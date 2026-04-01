import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { ToastrService } from '@core/services/toast/toastr.service';
import { IParticipation, IProject, ParticipationReviewStatus } from '@shared/models/entities.models';
import {
  MentorParticipationsFilter,
  MentorshipService,
  ParticipationReviewPayload
} from '../services/mentorship.service';

interface IMentorshipStore {
  mentoredProjects: IProject[];
  selectedProject: IProject | null;
  participations: IParticipation[];
  totalParticipations: number;
  selectedParticipation: IParticipation | null;
  currentPage: number;
  filterQ: string;
  filterPhaseId: string;
  filterStatus: ParticipationReviewStatus | '';
  isLoading: boolean;
  isLoadingParticipations: boolean;
  isLoadingDetail: boolean;
  isSubmittingReview: boolean;
}

export const MentorshipStore = signalStore(
  { providedIn: 'root' },
  withState<IMentorshipStore>({
    mentoredProjects: [],
    selectedProject: null,
    participations: [],
    totalParticipations: 0,
    selectedParticipation: null,
    currentPage: 1,
    filterQ: '',
    filterPhaseId: '',
    filterStatus: '',
    isLoading: false,
    isLoadingParticipations: false,
    isLoadingDetail: false,
    isSubmittingReview: false
  }),
  withProps(() => ({
    _service: inject(MentorshipService),
    _toast: inject(ToastrService)
  })),
  withComputed(({ participations, totalParticipations }) => ({
    hasMoreParticipations: computed(() => participations().length < totalParticipations())
  })),
  withMethods(({ _service, _toast, ...store }) => ({
    loadMentoredProjects: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          _service.getMentoredProjects().pipe(
            tap((projects) => {
              patchState(store, { mentoredProjects: projects, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error?.message || 'Erreur lors du chargement des projets mentorés');
              return of(null);
            })
          )
        )
      )
    ),

    loadMentoredProject: rxMethod<string>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            selectedProject: null,
            participations: [],
            totalParticipations: 0,
            currentPage: 1,
            filterQ: '',
            filterPhaseId: '',
            filterStatus: ''
          })
        ),
        switchMap((projectSlug) =>
          _service.getMentoredProject(projectSlug).pipe(
            tap((project) => {
              patchState(store, { selectedProject: project, isLoading: false });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error?.message || 'Projet introuvable');
              return of(null);
            })
          )
        )
      )
    ),

    loadParticipations: rxMethod<{ projectId: string; filter?: MentorParticipationsFilter }>(
      pipe(
        tap(() => patchState(store, { isLoadingParticipations: true })),
        switchMap(({ projectId, filter }) => {
          const page = filter?.page ?? 1;
          return _service.getMentoredProjectParticipations(projectId, filter).pipe(
            tap(([participations, total]) => {
              const existing = page > 1 ? store.participations() : [];
              patchState(store, {
                participations: [...existing, ...participations],
                totalParticipations: total,
                currentPage: page,
                isLoadingParticipations: false
              });
            }),
            catchError((err) => {
              patchState(store, { isLoadingParticipations: false });
              _toast.showError(err.error?.message || 'Erreur lors du chargement des candidatures');
              return of(null);
            })
          );
        })
      )
    ),

    loadParticipationDetail: rxMethod<{ participationId: string }>(
      pipe(
        tap(() => patchState(store, { isLoadingDetail: true, selectedParticipation: null })),
        switchMap(({ participationId }) =>
          _service.getMentoredProjectParticipation(participationId).pipe(
            tap((participation) => {
              patchState(store, { selectedParticipation: participation, isLoadingDetail: false });
            }),
            catchError((err) => {
              patchState(store, { isLoadingDetail: false });
              _toast.showError(err.error?.message || 'Candidature introuvable');
              return of(null);
            })
          )
        )
      )
    ),

    submitParticipationReview: rxMethod<{
      participationId: string;
      payload: ParticipationReviewPayload;
      refreshProjectId?: string;
      refreshFilter?: MentorParticipationsFilter;
    }>(
      pipe(
        tap(() => patchState(store, { isSubmittingReview: true })),
        switchMap(({ participationId, payload, refreshProjectId, refreshFilter }) =>
          _service.submitParticipationReview(participationId, payload).pipe(
            switchMap(() => _service.getMentoredProjectParticipation(participationId)),
            tap((participation) => {
              const updatedParticipations = store.participations().map((item) =>
                item.id === participation.id ? participation : item
              );

              patchState(store, {
                selectedParticipation: participation,
                participations: updatedParticipations,
                isSubmittingReview: false
              });

              if (refreshProjectId) {
                _service.getMentoredProjectParticipations(refreshProjectId, refreshFilter ?? {}).subscribe({
                  next: ([participations, total]) => {
                    patchState(store, { participations, totalParticipations: total });
                  },
                  error: () => undefined
                });
              }

              _toast.showSuccess('Revue enregistrée avec succès');
            }),
            catchError((err) => {
              patchState(store, { isSubmittingReview: false });
              _toast.showError(err.error?.message || 'Impossible d’enregistrer la revue');
              return of(null);
            })
          )
        )
      )
    ),

    setFilter: (projectId: string, q: string, phaseId: string, status: ParticipationReviewStatus | '') => {
      patchState(store, { filterQ: q, filterPhaseId: phaseId, filterStatus: status, participations: [], currentPage: 1 });
    },

    clearSelectedProject: () => {
      patchState(store, {
        selectedProject: null,
        participations: [],
        totalParticipations: 0,
        selectedParticipation: null,
        currentPage: 1,
        filterQ: '',
        filterPhaseId: '',
        filterStatus: ''
      });
    },

    clearSelectedParticipation: () => {
      patchState(store, { selectedParticipation: null });
    }
  }))
);
