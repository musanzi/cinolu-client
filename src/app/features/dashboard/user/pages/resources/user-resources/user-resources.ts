import { ChangeDetectionStrategy, Component, OnInit, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LucideAngularModule, FileText, FolderOpen } from 'lucide-angular';
import { ResourceCard } from '@features/dashboard/shared/components/resources/resource-card/resource-card';
import {
  ResourceFilters,
  type ResourceFilterValue
} from '@features/dashboard/shared/components/resources/resource-filters/resource-filters';
import { ParticipationsStore } from '@features/dashboard/shared/store/participations.store';
import { ResourcesService } from '@features/dashboard/shared/services/resources.service';
import { ResourcesStore } from '@features/dashboard/shared/store/resources.store';
import { type IProject, type IResource, type ResourcesFilter } from '@shared/models/entities.models';

@Component({
  selector: 'app-user-resources',
  imports: [CommonModule, FormsModule, ResourceCard, ResourceFilters, LucideAngularModule],
  templateUrl: './user-resources.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserResources implements OnInit {
  participationsStore = inject(ParticipationsStore);
  resourcesStore = inject(ResourcesStore);
  private _resourcesService = inject(ResourcesService);

  selectedProjectId = signal<string | null>(null);

  readonly icons = {
    file: FileText,
    folder: FolderOpen
  };

  readonly projects = computed<IProject[]>(() => {
    const seen = new Set<string>();
    const unique: IProject[] = [];
    for (const participation of this.participationsStore.participations()) {
      const project = participation.project;
      if (!project || seen.has(project.id)) continue;
      seen.add(project.id);
      unique.push(project);
    }
    return unique;
  });

  constructor() {
    effect(() => {
      const projectList = this.projects();
      const selected = this.selectedProjectId();
      if (projectList.length === 0) {
        this.selectedProjectId.set(null);
        this.resourcesStore.clearResources();
        return;
      }

      if (!selected || !projectList.some((p) => p.id === selected)) {
        const firstId = projectList[0].id;
        this.selectedProjectId.set(firstId);
        this.loadResourcesForProject(firstId);
      }
    });
  }

  ngOnInit(): void {
    this.participationsStore.myParticipations();
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

  onDownloadResource(resource: IResource): void {
    const url = this._resourcesService.getResourceFileUrl(resource);
    window.open(url, '_blank');
  }

  onViewResource(resource: IResource): void {
    const url = this._resourcesService.getResourceFileUrl(resource);
    window.open(url, '_blank');
  }

  private loadResourcesForProject(projectId: string): void {
    const filter: ResourcesFilter = {
      page: 1,
      category: this.resourcesStore.filterCategory() ?? undefined
    };

    this.resourcesStore.loadResourcesByProject({ projectId, filter });
  }
}
