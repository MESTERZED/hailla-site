// Guide HAILLA — offline engine. Rule-based, trilingual, built on the site catalogue.
// Used when the Claude proxy (api/chat) is not available. Returns markdown-lite with [[place:id]] tokens.
import { STAYS, POIS, CITIES, STAY_TYPES } from '../data/places.js';
import { HERITAGE } from '../data/heritage.js';
import { user } from '../core/store.js';

const fold = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, ' ');

export function detectLang(text, fallback = 'fr') {
  if (/[؀-ۿ]/.test(text)) return 'ar';
  const f = ` ${fold(text)} `;
  const en = (f.match(/\b(the|what|where|how|hotel|cheap|days?|see|visit|best|please|food|eat|i|my|is|are|in|to|for|thanks|hello|hi)\b/g) || []).length;
  const fr = (f.match(/\b(le|la|les|des|un|une|quoi|ou|comment|pas|cher|jours?|voir|visiter|merci|bonjour|salut|je|mon|est|pour|dans|que|quel|quelle)\b/g) || []).length;
  if (en > fr) return 'en';
  if (fr > en) return 'fr';
  return fallback;
}

const CITY_WORDS = {
  alger: ['alger', 'algiers', 'dzair', 'casbah', 'الجزائر', 'العاصمة', 'القصبة'],
  oran: ['oran', 'wahran', 'el bahia', 'وهران', 'الباهية'],
  bejaia: ['bejaia', 'bgayet', 'bougie', 'gouraya', 'cap carbon', 'بجاية'],
  tipaza: ['tipaza', 'tipasa', 'chenoua', 'تيبازة'],
  tizi: ['tizi', 'kabylie', 'kabylia', 'djurdjura', 'azeffoun', 'tikjda', 'تيزي', 'القبائل', 'جرجرة', 'أزفون'],
  ghardaia: ['ghardaia', 'mzab', 'm zab', 'غرداية', 'ميزاب'],
  taghit: ['taghit', 'bechar', 'تاغيت'],
  djanet: ['djanet', 'tassili', 'illizi', 'جانت', 'طاسيلي'],
  tamanrasset: ['tamanrasset', 'hoggar', 'ahaggar', 'تمنراست', 'الهقار'],
};

const has = (f, words) => words.some((w) => f.includes(fold(w)));
const findCity = (f) => Object.keys(CITY_WORDS).find((c) => has(f, CITY_WORDS[c]));
const name = (o, l) => o[l] ?? o.fr;
const cityName = (c, l) => name(CITIES[c].name, l);
const fmt = (n) => new Intl.NumberFormat('fr-FR').format(n).replace(/ | /g, ' ');

const T = (l, fr, en, ar) => ({ fr, en, ar })[l];

const DISHES = {
  alger: { fr: 'chorba frik, rechta, mhadjeb et zlabia', en: 'chorba frik, rechta, mhadjeb and zlabia', ar: 'شوربة فريك، رشتة، محاجب وزلابية' },
  oran: { fr: 'karantika, sardines grillées et loubia', en: 'karantika, grilled sardines and loubia', ar: 'كرنتيكة، سردين مشوي ولوبيا' },
  bejaia: { fr: 'couscous kabyle, aghroum (galette) et figues sèches', en: 'Kabyle couscous, aghroum flatbread and dried figs', ar: 'كسكس قبائلي، أغروم (كسرة) وتين مجفف' },
  tipaza: { fr: 'poisson grillé du port et makrout', en: 'grilled fish from the harbour and makrout', ar: 'سمك مشوي من الميناء ومقروط' },
  tizi: { fr: 'couscous aux légumes, huile d’olive de Kabylie et galette au feu de bois', en: 'vegetable couscous, Kabyle olive oil and wood-fired flatbread', ar: 'كسكس بالخضر، زيت زيتون القبائل وكسرة على الحطب' },
};

