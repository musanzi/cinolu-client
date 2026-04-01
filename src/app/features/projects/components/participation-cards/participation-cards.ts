import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideAngularModule, ThumbsUp, Check, MapPin, Building2, Layers } from 'lucide-angular';
import { ApiImgPipe } from '@shared/pipes/api-img.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { AuthStore } from '@core/auth/auth.store';
import { ParticipationsStore } from '@features/dashboard/shared/store/participations.store';
import { VoteStore } from '@features/dashboard/shared/store/vote.store';
import type {
  IProject,
  IProjectParticipationReview,
  IParticipationWithVote,
  ParticipationReviewStatus
} from '@shared/models/entities.models';

@Component({
  selector: 'app-participation-cards',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideAngularModule, ApiImgPipe, TranslateModule],
  templateUrl: './participation-cards.html'
})
export class ParticipationCards {
  participationsStore = inject(ParticipationsStore);
  voteStore = inject(VoteStore);
  authStore = inject(AuthStore);
  router = inject(Router);

  project = input<IProject | null>(null);

  authRequired = output<void>();

  canVote = computed(() => this.participationsStore.canVote(this.project()));
  voteClos = computed(() => !this.canVote());
  isAuthenticated = computed(() => this.authStore.user() != null);

  icons = { thumbsUp: ThumbsUp, check: Check, mapPin: MapPin, building2: Building2, layers: Layers };

  private getLatestReview(participation: IParticipationWithVote): IProjectParticipationReview | null {
    const reviews = participation.reviews ?? [];
    if (!reviews.length) return null;
    return [...reviews].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0] ?? null;
  }

  getParticipationStatus(participation: IParticipationWithVote): ParticipationReviewStatus | null {
    const latestReview = this.getLatestReview(participation);
    if (latestReview) {
      return latestReview.score >= 60 ? 'qualified' : 'disqualified';
    }

    return participation.status ?? null;
  }

  onVoteClick(participationId: string): void {
    if (!this.isAuthenticated()) {
      this.authRequired.emit();
      return;
    }
    this.voteStore.upvote(participationId);
  }

  removeVote(participationId: string): void {
    this.voteStore.removeVote(participationId);
  }
}
