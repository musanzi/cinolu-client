import { patchState, signalStore, withMethods, withProps, withState } from '@ngrx/signals';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IImage } from '@shared/models';
import { ToastrService } from '@core/services/toast';

interface IProductGalleryStore {
  isLoading: boolean;
  images: IImage[];
}

export const ProductGalleryStore = signalStore(
  withState<IProductGalleryStore>({ isLoading: false, images: [] }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService)
  })),
  withMethods(({ _http, _toast, ...store }) => ({
    loadAll: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((slug) =>
          _http.get<{ data: IImage[] }>(`products/by-slug/${slug}/gallery`).pipe(
            map(({ data }) => {
              patchState(store, { isLoading: false, images: data });
            }),
            catchError(() => {
              patchState(store, { isLoading: false, images: [] });
              return of(null);
            })
          )
        )
      )
    ),
    delete: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          _http.delete<void>(`products/gallery/${id}`).pipe(
            map(() => {
              const current = store.images();
              const filtered = current.filter((img: IImage) => img.id !== id);
              patchState(store, { isLoading: false, images: filtered });
              _toast.showSuccess('Image supprimée avec succès');
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError("Échec de la suppression de l'image");
              return of(null);
            })
          )
        )
      )
    )
  }))
);
