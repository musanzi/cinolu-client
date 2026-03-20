import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '@core/services/toast/toastr.service';
import { Router } from '@angular/router';
import { AuthStore } from '@core/auth/auth.store';
import { ParticipateProjectDto } from '../dto/create-participation.dto';
import type { IProject, IParticipation, IParticipationWithVote } from '../../../shared/models/entities.models';

interface IParticipationsStore {
  participations: IParticipationWithVote[];
  selectedParticipation: IParticipationWithVote | null;
  isLoading: boolean;
  totalCount: number;
}

function toParticipationWithVote(p: IParticipation, currentUserId: string | undefined): IParticipationWithVote {
  const upvotes = p.upvotes ?? [];
  const voteCount = upvotes.length;
  const hasUserVoted = !!currentUserId && upvotes.some((u) => u.user?.id === currentUserId);
  return { ...p, voteCount, hasUserVoted };
}

export const ParticipationsStore = signalStore(
  { providedIn: 'root' },
  withState<IParticipationsStore>({
    participations: [],
    selectedParticipation: null,
    isLoading: false,
    totalCount: 0
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _router: inject(Router),
    _authStore: inject(AuthStore)
  })),

  withMethods(({ _http, _toast, _router, _authStore, ...store }) => ({
    myParticipations: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() => {
          return _http.get<{ data: IParticipation[] }>('projects/me/participations').pipe(
            tap(({ data }) => {
              const userId = _authStore.user()?.id;
              const withVote = data.map((p) => toParticipationWithVote(p, userId));
              patchState(store, {
                participations: withVote,
                totalCount: withVote.length,
                isLoading: false
              });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error?.message || 'Erreur lors du chargement des candidatures');
              return of(null);
            })
          );
        })
      )
    ),

    loadProjectParticipations: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, participations: [] })),
        switchMap((projectId) =>
          _http.get<{ data: IParticipation[] }>(`projects/${projectId}/participations`).pipe(
            tap(({ data }) => {
              const userId = _authStore.user()?.id;
              const withVote = data.map((p) => toParticipationWithVote(p, userId));
              patchState(store, {
                participations: withVote,
                totalCount: withVote.length,
                isLoading: false
              });
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error?.message || 'Erreur lors du chargement des participations');
              return of(null);
            })
          )
        )
      )
    ),

    create: rxMethod<ParticipateProjectDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((data) =>
          _http
            .post<{ data: IParticipation }>(`projects/${data.projectId}/participate`, { ventureId: data.ventureId })
            .pipe(
              tap(() => {
                _toast.showSuccess('Candidature soumise avec succès');
                _router.navigate(['/dashboard/user/programs/my-applications']);
                patchState(store, { isLoading: false });
              }),
              catchError((err) => {
                _toast.showError(err.error?.message || "Une erreur s'est produite lors de la soumission");
                patchState(store, { isLoading: false });
                return of(null);
              })
            )
        )
      )
    ),

    checkExistingParticipation: (projectId: string, ventureId: string): boolean => {
      return store.participations().some((p) => p?.project?.id === projectId && p?.venture?.id === ventureId);
    },

    clearSelectedParticipation: () => {
      patchState(store, { selectedParticipation: null });
    },

    canVote: (project: IProject | null): boolean => {
      if (!project) return false;
      const now = new Date();
      const started = new Date(project.started_at);
      const ended = new Date(project.ended_at);
      return (started <= now && ended >= now) || started > now;
    },

    getVotesCount: (participationId: string): number => {
      const p = store.participations().find((x) => x.id === participationId);
      return p?.voteCount ?? 0;
    },

    getUserHasVoted: (participationId: string): boolean => {
      const p = store.participations().find((x) => x.id === participationId);
      return p?.hasUserVoted ?? false;
    },

    /** Mise à jour optimiste après vote / retrait (appelée par VoteStore). */
    setParticipationVote: (participationId: string, hasVoted: boolean): void => {
      const list = store.participations().map((p) => {
        if (p.id !== participationId) return p;
        const delta = hasVoted ? 1 : -1;
        return { ...p, voteCount: Math.max(0, p.voteCount + delta), hasUserVoted: hasVoted };
      });
      patchState(store, { participations: list });
    }
  }))
);
