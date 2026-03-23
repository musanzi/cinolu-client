import { Component, input, inject, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceCard } from '../../resources/components/resource-card/resource-card';
import {
  ResourceFilters,
  type ResourceFilterValue
} from '../../resources/components/resource-filters/resource-filters';
import { ResourceForm, type ResourceFormValue } from '../../resources/components/resource-form/resource-form';
import { ResourcesService } from '@features/dashboard/services/resources.service';
import { ResourcesStore } from '@features/dashboard/store/resources.store';
import { type CreateResourceDto, type IResource, type ResourcesFilter } from '@shared/models/entities.models';
import { FileText, LucideAngularModule, Plus } from 'lucide-angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-mentored-project-resources',
  imports: [CommonModule, ResourceCard, ResourceFilters, ResourceForm, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <div class="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white">
        <div class="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-amber-200/40 blur-2xl"></div>
        <div class="absolute -bottom-16 -left-12 h-52 w-52 rounded-full bg-sky-200/40 blur-2xl"></div>
        <div class="relative p-6 sm:p-7">
          <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center shadow-sm">
                <i-lucide class="text-amber-700" [name]="icons.file" [size]="22" />
              </div>
              <div>
                <h3 class="text-lg sm:text-xl font-semibold tracking-tight text-slate-900">
                  Bibliotheque de ressources
                </h3>
                <p class="text-sm text-slate-600">
                  {{ resourcesStore.totalResources() }} ressource{{ resourcesStore.totalResources() !== 1 ? 's' : '' }}
                </p>
              </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
              <span
                class="inline-flex items-center gap-2 rounded-full bg-amber-100 text-amber-800 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
                Mentorat
              </span>
              <button
                type="button"
                (click)="openCreateModal()"
                class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors shadow-sm">
                <i-lucide [name]="icons.plus" [size]="18" />
                <span>Ajouter</span>
              </button>
            </div>
          </div>

          <div class="mt-5 flex flex-wrap gap-2">
            <span class="text-xs text-slate-500 uppercase tracking-widest">Filtres rapides</span>
          </div>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <app-resource-filters (filterChange)="onFilterChange($event)" />
      </div>

      @if (resourcesStore.isLoading() && resourcesStore.isEmpty()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse">
              <div class="flex gap-4 mb-4">
                <div class="w-10 h-10 rounded-xl bg-slate-200 shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 rounded w-2/3"></div>
                  <div class="h-3 bg-slate-100 rounded w-full"></div>
                </div>
              </div>
              <div class="h-2 bg-slate-100 rounded w-1/2"></div>
            </div>
          }
        </div>
      } @else if (!resourcesStore.isEmpty()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (resource of resourcesStore.resources(); track resource.id) {
            <app-resource-card
              [resource]="resource"
              [showDelete]="true"
              (download)="onDownloadResource($event)"
              (view)="onViewResource($event)"
              (delete)="onDeleteResource($event)" />
          }
        </div>

        @if (resourcesStore.hasMoreResources()) {
          <div class="flex justify-center">
            <button
              type="button"
              (click)="loadMore()"
              [disabled]="resourcesStore.isLoading()"
              class="px-6 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-lg transition-colors disabled:opacity-50">
              {{ resourcesStore.isLoading() ? 'Chargement...' : 'Charger plus' }}
            </button>
          </div>
        }
      } @else {
        <div class="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
          <div class="w-16 h-16 rounded-2xl bg-white shadow-sm flex items-center justify-center mx-auto mb-4">
            <i-lucide class="text-3xl text-slate-500" [name]="icons.file" />
          </div>
          <h4 class="text-lg font-semibold text-slate-900 mb-2">Aucune ressource disponible</h4>
          <p class="text-sm text-slate-600 mb-4">Ajoutez des ressources pour guider les participants.</p>
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-600 text-white text-sm font-semibold hover:bg-primary-700 transition-colors">
            <i-lucide [name]="icons.plus" [size]="18" />
            Ajouter une ressource
          </button>
        </div>
      }
    </div>

    @if (showCreateModal()) {
      <div
        role="button"
        tabindex="0"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeCreateModal()"
        (keydown.escape)="closeCreateModal()"
        (keydown.enter)="closeCreateModal()"
        (keydown.space)="closeCreateModal()">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          role="dialog">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Créer une ressource</h2>
          <app-resource-form
            [contextProjectId]="projectId()"
            [isLoading]="resourcesStore.isCreating()"
            (submitForm)="onSubmitCreate($event)"
            (cancelForm)="closeCreateModal()" />
        </div>
      </div>
    }
  `
})
export class MentoredProjectResources {
  projectId = input.required<string>();

  resourcesStore = inject(ResourcesStore);
  private _resourcesService = inject(ResourcesService);
  private _router = inject(Router);

  readonly icons = {
    file: FileText,
    plus: Plus
  };

  showCreateModal = signal(false);

  constructor() {
    effect(() => {
      const projectId = this.projectId();
      if (projectId) {
        this.loadResources();
      }
    });
  }

  private loadResources(): void {
    const filter: ResourcesFilter = {
      page: 1,
      category: this.resourcesStore.filterCategory() ?? undefined
    };
    this.resourcesStore.loadResourcesByProject({ projectId: this.projectId(), filter });
  }

  onFilterChange(filter: ResourceFilterValue): void {
    const resourcesFilter: ResourcesFilter = {
      category: filter.category ?? undefined,
      page: 1
    };

    this.resourcesStore.setFilter(filter.category);
    this.resourcesStore.loadResourcesByProject({ projectId: this.projectId(), filter: resourcesFilter });
  }

  onDownloadResource(resource: IResource): void {
    const url = this._resourcesService.getResourceFileUrl(resource);
    window.open(url, '_blank');
  }

  onViewResource(resource: IResource): void {
    const url = this._resourcesService.getResourceFileUrl(resource);
    window.open(url, '_blank');
  }

  onDeleteResource(resource: IResource): void {
    if (confirm(`Êtes-vous sûr de vouloir supprimer "${resource.title}" ?`)) {
      this.resourcesStore.deleteResource(resource.id);
    }
  }

  openCreateModal(): void {
    this.showCreateModal.set(true);
  }

  closeCreateModal(): void {
    this.showCreateModal.set(false);
  }

  onSubmitCreate(event: { value: ResourceFormValue; file?: File }): void {
    if (!event.file) {
      alert('Veuillez sélectionner un fichier');
      return;
    }

    const dto: CreateResourceDto = {
      title: event.value.title,
      description: event.value.description,
      category: event.value.category,
      projectId: this.projectId(),
      phaseId: event.value.phaseId || undefined
    };

    this.resourcesStore.createResource({ dto, file: event.file });
    this.closeCreateModal();
  }

  loadMore(): void {
    const nextPage = this.resourcesStore.currentPage() + 1;
    const filter: ResourcesFilter = {
      page: nextPage,
      category: this.resourcesStore.filterCategory() ?? undefined
    };

    this.resourcesStore.loadResourcesByProject({ projectId: this.projectId(), filter });
  }
}
