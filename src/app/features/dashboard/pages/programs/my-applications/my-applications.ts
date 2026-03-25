import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ParticipationsStore } from '../../../store/participations.store';
import { ApiImgPipe } from '../../../../../shared/pipes/api-img.pipe';
import { IParticipation, ParticipationReviewStatus } from '../../../../../shared/models/entities.models';
import {
  ArrowRight,
  BadgeCheck,
  Briefcase,
  CheckCircle,
  Clock3,
  Compass,
  Eye,
  FolderOpen,
  Inbox,
  LineChart,
  LucideAngularModule,
  LucideIconData,
  Plus,
  XCircle
} from 'lucide-angular';

@Component({
  selector: 'app-my-applications',
  imports: [CommonModule, RouterLink, ApiImgPipe, LucideAngularModule],
  templateUrl: './my-applications.html'
})
export class MyApplications implements OnInit {
  participationsStore = inject(ParticipationsStore);

  icons = {
    add: Plus,
    arrowRight: ArrowRight,
    business: Briefcase,
    cancel: XCircle,
    checkCircle: CheckCircle,
    explore: Compass,
    folder: FolderOpen,
    inbox: Inbox,
    progress: LineChart,
    schedule: Clock3,
    verified: BadgeCheck,
    view: Eye
  };

  ngOnInit(): void {
    this.participationsStore.myParticipations();
  }

  getApplicationStatus(participation: IParticipation): { label: string; classes: string; icon: LucideIconData } {
    if (!participation?.project) {
      return {
        label: 'Indisponible',
        classes: 'bg-slate-100 text-slate-500 border border-slate-200',
        icon: this.icons.cancel
      };
    }

    const reviewStatus = participation.status as ParticipationReviewStatus | undefined;
    switch (reviewStatus) {
      case 'qualified':
        return {
          label: 'Qualifié',
          classes: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
          icon: this.icons.verified
        };
      case 'disqualified':
        return {
          label: 'Disqualifié',
          classes: 'bg-red-50 text-red-700 border border-red-200',
          icon: this.icons.cancel
        };
      case 'in_review':
        return {
          label: 'En revue',
          classes: 'bg-blue-50 text-blue-700 border border-blue-200',
          icon: this.icons.checkCircle
        };
      case 'info_requested':
        return {
          label: 'Infos demandées',
          classes: 'bg-amber-50 text-amber-700 border border-amber-200',
          icon: this.icons.schedule
        };
      case 'pending':
      default:
        return {
          label: 'En attente',
          classes: 'bg-slate-100 text-slate-700 border border-slate-200',
          icon: this.icons.schedule
        };
    }
  }

  hasMultiplePhases(participation: IParticipation): boolean {
    return !!participation.phases && participation.phases.length > 1;
  }

  getPhaseCount(participation: IParticipation): number {
    return participation.phases?.length || 0;
  }
}
