// Guides locaux, événements et expériences — données de démonstration (personnes et événements fictifs).
const L = (fr, en, ar) => ({ fr, en, ar });

export const INTEREST_ICONS = { hike: 'hike', music: 'music', food: 'restaurant', history: 'patrimoine', photo: 'camera', beach: 'plage', sport: 'sun', craft: 'souvenir' };
export const INTERESTS = {
  hike: L('Randonnée', 'Hiking', 'المشي'), music: L('Musique', 'Music', 'الموسيقى'), food: L('Cuisine', 'Food', 'الطبخ'),
  history: L('Histoire', 'History', 'التاريخ'), photo: L('Photo', 'Photography', 'التصوير'), beach: L('Plage', 'Beach', 'الشاطئ'),
  sport: L('Sport', 'Sport', 'الرياضة'), craft: L('Artisanat', 'Crafts', 'الحِرف'),
};
export const ACTIVITIES = {
  translate: L('Traduction & interprétariat', 'Translation & interpreting', 'الترجمة'),
  shopping: L('Shopping & souks', 'Shopping & souks', 'التسوق والأسواق'),
  food: L('Restaurants & cuisine locale', 'Food & restaurants', 'المطاعم والطبخ المحلي'),
  sport: L('Sport & loisirs', 'Sports & recreation', 'الرياضة والترفيه'),
  driving: L('Transferts & circuits en voiture', 'Pick-up & driving tours', 'النقل والجولات بالسيارة'),
  culture: L('Histoire & culture', 'History & culture', 'التاريخ والثقافة'),
};

export const GUIDES = [
  { id: 'g-lina', name: 'Lina Mansouri', city: 'alger', img: 'casbah-rue', hue: 205, price: 2500, rating: 4.9, reviews: 274, top: true,
    interests: ['history', 'photo', 'food', 'craft'], langs: { fr: 5, ar: 5, en: 4 }, activities: ['culture', 'shopping', 'food', 'translate'],
    bio: L('Née dans la Casbah, j’y fais visiter les palais, les fontaines et les ateliers d’artisans que les cartes ne montrent pas. Diplômée en histoire de l’art.', 'Born in the Casbah, I show visitors the palaces, fountains and craft workshops that maps don’t show. Art history graduate.', 'وُلدت في القصبة، وأُرِي الزوار القصور والعيون وورشات الحرفيين التي لا تظهر في الخرائط. خريجة تاريخ الفن.') },
  { id: 'g-yanis', name: 'Yanis Belaïd', city: 'bejaia', img: 'cap-carbon', hue: 170, price: 2000, rating: 4.8, reviews: 156,
    interests: ['hike', 'beach', 'photo', 'sport'], langs: { fr: 5, ar: 4, kab: 5, en: 3 }, activities: ['sport', 'culture', 'driving'],
    bio: L('Guide agréé du parc de Gouraya. Je connais chaque sentier jusqu’au Cap Carbon et les meilleures criques pour se baigner.', 'Licensed Gouraya park guide. I know every trail to Cap Carbon and the best coves for a swim.', 'مرشد معتمد في حظيرة قورايا. أعرف كل المسارات حتى رأس كاربون وأجمل الخلجان للسباحة.') },
  { id: 'g-karim', name: 'Karim Hadjadj', city: 'oran', img: 'santa-cruz', hue: 25, price: 2200, rating: 4.7, reviews: 98,
    interests: ['music', 'food', 'history'], langs: { fr: 5, ar: 5, en: 4 }, activities: ['culture', 'food', 'driving', 'translate'],
    bio: L('Oranais de cœur : raï, karantika et histoire espagnole d’El Bahia. Je vous emmène de Sidi El Houari à Santa Cruz.', 'Oranais at heart: raï, karantika and El Bahia’s Spanish history. From Sidi El Houari to Santa Cruz.', 'وهراني حتى النخاع: الراي والكرنتيكة والتاريخ الإسباني للباهية. من سيدي الهواري إلى سانتا كروز.') },
  { id: 'g-nesrine', name: 'Nesrine Aït Ali', city: 'tipaza', img: 'tipaza-ruines', hue: 330, price: 1800, rating: 4.8, reviews: 121,
    interests: ['history', 'beach', 'photo'], langs: { fr: 5, ar: 5, en: 5 }, activities: ['culture', 'translate'],
    bio: L('Archéologue de formation, je raconte Tipasa la punique, la romaine et celle de Camus — au lever du soleil, de préférence.', 'An archaeologist by training, I tell the story of Punic, Roman and Camus’s Tipasa — ideally at sunrise.', 'عالمة آثار بالتكوين، أحكي تيبازة البونيقية والرومانية وتيبازة كامو — ويُفضَّل عند الشروق.') },
  { id: 'g-amazigh', name: 'Amazigh Touati', city: 'tizi', img: 'djurdjura', hue: 120, price: 2800, rating: 4.9, reviews: 87, top: true,
    interests: ['hike', 'craft', 'food'], langs: { kab: 5, fr: 5, ar: 4, en: 3 }, activities: ['sport', 'driving', 'culture', 'shopping'],
    bio: L('Accompagnateur de montagne au Djurdjura, l’été comme sous la neige. Visites des bijoutiers d’Ath Yenni et repas chez l’habitant.', 'Mountain leader in the Djurdjura, in summer and in the snow. Visits to Ath Yenni silversmiths and home-cooked meals.', 'مرافق جبلي في جرجرة صيفًا وتحت الثلج. زيارات لصاغة آث يني ووجبات عند السكان.') },
  { id: 'g-sofiane', name: 'Sofiane Rahmani', city: 'alger', img: 'notre-dame', hue: 260, price: 1500, rating: 4.6, reviews: 64,
    interests: ['sport', 'music', 'food'], langs: { ar: 5, fr: 4, en: 5 }, activities: ['driving', 'food', 'sport'],
    bio: L('Transferts aéroport, tours d’Alger en voiture et soirées chaâbi : idéal pour une première visite en famille.', 'Airport transfers, Algiers driving tours and chaâbi nights: ideal for a first family visit.', 'نقل من المطار وجولات في العاصمة بالسيارة وسهرات شعبي: مثالي لزيارة عائلية أولى.') },
];