const DAY_TRIPS = {
  alger: { fr: 'Excursion à Tipaza (1 h 15) : ruines romaines et Mausolée royal', en: 'Day trip to Tipaza (1 h 15): Roman ruins and the Royal Mausoleum', ar: 'رحلة إلى تيبازة (ساعة و15 د): آثار رومانية والضريح الملكي' },
  tipaza: { fr: 'Cherchell et son musée de mosaïques, à 30 minutes', en: 'Cherchell and its mosaic museum, 30 minutes away', ar: 'شرشال ومتحف الفسيفساء، على بعد 30 دقيقة' },
  bejaia: { fr: 'Corniche jusqu’aux plages de Tichy et d’Aokas', en: 'Coastal road to the beaches of Tichy and Aokas', ar: 'الطريق الساحلي نحو شواطئ تيشي وأوقاس' },
  oran: { fr: 'Plages des Andalouses et coucher de soleil à Aïn El Turck', en: 'Les Andalouses beaches and sunset in Aïn El Turck', ar: 'شواطئ الأندلسيات وغروب الشمس في عين الترك' },
  tizi: { fr: 'Villages d’Ath Yenni et lacs de Tikjda', en: 'Ath Yenni villages and the Tikjda lakes', ar: 'قرى آث يني وبحيرات تيكجدة' },
};

const CAT_ORDER = ['patrimoine', 'nature', 'musee', 'plage', 'souvenir', 'cafe'];

function itinerary(city, days, l) {
  const pois = POIS.filter((p) => p.city === city).sort((a, b) => CAT_ORDER.indexOf(a.cat) - CAT_ORDER.indexOf(b.cat) || b.rating - a.rating);
  const big = pois.filter((p) => ['patrimoine', 'nature', 'musee', 'plage'].includes(p.cat));
  const small = pois.filter((p) => ['cafe', 'souvenir'].includes(p.cat));
  const lines = [];
  for (let d = 0; d < days; d++) {
    const morning = big[d * 2], afternoon = big[d * 2 + 1], evening = small[d % Math.max(small.length, 1)];
    const label = T(l, `**Jour ${d + 1}**`, `**Day ${d + 1}**`, `**اليوم ${d + 1}**`);
    if (!morning) { lines.push(`- ${label} — ${name(DAY_TRIPS[city], l)}`); continue; }
    const parts = [name(morning.name, l)];
    if (afternoon) parts.push(name(afternoon.name, l));
    if (evening) parts.push(T(l, `pause : ${name(evening.name, l)}`, `break: ${name(evening.name, l)}`, `استراحة: ${name(evening.name, l)}`));
    lines.push(`- ${label} — ${parts.join(' · ')}`);
  }
  const stay = STAYS.filter((s) => s.city === city).sort((a, b) => b.rating - a.rating)[0];
  return [
    T(l, `Voici un programme de ${days} jour${days > 1 ? 's' : ''} à ${cityName(city, l)} :`, `Here is a ${days}-day plan for ${cityName(city, l)}:`, `إليك برنامجًا لـ ${days} ${days > 2 ? 'أيام' : 'يوم'} في ${cityName(city, l)}:`),
    lines.join('\n'),
    T(l, `À goûter sur place : ${name(DISHES[city], l)}.`, `Must-try food: ${name(DISHES[city], l)}.`, `أطباق يجب تذوقها: ${name(DISHES[city], l)}.`),
    T(l, 'Pour dormir, je vous suggère :', 'Where to stay:', 'للمبيت أقترح عليك:'),
    `[[place:${stay.id}]]`,
    ...[...big].slice(0, 2).map((p) => `[[place:${p.id}]]`),
  ].join('\n\n');
}

