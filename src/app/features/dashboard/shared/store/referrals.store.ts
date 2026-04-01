import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, exhaustMap, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '@core/services/toast/toastr.service';
import { IUser } from '@shared/models/entities.models';

interface IReferralsStore {
  referralCode: string | null;
  referredUsers: IUser[];
  referredUsersPage: number;
  referredUsersTotalCount: number;
  isLoading: boolean;
  isLoadingReferredUsers: boolean;
}

export const ReferralsStore = signalStore(
  { providedIn: 'root' },
  withState<IReferralsStore>({
    referralCode: null,
    referredUsers: [],
    referredUsersPage: 1,
    referredUsersTotalCount: 0,
    isLoading: false,
    isLoadingReferredUsers: false
  }),
  withComputed(({ referredUsers }) => ({
    isEmpty: computed(() => !referredUsers() || referredUsers().length === 0),
    hasReferredUsers: computed(() => referredUsers() && referredUsers().length > 0)
  })),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _toast, ...store }) => ({
    generateReferralCode: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          return _http.post<{ referral_code: string }>('users/referral-code/generate', {}).pipe(
            tap(({ referral_code }) => {
              patchState(store, { referralCode: referral_code, isLoading: false });
              _toast.showSuccess('Code de parrainage généré');
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error?.message || 'Erreur lors de la génération du code');
              return of(null);
            })
          );
        })
      )
    ),

    loadReferredUsers: rxMethod<{ page?: number }>(
      pipe(
        tap(() => patchState(store, { isLoadingReferredUsers: true })),
        exhaustMap(({ page = 1 }) => {
          return _http.get<{ data: [IUser[], number] }>('users/me/referred-users', { params: { page } }).pipe(
            tap(({ data }) => {
              const [users, totalCount] = data;
              patchState(store, {
                referredUsers: users,
                referredUsersPage: page,
                referredUsersTotalCount: totalCount,
                isLoadingReferredUsers: false
              });
            }),
            catchError((err) => {
              patchState(store, { isLoadingReferredUsers: false });
              _toast.showError(err.error?.message || 'Erreur lors du chargement des utilisateurs référés');
              return of(null);
            })
          );
        })
      )
    ),

    setReferralCode: (code: string) => patchState(store, { referralCode: code })
  }))
);
