import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '@core/services/toast/toastr.service';

interface UpdatePasswordDto {
  password: string;
  password_confirm: string;
}

interface IUpdatePasswordStore {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

export const UpdatePasswordStore = signalStore(
  withState<IUpdatePasswordStore>({
    isLoading: false,
    error: null,
    success: false
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _toast, ...store }) => ({
    updatePassword: rxMethod<UpdatePasswordDto>(
      pipe(
        tap(() =>
          patchState(store, {
            isLoading: true,
            error: null,
            success: false
          })
        ),
        switchMap((payload) => {
          return _http.patch<{ message: string }>('auth/me/password', payload).pipe(
            tap(() => {
              patchState(store, {
                isLoading: false,
                success: true
              });
              _toast.showSuccess('Ton mot de passe a été mis à jour avec succès');
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError('Échec de la mise à jour du mot de passe');
              return of(null);
            })
          );
        })
      )
    ),
    resetState: () => {
      patchState(store, {
        isLoading: false,
        error: null,
        success: false
      });
    }
  }))
);
