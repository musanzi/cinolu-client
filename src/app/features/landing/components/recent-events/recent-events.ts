import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LucideAngularModule, MoveUpRight, ArrowRight } from 'lucide-angular';
import { EventCardSkeleton } from '../../../events/components/event-card-skeleton/event-card-skeleton';
import { EventCard } from '../../../events/components/event-card/event-card';
import { RecentEventsStore } from '../../../events/store/recent-events.store';
import { FadeInOnScrollDirective } from '../../../../shared/directives/animations-on-scroll.directive';
import { IEvent } from '../../../../shared/models';
import { TranslateModule } from '@ngx-translate/core';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';
import { CardsCarousel } from '../cards-carousel/cards-carousel';

@Component({
  selector: 'app-recent-events',
  providers: [RecentEventsStore],
  imports: [
    EventCard,
    RouterModule,
    LucideAngularModule,
    EventCardSkeleton,
    FadeInOnScrollDirective,
    TranslateModule,
    LandingSectionHeader,
    CardsCarousel
  ],
  templateUrl: './recent-events.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class RecentEvents {
  store = inject(RecentEventsStore);
  icons = {
    moveUpRight: MoveUpRight,
    arrowRight: ArrowRight
  };

  constructor() {
    this.store.loadEvents();
  }

  trackByEventId(_index: number, event: IEvent): string {
    return event.id;
  }
}
