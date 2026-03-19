import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResourcesStore } from '@features/dashboard/store/resources.store';
import { ResourcesService } from '@features/dashboard/services/resources.service';
import { ResourceCard } from '../components/resource-card/resource-card';
import { ResourceFilters, type ResourceFilterValue } from '../components/resource-filters/resource-filters';
import { ResourceForm, ResourceFormValue } from '../components/resource-form/resource-form';
import { IResource, ResourcesFilter, CreateResourceDto } from '@shared/models/entities.models';
import { FileText, Plus, FolderOpen, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-resources-list',
  imports: [CommonModule, ResourceCard, ResourceFilters, ResourceForm, LucideAngularModule],
  templateUrl: './resources-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourcesList implements OnInit {
  resourcesStore = inject(ResourcesStore);
  private _resourcesService = inject(ResourcesService);
  private _router = inject(Router);

  readonly icons = {
    file: FileText,
    plus: Plus,
    folder: FolderOpen
  };

  // Modal state for creating resource
  showCreateModal = signal(false);

  ngOnInit(): void {
    // For now, load all resources without project scope
    // TODO: In production, you might want to load resources from all mentored projects
    // or allow the user to select a project first
    this.resourcesStore.clearResources();
  }

  onFilterChange(filter: ResourceFilterValue): void {
    const resourcesFilter: ResourcesFilter = {
      category: filter.category ?? undefined,
      page: 1
    };
    const projectId = this.resourcesStore.projectIdScope();
    if (projectId) {
      this.resourcesStore.loadResourcesByProject({ projectId, filter: resourcesFilter });
    }
    this.resourcesStore.setFilter(filter.category);
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
      projectId: event.value.projectId || undefined,
      phaseId: event.value.phaseId || undefined
    };

    this.resourcesStore.createResource({ dto, file: event.file });
    this.closeCreateModal();
  }

  loadMore(): void {
    const projectId = this.resourcesStore.projectIdScope();
    if (!projectId) return;

    const nextPage = this.resourcesStore.currentPage() + 1;
    const filter: ResourcesFilter = {
      page: nextPage,
      category: this.resourcesStore.filterCategory() ?? undefined
    };

    this.resourcesStore.loadResourcesByProject({ projectId, filter });
  }
}
