import { Component, computed, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ParticipationsStore } from '../../../store/participations.store';
import { IParticipation, IPhase } from '../../../../../shared/models/entities.models';
import {
  BadgeCheck,
  Clock3,
  FolderOpen,
  LucideAngularModule,
  LucideIconData,
  TrendingUp,
  XCircle
} from 'lucide-angular';

enum ParticipationStatus {
  VALIDATED = 'VALIDATED',
  IN_PROGRESS = 'IN_PROGRESS',
  ELIMINATED = 'ELIMINATED'
}

interface ParticipationAnalysis {
  status: ParticipationStatus;
  totalProjectPhases: number;
  completedPhases: number;
  remainingPhases: number;
  progressPercentage: number;
  currentPhase: IPhase | null;
  isComplete: boolean;
}

interface StatusConfig {
  label: string;
  icon: LucideIconData;
  classes: string;
  badgeClasses: string;
  borderClasses: string;
}

@Component({
  selector: 'app-accepted-programs',
  imports: [CommonModule, RouterLink, LucideAngularModule],
  providers: [],
  templateUrl: './accepted-programs.html',
  styleUrls: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AcceptedPrograms implements OnInit {
  participationsStore = inject(ParticipationsStore);

  icons = {
    folder: FolderOpen,
    pending: Clock3,
    trending: TrendingUp,
    verified: BadgeCheck,
    cancel: XCircle
  };

  validParticipations = computed(() => {
    return this.participationsStore.participations().filter((p) => this.isValidForAcceptedPrograms(p));
  });

  stats = computed(() => {
    const valid = this.validParticipations();
    const analyses = valid.map((p) => this.analyzeParticipation(p));
    return {
      total: valid.length,
      validated: analyses.filter((a) => a.status === ParticipationStatus.VALIDATED).length,
      inProgress: analyses.filter((a) => a.status === ParticipationStatus.IN_PROGRESS).length,
      averageProgress:
        analyses.length > 0
          ? Math.round(analyses.reduce((sum, a) => sum + a.progressPercentage, 0) / analyses.length)
          : 0
    };
  });

  ngOnInit(): void {
    this.participationsStore.myParticipations();
  }

  private isQualifiedParticipation(participation: IParticipation): boolean {
    const latestReview = [...(participation.reviews ?? [])].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];

    if (latestReview) {
      return latestReview.score >= 60;
    }

    return participation.status === 'qualified';
  }

  private isValidForAcceptedPrograms(participation: IParticipation): boolean {
    const project = participation.project;
    if (!project) return false;
    const projectPhases = project.phases ?? [];
    return projectPhases.length >= 1 && this.isQualifiedParticipation(participation);
  }

  analyzeParticipation(participation: IParticipation): ParticipationAnalysis {
    const projectPhases = participation.project?.phases ?? [];
    const completedPhases = participation.phases ?? [];

    const totalProjectPhases = projectPhases.length;
    const completedPhasesCount = completedPhases.length;
    const remainingPhases = Math.max(0, totalProjectPhases - completedPhasesCount);
    const progressPercentage =
      totalProjectPhases > 0 ? Math.round((completedPhasesCount / totalProjectPhases) * 100) : 0;

    // Calculer combien de phases du projet sont déjà terminées
    const now = new Date();
    const endedProjectPhasesCount = projectPhases.filter((phase) => {
      const phaseEndDate = new Date(phase.ended_at);
      return phaseEndDate <= now;
    }).length;

    const status = this.determineStatus(completedPhasesCount, totalProjectPhases, endedProjectPhasesCount);
    const currentPhase = completedPhases.length > 0 ? completedPhases[completedPhases.length - 1] : null;

    return {
      status,
      totalProjectPhases,
      completedPhases: completedPhasesCount,
      remainingPhases,
      progressPercentage,
      currentPhase,
      isComplete: completedPhasesCount === totalProjectPhases && totalProjectPhases > 0
    };
  }

  private determineStatus(completed: number, total: number, endedPhases: number): ParticipationStatus {
    if (completed === total && total > 0) {
      return ParticipationStatus.VALIDATED;
    }
    const phasesDelay = endedPhases - completed;

    if (phasesDelay >= 2) {
      return ParticipationStatus.ELIMINATED;
    }
    return ParticipationStatus.IN_PROGRESS;
  }
  getStatusConfig(status: ParticipationStatus): StatusConfig {
    const icons = this.icons;
    const configs: Record<ParticipationStatus, StatusConfig> = {
      [ParticipationStatus.VALIDATED]: {
        label: 'Validé',
        icon: icons.verified,
        classes: 'bg-primary-50 text-primary-700',
        badgeClasses: 'bg-primary-100 text-primary-800 border-primary-200',
        borderClasses: 'border-primary-300 hover:border-primary-400'
      },
      [ParticipationStatus.IN_PROGRESS]: {
        label: 'En traitement',
        icon: icons.pending,
        classes: 'bg-blue-50 text-blue-700',
        badgeClasses: 'bg-blue-100 text-blue-800 border-blue-200',
        borderClasses: 'border-blue-300 hover:border-blue-400'
      },
      [ParticipationStatus.ELIMINATED]: {
        label: 'Éliminé',
        icon: icons.cancel,
        classes: 'bg-red-50 text-red-700',
        badgeClasses: 'bg-red-100 text-red-800 border-red-200',
        borderClasses: 'border-red-300 hover:border-red-400'
      }
    };

    return configs[status];
  }

  getAnalysis(participation: IParticipation): ParticipationAnalysis {
    return this.analyzeParticipation(participation);
  }

  getConfig(participation: IParticipation): StatusConfig {
    const analysis = this.analyzeParticipation(participation);
    return this.getStatusConfig(analysis.status);
  }
}
