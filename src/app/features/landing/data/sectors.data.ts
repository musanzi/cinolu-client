import { LucideIconData, Pickaxe, Sprout, Users } from 'lucide-angular';

export interface SectorCard {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: LucideIconData;
  readonly tag: string;
}

export interface SectorShowcase {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly imageAlt: string;
  readonly imageUrl: string;
}

export const SECTOR_SHOWCASE: SectorShowcase = {
  eyebrow: 'Cinolu ecosystem',
  title: 'Les secteurs dans lesquels Cinolu agit concrètement.',
  description: "Explorez les principaux secteurs dans lesquels Cinolu accompagne les porteurs de projets, entreprises et talents.",
  imageAlt: 'Secteurs stratégiques Cinolu',
  imageUrl: '/images/hero.jpg'
};

export const SECTORS: readonly SectorCard[] = [
  {
    id: 'mintech',
    name: 'MinTech',
    description: 'Des solutions tech pour moderniser la chaîne minière et encourager une exploitation plus durable.',
    icon: Pickaxe,
    tag: 'Technologie minière'
  },
  {
    id: 'greentech',
    name: 'GreenTech & AgriTech',
    description:
      "Des solutions concrètes pour l'agriculture, le climat et la transition écologique à fort impact local.",
    icon: Sprout,
    tag: 'Innovation verte'
  },
  {
    id: 'gender-inclusion',
    name: 'Gender Inclusion',
    description:
      "Des initiatives qui réduisent les barrières et ouvrent plus d'opportunités aux femmes entrepreneures.",
    icon: Users,
    tag: 'Égalité & inclusion'
  }
];
