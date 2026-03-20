import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '../../../../core/services/toast/toastr.service';
import { IComment } from '../../../../shared/models/entities.models';
import { CommentsStore } from './comments.store';

interface IUpdateCommentStore {
  isLoading: boolean;
}

interface CommentDto {
  id: string;
  content: string;
}

interface IUpdateCommentParams {
  payload: CommentDto;
  onSuccess: () => void;
}

export const UpdateCommentStore = signalStore(
  withState<IUpdateCommentStore>({ isLoading: false }),
  withProps(() => ({
    _http: inject(HttpClient),
    _commentsStore: inject(CommentsStore),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _commentsStore, _toast, ...store }) => ({
    updateComment: rxMethod<IUpdateCommentParams>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ payload, onSuccess }) => {
          return _http.patch<{ data: IComment }>(`comments/id/${payload.id}`, payload).pipe(
            map(({ data }) => {
              _commentsStore.updateComment(data);
              onSuccess();
              _toast.showSuccess('Le commentaire a été mis à jour avec succès');
              patchState(store, { isLoading: false });
            }),
            catchError(() => {
              _toast.showError('Échec de la mise à jour');
              patchState(store, { isLoading: false });
              return of(null);
            })
          );
        })
      )
    )
  }))
);
