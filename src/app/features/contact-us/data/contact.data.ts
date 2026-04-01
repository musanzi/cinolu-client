import { LucideIconData, MailCheck, Phone, MapPin, Clock, ScanFace } from 'lucide-angular';

interface IContactChildren {
  label?: string;
  value: string;
}

interface ISocialMedia {
  label: string;
  link: string;
  icon: string;
}

interface IContact {
  title: string;
  icon: LucideIconData;
  description: string;
  children?: IContactChildren[];
}

export const CONTACT_ITEMS: IContact[] = [
  {
    title: 'Rejoignez-nous par email',
    icon: MailCheck,
    description: 'Nous vous répondons dans les plus brefs délais.',
    children: [
      {
        label: 'Support client',
        value: 'reception@cinolu.org '
      }
    ]
  },
  {
    title: 'Appelez-nous',
    icon: Phone,
    description: 'Notre équipe est disponible pour vos appels du lundi au samedi.',
    children: [
      {
        label: 'Téléphone',
        value: '+243 976 807 000 '
      }
    ]
  },
  {
    title: 'Adresse',
    icon: MapPin,
    description: 'Venez nous rendre visite à notre siège.',
    children: [
      {
        label: 'Adresse',
        value: ' 221, Av. des usines, Makomeno, Lubumbashi, Haut-Katanga-RDC'
      }
    ]
  },
  {
    title: 'Horaires d’ouverture',
    icon: Clock,
    description: 'Nous sommes ouverts tous les jours ouvrables.',
    children: [
      {
        label: 'Lundi - Vendredi',
        value: '08h00 - 17h00'
      }
    ]
  },
  {
    title: 'Suivez-nous',
    icon: ScanFace,
    description: 'Restez connectés à notre actualité.'
  }
];

export const SOCIAL_LINKS: ISocialMedia[] = [
  {
    label: 'Facebook',
    link: 'https://www.facebook.com/cinolu',
    icon: 'icons/facebook.svg'
  },
  {
    label: 'Instagram',
    link: 'https://www.instagram.com/centredinnovationdelubumbashi/',
    icon: 'icons/instagram.svg'
  },
  {
    label: 'X',
    link: 'https://x.com/Lubumdigital',
    icon: 'icons/twitter-x.svg'
  },
  {
    label: 'TikTok',
    link: 'https://www.tiktok.com/@cinolu',
    icon: 'icons/tiktok.svg'
  },
  {
    label: 'LinkedIn',
    link: 'https://www.linkedin.com/company/cinolu',
    icon: 'icons/linkedin.svg'
  },
  {
    label: 'YouTube',
    link: 'https://www.youtube.com/@centredinnovationdelubumba3607',
    icon: 'icons/youtube.svg'
  }
];
