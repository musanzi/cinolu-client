import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ResourceCategory } from '@shared/models/entities.models';
import {
  BookOpen,
  FileText,
  Scale,
  Presentation,
  Calculator,
  FileBarChart,
  File,
  LucideAngularModule
} from 'lucide-angular';

@Component({
  selector: 'app-resource-category-badge',
  imports: [CommonModule, LucideAngularModule],
  template: `
    <span
      [class]="
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ' +
        getCategoryColors()
      ">
      <lucide-icon [img]="getCategoryIcon()" [size]="14" />
      <span>{{ getCategoryLabel() }}</span>
    </span>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceCategoryBadge {
  @Input({ required: true }) category!: ResourceCategory;

  private readonly categoryConfig: Record<
    ResourceCategory,
    { label: string; colors: string; icon: typeof BookOpen }
  > = {
    [ResourceCategory.GUIDE]: {
      label: 'Guide',
      colors: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      icon: BookOpen
    },
    [ResourceCategory.TEMPLATE]: {
      label: 'Template',
      colors: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      icon: FileText
    },
    [ResourceCategory.LEGAL]: {
      label: 'Légal',
      colors: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      icon: Scale
    },
    [ResourceCategory.PITCH]: {
      label: 'Pitch',
      colors: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      icon: Presentation
    },
    [ResourceCategory.FINANCIAL]: {
      label: 'Financier',
      colors: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      icon: Calculator
    },
    [ResourceCategory.REPORT]: {
      label: 'Rapport',
      colors: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      icon: FileBarChart
    },
    [ResourceCategory.OTHER]: {
      label: 'Autre',
      colors: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
      icon: File
    }
  };

  getCategoryLabel(): string {
    return this.categoryConfig[this.category]?.label ?? 'Inconnu';
  }

  getCategoryColors(): string {
    return this.categoryConfig[this.category]?.colors ?? this.categoryConfig[ResourceCategory.OTHER].colors;
  }

  getCategoryIcon(): typeof BookOpen {
    return this.categoryConfig[this.category]?.icon ?? File;
  }
}
