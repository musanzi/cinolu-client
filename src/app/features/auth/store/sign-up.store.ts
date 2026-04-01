import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from '../../../core/services/toast/toastr.service';
import { IUser } from '../../../shared/models/entities.models';
import { SignUpDto } from '../dto/sign-up.dto';
import { AuthStore } from '@core/auth/auth.store';

interface ISignUpStore {
  isLoading: boolean;
  user: IUser | null;
}

export const SignUpStore = signalStore(
  withState<ISignUpStore>({ isLoading: false, user: null }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _router: inject(Router),
    _authStore: inject(AuthStore)
  })),
  withMethods(({ _http, _toast, _router, _authStore, ...store }) => ({
    signUp: rxMethod<SignUpDto>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((payload) => {
          return _http.post<{ data: IUser }>('auth/signup', payload).pipe(
            tap(({ data }) => {
              patchState(store, { isLoading: false, user: data });
              _authStore.setUser(data);
              _toast.showSuccess('Inscription réussie');
              _router.navigate(['/dashboard/user/profile']);
            }),
            catchError((err) => {
              patchState(store, { isLoading: false });
              _toast.showError(err.error['message'] || "Erreur d'inscription");
              return of(null);
            })
          );
        })
      )
    )
  }))
);
