// Vols de démonstration (horaires et prix indicatifs, fictifs). Réservation de vols : bientôt dans HAILLA.
export const AIRPORTS = {
  ALG: { fr: 'Alger', en: 'Algiers', ar: 'الجزائر' },
  ORN: { fr: 'Oran', en: 'Oran', ar: 'وهران' },
  CZL: { fr: 'Constantine', en: 'Constantine', ar: 'قسنطينة' },
  BJA: { fr: 'Béjaïa', en: 'Bejaia', ar: 'بجاية' },
  GHA: { fr: 'Ghardaïa', en: 'Ghardaia', ar: 'غرداية' },
  DJG: { fr: 'Djanet', en: 'Djanet', ar: 'جانت' },
  TMR: { fr: 'Tamanrasset', en: 'Tamanrasset', ar: 'تمنراست' },
  CDG: { fr: 'Paris', en: 'Paris', ar: 'باريس' },
  MRS: { fr: 'Marseille', en: 'Marseille', ar: 'مرسيليا' },
};

export const AIRLINES = {
  AH: { name: 'Air Algérie', color: '#d6262b', url: 'https://airalgerie.dz' },
  SF: { name: 'Tassili Airlines', color: '#0a5aa8', url: 'https://www.tassiliairlines.dz' },
  AF: { name: 'Air France', color: '#0b2d6b', url: 'https://www.airfrance.fr' },
};

export const FLIGHTS = [
  { id: 'ah6110', from: 'ALG', to: 'ORN', airline: 'AH', dep: '08:00', arr: '09:00', price: 7200 },
  { id: 'sf8002', from: 'ALG', to: 'ORN', airline: 'SF', dep: '14:15', arr: '15:15', price: 6400 },
  { id: 'ah6118', from: 'ALG', to: 'ORN', airline: 'AH', dep: '18:00', arr: '19:00', price: 8900 },
  { id: 'ah6180', from: 'ALG', to: 'CZL', airline: 'AH', dep: '07:30', arr: '08:35', price: 6900 },
  { id: 'sf8120', from: 'ALG', to: 'CZL', airline: 'SF', dep: '16:40', arr: '17:45', price: 6100 },
  { id: 'ah6200', from: 'ALG', to: 'BJA', airline: 'AH', dep: '09:10', arr: '09:55', price: 5200 },
  { id: 'ah6250', from: 'ALG', to: 'GHA', airline: 'AH', dep: '06:45', arr: '07:55', price: 9800 },
  { id: 'sf8250', from: 'ALG', to: 'GHA', airline: 'SF', dep: '13:20', arr: '14:30', price: 9100 },
  { id: 'ah6290', from: 'ALG', to: 'DJG', airline: 'AH', dep: '10:00', arr: '12:45', price: 21500 },
  { id: 'ah6300', from: 'ALG', to: 'TMR', airline: 'AH', dep: '11:30', arr: '14:00', price: 19800 },
  { id: 'af1854', from: 'CDG', to: 'ALG', airline: 'AF', dep: '06:45', arr: '09:00', price: 28500 },
  { id: 'ah1001', from: 'CDG', to: 'ALG', airline: 'AH', dep: '12:20', arr: '14:30', price: 24500 },
  { id: 'ah1053', from: 'MRS', to: 'ALG', airline: 'AH', dep: '15:10', arr: '16:40', price: 19900 },
];

export const minutes = (hhmm) => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m; };
export const duration = (f) => { const d = (minutes(f.arr) - minutes(f.dep) + 1440) % 1440; return `${Math.floor(d / 60)} h ${String(d % 60).padStart(2, '0')}`; };
