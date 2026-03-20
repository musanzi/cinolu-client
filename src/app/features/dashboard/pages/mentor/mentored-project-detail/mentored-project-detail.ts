import { Component, inject, OnInit, OnDestroy, ChangeDetectionStrategy, signal, computed, effect } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { CommonModule, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { MentorshipStore } from '../../../store/mentorship.store';
import { IPhase } from '@shared/models/entities.models';
import { MentoredProjectResources } from './components/mentored-project-resources';
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
  User,
  UserX,
  Users
} from 'lucide-angular';
import { ProjectStore } from '@features/projects/store/project.store';

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
    schedule: Clock3,
    search: Search
  };

  projectId = signal<string>('');
  searchQuery = signal<string>('');
  selectedPhaseId = signal<string>('');
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

  private applyFilters(): void {
    const id = this.projectId();
    const q = this.searchQuery();
    const phaseId = this.selectedPhaseId();
    this.mentorshipStore.setFilter(id, q, phaseId);
    this.mentorshipStore.loadParticipations({
      projectId: id,
      filter: { page: 1, q: q || undefined, phaseId: phaseId || undefined }
    });
  }

  loadMore(): void {
    const nextPage = this.mentorshipStore.currentPage() + 1;
    this.mentorshipStore.loadParticipations({
      projectId: this.projectId(),
      filter: {
        page: nextPage,
        q: this.searchQuery() || undefined,
        phaseId: this.selectedPhaseId() || undefined
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
}