export const GUIDE_REVIEWS = [
  { name: 'Sarah K.', rating: 4.5, text: L('Passionnée et très ponctuelle. On a vu des lieux introuvables seuls.', 'Passionate and very punctual. We saw places we’d never have found alone.', 'شغوفة ودقيقة جدًا في المواعيد. رأينا أماكن ما كنا لنجدها وحدنا.') },
  { name: 'Thomas L.', rating: 5, text: L('Excellent conteur, adresses de restaurants parfaites.', 'Great storyteller, perfect restaurant tips.', 'راوٍ ممتاز ونصائح مطاعم مثالية.') },
  { name: 'Amel B.', rating: 4.5, text: L('Très bonne journée en famille, les enfants ont adoré.', 'Lovely family day, the kids loved it.', 'يوم عائلي رائع، أحبه الأطفال كثيرًا.') },
];

// Dates are relative to today so the list always looks "upcoming".
export const EVENTS = [
  { id: 'e-rai', city: 'oran', img: 'oran-front', inDays: 0, time: '20:30', name: L('Soirée raï sur le front de mer', 'Raï night on the seafront', 'سهرة راي على الواجهة البحرية'), venue: L('Front de mer, Oran', 'Seafront, Oran', 'الواجهة البحرية، وهران') },
  { id: 'e-expo', city: 'alger', img: 'casbah-dar', inDays: 1, time: '10:00', name: L('Exposition « Peintres de la Casbah »', '“Painters of the Casbah” exhibition', 'معرض «رسامو القصبة»'), venue: L('Bastion 23, Alger', 'Bastion 23, Algiers', 'الحصن 23، الجزائر') },
  { id: 'e-tipasa', city: 'tipaza', img: 'tipaza-ruines', inDays: 3, time: '18:30', name: L('Visite au coucher du soleil de Tipasa', 'Sunset tour of Tipasa', 'جولة الغروب في تيبازة'), venue: L('Parc archéologique, Tipaza', 'Archaeological park, Tipaza', 'الحظيرة الأثرية، تيبازة') },
  { id: 'e-bijoux', city: 'tizi', img: 'kabylie-village', inDays: 5, time: '09:00', name: L('Marché des bijoux d’Ath Yenni', 'Ath Yenni jewellery market', 'سوق حلي آث يني'), venue: L('Ath Yenni, Tizi Ouzou', 'Ath Yenni, Tizi Ouzou', 'آث يني، تيزي وزو') },
  { id: 'e-chaabi', city: 'alger', img: 'alger-port', inDays: 8, time: '21:00', name: L('Concert de chaâbi', 'Chaâbi concert', 'حفل شعبي'), venue: L('Salle Ibn Khaldoun, Alger', 'Ibn Khaldoun hall, Algiers', 'قاعة ابن خلدون، الجزائر') },
  { id: 'e-carbon', city: 'bejaia', img: 'cap-carbon', inDays: 12, time: '06:30', name: L('Randonnée lever de soleil au Cap Carbon', 'Sunrise hike to Cap Carbon', 'نزهة الشروق إلى رأس كاربون'), venue: L('Les Aiguades, Béjaïa', 'Les Aiguades, Bejaia', 'لي زيغاد، بجاية') },
];

export const TOURS = [
  { id: 't-casbah', city: 'alger', img: 'casbah-dar', guide: 'g-lina', price: 3500, rating: 4.9, kind: L('Visite culturelle · À pied', 'Cultural tour · Walking', 'جولة ثقافية · سيرًا'), name: L('La Casbah avec un déjeuner traditionnel', 'The Casbah with a traditional lunch', 'القصبة مع غداء تقليدي') },
  { id: 't-tipasa', city: 'tipaza', img: 'tombeau', guide: 'g-nesrine', price: 4500, rating: 4.8, kind: L('Visite culturelle · Journée', 'Cultural tour · Day trip', 'جولة ثقافية · يوم كامل'), name: L('Ruines de Tipasa et Cherchell', 'Ruins of Tipasa and Cherchell', 'آثار تيبازة وشرشال') },
  { id: 't-carbon', city: 'bejaia', img: 'gouraya-magot', guide: 'g-yanis', price: 2500, rating: 4.8, kind: L('Nature · Randonnée', 'Nature · Hiking', 'طبيعة · مشي'), name: L('Gouraya et le phare du Cap Carbon', 'Gouraya and Cap Carbon lighthouse', 'قورايا ومنارة رأس كاربون') },
  { id: 't-djurdjura', city: 'tizi', img: 'tikjda', guide: 'g-amazigh', price: 6000, rating: 4.9, kind: L('Montagne · Journée', 'Mountains · Day trip', 'جبال · يوم كامل'), name: L('Une journée à Tikjda et au Djurdjura', 'A day in Tikjda and the Djurdjura', 'يوم في تيكجدة وجرجرة') },
];

export const LANG_NAMES = { fr: L('Français', 'French', 'الفرنسية'), ar: L('Arabe', 'Arabic', 'العربية'), en: L('Anglais', 'English', 'الإنجليزية'), kab: L('Tamazight', 'Tamazight', 'الأمازيغية') };
