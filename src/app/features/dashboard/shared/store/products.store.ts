import { patchState, signalStore, withComputed, withMethods, withProps, withState } from '@ngrx/signals';
import { inject, computed } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { ToastrService } from '@core/services/toast/toastr.service';
import { IProduct } from '@shared/models/entities.models';
import { Router } from '@angular/router';

interface IProductsStore {
  products: IProduct[];
  selectedProduct: IProduct | null;
  isLoading: boolean;
  totalCount: number;
}

export const ProductsStore = signalStore(
  { providedIn: 'root' },
  withState<IProductsStore>({
    products: [],
    selectedProduct: null,
    isLoading: false,
    totalCount: 0
  }),
  withProps(() => ({
    _http: inject(HttpClient),
    _toast: inject(ToastrService),
    _router: inject(Router)
  })),
  withComputed(({ products, totalCount }) => ({
    hasMorePages: computed(() => products().length < totalCount()),
    isEmpty: computed(() => products().length === 0)
  })),
  withMethods(({ _http, _toast, _router, ...store }) => ({
    loadAllProducts: rxMethod<void>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(() =>
          _http.get<{ data: [IProduct[], number] }>('products/me').pipe(
            map(({ data: [products, totalCount] }) => {
              patchState(store, { products, totalCount, isLoading: false });
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              return of(null);
            })
          )
        )
      )
    ),

    loadProductBySlug: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((slug) =>
          _http.get<{ data: IProduct | { product: IProduct } }>(`products/by-slug/${slug}`).pipe(
            map(({ data }) => {
              const product = 'product' in data ? data.product : data;
              patchState(store, { selectedProduct: product, isLoading: false });
            }),
            catchError(() => {
              patchState(store, { isLoading: false, selectedProduct: null });
              _toast.showError('Erreur lors du chargement');
              return of(null);
            })
          )
        )
      )
    ),

    createProduct: rxMethod<Partial<IProduct> & { ventureId: string }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((data) =>
          _http.post<{ data: IProduct | { product: IProduct } }>('products', data).pipe(
            map(({ data }) => {
              const product = 'product' in data ? data.product : data;
              patchState(store, {
                products: [product, ...store.products()],
                totalCount: store.totalCount() + 1,
                selectedProduct: product,
                isLoading: false
              });
              _toast.showSuccess('Produit créé avec succès');
              setTimeout(() => {
                _router.navigate(['/dashboard/user/ventures'], { fragment: 'products' });
              }, 100);
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError('Erreur lors de la création');
              return of(null);
            })
          )
        )
      )
    ),

    updateProduct: rxMethod<{ slug: string; data: Partial<IProduct> }>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap(({ slug, data }) =>
          _http.patch<{ data: IProduct | { product: IProduct } }>(`products/by-slug/${slug}`, data).pipe(
            map(({ data }) => {
              const updated = 'product' in data ? data.product : data;
              patchState(store, {
                products: store.products().map((p) => (p.slug === slug ? updated : p)),
                selectedProduct: store.selectedProduct()?.slug === slug ? updated : store.selectedProduct(),
                isLoading: false
              });
              _toast.showSuccess('Produit mis à jour');
              _router.navigate(['/dashboard/user/ventures'], { fragment: 'products' });
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError('Erreur lors de la mise à jour');
              return of(null);
            })
          )
        )
      )
    ),

    deleteProduct: rxMethod<string>(
      pipe(
        tap(() => patchState(store, { isLoading: true })),
        switchMap((id) =>
          _http.delete<void>(`products/id/${id}`).pipe(
            map(() => {
              patchState(store, {
                products: store.products().filter((p) => p.id !== id),
                totalCount: Math.max(0, store.totalCount() - 1),
                isLoading: false
              });
              _toast.showSuccess('Produit supprimé');
              _router.navigate(['/dashboard/user/ventures'], { fragment: 'products' });
            }),
            catchError(() => {
              patchState(store, { isLoading: false });
              _toast.showError('Erreur lors de la suppression');
              return of(null);
            })
          )
        )
      )
    ),

    resetSelection: () => {
      patchState(store, { selectedProduct: null });
      _router.navigate(['/dashboard/user/ventures'], { fragment: 'products' });
    }
  }))
);
