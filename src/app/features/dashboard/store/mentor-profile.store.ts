import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from '@core/services/toast/toastr.service';
import { AuthStore } from '@core/auth/auth.store';
import {
  IExpertise,
  UpdateMentorProfileDto,
  MentorStatus,
  CreateMentorProfileDto,
  IMentorProfile
} from '@shared/models';
import { environment } from '@environments/environment';

interface MentorProfileState {
  profileMentor: IMentorProfile[];
  expertises: IExpertise[];
  isLoading: boolean;
  isUploadingCV: boolean;
}

export const MentorProfileStore = signalStore(
  { providedIn: 'root' },
  withState<MentorProfileState>({
    expertises: [],
    profileMentor: [],
    isLoading: false,
    isUploadingCV: false
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _router: inject(Router),
    _authStore: inject(AuthStore)
  })),
  withComputed((state) => ({
    profile: computed(() => state.profileMentor()[0] ?? null),
    hasProfile: computed(() => !!state.profileMentor()[0]),
    isApproved: computed(() => state.profileMentor()[0]?.status === MentorStatus.APPROVED),
    isPending: computed(() => state.profileMentor()[0]?.status === MentorStatus.PENDING),
    isRejected: computed(() => state.profileMentor()[0]?.status === MentorStatus.REJECTED),
    cvUrl: computed(() => {
      const cv = state.profileMentor()[0]?.cv;
      if (!cv) return null;
      return `${environment.apiUrl}uploads/mentors/cvs/${cv}`;
    })
  })),

  withMethods(({ _http, _toast, _router, _authStore, ...store }) => ({
    loadProfileFromAuth: () => {
      if (store.profileMentor().length > 0) return;
      const user = _authStore.user();
      if (user?.mentor_profile) {
        patchState(store, { profileMentor: [user.mentor_profile], isLoading: false });
      }
    },

    loadExpertises: rxMethod<void>(
      pipe(
        switchMap(() =>
          _http.get<{ data: IExpertise[] }>('expertises').pipe(
            tap(({ data }) => {
              patchState(store, { expertises: data });
            }),
            catchError((err) => {
              _toast.showError(err.error?.message || 'Erreur lors du chargement des expertises');
              return of(null);
            })
          )
        )
      )
    ),

    loadProfileFromMe: rxMethod<void>(
      pipe(
        switchMap(() =>
          _http.get<{ data: IMentorProfile[] }>('mentors/me').pipe(
            tap(({ data }) => {
              patchState(store, {
                profileMentor: data,
                isLoading: false
              });
            }),
            catchError((err) => {
              _toast.showError(err.error?.message || 'Erreur lors du chargement du profil mentor');
              return of(null);
            })
          )
        )
      )
    ),
    createProfile: rxMethod<{ data: CreateMentorProfileDto; onSuccess?: (profile: IMentorProfile) => void }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ data, onSuccess }) =>
          _http.post<{ data: IMentorProfile }>('mentors/request', data).pipe(
            tap(({ data: profile }) => {
              patchState(store, {
                profileMentor: [profile],
                isLoading: false
              });
              _toast.showSuccess('Candidature soumise avec succès');
              if (onSuccess) {
                onSuccess(profile);
              }
            }),
            catchError((err) => {
              patchState(store, {
                isLoading: false
              });
              _toast.showError(err.error?.message || 'Erreur lors de la soumission de la candidature');
              return of(null);
            })
          )
        )
      )
    ),

    updateProfile: rxMethod<{ id: string; dto: UpdateMentorProfileDto }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id, dto }) =>
          _http.patch<{ data: IMentorProfile }>(`mentors/requests/${id}`, dto).pipe(
            tap(({ data }) => {
              patchState(store, {
                profileMentor: [data],
                isLoading: false
              });
              _toast.showSuccess('Profil mis à jour avec succès');
              _router.navigate(['/dashboard/mentor/profile']);
            }),
            catchError((err) => {
              patchState(store, {
                isLoading: false
              });
              _toast.showError(err.error?.message || 'Erreur lors de la mise à jour du profil');
              return of(null);
            })
          )
        )
      )
    ),

    uploadCV: rxMethod<{ id: string; file: File }>(
      pipe(
        tap(() => patchState(store, { isUploadingCV: true })),
        switchMap(({ id, file }) => {
          const formData = new FormData();
          formData.append('cv', file);
          return _http.post<{ data: IMentorProfile }>(`mentors/id/${id}/cv`, formData).pipe(
            tap(({ data }) => {
              patchState(store, {
                profileMentor: [data],
                isUploadingCV: false
              });
              _toast.showSuccess('CV uploadé avec succès');
            }),
            catchError((err) => {
              patchState(store, {
                isUploadingCV: false
              });
              _toast.showError(err.error?.message || "Erreur lors de l'upload du CV");
              return of(null);
            })
          );
        })
      )
    ),

    reset: () => {
      patchState(store, {
        expertises: [],
        profileMentor: [],
        isLoading: false,
        isUploadingCV: false
      });
    }
  }))
);
