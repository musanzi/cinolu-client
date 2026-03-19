import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ResourcesStore } from '@features/dashboard/store/resources.store';
import { ResourcesService } from '@features/dashboard/services/resources.service';
import { MentorshipService } from '@features/dashboard/services/mentorship.service';
import { ResourceCard } from '../components/resource-card/resource-card';
import { ResourceFilters, type ResourceFilterValue } from '../components/resource-filters/resource-filters';
import { ResourceForm, ResourceFormValue } from '../components/resource-form/resource-form';
import { IResource, ResourcesFilter, CreateResourceDto, IProject } from '@shared/models/entities.models';
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
  private _mentorshipService = inject(MentorshipService);
  private _router = inject(Router);

  readonly icons = {
    file: FileText,
    plus: Plus,
    folder: FolderOpen
  };

  // Modal state for creating resource
  showCreateModal = signal(false);
  mentoredProjects = signal<IProject[]>([]);
  selectedProjectId = signal<string | null>(null);

  ngOnInit(): void {
    // Load mentored projects first
    this._mentorshipService.getMentoredProjects().subscribe({
      next: (projects) => {
        this.mentoredProjects.set(projects);
        
        // If there's at least one project, load its resources
        if (projects.length > 0) {
          const firstProject = projects[0];
          this.selectedProjectId.set(firstProject.id);
          this.loadResourcesForProject(firstProject.id);
        }
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
