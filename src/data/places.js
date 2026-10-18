// Catalogue de démonstration HAILLA.
// Les hébergements, cafés et boutiques sont fictifs ; les sites et monuments sont réels.
const L = (fr, en, ar) => ({ fr, en, ar });

export const CITIES = {
  alger: { name: L('Alger', 'Algiers', 'الجزائر العاصمة'), lat: 36.7538, lng: 3.0588, phase: 1 },
  tipaza: { name: L('Tipaza', 'Tipaza', 'تيبازة'), lat: 36.5897, lng: 2.4475, phase: 1 },
  bejaia: { name: L('Béjaïa', 'Bejaia', 'بجاية'), lat: 36.7509, lng: 5.0567, phase: 1 },
  oran: { name: L('Oran', 'Oran', 'وهران'), lat: 35.6971, lng: -0.6308, phase: 1 },
  tizi: { name: L('Tizi Ouzou', 'Tizi Ouzou', 'تيزي وزو'), lat: 36.7169, lng: 4.0497, phase: 1 },
  ghardaia: { name: L('Ghardaïa', 'Ghardaia', 'غرداية'), lat: 32.4909, lng: 3.6735, phase: 2 },
  taghit: { name: L('Taghit', 'Taghit', 'تاغيت'), lat: 30.9167, lng: -2.0333, phase: 2 },
  djanet: { name: L('Djanet', 'Djanet', 'جانت'), lat: 24.5551, lng: 9.4848, phase: 2 },
  tamanrasset: { name: L('Tamanrasset', 'Tamanrasset', 'تمنراست'), lat: 22.785, lng: 5.5228, phase: 2 },
};

export const STAY_TYPES = {
  hotel: L('Hôtel', 'Hotel', 'فندق'),
  maison: L("Maison d'hôtes", 'Guesthouse', 'دار ضيافة'),
  auberge: L('Auberge', 'Hostel', 'نُزُل'),
  eco: L('Écolodge', 'Eco-lodge', 'نُزُل بيئي'),
  appart: L('Appartement', 'Apartment', 'شقة'),
};

export const AMENITIES = {
  wifi: L('Wi-Fi gratuit', 'Free Wi-Fi', 'واي فاي مجاني'),
  parking: L('Parking gratuit', 'Free parking', 'موقف سيارات مجاني'),
  breakfast: L('Petit-déjeuner', 'Breakfast', 'فطور الصباح'),
  pool: L('Piscine', 'Pool', 'مسبح'),
  spa: L('Spa & hammam', 'Spa & hammam', 'سبا وحمّام'),
  shuttle: L('Navette aéroport', 'Airport shuttle', 'نقل من المطار'),
  beach: L('Accès plage', 'Beach access', 'وصول إلى الشاطئ'),
  family: L('Adapté aux familles', 'Family friendly', 'مناسب للعائلات'),
  clim: L('Climatisation', 'Air conditioning', 'تكييف'),
  restaurant: L('Restaurant', 'Restaurant', 'مطعم'),
  terrace: L('Terrasse', 'Terrace', 'شرفة'),
  hike: L('Départ de randonnées', 'Hiking trails', 'مسارات مشي'),
};

export const LANGS_SPOKEN = { ar: L('Arabe', 'Arabic', 'العربية'), fr: L('Français', 'French', 'الفرنسية'), en: L('Anglais', 'English', 'الإنجليزية'), kab: L('Tamazight', 'Tamazight', 'الأمازيغية') };