function staysReply(f, city, l) {
  const prefs = user.prefs();
  let list = STAYS.filter((s) => !city || s.city === city);
  const cheap = has(f, ['pas cher', 'cheap', 'budget', 'econom', 'petit prix', 'رخيص', 'اقتصادي', 'ميزانية']);
  const lux = has(f, ['luxe', 'luxury', 'spa', 'piscine', 'pool', 'فاخر', 'مسبح']);
  const eco = has(f, ['eco', 'nature', 'بيئي']);
  const family = has(f, ['famille', 'family', 'enfants', 'kids', 'عائلة', 'أطفال']);
  if (eco) list = list.filter((s) => s.eco);
  if (family) list = list.filter((s) => s.amenities.includes('family'));
  if (lux) list = list.filter((s) => s.amenities.includes('pool') || s.amenities.includes('spa'));
  if (cheap || (!lux && prefs.budget === 'low')) list.sort((a, b) => a.price - b.price);
  else list.sort((a, b) => b.rating - a.rating);
  list = list.slice(0, 3);
  if (!list.length) return T(l, 'Je n’ai rien trouvé avec ces critères. Essayez sans filtre, ou une autre ville.', 'Nothing matches those criteria. Try without a filter, or another city.', 'لم أجد شيئًا بهذه المعايير. جرّب دون تصفية أو مدينة أخرى.');
  const where = city ? cityName(city, l) : T(l, 'le Nord', 'the north', 'الشمال');
  const intro = cheap
    ? T(l, `Les adresses les plus abordables à ${where} :`, `The most affordable places in ${where}:`, `أكثر العناوين اقتصادًا في ${where}:`)
    : T(l, `Mes adresses préférées à ${where} :`, `My favourite places in ${where}:`, `عناويني المفضلة في ${where}:`);
  const bullets = list.map((s) => `- **${name(s.name, l)}** — ${name(STAY_TYPES[s.type], l)}, ${fmt(s.price)} ${T(l, 'DA/nuit', 'DA/night', 'دج/الليلة')}, ${s.rating}/5`).join('\n');
  return [intro, bullets, ...list.map((s) => `[[place:${s.id}]]`), T(l, 'Touchez une carte pour voir les photos et réserver.', 'Tap a card to see photos and book.', 'اضغط على بطاقة لرؤية الصور والحجز.')].join('\n\n');
}

function seeReply(city, l) {
  if (!city) {
    const top = HERITAGE.filter((h) => h.unesco).slice(0, 4);
    return [T(l, 'Les incontournables d’Algérie, inscrits à l’UNESCO :', 'Algeria’s must-sees, all UNESCO-listed:', 'أبرز معالم الجزائر المسجلة لدى اليونسكو:'),
      top.map((h) => `- **${name(h.name, l)}** (${name(h.region, l)}) — ${name(h.best, l)}`).join('\n'),
      T(l, 'Dites-moi votre ville de départ et je vous fais un programme.', 'Tell me where you start and I’ll build a plan.', 'أخبرني من أين تنطلق وسأعدّ لك برنامجًا.')].join('\n\n');
  }
  if (CITIES[city].phase === 2) return southReply(city, l);
  const pois = POIS.filter((p) => p.city === city && ['patrimoine', 'nature', 'musee', 'plage'].includes(p.cat)).sort((a, b) => b.rating - a.rating);
  return [T(l, `À ${cityName(city, l)}, ne manquez pas :`, `In ${cityName(city, l)}, don’t miss:`, `في ${cityName(city, l)}، لا تفوّت:`),
    pois.map((p) => `- **${name(p.name, l)}** — ${name(p.desc, l)}`).join('\n'),
    ...pois.slice(0, 3).map((p) => `[[place:${p.id}]]`)].join('\n\n');
}

