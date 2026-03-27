import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  viewChildren
} from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule, MoveUpRight } from 'lucide-angular';
import { SECTORS, SECTOR_SHOWCASE } from '@features/landing/data/sectors.data';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';

@Component({
  selector: 'app-sectors',
  imports: [DecimalPipe, LucideAngularModule, LandingSectionHeader],
  templateUrl: './sectors.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sectors {
  private readonly destroyRef = inject(DestroyRef);
  private readonly sectorCardElements = viewChildren<ElementRef<HTMLElement>>('sectorCard');

  readonly arrowIcon = MoveUpRight;
  readonly revealDelayStepMs = 120;

  readonly showcase = SECTOR_SHOWCASE;
  readonly sectors = SECTORS;

  constructor() {
    afterNextRender(() => {
      this.initializeCardReveal();
    });
  }

  private initializeCardReveal(): void {
    const cards = this.sectorCardElements().map((element) => element.nativeElement);

    if (!cards.length) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      cards.forEach((card) => this.revealCard(card));
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          this.revealCard(entry.target as HTMLElement);
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -48px 0px' }
    );

    cards.forEach((card) => observer.observe(card));
    this.destroyRef.onDestroy(() => observer.disconnect());
  }

  private revealCard(card: HTMLElement): void {
    card.classList.remove('translate-y-6', 'opacity-0');
    card.classList.add('translate-y-0', 'opacity-100');
  }
}
