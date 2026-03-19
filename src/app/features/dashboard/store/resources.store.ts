import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed, inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, of, pipe, switchMap, tap } from 'rxjs';
import { ToastrService } from '@core/services/toast/toastr.service';
import {
  IResource,
  ResourcesFilter,
  ResourceCategory,
  CreateResourceDto,
  UpdateResourceDto
} from '@shared/models/entities.models';
import { ResourcesService } from '../services/resources.service';

interface IResourcesStore {
  resources: IResource[];
  totalResources: number;
  selectedResource: IResource | null;

  // Filtres
  currentPage: number;
  filterCategory: ResourceCategory | null;
  projectIdScope: string | null; // pour filtrer par projet

  // États UI
  isLoading: boolean;
  isLoadingDetail: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
}

export const ResourcesStore = signalStore(
  { providedIn: 'root' },
  withState<IResourcesStore>({
    resources: [],
    totalResources: 0,
    selectedResource: null,
    currentPage: 1,
    filterCategory: null,
    projectIdScope: null,
    isLoading: false,
    isLoadingDetail: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null
  }),
  withComputed(({ resources, totalResources }) => ({
    hasMoreResources: computed(() => resources().length < totalResources()),
    isEmpty: computed(() => resources().length === 0),
    resourcesCount: computed(() => resources().length)
  })),
  withMethods((store) => {
    const service = inject(ResourcesService);
    const toast = inject(ToastrService);

    return {
      /**
       * Load resources by project with filters
       */
      loadResourcesByProject: rxMethod<{ projectId: string; filter?: ResourcesFilter }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ projectId, filter }) => {
            const page = filter?.page ?? 1;
            const finalFilter: ResourcesFilter = {
              ...filter,
              page,
              limit: filter?.limit ?? 20
            };

            return service.getResourcesByProject(projectId, finalFilter).pipe(
              tap(([resources, total]) => {
                // Append if loading next page, replace otherwise
                const existing = page > 1 ? store.resources() : [];
                patchState(store, {
                  resources: [...existing, ...resources],
                  totalResources: total,
                  currentPage: page,
                  projectIdScope: projectId,
                  isLoading: false
                });
              }),
              catchError((err) => {
                patchState(store, { isLoading: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors du chargement des ressources');
                return of(null);
              })
            );
          })
        )
      ),

      /**
       * Load resources by phase with filters
       */
      loadResourcesByPhase: rxMethod<{ phaseId: string; filter?: ResourcesFilter }>(
        pipe(
          tap(() => patchState(store, { isLoading: true, error: null })),
          switchMap(({ phaseId, filter }) => {
            const page = filter?.page ?? 1;
            const finalFilter: ResourcesFilter = {
              ...filter,
              page,
              limit: filter?.limit ?? 20
            };

            return service.getResourcesByPhase(phaseId, finalFilter).pipe(
              tap(([resources, total]) => {
                const existing = page > 1 ? store.resources() : [];
                patchState(store, {
                  resources: [...existing, ...resources],
                  totalResources: total,
                  currentPage: page,
                  isLoading: false
                });
              }),
              catchError((err) => {
                patchState(store, { isLoading: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors du chargement des ressources');
                return of(null);
              })
            );
          })
        )
      ),

  
      createResource: rxMethod<{ dto: CreateResourceDto; file: File }>(
        pipe(
          tap(() => patchState(store, { isCreating: true, error: null })),
          switchMap(({ dto, file }) =>
            service.createResource(dto, file).pipe(
              tap((newResource) => {
                patchState(store, {
                  resources: [newResource, ...store.resources()],
                  totalResources: store.totalResources() + 1,
                  isCreating: false
                });
                toast.showSuccess('Ressource créée avec succès');
              }),
              catchError((err) => {
                patchState(store, { isCreating: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors de la création de la ressource');
                return of(null);
              })
            )
          )
        )
      ),


      updateResource: rxMethod<{ id: string; dto: UpdateResourceDto }>(
        pipe(
          tap(() => patchState(store, { isUpdating: true, error: null })),
          switchMap(({ id, dto }) =>
            service.updateResource(id, dto).pipe(
              tap((updatedResource) => {
                const updated = store.resources().map((r: IResource) => (r.id === id ? updatedResource : r));
                patchState(store, {
                  resources: updated,
                  selectedResource:
                    store.selectedResource()?.id === id ? updatedResource : store.selectedResource(),
                  isUpdating: false
                });
                toast.showSuccess('Ressource mise à jour');
              }),
              catchError((err) => {
                patchState(store, { isUpdating: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors de la mise à jour');
                return of(null);
              })
            )
          )
        )
      ),
      updateResourceFile: rxMethod<{ id: string; file: File }>(
        pipe(
          tap(() => patchState(store, { isUpdating: true, error: null })),
          switchMap(({ id, file }) =>
            service.updateResourceFile(id, file).pipe(
              tap((updatedResource) => {
                const updated = store.resources().map((r: IResource) => (r.id === id ? updatedResource : r));
                patchState(store, {
                  resources: updated,
                  selectedResource:
                    store.selectedResource()?.id === id ? updatedResource : store.selectedResource(),
                  isUpdating: false
                });
                toast.showSuccess('Fichier mis à jour');
              }),
              catchError((err) => {
                patchState(store, { isUpdating: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors du remplacement du fichier');
                return of(null);
              })
            )
          )
        )
      ),

      deleteResource: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { isDeleting: true, error: null })),
          switchMap((id) =>
            service.deleteResource(id).pipe(
              tap(() => {
                const filtered = store.resources().filter((r: IResource) => r.id !== id);
                patchState(store, {
                  resources: filtered,
                  totalResources: store.totalResources() - 1,
                  selectedResource: store.selectedResource()?.id === id ? null : store.selectedResource(),
                  isDeleting: false
                });
                toast.showSuccess('Ressource supprimée');
              }),
              catchError((err) => {
                patchState(store, { isDeleting: false, error: err.error?.message });
                toast.showError(err.error?.message || 'Erreur lors de la suppression');
                return of(null);
              })
            )
          )
        )
      ),


      selectResource: (resource: IResource | null) => {
        patchState(store, { selectedResource: resource });
      },
      setFilter: (category: ResourceCategory | null) => {
        patchState(store, {
          filterCategory: category,
          resources: [],
          currentPage: 1
        });
      },
      clearResources: () => {
        patchState(store, {
          resources: [],
          totalResources: 0,
          selectedResource: null,
          currentPage: 1,
          filterCategory: null,
          projectIdScope: null,
          error: null
        });
      }
    };
  })
);
