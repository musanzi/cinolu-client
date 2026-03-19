import { Component, Output, EventEmitter, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ResourceCategory } from '@shared/models/entities.models';
import { X, LucideAngularModule } from 'lucide-angular';

export interface ResourceFilterValue {
  category: ResourceCategory | null;
}

@Component({
  selector: 'app-resource-filters',
  imports: [CommonModule, FormsModule, LucideAngularModule],
  templateUrl: './resource-filters.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceFilters {
  @Output() filterChange = new EventEmitter<ResourceFilterValue>();

  selectedCategory = signal<ResourceCategory | null>(null);

  readonly icons = {
    clear: X
  };

  readonly categories: { value: ResourceCategory; label: string }[] = [
    { value: ResourceCategory.GUIDE, label: 'Guide' },
    { value: ResourceCategory.TEMPLATE, label: 'Template' },
    { value: ResourceCategory.LEGAL, label: 'Légal' },
    { value: ResourceCategory.PITCH, label: 'Pitch' },
    { value: ResourceCategory.FINANCIAL, label: 'Financier' },
    { value: ResourceCategory.REPORT, label: 'Rapport' },
    { value: ResourceCategory.OTHER, label: 'Autre' }
  ];

  onCategoryChange(value: string): void {
    this.selectedCategory.set(value === '' ? null : (value as ResourceCategory));
    this.emitFilter();
  }

  resetFilters(): void {
    this.selectedCategory.set(null);
    this.emitFilter();
  }

  private emitFilter(): void {
    this.filterChange.emit({
      category: this.selectedCategory()
    });
  }
}
