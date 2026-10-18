// Espace découverte — patrimoine algérien (sites réels).
const L = (fr, en, ar) => ({ fr, en, ar });

export const ERAS = {
  prehistoire: L('Préhistoire', 'Prehistory', 'ما قبل التاريخ'),
  antique: L('Antiquité', 'Antiquity', 'العصور القديمة'),
  medieval: L('Époque médiévale', 'Middle Ages', 'العصر الوسيط'),
  ottoman: L('Époque ottomane', 'Ottoman era', 'العهد العثماني'),
  nature: L('Sites naturels', 'Natural sites', 'مواقع طبيعية'),
};

export const HERITAGE = [
  {
    id: 'casbah', era: 'ottoman', unesco: 1992, city: 'alger', lat: 36.7856, lng: 3.0607, img: 'casbah-rue', gallery: ['casbah-rue', 'casbah-dar', 'dar-pacha'],
    name: L("Casbah d'Alger", 'Casbah of Algiers', 'قصبة الجزائر'),
    region: L('Alger', 'Algiers', 'الجزائر العاصمة'),
    story: L(
      "Construite sur les ruines de l'antique Icosium, la Casbah est une ville-escalier qui descend vers la mer. Ses maisons à patio, ses mosquées et le palais du Dey témoignent de l'époque ottomane, et ses ruelles ont été le théâtre de la bataille d'Alger.",
      'Built on the ruins of ancient Icosium, the Casbah is a stairway city tumbling down to the sea. Its courtyard houses, mosques and the Dey’s palace bear witness to the Ottoman era, and its alleys were the stage of the Battle of Algiers.',
      'شُيّدت القصبة على أنقاض إيكوزيوم القديمة، وهي مدينة مدرّجة تنحدر نحو البحر. تشهد دورها ذات الأفنية ومساجدها وقصر الداي على العهد العثماني، وكانت أزقتها مسرحًا لمعركة الجزائر.'
    ),
    best: L('Printemps et automne, le matin', 'Spring and autumn, in the morning', 'الربيع والخريف، صباحًا'),
    access: L('Métro jusqu’à la place des Martyrs, puis à pied', 'Metro to Place des Martyrs, then on foot', 'المترو حتى ساحة الشهداء ثم سيرًا على الأقدام'),
  },
  {
    id: 'tipasa', era: 'antique', unesco: 1982, city: 'tipaza', lat: 36.5950, lng: 2.4440, img: 'tipaza-ruines', gallery: ['tipaza-ruines', 'tombeau'],
    name: L('Tipasa', 'Tipasa', 'تيبازة'),
    region: L('Tipaza', 'Tipaza', 'تيبازة'),
    story: L(
      "Comptoir punique devenu cité romaine, Tipasa étale ses basiliques, son amphithéâtre et ses nécropoles au bord de l'eau. Albert Camus y a écrit « Noces à Tipasa », hymne au soleil et à la mer.",
      'A Punic trading post turned Roman city, Tipasa spreads its basilicas, amphitheatre and necropolises along the shore. Albert Camus wrote “Nuptials at Tipasa” here, a hymn to sun and sea.',
      'مرفأ بونيقي تحوّل إلى مدينة رومانية، تمتد في تيبازة كنائسها ومدرّجها ومقابرها على حافة البحر. كتب فيها ألبير كامو «أعراس في تيبازة»، نشيدًا للشمس والبحر.'
    ),
    best: L('Avril à juin, avant 10 h', 'April to June, before 10 am', 'من أفريل إلى جوان، قبل العاشرة صباحًا'),
    access: L('1 h 15 en voiture depuis Alger par la RN11', '1 h 15 drive from Algiers on the RN11', 'ساعة و15 دقيقة بالسيارة من الجزائر عبر الطريق الوطني 11'),
  },
  {
    id: 'djemila', era: 'antique', unesco: 1982, city: null, lat: 36.3206, lng: 5.7367, img: 'djemila', gallery: ['djemila', 'djemila-theatre'],
    name: L('Djémila', 'Djemila', 'جميلة'),
    region: L('Sétif', 'Setif', 'سطيف'),
    story: L(
      "Cuicul, « la belle », s'accroche à 900 m d'altitude dans les montagnes. Son forum, ses temples et son théâtre comptent parmi les ruines romaines les mieux conservées d'Afrique du Nord.",
      'Cuicul, “the beautiful”, clings to the mountains at 900 m. Its forum, temples and theatre are among the best-preserved Roman ruins in North Africa.',
      'كويكول «الجميلة» تتشبث بالجبال على ارتفاع 900 م. يُعدّ منتداها ومعابدها ومسرحها من أفضل الآثار الرومانية حفظًا في شمال إفريقيا.'
    ),
    best: L('Printemps, quand les collines verdissent', 'Spring, when the hills turn green', 'الربيع حين تخضرّ التلال'),
    access: L('50 km au nord-est de Sétif', '50 km north-east of Setif', 'على بعد 50 كم شمال شرق سطيف'),
  },
  {
    id: 'timgad', era: 'antique', unesco: 1982, city: null, lat: 35.4847, lng: 6.4683, img: 'timgad', gallery: ['timgad'],
    name: L('Timgad', 'Timgad', 'تيمقاد'),
    region: L('Batna', 'Batna', 'باتنة'),
    story: L(
      "Fondée par Trajan en l'an 100, Thamugadi est une ville romaine au plan en damier parfait. L'arc de Trajan et la bibliothèque rappellent une colonie de vétérans aux portes des Aurès.",
      'Founded by Trajan in AD 100, Thamugadi is a Roman town laid out on a perfect grid. Trajan’s arch and the library recall a veterans’ colony at the gates of the Aurès.',
      'أسسها تراجان سنة 100م، وتاموقادي مدينة رومانية ذات تخطيط شبكي مثالي. يذكّر قوس تراجان والمكتبة بمستعمرة للمحاربين القدامى على أبواب الأوراس.'
    ),
    best: L('Juillet, pendant le festival de Timgad', 'July, during the Timgad festival', 'جويلية، خلال مهرجان تيمقاد'),
    access: L('35 km à l’est de Batna', '35 km east of Batna', 'على بعد 35 كم شرق باتنة'),
  },
  {
    id: 'mzab', era: 'medieval', unesco: 1982, city: 'ghardaia', lat: 32.4909, lng: 3.6735, img: 'mzab', gallery: ['mzab'],
    name: L("Vallée du M'Zab", "M'Zab Valley", 'وادي ميزاب'),
    region: L('Ghardaïa', 'Ghardaia', 'غرداية'),
    story: L(
      "Cinq ksour fondés au XIe siècle par les Ibadites, organisés autour d'une mosquée et d'une palmeraie. Leur architecture d'une sobriété absolue a inspiré Le Corbusier.",
      'Five ksour founded in the 11th century by the Ibadis, each built around a mosque and a palm grove. Their utterly sober architecture inspired Le Corbusier.',
      'خمسة قصور أسسها الإباضيون في القرن الحادي عشر، كلٌّ منها حول مسجد وواحة نخيل. ألهمت عمارتها البسيطة لوكوربوزييه.'
    ),
    best: L('Octobre à avril', 'October to April', 'من أكتوبر إلى أفريل'),
    access: L('Vol Alger–Ghardaïa (1 h) — bientôt dans HAILLA', 'Algiers–Ghardaia flight (1 h) — coming soon to HAILLA', 'رحلة الجزائر–غرداية (ساعة) — قريبًا في هايلا'),
  },
  {
    id: 'tassili', era: 'prehistoire', unesco: 1982, city: 'djanet', lat: 25.5, lng: 9.0, img: 'tassili-art', gallery: ['tassili-art', 'tassili-roches', 'sahara-dune'],
    name: L("Tassili n'Ajjer", "Tassili n'Ajjer", 'طاسيلي ناجر'),
    region: L('Illizi', 'Illizi', 'إليزي'),
    story: L(
      "Un musée à ciel ouvert : plus de 15 000 peintures et gravures rupestres racontent un Sahara vert, peuplé de girafes et de bergers. Les forêts de pierre du plateau sont parmi les paysages les plus étranges de la planète.",
      'An open-air museum: more than 15,000 rock paintings and engravings tell of a green Sahara, home to giraffes and herders. The plateau’s stone forests are among the strangest landscapes on Earth.',
      'متحف في الهواء الطلق: أكثر من 15000 رسم ونقش صخري تروي صحراء خضراء عاشت فيها الزرافات والرعاة. غابات الحجر على الهضبة من أغرب المناظر على وجه الأرض.'
    ),
    best: L('Novembre à mars', 'November to March', 'من نوفمبر إلى مارس'),
    access: L('Vol vers Djanet, puis circuit avec agence agréée', 'Fly to Djanet, then a tour with a licensed agency', 'رحلة جوية إلى جانت ثم جولة مع وكالة معتمدة'),
  },
  {
    id: 'kalaa', era: 'medieval', unesco: 1980, city: null, lat: 35.8139, lng: 4.7928, img: 'kalaa', gallery: ['kalaa'],
    name: L('Kalâa des Béni Hammad', 'Al Qal’a of Beni Hammad', 'قلعة بني حماد'),
    region: L("M'Sila", "M'Sila", 'المسيلة'),
    story: L(
      "Première capitale des Hammadides au XIe siècle, la Kalâa garde un minaret de 25 m, l'un des plus anciens du Maghreb, au milieu des monts du Hodna.",
      'First capital of the Hammadids in the 11th century, the Qal’a keeps a 25 m minaret, one of the oldest in the Maghreb, amid the Hodna mountains.',
      'أول عاصمة للحماديين في القرن الحادي عشر، تحتفظ القلعة بمئذنة بطول 25 مترًا، من أقدم مآذن المغرب، وسط جبال الحضنة.'
    ),
    best: L('Printemps, champs en fleurs', 'Spring, when fields bloom', 'الربيع حين تزهر الحقول'),
    access: L('36 km au nord-est de M’Sila', '36 km north-east of M’Sila', 'على بعد 36 كم شمال شرق المسيلة'),
  },
  {
    id: 'cap-carbon', era: 'nature', unesco: null, city: 'bejaia', lat: 36.7744, lng: 5.1036, img: 'cap-carbon', gallery: ['cap-carbon', 'bejaia-baie', 'gouraya-magot'],
    name: L('Cap Carbon & Gouraya', 'Cap Carbon & Gouraya', 'رأس كاربون وقورايا'),
    region: L('Béjaïa', 'Bejaia', 'بجاية'),
    story: L(
      "Une arche naturelle, un phare perché à 220 m au-dessus des flots et une forêt où vivent les macaques de Barbarie, espèce menacée. Le parc national de Gouraya est classé réserve de biosphère par l'UNESCO.",
      'A natural arch, a lighthouse 220 m above the waves and a forest home to the endangered Barbary macaque. Gouraya National Park is a UNESCO biosphere reserve.',
      'قوس طبيعي ومنارة على ارتفاع 220 م فوق الأمواج وغابة تعيش فيها قردة المغوت المهددة بالانقراض. الحظيرة الوطنية قورايا محمية محيط حيوي لدى اليونسكو.'
    ),
    best: L('Mai à octobre', 'May to October', 'من ماي إلى أكتوبر'),
    access: L('À pied depuis les Aiguades (45 min)', 'On foot from Les Aiguades (45 min)', 'سيرًا من لي زيغاد (45 دقيقة)'),
  },
  {
    id: 'djurdjura', era: 'nature', unesco: null, city: 'tizi', lat: 36.46, lng: 4.12, img: 'djurdjura', gallery: ['djurdjura', 'tikjda', 'tikjda-lac'],
    name: L('Parc national du Djurdjura', 'Djurdjura National Park', 'الحظيرة الوطنية جرجرة'),
    region: L('Tizi Ouzou · Bouira', 'Tizi Ouzou · Bouira', 'تيزي وزو · البويرة'),
    story: L(
      "La « montagne de fer » des Kabyles culmine à 2 308 m au Lalla Khedidja. Cèdres de l'Atlas, gouffres et villages perchés : en hiver, Tikjda devient la station de ski du Nord.",
      'The Kabyles’ “iron mountain” peaks at 2,308 m at Lalla Khedidja. Atlas cedars, chasms and hilltop villages: in winter, Tikjda becomes the north’s ski resort.',
      '«جبل الحديد» لدى القبائل يبلغ ذروته عند 2308 م في لالة خديجة. أرز الأطلس وهوّات وقرى معلّقة: في الشتاء تصبح تيكجدة محطة التزلج في الشمال.'
    ),
    best: L('Décembre–mars (neige) ou mai–juin', 'December–March (snow) or May–June', 'ديسمبر–مارس (الثلج) أو ماي–جوان'),
    access: L('2 h de route depuis Tizi Ouzou', '2 h drive from Tizi Ouzou', 'ساعتان بالسيارة من تيزي وزو'),
  },
  {
    id: 'constantine', era: 'medieval', unesco: null, city: null, lat: 36.365, lng: 6.6147, img: 'constantine', gallery: ['constantine'],
    name: L('Ponts de Constantine', 'Bridges of Constantine', 'جسور قسنطينة'),
    region: L('Constantine', 'Constantine', 'قسنطينة'),
    story: L(
      "Cirta, la ville suspendue, enjambe les gorges du Rhumel par sept ponts. La passerelle Sidi M'Cid se balance à 175 m au-dessus du vide.",
      'Cirta, the suspended city, spans the Rhumel gorges with seven bridges. The Sidi M’Cid footbridge sways 175 m above the void.',
      'سيرتا، المدينة المعلّقة، تعبر خوانق الرمال بسبعة جسور. جسر سيدي مسيد يتأرجح على ارتفاع 175 م فوق الفراغ.'
    ),
    best: L('Toute l’année', 'All year round', 'طوال السنة'),
    access: L('Train ou vol depuis Alger', 'Train or flight from Algiers', 'القطار أو الطائرة من الجزائر'),
  },
  {
    id: 'ghoufi', era: 'nature', unesco: null, city: null, lat: 35.05, lng: 6.21, img: 'ghoufi', gallery: ['ghoufi'],
    name: L('Balcons de Ghoufi', 'Ghoufi Balconies', 'شرفات غوفي'),
    region: L('Batna', 'Batna', 'باتنة'),
    story: L(
      "Un canyon des Aurès où des maisons troglodytes en pierre s'accrochent à la falaise au-dessus d'une palmeraie de l'oued Abiod.",
      'An Aurès canyon where stone cliff dwellings cling to the rock face above the palm grove of Oued Abiod.',
      'وادٍ في الأوراس تتشبث فيه بيوت حجرية بالجرف فوق واحة نخيل وادي الأبيض.'
    ),
    best: L('Printemps et automne', 'Spring and autumn', 'الربيع والخريف'),
    access: L('90 km au sud de Batna', '90 km south of Batna', 'على بعد 90 كم جنوب باتنة'),
  },
  {
    id: 'taghit', era: 'nature', unesco: null, city: 'taghit', lat: 30.9167, lng: -2.0333, img: 'taghit', gallery: ['taghit', 'sahara-erg', 'sahara-dune'],
    name: L('Dunes de Taghit', 'Taghit dunes', 'كثبان تاغيت'),
    region: L('Béchar', 'Bechar', 'بشار'),
    story: L(
      "Le Grand Erg occidental vient mourir au pied d'un ksar en terre et d'une palmeraie. Gravures rupestres, nuits étoilées et fêtes du Nouvel An dans les dunes.",
      'The Great Western Erg ends at the foot of an earthen ksar and a palm grove. Rock engravings, starry nights and New Year festivities in the dunes.',
      'ينتهي العرق الغربي الكبير عند سفح قصر طيني وواحة نخيل. نقوش صخرية وليالٍ مرصّعة بالنجوم واحتفالات رأس السنة بين الكثبان.'
    ),
    best: L('Octobre à mars', 'October to March', 'من أكتوبر إلى مارس'),
    access: L('Vol vers Béchar, puis 1 h de route — bientôt dans HAILLA', 'Fly to Bechar, then 1 h by road — coming soon to HAILLA', 'رحلة إلى بشار ثم ساعة بالسيارة — قريبًا في هايلا'),
  },
];