export const STAYS = [
  {
    id: 'dar-el-bahdja', type: 'maison', city: 'alger', lat: 36.7856, lng: 3.0603, price: 9500, rating: 4.7, reviews: 128,
    cleanliness: 9.1, comfort: 8.8, capacity: 4, eco: true,
    amenities: ['wifi', 'breakfast', 'terrace', 'family', 'clim'], langs: ['ar', 'fr', 'en'],
    images: ['casbah-dar', 'dar-pacha', 'casbah-rue'],
    name: L('Dar El Bahdja', 'Dar El Bahdja', 'دار البهجة'),
    area: L('Casbah, Alger', 'Casbah, Algiers', 'القصبة، الجزائر'),
    tagline: L('Patio ottoman et terrasse sur la baie', 'Ottoman patio and terrace over the bay', 'فناء عثماني وشرفة تطل على الخليج'),
    desc: L(
      "Une maison restaurée au cœur de la Casbah : cinq chambres autour d'un patio à colonnes, petit-déjeuner servi sur la terrasse face à la baie d'Alger. Vos hôtes organisent des visites guidées des ruelles.",
      'A restored house in the heart of the Casbah: five rooms around a columned patio, breakfast served on the terrace facing the Bay of Algiers. Your hosts arrange guided walks through the alleys.',
      'دار مرمّمة في قلب القصبة: خمس غرف حول فناء ذي أعمدة، وفطور يُقدَّم على الشرفة المطلة على خليج الجزائر. ينظّم المضيفون جولات مصحوبة بمرشد في الأزقة.'
    ),
  },
  {
    id: 'sablette-azur', type: 'hotel', city: 'alger', lat: 36.7375, lng: 3.0919, price: 18000, rating: 4.4, reviews: 342,
    cleanliness: 8.7, comfort: 8.9, capacity: 3, eco: false,
    amenities: ['wifi', 'parking', 'pool', 'shuttle', 'restaurant', 'clim', 'family'], langs: ['ar', 'fr', 'en'],
    images: ['alger-baie', 'hotel-tour', 'maqam'],
    name: L('Hôtel Sablette Azur', 'Hotel Sablette Azur', 'فندق صابلات أزور'),
    area: L('Front de mer, Alger', 'Waterfront, Algiers', 'الواجهة البحرية، الجزائر'),
    tagline: L('Piscine panoramique et navette aéroport', 'Rooftop pool and airport shuttle', 'مسبح بانورامي ونقل من المطار'),
    desc: L(
      "Un hôtel contemporain sur la promenade des Sablettes, à 15 minutes de l'aéroport Houari-Boumédiène. Chambres climatisées avec balcon, piscine sur le toit et restaurant de poissons.",
      'A contemporary hotel on the Sablettes promenade, 15 minutes from Houari Boumediene airport. Air-conditioned rooms with balconies, a rooftop pool and a seafood restaurant.',
      'فندق عصري على كورنيش الصابلات، على بعد 15 دقيقة من مطار هواري بومدين. غرف مكيّفة بشرفات، مسبح على السطح ومطعم للمأكولات البحرية.'
    ),
  },
  {
    id: 'auberge-hamma', type: 'auberge', city: 'alger', lat: 36.7468, lng: 3.0745, price: 3200, rating: 4.2, reviews: 211,
    cleanliness: 8.4, comfort: 7.6, capacity: 6, eco: true,
    amenities: ['wifi', 'breakfast', 'terrace'], langs: ['ar', 'fr', 'en'],
    images: ['jardin-essai', 'alger-port'],
    name: L('Auberge du Hamma', 'Hamma Hostel', 'نُزُل الحامة'),
    area: L("Jardin d'Essai, Alger", "Jardin d'Essai, Algiers", 'حديقة التجارب، الجزائر'),
    tagline: L('Dortoirs et chambres privées face au jardin', 'Dorms and private rooms by the garden', 'غرف مشتركة وخاصة قبالة الحديقة'),
    desc: L(
      "L'adresse des jeunes voyageurs : dortoirs lumineux, cuisine partagée et métro à deux minutes. Le Jardin d'Essai du Hamma est juste en face.",
      'The go-to address for young travellers: bright dorms, a shared kitchen and the metro two minutes away. The Hamma Jardin d’Essai is right across the street.',
      'العنوان المفضّل للمسافرين الشباب: غرف مشتركة مضيئة، مطبخ مشترك والمترو على بعد دقيقتين. حديقة التجارب بالحامة في الجهة المقابلة.'
    ),
  },
  {
    id: 'residence-bologhine', type: 'appart', city: 'alger', lat: 36.8015, lng: 3.0422, price: 12000, rating: 4.5, reviews: 76,
    cleanliness: 9.0, comfort: 8.6, capacity: 5, eco: false,
    amenities: ['wifi', 'parking', 'clim', 'family', 'terrace'], langs: ['ar', 'fr'],
    images: ['notre-dame', 'alger-baie'],
    name: L('Résidence Bologhine', 'Bologhine Residence', 'إقامة بولوغين'),
    area: L("Sous Notre-Dame d'Afrique, Alger", "Below Notre-Dame d'Afrique, Algiers", 'أسفل كنيسة السيدة الإفريقية، الجزائر'),
    tagline: L('Trois pièces pour les familles, vue mer', 'Three-room family flat with sea view', 'شقة من ثلاث غرف للعائلات بإطلالة بحرية'),
    desc: L(
      "Un appartement de 90 m² avec cuisine équipée et grande terrasse, idéal pour les séjours en famille. La basilique Notre-Dame d'Afrique est à dix minutes à pied.",
      'A 90 m² flat with a fitted kitchen and a large terrace, ideal for family stays. The Notre-Dame d’Afrique basilica is a ten-minute walk away.',
      'شقة بمساحة 90 م² بمطبخ مجهّز وشرفة واسعة، مثالية للإقامات العائلية. كنيسة السيدة الإفريقية على بعد عشر دقائق سيرًا.'
    ),
  },
  {
    id: 'ruines-bleues', type: 'hotel', city: 'tipaza', lat: 36.5936, lng: 2.4502, price: 16500, rating: 4.6, reviews: 289,
    cleanliness: 8.6, comfort: 8.9, capacity: 2, eco: false,
    amenities: ['wifi', 'parking', 'breakfast', 'pool', 'spa', 'beach', 'shuttle', 'restaurant'], langs: ['ar', 'fr', 'en'],
    images: ['tipaza-ruines', 'tombeau', 'azeffoun-coucher'],
    name: L('Hôtel Les Ruines Bleues', 'Les Ruines Bleues Hotel', 'فندق الأطلال الزرقاء'),
    area: L('Bord de mer, Tipaza', 'Seafront, Tipaza', 'شاطئ البحر، تيبازة'),
    tagline: L('Plage privée, spa et piscine toute l’année', 'Private beach, spa and year-round pool', 'شاطئ خاص، سبا ومسبح طوال السنة'),
    desc: L(
      'Face au parc archéologique, l’hôtel offre une plage privée et un accès direct au rivage. Piscine extérieure chauffée, terrasse au soleil et jardin luxuriant.',
      'Facing the archaeological park, the hotel has a private beach and direct shore access. Heated outdoor pool, sun terrace and a lush garden.',
      'قبالة الحظيرة الأثرية، يوفر الفندق شاطئًا خاصًا ووصولًا مباشرًا إلى البحر. مسبح خارجي مدفأ، شرفة مشمسة وحديقة غنّاء.'
    ),
  },
  {
    id: 'ecolodge-chenoua', type: 'eco', city: 'tipaza', lat: 36.6133, lng: 2.3897, price: 11000, rating: 4.8, reviews: 94,
    cleanliness: 9.3, comfort: 8.5, capacity: 4, eco: true,
    amenities: ['wifi', 'breakfast', 'hike', 'beach', 'family'], langs: ['ar', 'fr', 'en', 'kab'],
    images: ['tombeau', 'tipaza-ruines'],
    name: L('Écolodge du Chenoua', 'Chenoua Eco-lodge', 'النُزُل البيئي شنوة'),
    area: L('Mont Chenoua, Tipaza', 'Mount Chenoua, Tipaza', 'جبل شنوة، تيبازة'),
    tagline: L('Cabanes solaires entre forêt et mer', 'Solar cabins between forest and sea', 'أكواخ بالطاقة الشمسية بين الغابة والبحر'),
    desc: L(
      'Six cabanes en bois alimentées à l’énergie solaire, potager bio et produits du terroir au petit-déjeuner. Sentiers vers les criques du Chenoua au départ du lodge.',
      'Six solar-powered wooden cabins, an organic kitchen garden and local produce at breakfast. Trails lead from the lodge to the Chenoua coves.',
      'ستة أكواخ خشبية تعمل بالطاقة الشمسية، حديقة خضر عضوية ومنتجات محلية في الفطور. مسارات تنطلق من النُزُل نحو خلجان شنوة.'
    ),
  },
  {
    id: 'hotel-cap-carbon', type: 'hotel', city: 'bejaia', lat: 36.7605, lng: 5.0889, price: 14000, rating: 4.5, reviews: 198,
    cleanliness: 8.8, comfort: 8.7, capacity: 3, eco: false,
    amenities: ['wifi', 'parking', 'breakfast', 'restaurant', 'clim', 'terrace'], langs: ['ar', 'fr', 'en', 'kab'],
    images: ['cap-carbon', 'bejaia-baie'],
    name: L('Hôtel Cap Carbon', 'Cap Carbon Hotel', 'فندق رأس كاربون'),
    area: L('Les Aiguades, Béjaïa', 'Les Aiguades, Bejaia', 'لي زيغاد، بجاية'),
    tagline: L('Chambres face au cap et aux falaises', 'Rooms facing the cape and cliffs', 'غرف تطل على الرأس والمنحدرات'),
    desc: L(
      'Accroché à la corniche des Aiguades, l’hôtel regarde le Cap Carbon et son phare. Restaurant panoramique, terrasse et départ des sentiers du parc national de Gouraya.',
      'Perched on the Aiguades corniche, the hotel looks out at Cap Carbon and its lighthouse. Panoramic restaurant, terrace and trailheads into Gouraya National Park.',
      'على كورنيش لي زيغاد، يطل الفندق على رأس كاربون ومنارته. مطعم بانورامي، شرفة ونقطة انطلاق مسارات الحظيرة الوطنية قورايا.'
    ),
  },
  {
    id: 'gite-gouraya', type: 'eco', city: 'bejaia', lat: 36.7701, lng: 5.0778, price: 7800, rating: 4.7, reviews: 63,
    cleanliness: 9.0, comfort: 8.1, capacity: 4, eco: true,
    amenities: ['breakfast', 'hike', 'family', 'parking'], langs: ['ar', 'fr', 'kab'],
    images: ['gouraya-magot', 'bejaia-baie'],
    name: L('Gîte de Gouraya', 'Gouraya Lodge', 'نُزُل قورايا'),
    area: L('Parc national de Gouraya, Béjaïa', 'Gouraya National Park, Bejaia', 'الحظيرة الوطنية قورايا، بجاية'),
    tagline: L('Au réveil, les magots sur le muret', 'Barbary macaques on the wall at sunrise', 'قردة المغوت على السور عند الاستيقاظ'),
    desc: L(
      'Un gîte familial à l’orée du parc, où l’on croise les macaques de Barbarie. Les hôtes, guides agréés, partagent les règles d’observation responsable.',
      'A family-run lodge at the edge of the park, where Barbary macaques roam. Your hosts, licensed guides, share the rules for responsible wildlife watching.',
      'نُزُل عائلي على حافة الحظيرة، حيث تلتقي بقردة المغوت البربرية. المضيفون مرشدون معتمدون يشرحون قواعد المراقبة المسؤولة.'
    ),
  },
  {
    id: 'maison-aiguades', type: 'maison', city: 'bejaia', lat: 36.7552, lng: 5.0712, price: 8900, rating: 4.6, reviews: 101,
    cleanliness: 9.2, comfort: 8.6, capacity: 3, eco: false,
    amenities: ['wifi', 'breakfast', 'terrace', 'clim'], langs: ['ar', 'fr', 'kab'],
    images: ['bejaia-baie', 'cap-carbon'],
    name: L('Maison des Aiguades', 'Aiguades House', 'دار لي زيغاد'),
    area: L('Vieille ville, Béjaïa', 'Old town, Bejaia', 'المدينة القديمة، بجاية'),
    tagline: L('Quatre chambres et une vue sur le golfe', 'Four rooms and a view over the gulf', 'أربع غرف وإطلالة على الخليج'),
    desc: L(
      'Une maison de famille près de la porte Sarrasine, transformée en maison d’hôtes. Pâtisseries kabyles maison au petit-déjeuner.',
      'A family home near the Saracen Gate, turned into a guesthouse. Homemade Kabyle pastries at breakfast.',
      'منزل عائلي قرب باب البحر، تحوّل إلى دار ضيافة. حلويات قبائلية منزلية في الفطور.'
    ),
  },
  {
    id: 'hotel-front-de-mer', type: 'hotel', city: 'oran', lat: 35.7029, lng: -0.6418, price: 17000, rating: 4.3, reviews: 410,
    cleanliness: 8.5, comfort: 8.8, capacity: 3, eco: false,
    amenities: ['wifi', 'parking', 'pool', 'spa', 'shuttle', 'restaurant', 'clim'], langs: ['ar', 'fr', 'en'],
    images: ['oran-front', 'hotel-oran', 'santa-cruz-dome'],
    name: L('Hôtel Front de Mer', 'Front de Mer Hotel', 'فندق الواجهة البحرية'),
    area: L('Boulevard de l’ALN, Oran', 'ALN Boulevard, Oran', 'شارع جيش التحرير، وهران'),
    tagline: L('Sur le boulevard, vue sur le port', 'On the boulevard, overlooking the port', 'على الكورنيش، بإطلالة على الميناء'),
    desc: L(
      'Au milieu du front de mer d’El Bahia, à pied des cafés et du théâtre. Spa, piscine intérieure et navette vers l’aéroport Ahmed-Ben-Bella.',
      'Right on El Bahia’s seafront, walking distance from cafés and the theatre. Spa, indoor pool and a shuttle to Ahmed Ben Bella airport.',
      'في وسط واجهة الباهية البحرية، على مقربة من المقاهي والمسرح. سبا، مسبح داخلي ونقل إلى مطار أحمد بن بلة.'
    ),
  },
  {
    id: 'riad-santa-cruz', type: 'maison', city: 'oran', lat: 35.7101, lng: -0.6589, price: 10500, rating: 4.7, reviews: 87,
    cleanliness: 9.2, comfort: 8.9, capacity: 4, eco: true,
    amenities: ['wifi', 'breakfast', 'terrace', 'family'], langs: ['ar', 'fr', 'en'],
    images: ['santa-cruz', 'santa-cruz-dome'],
    name: L('Riad Santa Cruz', 'Riad Santa Cruz', 'رياض سانتا كروز'),
    area: L('Sidi El Houari, Oran', 'Sidi El Houari, Oran', 'سيدي الهواري، وهران'),
    tagline: L('Le vieux quartier, au pied du fort', 'The old quarter, below the fort', 'الحي العتيق، أسفل القلعة'),
    desc: L(
      'Dans le quartier historique de Sidi El Houari, un riad aux carreaux anciens. Les hôtes vous conduisent au fort de Santa Cruz pour le coucher du soleil.',
      'In the historic Sidi El Houari quarter, a riad with antique tiles. Your hosts take you up to Santa Cruz fort for sunset.',
      'في حي سيدي الهواري التاريخي، رياض ببلاط عتيق. يرافقك المضيفون إلى قلعة سانتا كروز لمشاهدة الغروب.'
    ),
  },
  {
    id: 'auberge-el-bahia', type: 'auberge', city: 'oran', lat: 35.6943, lng: -0.6339, price: 3500, rating: 4.1, reviews: 156,
    cleanliness: 8.2, comfort: 7.5, capacity: 6, eco: false,
    amenities: ['wifi', 'clim'], langs: ['ar', 'fr', 'en'],
    images: ['hotel-pins', 'oran-front'],
    name: L('Auberge El Bahia', 'El Bahia Hostel', 'نُزُل الباهية'),
    area: L('Centre-ville, Oran', 'City centre, Oran', 'وسط المدينة، وهران'),
    tagline: L('Petit budget, grande ambiance', 'Small budget, big atmosphere', 'ميزانية صغيرة وأجواء رائعة'),
    desc: L(
      'Dortoirs propres et chambres doubles à deux pas de la place du 1er-Novembre. Soirées musique raï le jeudi.',
      'Clean dorms and double rooms steps from 1st November Square. Raï music nights on Thursdays.',
      'غرف مشتركة نظيفة وغرف مزدوجة على بعد خطوات من ساحة أول نوفمبر. سهرات موسيقى الراي كل خميس.'
    ),
  },
  {
    id: 'chalet-tikjda', type: 'eco', city: 'tizi', lat: 36.4472, lng: 4.1219, price: 9000, rating: 4.8, reviews: 72,
    cleanliness: 9.0, comfort: 8.7, capacity: 6, eco: true,
    amenities: ['breakfast', 'hike', 'family', 'parking', 'restaurant'], langs: ['ar', 'fr', 'kab'],
    images: ['tikjda', 'tikjda-lac', 'djurdjura'],
    name: L('Chalet de Tikjda', 'Tikjda Chalet', 'شاليه تيكجدة'),
    area: L('Parc national du Djurdjura', 'Djurdjura National Park', 'الحظيرة الوطنية جرجرة'),
    tagline: L('Neige l’hiver, cèdres et lacs l’été', 'Snow in winter, cedars and lakes in summer', 'ثلوج في الشتاء وأرز وبحيرات في الصيف'),
    desc: L(
      'Un chalet en pierre à 1 450 m d’altitude, chauffé au bois. Randonnées guidées vers le lac Agoulmime et les crêtes du Djurdjura.',
      'A stone chalet at 1,450 m, heated with wood. Guided hikes to Lake Agoulmime and the Djurdjura ridges.',
      'شاليه حجري على ارتفاع 1450 م، يُدفأ بالحطب. نزهات مصحوبة بمرشد نحو بحيرة أقولميم وقمم جرجرة.'
    ),
  },
  {
    id: 'maison-azeffoun', type: 'maison', city: 'tizi', lat: 36.8936, lng: 4.4197, price: 8000, rating: 4.6, reviews: 58,
    cleanliness: 8.9, comfort: 8.4, capacity: 5, eco: true,
    amenities: ['wifi', 'breakfast', 'beach', 'family', 'terrace'], langs: ['ar', 'fr', 'kab'],
    images: ['azeffoun-coucher', 'azeffoun-rochers'],
    name: L('Maison kabyle d’Azeffoun', 'Azeffoun Kabyle House', 'البيت القبائلي بأزفون'),
    area: L('Azeffoun, Tizi Ouzou', 'Azeffoun, Tizi Ouzou', 'أزفون، تيزي وزو'),
    tagline: L('Entre montagne et Méditerranée', 'Between mountain and Mediterranean', 'بين الجبل والبحر المتوسط'),
    desc: L(
      'Une maison traditionnelle restaurée sur les hauteurs d’Azeffoun, plage à cinq minutes. Couscous du vendredi préparé par la famille.',
      'A restored traditional house above Azeffoun, five minutes from the beach. Friday couscous cooked by the family.',
      'بيت تقليدي مرمّم في أعالي أزفون، والشاطئ على بعد خمس دقائق. كسكس الجمعة تحضّره العائلة.'
    ),
  },
  {
    id: 'hotel-djurdjura', type: 'hotel', city: 'tizi', lat: 36.7118, lng: 4.0459, price: 9800, rating: 4.2, reviews: 133,
    cleanliness: 8.4, comfort: 8.2, capacity: 3, eco: false,
    amenities: ['wifi', 'parking', 'restaurant', 'clim', 'family'], langs: ['ar', 'fr', 'kab'],
    images: ['djurdjura', 'tikjda'],
    name: L('Hôtel Les Cimes', 'Les Cimes Hotel', 'فندق القمم'),
    area: L('Centre, Tizi Ouzou', 'Centre, Tizi Ouzou', 'وسط تيزي وزو'),
    tagline: L('Base idéale pour la Kabylie', 'The ideal base for Kabylia', 'نقطة انطلاق مثالية لمنطقة القبائل'),
    desc: L(
      'Un hôtel simple et confortable au centre-ville, avec vue sur le Djurdjura. L’accueil réserve vos excursions vers les villages et les marchés de bijoux.',
      'A simple, comfortable city-centre hotel with views of the Djurdjura. Reception books your trips to the villages and jewellery markets.',
      'فندق بسيط ومريح في وسط المدينة بإطلالة على جرجرة. يحجز لك الاستقبال رحلاتك نحو القرى وأسواق الحلي.'
    ),
  },
];

