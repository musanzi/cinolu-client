import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { CommonModule, NgClass } from '@angular/common';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { MentorshipStore } from '../../../store/mentorship.store';
import { environment } from '@environments/environment';
import {
  ArrowLeft,
  Ban,
  Building,
  Calendar,
  CalendarDays,
  Check,
  CircleAlert,
  Clock3,
  FileText,
  FileUp,
  ShieldCheck,
  Layers,
  LucideAngularModule,
  MapPin,
  MapPinned,
  Phone,
  Play,
  ThumbsUp,
  TrendingUp,
  User
} from 'lucide-angular';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { IPhase, IProjectParticipationReview, ParticipationReviewStatus } from '@shared/models/entities.models';

@Component({
  selector: 'app-mentored-participation-detail',
  imports: [NgClass, ApiImgPipe, CommonModule, LucideAngularModule, FormsModule],
  templateUrl: './mentored-participation-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentoredParticipationDetail implements OnInit, OnDestroy {
  mentorshipStore = inject(MentorshipStore);
  private route = inject(ActivatedRoute);

  readonly icons = {
    arrowBack: ArrowLeft,
    block: Ban,
    business: Building,
    calendar: CalendarDays,
    check: Check,
    error: CircleAlert,
    event: Calendar,
    layers: Layers,
    location: MapPin,
    phone: Phone,
    place: MapPinned,
    play: Play,
    profile: User,
    review: ShieldCheck,
    schedule: Clock3,
    thumbUp: ThumbsUp,
    trendingUp: TrendingUp,
    uploadFile: FileUp,
    filePdf: FileText
  };

  participationId!: string;

  apiUrl = environment.apiUrl;
  selectedReviewPhaseId = signal<string>('');
  reviewScore = signal<number | null>(null);
  reviewMessage = signal<string>('');
  notifyParticipant = signal<boolean>(false);

  completedPhaseIds = computed<Set<string>>(() => {
    const p = this.mentorshipStore.selectedParticipation();
    return new Set(p?.phases?.map((ph) => ph.id) ?? []);
  });

  reviewsByPhase = computed<Map<string, IProjectParticipationReview>>(() => {
    const reviews = this.mentorshipStore.selectedParticipation()?.reviews ?? [];
    return new Map(reviews.map((review) => [review.phase?.id, review]));
  });

  getPhaseStatus(phaseId: string, started_at: Date, ended_at: Date): 'completed' | 'active' | 'future' | 'past' {
    if (this.completedPhaseIds().has(phaseId)) return 'completed';
    const now = new Date();
    const start = new Date(started_at);
    const end = new Date(ended_at);
    if (start > now) return 'future';
    if (end < now) return 'past';
    return 'active';
  }

  getSubmissionForPhase(phaseId: string) {
    const p = this.mentorshipStore.selectedParticipation();
    return p?.deliverable_submissions?.find(
      (s) =>
        s.deliverable?.id &&
        p.phases?.some((ph) => ph.id === phaseId && ph.deliverables?.some((d) => d.id === s.deliverable?.id))
    );
  }

  hasDeliverables(phase: { deliverables?: unknown[] }): boolean {
    return Array.isArray(phase.deliverables) && phase.deliverables.length > 0;
  }

  getFileUrl(filename: string): string {
    return `${this.apiUrl}uploads/deliverables/${filename}`;
  }

  ngOnInit(): void {
    this.participationId = this.route.snapshot.paramMap.get('participationId') ?? '';
    this.mentorshipStore.loadParticipationDetail({
      participationId: this.participationId
    });
  }

  ngOnDestroy(): void {
    this.mentorshipStore.clearSelectedParticipation();
  }

  getSortedProjectPhases(projectPhases: IPhase[]): IPhase[] {
    return [...projectPhases].sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
  }

  getReviewForPhase(phaseId: string): IProjectParticipationReview | undefined {
    return this.reviewsByPhase().get(phaseId);
  }

  selectReviewPhase(phaseId: string): void {
    this.selectedReviewPhaseId.set(phaseId);
    const review = this.getReviewForPhase(phaseId);
    this.reviewScore.set(review?.score ?? null);
    this.reviewMessage.set(review?.message ?? '');
    this.notifyParticipant.set(false);
  }

  submitReview(): void {
    const participation = this.mentorshipStore.selectedParticipation();
    const project = participation?.project;
    const phaseId = this.selectedReviewPhaseId();
    const score = this.reviewScore();

    if (
      !participation ||
      !project ||
      !phaseId ||
      score === null ||
      !Number.isInteger(score) ||
      score < 0 ||
      score > 100
    ) {
      return;
    }

    const message = this.reviewMessage().trim();
    const existingReview = this.getReviewForPhase(phaseId);

    this.mentorshipStore.submitParticipationReview({
      participationId: participation.id,
      payload: existingReview
        ? {
            reviewId: existingReview.id,
            score,
            message: message || undefined,
            notifyParticipant: this.notifyParticipant()
          }
        : {
            phaseId,
            score,
            message: message || undefined,
            notifyParticipant: this.notifyParticipant()
          },
      refreshProjectId: project.id,
      refreshFilter: {
        page: 1
      }
    });
  }

  getParticipationStatus(): ParticipationReviewStatus {
    const participation = this.mentorshipStore.selectedParticipation();
    const reviews = participation?.reviews ?? [];
    const latestReview = [...reviews].sort(
      (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )[0];

    if (latestReview) {
      return latestReview.score >= 60 ? 'qualified' : 'disqualified';
    }

    return participation?.status ?? 'pending';
  }

  getReviewStatusMeta(status?: string): { label: string; classes: string } {
    switch (status) {
      case 'qualified':
        return { label: 'Qualifié', classes: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'disqualified':
        return { label: 'Disqualifié', classes: 'bg-red-50 text-red-700 border-red-200' };
      case 'in_review':
        return { label: 'En revue', classes: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'info_requested':
        return { label: 'Infos demandées', classes: 'bg-amber-50 text-amber-700 border-amber-200' };
      case 'pending':
      default:
        return { label: 'En attente', classes: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  }
}
