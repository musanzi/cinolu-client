import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IResource } from '@shared/models/entities.models';
import { ResourceCategoryBadge } from '../resource-category-badge/resource-category-badge';
import { Download, Eye, Trash2, LucideAngularModule } from 'lucide-angular';
import { ResourcesService } from '@features/dashboard/shared/services/resources.service';

@Component({
  selector: 'app-resource-card',
  imports: [CommonModule, ResourceCategoryBadge, LucideAngularModule],
  templateUrl: './resource-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceCard {
  @Input({ required: true }) resource!: IResource;
  @Input() showActions = true;
  @Input() showDelete = false; // Only show delete for mentors with permission

  @Output() download = new EventEmitter<IResource>();
  @Output() delete = new EventEmitter<IResource>();
  @Output() view = new EventEmitter<IResource>();

  private _resourcesService = inject(ResourcesService);

  readonly icons = {
    download: Download,
    eye: Eye,
    trash: Trash2
  };

  getFileExtension(): string {
    return this._resourcesService.getFileExtension(this.resource);
  }

  onDownload(event: Event): void {
    event.stopPropagation();
    this.download.emit(this.resource);
  }

  onView(event?: Event): void {
    if (event) event.stopPropagation();
    this.view.emit(this.resource);
  }

  onDelete(event: Event): void {
    event.stopPropagation();
    this.delete.emit(this.resource);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}