export const POI_CATS = {
  cafe: L('Café', 'Coffee', 'مقهى'),
  hotel: L('Hôtel', 'Hotel', 'فندق'),
  musee: L('Musée', 'Museum', 'متحف'),
  souvenir: L('Souvenirs', 'Souvenirs', 'هدايا تذكارية'),
  plage: L('Plage', 'Beach', 'شاطئ'),
  patrimoine: L('Patrimoine', 'Heritage', 'تراث'),
  nature: L('Nature', 'Nature', 'طبيعة'),
};

export const POIS = [
  { id: 'casbah', cat: 'patrimoine', city: 'alger', lat: 36.7856, lng: 3.0607, rating: 4.8, img: 'casbah-rue', hours: '08:00-18:00', heritage: 'casbah',
    name: L('Casbah d’Alger', 'Casbah of Algiers', 'قصبة الجزائر'), desc: L('Médina classée à l’UNESCO, ruelles en escaliers et palais ottomans.', 'UNESCO-listed medina with stepped alleys and Ottoman palaces.', 'مدينة عتيقة مصنّفة لدى اليونسكو، أزقة مدرّجة وقصور عثمانية.') },
  { id: 'notre-dame-afrique', cat: 'patrimoine', city: 'alger', lat: 36.8010, lng: 3.0420, rating: 4.7, img: 'notre-dame', hours: '10:00-17:00',
    name: L("Notre-Dame d'Afrique", "Notre-Dame d'Afrique", 'كنيسة السيدة الإفريقية'), desc: L('Basilique néo-byzantine dominant la baie, inscription « priez pour nous et pour les musulmans ».', 'Neo-Byzantine basilica above the bay.', 'كنيسة على الطراز البيزنطي الجديد تطل على الخليج.') },
  { id: 'maqam-echahid', cat: 'patrimoine', city: 'alger', lat: 36.7458, lng: 3.0700, rating: 4.6, img: 'maqam', hours: '09:00-19:00',
    name: L('Maqam Echahid', 'Martyrs’ Memorial', 'مقام الشهيد'), desc: L('Mémorial des martyrs et musée du Moudjahid, vue sur toute la ville.', 'Martyrs’ memorial and Moudjahid museum, with views over the city.', 'نصب الشهداء ومتحف المجاهد، بإطلالة على المدينة كلها.') },
  { id: 'jardin-essai', cat: 'nature', city: 'alger', lat: 36.7480, lng: 3.0740, rating: 4.7, img: 'jardin-essai', hours: '08:00-18:30',
    name: L("Jardin d'Essai du Hamma", 'Hamma Botanical Garden', 'حديقة التجارب بالحامة'), desc: L('Jardin botanique de 1832 : allées de palmiers, ficus géants et bassins.', 'Botanical garden from 1832: palm alleys, giant figs and ponds.', 'حديقة نباتية من سنة 1832: ممرات النخيل وأشجار التين العملاقة والأحواض.') },
  { id: 'musee-bardo', cat: 'musee', city: 'alger', lat: 36.7593, lng: 3.0453, rating: 4.5, img: 'dar-pacha', hours: '09:00-16:30',
    name: L('Musée national du Bardo', 'Bardo National Museum', 'المتحف الوطني باردو'), desc: L('Préhistoire et ethnographie dans une villa ottomane.', 'Prehistory and ethnography in an Ottoman villa.', 'ما قبل التاريخ والإثنوغرافيا في فيلا عثمانية.') },
  { id: 'cafe-port-said', cat: 'cafe', city: 'alger', lat: 36.7838, lng: 3.0611, rating: 4.4, img: 'alger-port', hours: '06:30-23:00',
    name: L('Café du Square', 'Café du Square', 'مقهى الساحة'), desc: L('Thé à la menthe et qalb el louz sous les arcades.', 'Mint tea and qalb el louz under the arcades.', 'شاي بالنعناع وقلب اللوز تحت الأقواس.') },
  { id: 'souvenirs-casbah', cat: 'souvenir', city: 'alger', lat: 36.7849, lng: 3.0595, rating: 4.3, img: 'casbah-dar', hours: '10:00-19:00',
    name: L('Atelier de dinanderie', 'Copperware workshop', 'ورشة النحاس'), desc: L('Plateaux en cuivre ciselé faits main dans la Casbah.', 'Hand-chased copper trays made in the Casbah.', 'صواني نحاسية منقوشة يدويًا في القصبة.') },
  { id: 'parc-tipasa', cat: 'patrimoine', city: 'tipaza', lat: 36.5950, lng: 2.4440, rating: 4.8, img: 'tipaza-ruines', hours: '08:30-18:00', heritage: 'tipasa',
    name: L('Parc archéologique de Tipasa', 'Tipasa Archaeological Park', 'الحظيرة الأثرية تيبازة'), desc: L('Ruines puniques et romaines au bord de l’eau, chères à Camus.', 'Punic and Roman ruins on the water’s edge, beloved by Camus.', 'آثار بونيقية ورومانية على حافة البحر، أحبها كامو.') },
  { id: 'tombeau-chretienne', cat: 'patrimoine', city: 'tipaza', lat: 36.5781, lng: 2.6944, rating: 4.6, img: 'tombeau', hours: '09:00-17:00',
    name: L('Mausolée royal de Maurétanie', 'Royal Mausoleum of Mauretania', 'الضريح الملكي الموريتاني'), desc: L('Le « Tombeau de la Chrétienne », mausolée numide de 30 m de haut.', 'The “Tomb of the Christian Woman”, a 30 m Numidian mausoleum.', '«قبر الرومية»، ضريح نوميدي بارتفاع 30 مترًا.') },
  { id: 'plage-chenoua', cat: 'plage', city: 'tipaza', lat: 36.6131, lng: 2.4110, rating: 4.4, img: 'azeffoun-coucher', hours: '24h',
    name: L('Plage du Chenoua', 'Chenoua Beach', 'شاطئ شنوة'), desc: L('Long ruban de sable au pied du mont Chenoua.', 'A long ribbon of sand below Mount Chenoua.', 'شريط رملي طويل عند سفح جبل شنوة.') },
  { id: 'cafe-port-tipaza', cat: 'cafe', city: 'tipaza', lat: 36.5925, lng: 2.4495, rating: 4.5, img: 'tipaza-ruines', hours: '07:00-23:00',
    name: L('Café du Petit Port', 'Little Harbour Café', 'مقهى الميناء الصغير'), desc: L('Café noir et sardines grillées face aux barques.', 'Black coffee and grilled sardines facing the boats.', 'قهوة سوداء وسردين مشوي قبالة القوارب.') },
  { id: 'cap-carbon', cat: 'nature', city: 'bejaia', lat: 36.7744, lng: 5.1036, rating: 4.9, img: 'cap-carbon', hours: '24h',
    name: L('Cap Carbon', 'Cap Carbon', 'رأس كاربون'), desc: L('Promontoire et phare parmi les plus hauts du monde au-dessus de la mer.', 'A headland with one of the world’s highest lighthouses above sea level.', 'رأس ومنارة من أعلى المنارات في العالم فوق سطح البحر.') },
  { id: 'parc-gouraya', cat: 'nature', city: 'bejaia', lat: 36.7690, lng: 5.0800, rating: 4.8, img: 'gouraya-magot', hours: '07:00-19:00',
    name: L('Parc national de Gouraya', 'Gouraya National Park', 'الحظيرة الوطنية قورايا'), desc: L('Falaises, fort de Gouraya et macaques de Barbarie.', 'Cliffs, Gouraya fort and Barbary macaques.', 'منحدرات، حصن قورايا وقردة المغوت.') },
  { id: 'plage-aiguades', cat: 'plage', city: 'bejaia', lat: 36.7650, lng: 5.0950, rating: 4.6, img: 'bejaia-baie', hours: '24h',
    name: L('Plage des Aiguades', 'Aiguades Beach', 'شاطئ لي زيغاد'), desc: L('Crique d’eau turquoise sous les pins.', 'A turquoise cove beneath the pines.', 'خليج صغير بمياه فيروزية تحت الصنوبر.') },
  { id: 'poterie-bejaia', cat: 'souvenir', city: 'bejaia', lat: 36.7531, lng: 5.0640, rating: 4.4, img: 'bejaia-baie', hours: '09:00-18:00',
    name: L('Atelier de poterie kabyle', 'Kabyle pottery workshop', 'ورشة الفخار القبائلي'), desc: L('Poteries peintes aux motifs berbères, cuites au feu de bois.', 'Painted pottery with Berber motifs, wood-fired.', 'فخار مزخرف بالرموز الأمازيغية مطهو على الحطب.') },
  { id: 'cafe-bejaia', cat: 'cafe', city: 'bejaia', lat: 36.7515, lng: 5.0585, rating: 4.5, img: 'bejaia-baie', hours: '06:00-22:00',
    name: L('Café de la Place Gueydon', 'Place Gueydon Café', 'مقهى ساحة قيدون'), desc: L('Le « balcon de la Méditerranée », vue sur le golfe.', 'The “balcony of the Mediterranean”, overlooking the gulf.', '«شرفة المتوسط»، بإطلالة على الخليج.') },
  { id: 'santa-cruz', cat: 'patrimoine', city: 'oran', lat: 35.7086, lng: -0.6656, rating: 4.7, img: 'santa-cruz', hours: '09:00-19:00',
    name: L('Fort et chapelle de Santa Cruz', 'Santa Cruz Fort & Chapel', 'قلعة وكنيسة سانتا كروز'), desc: L('Fort espagnol du XVIe siècle sur le mont Murdjadjo, vue sur la baie.', '16th-century Spanish fort on Mount Murdjadjo, overlooking the bay.', 'قلعة إسبانية من القرن السادس عشر على جبل المرجاجو.') },
  { id: 'front-de-mer-oran', cat: 'nature', city: 'oran', lat: 35.7020, lng: -0.6400, rating: 4.5, img: 'oran-front', hours: '24h',
    name: L('Front de mer d’Oran', 'Oran seafront', 'واجهة وهران البحرية'), desc: L('La promenade du soir, palmiers et vue sur le port.', 'The evening promenade, palms and port views.', 'نزهة المساء بين النخيل وبإطلالة على الميناء.') },
  { id: 'musee-zabana', cat: 'musee', city: 'oran', lat: 35.6960, lng: -0.6380, rating: 4.4, img: 'djemila-theatre', hours: '09:00-17:00',
    name: L('Musée Ahmed Zabana', 'Ahmed Zabana Museum', 'متحف أحمد زبانة'), desc: L('Archéologie, beaux-arts et histoire naturelle de l’Oranie.', 'Archaeology, fine arts and natural history of the Oran region.', 'آثار وفنون جميلة وتاريخ طبيعي لمنطقة وهران.') },
  { id: 'cafe-rai', cat: 'cafe', city: 'oran', lat: 35.6985, lng: -0.6330, rating: 4.3, img: 'hotel-pins', hours: '08:00-01:00',
    name: L('Café El Bahia', 'Café El Bahia', 'مقهى الباهية'), desc: L('Raï en fond sonore et karantika au comptoir.', 'Raï in the background and karantika at the counter.', 'موسيقى الراي في الخلفية والكرنتيكة على الكونتوار.') },
  { id: 'souvenirs-oran', cat: 'souvenir', city: 'oran', lat: 35.6990, lng: -0.6350, rating: 4.2, img: 'santa-cruz-dome', hours: '10:00-20:00',
    name: L('Boutique Derb', 'Derb Boutique', 'متجر الدرب'), desc: L('Vinyles de raï, céramiques et épices de l’Ouest.', 'Raï records, ceramics and western spices.', 'أسطوانات الراي، خزف وتوابل الغرب.') },
  { id: 'djurdjura', cat: 'nature', city: 'tizi', lat: 36.4600, lng: 4.1200, rating: 4.9, img: 'djurdjura', hours: '24h',
    name: L('Massif du Djurdjura', 'Djurdjura massif', 'سلسلة جبال جرجرة'), desc: L('Sommets à plus de 2 300 m, cèdres et villages perchés.', 'Peaks above 2,300 m, cedars and hilltop villages.', 'قمم تتجاوز 2300 م، أرز وقرى معلّقة.') },
  { id: 'plage-azeffoun', cat: 'plage', city: 'tizi', lat: 36.8950, lng: 4.4250, rating: 4.6, img: 'azeffoun-rochers', hours: '24h',
    name: L('Plage d’Azeffoun', 'Azeffoun Beach', 'شاطئ أزفون'), desc: L('Rochers, eau claire et couchers de soleil sur la côte kabyle.', 'Rocks, clear water and sunsets on the Kabyle coast.', 'صخور ومياه صافية وغروب على الساحل القبائلي.') },
  { id: 'bijoux-ath-yenni', cat: 'souvenir', city: 'tizi', lat: 36.5950, lng: 4.2000, rating: 4.7, img: 'kabylie-village', hours: '09:00-18:00',
    name: L('Bijoutiers d’Ath Yenni', 'Ath Yenni silversmiths', 'صاغة آث يني'), desc: L('Bijoux en argent émaillé, savoir-faire transmis depuis des siècles.', 'Enamelled silver jewellery, a centuries-old craft.', 'حلي فضية مطلية بالمينا، حرفة متوارثة منذ قرون.') },
  { id: 'cafe-tizi', cat: 'cafe', city: 'tizi', lat: 36.7150, lng: 4.0480, rating: 4.3, img: 'tikjda', hours: '06:00-22:00',
    name: L('Café des Oliviers', 'Olive Tree Café', 'مقهى الزيتون'), desc: L('Café au lait et galette kabyle au feu de bois.', 'Milky coffee and wood-fired Kabyle flatbread.', 'قهوة بالحليب وكسرة قبائلية على الحطب.') },
];

