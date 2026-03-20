import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProjectStore } from '../../../../projects/store/project.store';
import { VenturesStore } from '../../../store/ventures.store';
import { ParticipationsStore } from '../../../store/participations.store';
import { ApiImgPipe } from '../../../../../shared/pipes/api-img.pipe';
import { AuthStore } from '@core/auth/auth.store';
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Briefcase,
  Calendar,
  CalendarX,
  CheckCircle,
  Clock3,
  FileText,
  Images,
  Info,
  Lightbulb,
  Lock,
  LucideAngularModule,
  Rocket,
  SearchX,
  Send,
  Tag,
  Trophy,
  User
} from 'lucide-angular';
import { ButtonComponent, DialogComponent } from '@shared/ui';

@Component({
  selector: 'app-program-detail',
  imports: [CommonModule, ApiImgPipe, RouterLink, LucideAngularModule, ButtonComponent, DialogComponent],
  providers: [ProjectStore],
  templateUrl: './program-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ProgramDetail implements OnInit {
  route = inject(ActivatedRoute);
  router = inject(Router);
  projectStore = inject(ProjectStore);
  venturesStore = inject(VenturesStore);
  participationsStore = inject(ParticipationsStore);
  authStore = inject(AuthStore);

  showVentureSelectionModal = signal(false);
  showConfirmModal = signal(false);
  confirmTitle = signal('');
  confirmMessage = signal('');
  confirmAcceptLabel = signal('OK');
  confirmHideReject = signal(false);
  confirmIcon = signal<'alert' | 'info'>('alert');
  pendingConfirmAction = signal<(() => void) | null>(null);

  readonly icons = {
    alertTriangle: AlertTriangle,
    arrowLeft: ArrowLeft,
    arrowRight: ArrowRight,
    briefcase: Briefcase,
    calendar: Calendar,
    calendarX: CalendarX,
    checkCircle: CheckCircle,
    clock: Clock3,
    description: FileText,
    images: Images,
    info: Info,
    lightbulb: Lightbulb,
    lock: Lock,
    rocket: Rocket,
    search: SearchX,
    send: Send,
    tag: Tag,
    trophy: Trophy,
    user: User,
    verified: BadgeCheck
  };

  readonly projectStatus = computed(() => {
    const project = this.projectStore.project();
    if (!project) return null;
    const now = new Date();
    const startedAt = new Date(project.started_at);
    const endedAt = new Date(project.ended_at);
    if (startedAt <= now && endedAt >= now) return 'En cours';
    if (startedAt > now) return 'À venir';
    return 'Terminé';
  });

  readonly statusBadgeClasses = computed(() => {
    switch (this.projectStatus()) {
      case 'En cours':
        return 'bg-green-50 text-green-700 border-green-300';
      case 'À venir':
        return 'bg-blue-50 text-blue-700 border-blue-300';
      case 'Terminé':
        return 'bg-red-50 text-red-700 border-red-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.params['slug'];
    this.projectStore.loadProject(slug);
    this.venturesStore.loadAllVentures();
    this.participationsStore.myParticipations();
  }

  isProgramClosed(): boolean {
    const project = this.projectStore.project();
    if (!project?.ended_at) return false;
    return new Date(project.ended_at) < new Date();
  }

  hasApplied(): boolean {
    const project = this.projectStore.project();
    if (!project) return false;
    return this.participationsStore.participations().some((p) => p?.project?.id === project.id);
  }

  onApplyClick(): void {
    const project = this.projectStore.project();
    if (!project) return;
    const ventures = this.venturesStore.ventures();

    if (ventures.length === 0) {
      this.confirmIcon.set('alert');
      this.confirmTitle.set('Aucun projet');
      this.confirmMessage.set('Vous devez créer un projet avant de pouvoir postuler à un programme.');
      this.confirmAcceptLabel.set('Créer un projet');
      this.confirmHideReject.set(false);
      this.pendingConfirmAction.set(() => this.router.navigate(['/dashboard/user/ventures/create']));
      this.showConfirmModal.set(true);
      return;
    }
    if (ventures.length === 1) {
      this.submitApplication(ventures[0].id);
      return;
    }
    this.showVentureSelectionModal.set(true);
  }

  onConfirmAccept(): void {
    const action = this.pendingConfirmAction();
    if (action) action();
    this.showConfirmModal.set(false);
  }

  submitApplication(ventureId: string): void {
    const project = this.projectStore.project();
    if (!project) return;
    const alreadyApplied = this.participationsStore.checkExistingParticipation(project.id, ventureId);
    if (alreadyApplied) {
      this.confirmIcon.set('info');
      this.confirmTitle.set('Candidature existante');
      this.confirmMessage.set('Vous avez déjà postulé à ce programme avec ce projet.');
      this.confirmAcceptLabel.set('Compris');
      this.confirmHideReject.set(true);
      this.pendingConfirmAction.set(null);
      this.showConfirmModal.set(true);
      return;
    }
    this.participationsStore.create({ projectId: project.id, ventureId });
    this.showVentureSelectionModal.set(false);
  }
}
