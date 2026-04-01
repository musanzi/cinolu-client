import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResourceCard } from '@features/dashboard/shared/components/resources/resource-card/resource-card';
import {
  ResourceFilters,
  type ResourceFilterValue
} from '@features/dashboard/shared/components/resources/resource-filters/resource-filters';
import { ResourceForm, type ResourceFormValue } from '@features/dashboard/shared/components/resources/resource-form/resource-form';
import { MentorshipService } from '@features/dashboard/shared/services/mentorship.service';
import { ResourcesService } from '@features/dashboard/shared/services/resources.service';
import { ResourcesStore } from '@features/dashboard/shared/store/resources.store';
import { type CreateResourceDto, type IResource, type ResourcesFilter } from '@shared/models/entities.models';
import { FileText, FolderOpen, LucideAngularModule, Plus } from 'lucide-angular';

@Component({
  selector: 'app-resources-list',
  imports: [CommonModule, ResourceCard, ResourceFilters, ResourceForm, LucideAngularModule],
  templateUrl: './resources-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourcesList implements OnInit {
  resourcesStore = inject(ResourcesStore);
  private _resourcesService = inject(ResourcesService);
  private _mentorshipService = inject(MentorshipService);
  private _router = inject(Router);

  readonly icons = {
    file: FileText,
    plus: Plus,
    folder: FolderOpen
  };

  selectedProjectId = signal<string | null>(null);
  showCreateModal = signal(false);

  ngOnInit(): void {
    this._mentorshipService.getMentoredProjects().subscribe({
      next: (projects) => {
        const firstProject = projects[0];
        if (!firstProject) {
          this.selectedProjectId.set(null);
          this.resourcesStore.clearResources();
          return;
        }

        this.selectedProjectId.set(firstProject.id);
        this.loadResourcesForProject(firstProject.id);
      },
      error: (err) => {
        console.error('Error loading mentored projects:', err);
      }
    });
  }

  private loadResourcesForProject(projectId: string): void {
    const filter: ResourcesFilter = {
      page: 1,
      category: this.resourcesStore.filterCategory() ?? undefined
    };

    this.resourcesStore.loadResourcesByProject({ projectId, filter });
  }

  onProjectChange(projectId: string): void {
    this.selectedProjectId.set(projectId);
    this.resourcesStore.clearResources();
    this.loadResourcesForProject(projectId);
  }

  onFilterChange(filter: ResourceFilterValue): void {
    const projectId = this.selectedProjectId();
    if (!projectId) return;

    const resourcesFilter: ResourcesFilter = {
      category: filter.category ?? undefined,
      page: 1
    };

    this.resourcesStore.setFilter(filter.category);
    this.resourcesStore.loadResourcesByProject({ projectId, filter: resourcesFilter });
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

    const projectId = this.selectedProjectId();
    const dto: CreateResourceDto = {
      title: event.value.title,
      description: event.value.description,
      category: event.value.category,
      projectId: event.value.projectId || projectId || undefined,
      phaseId: event.value.phaseId || undefined
    };

    this.resourcesStore.createResource({ dto, file: event.file });
    this.closeCreateModal();
  }

  loadMore(): void {
    const projectId = this.selectedProjectId();
    if (!projectId) return;

    const nextPage = this.resourcesStore.currentPage() + 1;
    const filter: ResourcesFilter = {
      page: nextPage,
      category: this.resourcesStore.filterCategory() ?? undefined
    };

    this.resourcesStore.loadResourcesByProject({ projectId, filter });
  }
}
