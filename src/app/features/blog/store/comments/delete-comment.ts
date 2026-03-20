import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { CommentsStore } from './comments.store';
import { ToastrService } from '../../../../core/services/toast/toastr.service';

interface IDeleteCommentStore {
  isLoading: boolean;
}

interface IDeleteCommentParams {
  id: string;
}

export const DeleteCommentStore = signalStore(
  withState<IDeleteCommentStore>({ isLoading: false }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _commentsStore: inject(CommentsStore)
  })),
  withMethods(({ _http, _commentsStore, _toast, ...store }) => ({
    deleteComment: rxMethod<IDeleteCommentParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ id }) => {
          return _http.delete<void>(`comments/id/${id}`).pipe(
            map(() => {
              patchState(store, { isLoading: false });
              _commentsStore.deleteComment(id);
              _toast.showSuccess('Commentaire a été supprimé avec succès');
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError("Une erreur s'est produite lors de la suppression");
              return of(null);
            })
          );
        })
      )
    )
  }))
);