// Avis initiaux (démo) — les avis ajoutés par l'utilisateur sont stockés localement.
export const SEED_REVIEWS = {
  'dar-el-bahdja': [
    { name: 'Lina B.', from: 'Lyon', rating: 5, date: '2026-09-12', text: 'Le patio est magique et la vue au petit-déjeuner incroyable. Nos hôtes nous ont fait découvrir des coins de la Casbah qu’on n’aurait jamais trouvés.' },
    { name: 'Yacine M.', from: 'Constantine', rating: 4, date: '2026-08-03', text: 'Très bon accueil, maison pleine de charme. Il faut monter pas mal d’escaliers, prévoir des sacs légers.' },
  ],
  'ruines-bleues': [
    { name: 'Sarah K.', from: 'Montréal', rating: 5, date: '2026-07-21', text: 'Plage privée, spa et ruines romaines à 5 minutes à pied. Parfait pour notre retour au bled en famille.' },
    { name: 'Karim D.', from: 'Blida', rating: 4, date: '2026-06-30', text: 'Belle piscine, personnel aux petits soins. Le restaurant manque un peu de choix le soir.' },
  ],
  'hotel-cap-carbon': [
    { name: 'Thiziri A.', from: 'Tizi Ouzou', rating: 5, date: '2026-09-02', text: 'Réveil face au cap, coucher de soleil depuis la terrasse. Le personnel parle kabyle, arabe et français.' },
  ],
  'chalet-tikjda': [
    { name: 'Amine R.', from: 'Alger', rating: 5, date: '2026-02-14', text: 'Neige partout, cheminée, randonnée en raquettes avec le guide. Un week-end inoubliable.' },
  ],
};

export const SEED_COMMUNITY = [
  { name: 'Nadia', city: 'tipaza', text: 'Allez au parc archéologique tôt le matin : lumière douce et presque personne avant 10 h.' },
  { name: 'Samir', city: 'bejaia', text: 'Pour Cap Carbon, la route est fermée aux voitures : comptez 45 minutes de marche depuis les Aiguades.' },
  { name: 'Ines', city: 'alger', text: 'Dans la Casbah, prenez un guide agréé : les ruelles se ressemblent toutes et les palais ouvrent à des horaires variables.' },
  { name: 'Walid', city: 'oran', text: 'Le téléphérique vers Santa Cruz est fermé certains jours de vent ; le taxi jusqu’au fort coûte environ 500 DA.' },
  { name: 'Kenza', city: 'tizi', text: 'Pour Tikjda en hiver, chaînes ou pneus neige obligatoires après Haizer.' },
];

export const allPlaces = () => [...STAYS.map((s) => ({ ...s, kind: 'stay' })), ...POIS.map((p) => ({ ...p, kind: 'poi' }))];
export const findPlace = (id) => allPlaces().find((p) => p.id === id);
