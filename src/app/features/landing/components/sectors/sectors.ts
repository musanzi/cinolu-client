import { Component, ChangeDetectionStrategy, signal, OnInit } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { LucideAngularModule, LucideIconData, MoveUpRight, Pickaxe, Sprout, Users } from 'lucide-angular';
import { LandingSectionHeader } from '../landing-section-header/landing-section-header';

interface Sector {
  id: string;
  name: string;
  description: string;
  icon: LucideIconData;
  tag: string;
}

@Component({
  selector: 'app-sectors',
  imports: [DecimalPipe, LucideAngularModule, LandingSectionHeader],
  templateUrl: './sectors.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Sectors implements OnInit {
  readonly arrowIcon = MoveUpRight;
  readonly featureImage =
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=1400&fit=crop&crop=faces';

  sectors = signal<Sector[]>([
    {
      id: 'mintech',
      name: 'MinTech',
      description:
        "Des solutions tech pour moderniser la chaîne minière et encourager une exploitation plus durable.",
      icon: Pickaxe,
      tag: 'Technologie Minière'
    },
    {
      id: 'greentech',
      name: 'GreenTech & AgriTech',
      description:
        "Des solutions concrètes pour l'agriculture, le climat et la transition écologique à fort impact local.",
      icon: Sprout,
      tag: 'Innovation Verte'
    },
    {
      id: 'gender-inclusion',
      name: 'Gender Inclusion',
      description:
        "Des initiatives qui réduisent les barrières et ouvrent plus d'opportunités aux femmes entrepreneures.",
      icon: Users,
      tag: 'Égalité & Inclusion'
    }
  ]);

  ngOnInit(): void {
    this.observeCards();
  }

  private observeCards(): void {
    if (typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add('animate-fade-in-up');
            }, index * 150);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    setTimeout(() => {
      const cards = document.querySelectorAll('.sector-card');
      cards.forEach((card) => observer.observe(card));
    }, 100);
  }

  trackBySectorId(_index: number, sector: Sector): string {
    return sector.id;
  }
}
