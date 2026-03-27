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
  title: 'Des secteurs plus lisibles, plus clairs, plus crédibles.',
  description: "Une présentation resserrée pour mieux structurer l'offre sans alourdir la landing page.",
  imageAlt: 'Secteurs stratégiques Cinolu',
  imageUrl:
    'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=1400&fit=crop&crop=faces'
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
    description: "Des solutions concrètes pour l'agriculture, le climat et la transition écologique à fort impact local.",
    icon: Sprout,
    tag: 'Innovation verte'
  },
  {
    id: 'gender-inclusion',
    name: 'Gender Inclusion',
    description: "Des initiatives qui réduisent les barrières et ouvrent plus d'opportunités aux femmes entrepreneures.",
    icon: Users,
    tag: 'Égalité & inclusion'
  }
];
