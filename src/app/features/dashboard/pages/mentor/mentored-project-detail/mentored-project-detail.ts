import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { MentorshipStore } from '../../../store/mentorship.store';
import { IPhase, ParticipationReviewStatus } from '@shared/models/entities.models';
import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Layers,
  LucideAngularModule,
  Search,
  ShieldCheck,
  User,
  UserX,
  Users
} from 'lucide-angular';
import { ProjectStore } from '@features/projects/store/project.store';
import { MentoredProjectResources } from "./components/mentored-project-resources";

@Component({
  selector: 'app-mentored-project-detail',
  providers: [ProjectStore],
  imports: [RouterLink, NgClass, FormsModule, ApiImgPipe, CommonModule, LucideAngularModule, MentoredProjectResources],
  templateUrl: './mentored-project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MentoredProjectDetail implements OnInit, OnDestroy {
  mentorshipStore = inject(MentorshipStore);
  private route = inject(ActivatedRoute);
  projectStore = inject(ProjectStore);

  readonly icons = {
    arrowBack: ArrowLeft,
    calendar: CalendarDays,
    check: Check,
    chevronRight: ChevronRight,
    error: CircleAlert,
    group: Users,
    groupOff: UserX,
    layers: Layers,
    person: User,
    review: ShieldCheck,
    schedule: Clock3,
    search: Search
  };

  projectId = signal<string>('');
  searchQuery = signal<string>('');
  selectedPhaseId = signal<string>('');
  selectedStatus = signal<ParticipationReviewStatus | ''>('');
  activeTab = signal<'participations' | 'resources'>('participations');

  constructor() {
    effect(() => {
      const project = this.mentorshipStore.selectedProject();
      if (!project?.id || this.projectId() === project.id) return;

      this.projectId.set(project.id);
      this.mentorshipStore.loadParticipations({ projectId: project.id });
    });
  }

  getProgress(completedCount: number, totalPhases: number): number {
    if (!totalPhases) return 0;
    return Math.round((completedCount / totalPhases) * 100);
  }

  myPhases = computed<IPhase[]>(() => {
    const project = this.mentorshipStore.selectedProject();
    if (!project?.phases) return [];
    return project.phases;
  });

  ngOnInit(): void {
    const projectSlug = this.route.snapshot.paramMap.get('projectId') ?? '';
    if (!projectSlug) return;

    this.projectStore.loadProject(projectSlug);
    this.mentorshipStore.loadMentoredProject(projectSlug);
  }

  ngOnDestroy(): void {
    this.mentorshipStore.clearSelectedProject();
  }

  onSearch(q: string): void {
    this.searchQuery.set(q);
    this.applyFilters();
  }

  onPhaseFilter(phaseId: string): void {
    this.selectedPhaseId.set(phaseId);
    this.applyFilters();
  }

  onStatusFilter(status: ParticipationReviewStatus | ''): void {
    this.selectedStatus.set(status);
    this.applyFilters();
  }

  private applyFilters(): void {
    const id = this.projectId();
    const q = this.searchQuery();
    const phaseId = this.selectedPhaseId();
    const status = this.selectedStatus();
    this.mentorshipStore.setFilter(id, q, phaseId, status);
    this.mentorshipStore.loadParticipations({
      projectId: id,
      filter: { page: 1, q: q || undefined, phaseId: phaseId || undefined, status: status || undefined }
    });
  }

  loadMore(): void {
    const nextPage = this.mentorshipStore.currentPage() + 1;
    this.mentorshipStore.loadParticipations({
      projectId: this.projectId(),
      filter: {
        page: nextPage,
        q: this.searchQuery() || undefined,
        phaseId: this.selectedPhaseId() || undefined,
        status: this.selectedStatus() || undefined
      }
    });
  }

  trackById(_: number, item: { id: string }): string {
    return item.id;
  }

  getPhaseStatus(phase: IPhase): 'active' | 'past' | 'future' {
    const now = new Date();
    const start = new Date(phase.started_at);
    const end = new Date(phase.ended_at);
    if (start <= now && end >= now) return 'active';
    if (end < now) return 'past';
    return 'future';
  }

  onTabChange(tab: 'participations' | 'resources'): void {
    this.activeTab.set(tab);
  }

  getReviewStatusMeta(status?: ParticipationReviewStatus): { label: string; classes: string } {
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
