import { signalStore, withState, withMethods, patchState, withProps } from '@ngrx/signals';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { ToastrService } from '@core/services/toast/toastr.service';
import { ParticipationsStore } from './participations.store';

interface IVoteResponse {
  success: boolean;
  message?: string;
}

interface IVoteStore {
  isLoading: boolean;
  isUpvoted: boolean;
  error: string | null;
}

export const VoteStore = signalStore(
  withState<IVoteStore>({ isLoading: false, isUpvoted: false, error: null }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _participationsStore: inject(ParticipationsStore)
  })),
  withMethods(({ _http, _toast, _participationsStore, ...store }) => ({
    upvote: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((participationId) =>
          _http.post<IVoteResponse>(`projects/participations/${participationId}/upvote`, {}).pipe(
            tap(() => {
              patchState(store, { isLoading: false, isUpvoted: true });
              _participationsStore.setParticipationVote(participationId, true);
              _toast.showSuccess('Vote enregistré');
            }),
            catchError((error) => {
              patchState(store, { isLoading: false, error: error.message || 'Erreur lors du vote' });
              return of(null);
            })
          )
        )
      )
    ),
    removeVote: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true, error: null })),
        switchMap((participationId) =>
          _http.delete<IVoteResponse>(`projects/participations/${participationId}/upvote`).pipe(
            tap(() => {
              patchState(store, { isLoading: false, isUpvoted: false });
              _participationsStore.setParticipationVote(participationId, false);
              _toast.showSuccess('Vote retiré');
            }),
            catchError((error) => {
              patchState(store, { isLoading: false, error: error.message || 'Erreur lors de la suppression du vote' });
              return of(null);
            })
          )
        )
      )
    )
  }))
);
