import { Component, inject, OnInit, signal, computed, ChangeDetectionStrategy, effect } from '@angular/core';
import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ParticipationsStore } from '../../../store/participations.store';
import { ProgramCard } from '../../../components/program-card/program-card';
import { IProject } from '@shared/models';
import { ProjectsStore } from '../../../../projects/store/projects.store';
import { Calendar, CalendarX, Clock3, Compass, LucideAngularModule, Rocket, SearchX } from 'lucide-angular';

type LoadingPhase = 'current' | 'upcoming' | 'done';

@Component({
  selector: 'app-discover-programs',
  imports: [NgClass, NgTemplateOutlet, ProgramCard, LucideAngularModule],
  templateUrl: './discover.html',
  providers: [ProjectsStore],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DiscoverPrograms implements OnInit {
  projectsStore = inject(ProjectsStore);
  participationsStore = inject(ParticipationsStore);

  loadingPhase = signal<LoadingPhase>('current');
  currentList = signal<IProject[]>([]);
  upcomingList = signal<IProject[]>([]);

  currentProjects = this.currentList.asReadonly();
  upcomingProjects = this.upcomingList.asReadonly();

  isCurrentLoading = computed(() => this.loadingPhase() === 'current');
  isUpcomingLoading = computed(() => this.loadingPhase() === 'upcoming');
  isFullyLoaded = computed(() => this.loadingPhase() === 'done');

  hasNoProjectsAtAll = computed(
    () => this.isFullyLoaded() && this.currentList().length === 0 && this.upcomingList().length === 0
  );

  icons = {
    current: Rocket,
    emptyCurrent: CalendarX,
    explore: Compass,
    search: SearchX,
    upcoming: Calendar,
    upcomingHeader: Clock3
  };

  currentHeaderContext = {
    icon: this.icons.current,
    label: 'Programmes en cours'
  } as const;

  upcomingHeaderContext = {
    icon: this.icons.upcomingHeader,
    label: 'Programmes à venir',
    accent: 'blue'
  } as const;

  emptyCurrentContext = {
    title: 'Aucun programme en cours',
    message: "Il n'y a pas de programmes actifs pour le moment.",
    icon: this.icons.emptyCurrent
  } as const;

  emptyUpcomingContext = {
    title: 'Aucun programme à venir',
    message: "Il n'y a pas de programmes prévus pour l'instant. Revenez bientôt !",
    icon: this.icons.upcoming
  } as const;

  loadingPrimaryContext = { color: 'primary' } as const;
  loadingBlueContext = { color: 'blue' } as const;

  constructor() {
    effect(() => {
      const store = this.projectsStore;
      if (!store) return;

      const isLoading = store.isLoading();
      const phase = this.loadingPhase();

      if (isLoading) return;

      if (phase === 'current') {
        this.currentList.set(store.projects()[0] ?? []);
        this.loadingPhase.set('upcoming');
        store.loadProjects({
          page: '1',
          categories: null,
          status: 'future'
        });
      } else if (phase === 'upcoming') {
        this.upcomingList.set(store.projects()[0] ?? []);
        this.loadingPhase.set('done');
      }
    });
  }

  ngOnInit(): void {
    this.projectsStore.loadProjects({
      page: '1',
      categories: null,
      status: 'current'
    });
    this.participationsStore.myParticipations();
  }

  isProgramClosed(project: IProject): boolean {
    if (!project.ended_at) return false;
    return new Date(project.ended_at) < new Date();
  }

  hasApplied(projectId: string): boolean {
    return this.participationsStore.participations().some((p) => p?.project?.id === projectId);
  }
}