function southReply(city, l) {
  const h = HERITAGE.find((x) => x.city === city);
  return [T(l, `${cityName(city, l)} fait partie de la phase 2 de HAILLA : on ne peut pas encore y réserver via l’application.`, `${cityName(city, l)} is part of HAILLA’s phase 2: bookings there aren’t open in the app yet.`, `${cityName(city, l)} ضمن المرحلة الثانية من هايلا: لا يمكن الحجز هناك عبر التطبيق بعد.`),
    h ? `**${name(h.name, l)}** — ${name(h.story, l)}` : '',
    h ? T(l, `Meilleure période : ${name(h.best, l)}. Accès : ${name(h.access, l)}.`, `Best time: ${name(h.best, l)}. Getting there: ${name(h.access, l)}.`, `أفضل فترة: ${name(h.best, l)}. الوصول: ${name(h.access, l)}.`) : '',
  ].filter(Boolean).join('\n\n');
}

const REPLIES = {
  emergency: (l) => T(l,
    'Numéros d’urgence en Algérie :\n- **17** — Police\n- **14** — Protection civile (pompiers, ambulances)\n- **1055** — Gendarmerie nationale\n\nEn cas de problème avec une réservation HAILLA, écrivez à contact@hailla.dz.',
    'Emergency numbers in Algeria:\n- **17** — Police\n- **14** — Civil protection (fire, ambulance)\n- **1055** — National gendarmerie\n\nFor a problem with a HAILLA booking, email contact@hailla.dz.',
    'أرقام الطوارئ في الجزائر:\n- **17** — الشرطة\n- **14** — الحماية المدنية (إطفاء وإسعاف)\n- **1055** — الدرك الوطني\n\nلأي مشكلة في حجز هايلا راسلنا على contact@hailla.dz.'),
  darja: (l) => T(l,
    'Quelques mots de darja qui ouvrent les portes :\n- **Saha / Sahit** — bonjour, merci\n- **Bshhal ?** — combien ?\n- **Win kayen… ?** — où se trouve… ?\n- **Ma fhemtch** — je n’ai pas compris\n- **Bezzaf / Shwiya** — beaucoup / un peu\n- **Yaatik saha** — merci, bon courage\n\nEn Kabylie : **Azul** (bonjour) et **Tanemmirt** (merci).',
    'A few Darja words that open doors:\n- **Saha / Sahit** — hello, thanks\n- **Bshhal?** — how much?\n- **Win kayen…?** — where is…?\n- **Ma fhemtch** — I didn’t understand\n- **Bezzaf / Shwiya** — a lot / a little\n- **Yaatik saha** — thank you, well done\n\nIn Kabylia: **Azul** (hello) and **Tanemmirt** (thank you).',
    'كلمات بالدارجة تفتح لك الأبواب:\n- **صحّة / صحيت** — مرحبا، شكرًا\n- **بشحال؟** — بكم؟\n- **وين كاين…؟** — أين يوجد…؟\n- **ما فهمتش** — لم أفهم\n- **بزّاف / شويّة** — كثيرًا / قليلًا\n- **يعطيك الصحّة** — شكرًا، بارك الله فيك\n\nفي القبائل: **أزول** (مرحبا) و**تانميرت** (شكرًا).'),
  weather: (l) => T(l,
    'Je n’ai pas la météo en direct, mais voici les repères pour le Nord :\n- **Avril à juin** et **septembre-octobre** : idéal, 20 à 28 °C\n- **Juillet-août** : chaud (30 °C et plus), parfait pour la plage\n- **Hiver** : doux et pluvieux sur la côte ; neige au Djurdjura de décembre à mars\n\nPour le Sahara, privilégiez octobre à mars.',
    'I don’t have live weather, but here are the north’s benchmarks:\n- **April–June** and **September–October**: ideal, 20–28 °C\n- **July–August**: hot (30 °C+), great for beaches\n- **Winter**: mild and rainy on the coast; snow on the Djurdjura from December to March\n\nFor the Sahara, go between October and March.',
    'ليست لديّ أحوال الطقس المباشرة، لكن هذه معالم الشمال:\n- **من أفريل إلى جوان** و**سبتمبر-أكتوبر**: مثالي، من 20 إلى 28 درجة\n- **جويلية-أوت**: حار (30 درجة فأكثر)، مثالي للشاطئ\n- **الشتاء**: معتدل وممطر على الساحل؛ ثلوج في جرجرة من ديسمبر إلى مارس\n\nللصحراء اختر الفترة من أكتوبر إلى مارس.'),
  transport: (l) => T(l,
    'Pour se déplacer :\n- **Alger** : métro, tramway et téléphériques ; taxis et VTC (Yassir, Heetch)\n- **Entre villes** : trains SNTF (Alger–Oran, Alger–Béjaïa), cars depuis la gare routière du Caroubier, vols Air Algérie\n- **Sur place** : la voiture de location reste le plus libre pour la Kabylie et la côte\n\nVérifiez les horaires le jour même, ils changent souvent.',
    'Getting around:\n- **Algiers**: metro, tram and cable cars; taxis and ride-hailing (Yassir, Heetch)\n- **Between cities**: SNTF trains (Algiers–Oran, Algiers–Bejaia), coaches from Caroubier bus station, Air Algérie flights\n- **Locally**: a rental car is the most flexible option for Kabylia and the coast\n\nCheck timetables on the day — they change often.',
    'للتنقل:\n- **الجزائر العاصمة**: مترو، ترامواي وتلفريك؛ سيارات أجرة وتطبيقات (يسير، هيتش)\n- **بين المدن**: قطارات SNTF (الجزائر–وهران، الجزائر–بجاية)، حافلات من محطة الخروبة، رحلات الجوية الجزائرية\n- **محليًا**: السيارة المستأجرة الأكثر حرية للقبائل والساحل\n\nتحقّق من المواعيد في اليوم نفسه فهي تتغير كثيرًا.'),
  money: (l) => T(l,
    'La monnaie est le **dinar algérien (DA)**. L’espèce reste reine : prévoyez du liquide pour les cafés, taxis et marchés. Les distributeurs se trouvent dans les villes ; les cartes locales CIB et Edahabia sont de plus en plus acceptées. Changez votre argent en banque ou dans un bureau agréé et gardez les reçus.',
    'The currency is the **Algerian dinar (DA)**. Cash is king: carry some for cafés, taxis and markets. ATMs are found in cities; local CIB and Edahabia cards are increasingly accepted. Exchange money at a bank or licensed bureau and keep the receipts.',
    'العملة هي **الدينار الجزائري (دج)**. النقد هو الأساس: احمل مبلغًا للمقاهي وسيارات الأجرة والأسواق. الصرّافات الآلية متوفرة في المدن، وبطاقتا CIB والذهبية مقبولتان أكثر فأكثر. اصرف أموالك في البنك أو مكتب معتمد واحتفظ بالوصولات.'),
  visa: (l) => T(l,
    'La plupart des voyageurs étrangers ont besoin d’un visa, à demander au consulat d’Algérie de leur pays de résidence. Les Algériens de la diaspora entrent avec leur passeport algérien. Les règles évoluent : vérifiez auprès du consulat avant de réserver vos vols.',
    'Most foreign travellers need a visa, issued by the Algerian consulate in their country of residence. Algerians from the diaspora enter with their Algerian passport. Rules change: check with the consulate before booking flights.',
    'يحتاج معظم المسافرين الأجانب إلى تأشيرة من القنصلية الجزائرية في بلد إقامتهم. يدخل جزائريو الجالية بجوازهم الجزائري. القواعد تتغيّر: تحقّق لدى القنصلية قبل حجز الرحلات.'),
  booking: (l) => T(l,
    'Pour réserver : ouvrez **Hébergements**, filtrez par ville et budget, choisissez une adresse puis touchez **Réserver**. La confirmation est immédiate et votre réservation apparaît dans **Mes voyages**. Le paiement se fait sur place ; la carte CIB/Edahabia arrive bientôt. Annulation gratuite jusqu’à 48 h avant l’arrivée.',
    'To book: open **Stays**, filter by city and budget, pick a place and tap **Reserve**. Confirmation is instant and your booking appears in **My trips**. You pay at the property; CIB/Edahabia card payment is coming soon. Free cancellation up to 48 h before arrival.',
    'للحجز: افتح **الإقامات**، صفِّ حسب المدينة والميزانية، اختر عنوانًا ثم اضغط **احجز**. التأكيد فوري ويظهر حجزك في **رحلاتي**. الدفع في المؤسسة، والدفع ببطاقة CIB/الذهبية قريبًا. إلغاء مجاني حتى 48 ساعة قبل الوصول.'),
  eco: (l) => [T(l,
    'Voyager responsable en Algérie :\n- Restez sur les sentiers et ne nourrissez pas les macaques de Gouraya\n- Emportez vos déchets, surtout sur les plages et au Djurdjura\n- Préférez les guides et artisans locaux\n\nNos adresses labellisées Éco :',
    'Travelling responsibly in Algeria:\n- Stay on trails and don’t feed the Gouraya macaques\n- Take your rubbish with you, especially on beaches and in the Djurdjura\n- Choose local guides and artisans\n\nOur Eco-labelled places:',
    'السفر المسؤول في الجزائر:\n- التزم بالمسارات ولا تُطعم قردة قورايا\n- احمل نفاياتك معك، خاصة على الشواطئ وفي جرجرة\n- فضّل المرشدين والحرفيين المحليين\n\nعناويننا الحاصلة على علامة «بيئي»:'),
  ...STAYS.filter((s) => s.eco).sort((a, b) => b.rating - a.rating).slice(0, 3).map((s) => `[[place:${s.id}]]`)].join('\n\n'),
  hello: (l) => T(l,
    'Marhba ! Dites-moi où vous voulez aller et pour combien de jours — ou demandez-moi un hôtel, un plat à goûter, un horaire.',
    'Marhba! Tell me where you’d like to go and for how many days — or ask me for a hotel, a dish to try, opening hours.',
    'مرحبا! أخبرني إلى أين تريد الذهاب ولكم يومًا — أو اسألني عن فندق أو طبق تتذوقه أو مواعيد.'),
  thanks: (l) => T(l, 'Avec plaisir ! Bon voyage — et n’hésitez pas si vous avez une autre question.', 'My pleasure! Have a great trip — ask me anything else anytime.', 'بكل سرور! رحلة سعيدة — ولا تتردد إن كان لديك سؤال آخر.'),
  fallback: (l) => T(l,
    'Je peux vous aider à :\n- construire un itinéraire (« 3 jours à Oran »)\n- trouver un hébergement (« maison d’hôtes pas chère à Béjaïa »)\n- savoir quoi voir, quoi manger, comment se déplacer\n\nQue cherchez-vous ?',
    'I can help you:\n- build an itinerary (“3 days in Oran”)\n- find a place to stay (“cheap guesthouse in Bejaia”)\n- know what to see, what to eat, how to get around\n\nWhat are you looking for?',
    'يمكنني مساعدتك في:\n- إعداد برنامج («3 أيام في وهران»)\n- إيجاد إقامة («دار ضيافة رخيصة في بجاية»)\n- معرفة ما تزوره وما تأكله وكيف تتنقل\n\nعمّا تبحث؟'),
};

