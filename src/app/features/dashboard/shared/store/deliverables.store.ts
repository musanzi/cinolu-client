import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '@core/services/toast/toastr.service';
import { IDeliverableSubmission } from '@shared/models/entities.models';
import { SubmitDeliverableInput } from '../dto/submit-deliverable.dto';

interface IDeliverablesStore {
  isLoading: boolean;
  lastSubmission: IDeliverableSubmission | null;
}

export const DeliverablesStore = signalStore(
  { providedIn: 'root' },
  withState<IDeliverablesStore>({ isLoading: false, lastSubmission: null }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _toast, ...store }) => ({
    submitDeliverable: rxMethod<SubmitDeliverableInput>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((input) => {
          const form = new FormData();
          form.append('file', input.file, input.file.name);
          return _http
            .post<{
              data: IDeliverableSubmission;
            }>(`deliverables/id/${input.deliverableId}/participations/${input.participationId}/submissions`, form)
            .pipe(
              map(({ data }) => {
                patchState(store, { isLoading: false, lastSubmission: data });
                _toast.showSuccess('Livrable envoyé.');
                return data;
              }),
              catchError((err) => {
                patchState(store, { isLoading: false });
                _toast.showError(err?.error?.message ?? 'Erreur lors de l’envoi.');
                return of(null);
              })
            );
        })
      )
    ),

    clearLast: () => patchState(store, { lastSubmission: null })
  }))
);
