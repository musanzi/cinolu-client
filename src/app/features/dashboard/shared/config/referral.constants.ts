export const REFERRAL_CONFIG = {
  MAX_TIMELINE_EVENTS: 20,
  QR_CODE_SIZE: 300,

  QR_CODE_CACHE_KEY: 'cinolu_referral_qr_cache',

  QR_CODE_CACHE_TTL: 7 * 24 * 60 * 60 * 1000,

  SOCIAL_MESSAGES: {
    WHATSAPP: `Rejoins-moi sur Cinolu, la plateforme qui accompagne les entrepreneurs africains !

Inscris-toi avec mon lien de parrainage :
{LINK}

Ensemble, construisons l'écosystème entrepreneurial de demain !`,

    TWITTER: `Rejoins-moi sur @Cinolu_org, la plateforme pour entrepreneurs africains !

Inscris-toi avec mon lien de parrainage`,

    FACEBOOK_HASHTAGS: '#Cinolu #Entrepreneuriat #Afrique'
  }
} as const;

export interface QRCodeCache {
  dataUrl: string;
  referralCode: string;
  timestamp: number;
}
