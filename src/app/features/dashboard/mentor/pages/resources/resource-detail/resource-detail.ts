import { Component, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ResourcesStore } from '@features/dashboard/shared/store/resources.store';
import { ResourcesService } from '@features/dashboard/shared/services/resources.service';
import { ResourceCategoryBadge } from '@features/dashboard/shared/components/resources/resource-category-badge/resource-category-badge';
import { ResourceForm, type ResourceFormValue } from '@features/dashboard/shared/components/resources/resource-form/resource-form';
import { UpdateResourceDto } from '@shared/models/entities.models';
import {
  ArrowLeft,
  Download,
  Edit,
  Trash2,
  Calendar,
  FolderOpen,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-resource-detail',
  imports: [CommonModule, ResourceCategoryBadge, ResourceForm, LucideAngularModule],
  templateUrl: './resource-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceDetail implements OnInit {
  private _route = inject(ActivatedRoute);
  private _router = inject(Router);
  resourcesStore = inject(ResourcesStore);
  private _resourcesService = inject(ResourcesService);

  readonly icons = {
    back: ArrowLeft,
    download: Download,
    edit: Edit,
    trash: Trash2,
    calendar: Calendar,
    folder: FolderOpen
  };

  showEditModal = signal(false);

  ngOnInit(): void {
    const resourceId = this._route.snapshot.paramMap.get('id');
    if (!resourceId) {
      this._router.navigate(['/dashboard/mentor/resources']);
      return;
    }

    // Try to find the resource in the store first
    const existingResource = this.resourcesStore
      .resources()
      .find((r) => r.id === resourceId);

    if (existingResource) {
      this.resourcesStore.selectResource(existingResource);
    } else {
      // If not in store, we'd need a getResourceById endpoint
      // For now, navigate back
      this._router.navigate(['/dashboard/mentor/resources']);
    }
  }

  onDownload(): void {
    const resource = this.resourcesStore.selectedResource();
    if (!resource) return;

    const url = this._resourcesService.getResourceFileUrl(resource);
    window.open(url, '_blank');
  }

  onEdit(): void {
    this.showEditModal.set(true);
  }

  closeEditModal(): void {
    this.showEditModal.set(false);
  }

  onSubmitEdit(event: { value: ResourceFormValue; file?: File }): void {
    const resource = this.resourcesStore.selectedResource();
    if (!resource) return;

    const dto: UpdateResourceDto = {
      title: event.value.title,
      description: event.value.description,
      category: event.value.category,
      projectId: event.value.projectId || undefined,
      phaseId: event.value.phaseId || undefined
    };

    this.resourcesStore.updateResource({ id: resource.id, dto });

    // If file is provided, update it separately
    if (event.file) {
      this.resourcesStore.updateResourceFile({ id: resource.id, file: event.file });
    }

    this.closeEditModal();
  }

  onDelete(): void {
    const resource = this.resourcesStore.selectedResource();
    if (!resource) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${resource.title}" ?`)) {
      this.resourcesStore.deleteResource(resource.id);
      this._router.navigate(['/dashboard/mentor/resources']);
    }
  }

  goBack(): void {
    this._router.navigate(['/dashboard/mentor/resources']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getFileExtension(): string {
    const resource = this.resourcesStore.selectedResource();
    return resource ? this._resourcesService.getFileExtension(resource) : '';
  }

  isPreviewable(): boolean {
    const resource = this.resourcesStore.selectedResource();
    return resource ? this._resourcesService.isPreviewable(resource) : false;
  }

  getInitialFormValue(): ResourceFormValue | undefined {
    const resource = this.resourcesStore.selectedResource();
    if (!resource) return undefined;

    return {
      title: resource.title,
      description: resource.description,
      category: resource.category,
      projectId: resource.project?.id,
      phaseId: resource.phase?.id
    };
  }
}
