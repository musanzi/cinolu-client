import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, OnInit, ChangeDetectionStrategy, signal } from '@angular/core';
import { ProjectSkeleton } from '../../components/project-skeleton/project-skeleton';
import { LucideAngularModule, ThumbsUp } from 'lucide-angular';
import { ProjectStore } from '../../store/project.store';
import { formatDateForGoogleCalendarUTC, openExternalUrl } from '@shared/helpers';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/auth/auth.store';
import { AuthRequiredModalComponent } from '@shared/components/auth-required-modal/auth-required-modal';
import { ParticipationsStore } from '@features/dashboard/shared/store/participations.store';
import { VoteStore } from '@features/dashboard/shared/store/vote.store';
import { ParticipationCards } from '../../components/participation-cards/participation-cards';
import { ProjectDetailHeaderComponent } from '../../components/project-detail-header/project-detail-header';
import { ProjectDetailGalleryComponent } from '../../components/project-detail-gallery/project-detail-gallery';
import { ProjectDetailCollapsibleComponent } from '../../components/project-detail-collapsible/project-detail-collapsible';
import { ProjectDetailPhasesComponent } from '../../components/project-detail-phases/project-detail-phases';
import { ProjectDetailMetaComponent } from '../../components/project-detail-meta/project-detail-meta';
import { ProjectDetailDatesComponent } from '../../components/project-detail-dates/project-detail-dates';
import { ProjectDetailCategoriesComponent } from '../../components/project-detail-categories/project-detail-categories';
import { ProjectDetailQuickActionsComponent } from '../../components/project-detail-quick-actions/project-detail-quick-actions';
import { ProjectDetailErrorComponent } from '../../components/project-detail-error/project-detail-error';

@Component({
  selector: 'app-project-detail',
  providers: [ProjectStore, VoteStore],
  imports: [
    CommonModule,
    ProjectSkeleton,
    LucideAngularModule,
    TranslateModule,
    ParticipationCards,
    AuthRequiredModalComponent,
    ProjectDetailHeaderComponent,
    ProjectDetailGalleryComponent,
    ProjectDetailCollapsibleComponent,
    ProjectDetailPhasesComponent,
    ProjectDetailMetaComponent,
    ProjectDetailDatesComponent,
    ProjectDetailCategoriesComponent,
    ProjectDetailQuickActionsComponent,
    ProjectDetailErrorComponent
  ],
  templateUrl: './detail-project.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DetailProject implements OnInit {
  #route = inject(ActivatedRoute);
  #router = inject(Router);
  store = inject(ProjectStore);
  participationsStore = inject(ParticipationsStore);
  authStore = inject(AuthStore);

  activeSection = signal<string | null>(null);
  showAuthModal = signal(false);
  returnUrl = computed(() => this.#router.url.split('?')[0] || '/');
  private lastLoadedProjectId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const project = this.store.project();
      const id = project?.id ?? null;
      if (!id || id === this.lastLoadedProjectId()) return;
      this.lastLoadedProjectId.set(id);
      this.participationsStore.loadProjectParticipations(id);
    });
  }

  expandedDescription = computed(() => this.activeSection() === 'description');
  expandedCriteria = computed(() => this.activeSection() === 'criteria');
  expandedObjectives = computed(() => this.activeSection() === 'objectives');
  expandedContext = computed(() => this.activeSection() === 'context');

  projectStatus = computed(() => {
    const project = this.store.project();
    if (!project) return null;
    const now = new Date();
    const startedAt = new Date(project.started_at);
    const endedAt = new Date(project.ended_at);
    if (startedAt <= now && endedAt >= now) return 'En cours';
    if (startedAt > now) return 'À venir';
    return 'Terminé';
  });

  isProjectOpen = computed(() => {
    const status = this.projectStatus();
    return status === 'En cours' || status === 'À venir';
  });

  statusBadgeClasses = computed(() => {
    const statut = this.projectStatus();
    switch (statut) {
      case 'En cours':
        return 'bg-primary-50 border-primary-200 text-primary-700';
      case 'À venir':
        return 'bg-primary-100/60 border-primary-200 text-primary-700';
      case 'Terminé':
        return 'bg-gray-100 border-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-700';
    }
  });

  private toggleSection(name: string) {
    this.activeSection.set(this.activeSection() === name ? null : name);
  }

  toggleDescription() {
    this.toggleSection('description');
  }
  toggleCriteria() {
    this.toggleSection('criteria');
  }
  toggleObjectives() {
    this.toggleSection('objectives');
  }
  toggleContext() {
    this.toggleSection('context');
  }

  orderedPhases = computed(() => {
    const phases = this.store.project()?.phases ?? [];
    return [...phases].sort(
      (a, b) => ((a as { order?: number }).order ?? 0) - ((b as { order?: number }).order ?? 0)
    );
  });

  icons = { thumbsUp: ThumbsUp };

  ngOnInit(): void {
    const slug = this.#route.snapshot.params['slug'];
    this.store.loadProject(slug);
  }

  addToCalendar() {
    const project = this.store.project();
    if (!project) return;
    const start = formatDateForGoogleCalendarUTC(project.started_at);
    const end = formatDateForGoogleCalendarUTC(project.ended_at);
    const title = encodeURIComponent(project.name || 'Project');
    const details = encodeURIComponent(project.description?.replace(/\n/g, ' ') || '');
    const url = `https://calendar.google.com/calendar/r/eventedit?text=${title}&details=${details}&dates=${start}/${end}`;
    openExternalUrl(url);
  }

  async shareProject() {
    const project = this.store.project();
    if (!project) return;
    const shareData = {
      title: project.name,
      text: (project.description || '').slice(0, 200),
      url: typeof window !== 'undefined' ? window.location.href : ''
    };
    try {
      const nav = navigator as unknown as { share?: (data: typeof shareData) => Promise<void> };
      if (nav.share) {
        await nav.share(shareData);
      } else if (typeof window !== 'undefined') {
        const body = encodeURIComponent(`${shareData.text}\n\n${shareData.url}`);
        window.open(`mailto:?subject=${encodeURIComponent(shareData.title || '')}&body=${body}`, '_blank');
      }
    } catch {
      // ignore
    }
  }

  applyToProject(): void {
    if (!this.authStore.user()) {
      this.showAuthModal.set(true);
      return;
    }
    const project = this.store.project();
    if (!project?.slug) return;
    this.#router.navigate(['/dashboard/user/programs', project.slug]);
  }

  closeAuthModal(): void {
    this.showAuthModal.set(false);
  }
}