const INTENTS = [
  ['emergency', ['urgence', 'urgent', 'emergency', 'police', 'ambulance', 'pompier', 'hopital', 'hospital', 'طوارئ', 'شرطة', 'إسعاف', 'مستشفى']],
  ['darja', ['darja', 'derja', 'phrase', 'expression', 'dire ', 'say ', 'دارجة', 'عبارات', 'كلمات']],
  ['weather', ['meteo', 'weather', 'climat', 'climate', 'saison', 'season', 'quand partir', 'when to', 'best time', 'temperature', 'طقس', 'مناخ', 'متى']],
  ['transport', ['transport', 'taxi', 'train', 'bus', 'metro', 'avion', 'flight', 'vol ', 'aller a', 'get to', 'getting', 'voiture', 'rental', 'مواصلات', 'قطار', 'حافلة', 'تنقل', 'طائرة']],
  ['money', ['argent', 'change', 'dinar', 'money', 'currency', 'cash', 'carte bancaire', 'atm', 'صرف', 'عملة', 'دينار', 'نقود']],
  ['visa', ['visa', 'passeport', 'passport', 'تأشيرة', 'فيزا', 'جواز']],
  ['booking', ['reserver', 'reservation', 'book ', 'booking', 'annuler', 'cancel', 'حجز', 'إلغاء']],
  ['eco', ['ecolo', 'eco-', 'durable', 'sustainable', 'responsable', 'responsible', 'بيئ']],
  ['thanks', ['merci', 'thanks', 'thank you', 'شكرا', 'شكرًا', 'saha', 'يعطيك']],
  ['hello', ['bonjour', 'salut', 'salam', 'hello', 'hi ', 'hey', 'marhba', 'مرحبا', 'السلام', 'أهلا']],
];

