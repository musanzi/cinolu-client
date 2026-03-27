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
import { LucideAngularModule, LucideIconData, MoveUpRight, Pickaxe, Sprout, Users } from 'lucide-angular';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';

interface SectorCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIconData;
  readonly tag: string;
}

interface SectorShowcase {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageUrl: string;
}

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

  readonly showcase: SectorShowcase = {
    eyebrow: 'Cinolu ecosystem',
    title: 'Des secteurs plus lisibles, plus clairs, plus cr\u00e9dibles.',
    description:
      'Une pr\u00e9sentation resserr\u00e9e pour mieux structurer l\u2019offre sans alourdir la landing page.',
    imageAlt: 'Secteurs strat\u00e9giques Cinolu',
    imageUrl:
      'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=1400&fit=crop&crop=faces'
  };

  readonly sectors: readonly SectorCard[] = [
    {
      id: 'mintech',
      name: 'MinTech',
      description:
        'Des solutions tech pour moderniser la cha\u00eene mini\u00e8re et encourager une exploitation plus durable.',
      icon: Pickaxe,
      tag: 'Technologie mini\u00e8re'
    },
    {
      id: 'greentech',
      name: 'GreenTech & AgriTech',
      description:
        'Des solutions concr\u00e8tes pour l\u2019agriculture, le climat et la transition \u00e9cologique \u00e0 fort impact local.',
      icon: Sprout,
      tag: 'Innovation verte'
    },
    {
      id: 'gender-inclusion',
      name: 'Gender Inclusion',
      description:
        'Des initiatives qui r\u00e9duisent les barri\u00e8res et ouvrent plus d\u2019opportunit\u00e9s aux femmes entrepreneures.',
      icon: Users,
      tag: '\u00c9galit\u00e9 & inclusion'
    }
  ];

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
