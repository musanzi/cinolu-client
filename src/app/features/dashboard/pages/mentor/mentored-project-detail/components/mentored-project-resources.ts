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
  standalone: true,
  imports: [CommonModule, ResourceCard, ResourceFilters, ResourceForm, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/20 flex items-center justify-center">
            <i-lucide class="text-primary-600 dark:text-primary-400" [name]="icons.file" [size]="20" />
          </div>
          <div>
            <h3 class="dashboard-heading-5">Ressources du projet</h3>
            <p class="dashboard-text-tiny">
              {{ resourcesStore.totalResources() }} ressource{{ resourcesStore.totalResources() !== 1 ? 's' : '' }}
            </p>
          </div>
        </div>
        <button
          type="button"
          (click)="openCreateModal()"
          class="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
          <i-lucide [name]="icons.plus" [size]="18" />
          <span>Ajouter</span>
        </button>
      </div>

      <!-- Filters -->
      <app-resource-filters (filterChange)="onFilterChange($event)" />

      <!-- Loading State -->
      @if (resourcesStore.isLoading() && resourcesStore.isEmpty()) {
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          @for (i of [1, 2, 3]; track i) {
            <div class="dashboard-card p-6 animate-pulse">
              <div class="flex gap-4 mb-4">
                <div class="w-10 h-10 rounded-lg bg-slate-200 dark:bg-slate-700 shrink-0"></div>
                <div class="flex-1 space-y-2">
                  <div class="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
                  <div class="h-3 bg-slate-100 dark:bg-slate-600 rounded w-full"></div>
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Resources Grid -->
      @else if (!resourcesStore.isEmpty()) {
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

        <!-- Load More -->
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
      }

      <!-- Empty State -->
      @else {
        <div class="dashboard-card p-12 text-center">
          <div
            class="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
            <i-lucide class="text-3xl text-slate-400" [name]="icons.file" />
          </div>
          <h4 class="dashboard-heading-5 mb-2">Aucune ressource disponible</h4>
          <p class="dashboard-text-body mb-4">Ajoutez des ressources pour ce projet.</p>
          <button
            type="button"
            (click)="openCreateModal()"
            class="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors">
            <i-lucide [name]="icons.plus" [size]="18" />
            Ajouter une ressource
          </button>
        </div>
      }
    </div>

    <!-- Create Modal -->
    @if (showCreateModal()) {
      <div
        role="button"
        tabindex="0"
        aria-label="Fermer le modal"
        class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
        (click)="closeCreateModal()"
        (keydown.escape)="closeCreateModal()"
        (keydown.enter)="closeCreateModal()"
        (keydown.space)="closeCreateModal()">
        <div
          class="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          (click)="$event.stopPropagation()"
          (keydown)="$event.stopPropagation()"
          role="dialog"
          aria-modal="true">
          <h2 class="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6">Créer une ressource</h2>
          <app-resource-form
            mode="create"
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
    this._router.navigate(['/dashboard/mentor/resources', resource.id]);
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