export function localReply(message, uiLang = 'fr') {
  const l = detectLang(message, uiLang);
  const f = ` ${fold(message)} `;
  const city = findCity(f);

  const days = f.match(/(\d+)\s*(jours?|days?|j\b|nuits?|nights?|أيام|يوم|ايام)/);
  const wantsPlan = days || has(f, ['itineraire', 'itinerary', 'programme', 'program', 'plan ', 'circuit', 'برنامج', 'مسار']);
  if (wantsPlan && city) {
    if (CITIES[city].phase === 2) return southReply(city, l);
    return itinerary(city, Math.min(Math.max(Number(days?.[1] || 3), 1), 7), l);
  }
  if (wantsPlan) return T(l, 'Avec plaisir ! Pour quelle ville ? Alger, Tipaza, Béjaïa, Oran ou Tizi Ouzou.', 'Happy to! Which city? Algiers, Tipaza, Bejaia, Oran or Tizi Ouzou.', 'بكل سرور! لأي مدينة؟ الجزائر، تيبازة، بجاية، وهران أو تيزي وزو.');

  if (has(f, ['hotel', 'dormir', 'heberg', 'logement', 'nuit', 'stay', 'sleep', 'room', 'chambre', 'maison d hote', 'guesthouse', 'auberge', 'hostel', 'فندق', 'مبيت', 'إقامة', 'غرفة', 'نزل'])) {
    if (city && CITIES[city].phase === 2) return southReply(city, l);
    return staysReply(f, city, l);
  }
  if (has(f, ['manger', 'plat', 'cuisine', 'restaurant', 'food', 'eat', 'dish', 'gouter', 'taste', 'café', 'cafe', 'أكل', 'طبق', 'مطعم', 'مقهى'])) {
    const c = city && DISHES[city] ? city : 'alger';
    const cafes = POIS.filter((p) => p.city === c && p.cat === 'cafe');
    return [T(l, `À ${cityName(c, l)}, goûtez : ${name(DISHES[c], l)}.`, `In ${cityName(c, l)}, try: ${name(DISHES[c], l)}.`, `في ${cityName(c, l)} تذوّق: ${name(DISHES[c], l)}.`),
      ...cafes.map((p) => `[[place:${p.id}]]`)].join('\n\n');
  }
  if (has(f, ['voir', 'visiter', 'faire', 'see', 'visit', 'to do', 'monument', 'site', 'patrimoine', 'heritage', 'unesco', 'زيارة', 'أزور', 'معالم', 'تراث', 'ماذا'])) return seeReply(city, l);

  for (const [intent, words] of INTENTS) if (has(f, words)) return REPLIES[intent](l);
  if (city) return CITIES[city].phase === 2 ? southReply(city, l) : seeReply(city, l);
  return REPLIES.fallback(l);
}
