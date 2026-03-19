import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, computed } from '@angular/core';
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

@Component({
  selector: 'app-mentored-participation-detail',
  imports: [NgClass, ApiImgPipe, CommonModule, LucideAngularModule],
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
    schedule: Clock3,
    thumbUp: ThumbsUp,
    trendingUp: TrendingUp,
    uploadFile: FileUp,
    filePdf: FileText
  };

  participationId!: string;

  apiUrl = environment.apiUrl;

  completedPhaseIds = computed<Set<string>>(() => {
    const p = this.mentorshipStore.selectedParticipation();
    return new Set(p?.phases?.map((ph) => ph.id) ?? []);
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
}
