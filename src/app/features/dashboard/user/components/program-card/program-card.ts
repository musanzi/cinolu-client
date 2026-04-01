import { Component, input, computed, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { IProject } from '@shared/models';
import {
  LucideAngularModule,
  LucideIconData,
  BadgeCheck,
  Calendar,
  CalendarX,
  ArrowRight,
  LockKeyhole,
  CirclePlay,
  Clock3
} from 'lucide-angular';

@Component({
  selector: 'app-program-card',
  imports: [CommonModule, RouterModule, DatePipe, LucideAngularModule],
  templateUrl: './program-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramCard {
  project = input.required<IProject>();
  isProgramClosed = input.required<boolean>();
  hasApplied = input.required<boolean>();

  readonly icons = {
    verified: BadgeCheck,
    event: Calendar,
    eventBusy: CalendarX,
    arrowForward: ArrowRight
  };

  daysUntilStart = computed(() => {
    const startDate = new Date(this.project().started_at);
    const today = new Date();
    const diff = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  });

  isStartingSoon = computed(() => this.daysUntilStart() <= 14 && this.daysUntilStart() > 0);

  isProgramActive = computed(() => {
    const project = this.project();
    const now = new Date();
    const startedAt = new Date(project.started_at);
    const endedAt = new Date(project.ended_at);
    return startedAt <= now && endedAt >= now;
  });

  statusConfig = computed(() => {
    if (this.isProgramClosed()) {
      return {
        label: 'Terminé',
        icon: LockKeyhole as LucideIconData,
        classes: 'bg-gray-100 text-gray-600 border-gray-200'
      };
    }
    if (this.isProgramActive()) {
      return {
        label: 'En cours',
        icon: CirclePlay as LucideIconData,
        classes: 'bg-primary-50 text-primary-600 border-primary-200'
      };
    }
    return {
      label: 'À venir',
      icon: Clock3 as LucideIconData,
      classes: 'bg-primary-50 text-primary-600 border-primary-200'
    };
  });
}
