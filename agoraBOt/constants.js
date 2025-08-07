// Константы для AgoraHub бота

// Категории услуг
const CATEGORIES = {
  'repair': {
    name: '🔧 Ремонт и строительство',
    subcategories: {
      'home_repair': 'Домашний ремонт',
      'plumbing': 'Сантехника',
      'electrical': 'Электрика',
      'painting': 'Малярные работы',
      'flooring': 'Напольные покрытия',
      'windows': 'Окна и двери'
    }
  },
  'beauty': {
    name: '💄 Красота и здоровье',
    subcategories: {
      'hairdressing': 'Парикмахерские услуги',
      'cosmetology': 'Косметология',
      'massage': 'Массаж',
      'manicure': 'Маникюр/Педикюр',
      'fitness': 'Фитнес-тренеры',
      'dentistry': 'Стоматология'
    }
  },
  'transport': {
    name: '🚗 Транспорт и логистика',
    subcategories: {
      'taxi': 'Такси',
      'delivery': 'Доставка',
      'moving': 'Переезды',
      'freight': 'Грузоперевозки',
      'auto_service': 'Автосервис',
      'car_wash': 'Автомойка'
    }
  },
  'education': {
    name: '📚 Образование и репетиторство',
    subcategories: {
      'tutoring': 'Репетиторы',
      'language': 'Языки',
      'music': 'Музыка',
      'programming': 'Программирование',
      'design': 'Дизайн',
      'sports': 'Спорт'
    }
  },
  'home_services': {
    name: '🏠 Домашние услуги',
    subcategories: {
      'cleaning': 'Уборка',
      'cooking': 'Приготовление еды',
      'babysitting': 'Няни',
      'pet_care': 'Уход за животными',
      'gardening': 'Садоводство',
      'handyman': 'Мелкий ремонт'
    }
  },
  'events': {
    name: '🎉 Мероприятия и досуг',
    subcategories: {
      'photo_video': 'Фото/Видеосъемка',
      'music_dj': 'Музыка и DJ',
      'decoration': 'Оформление',
      'catering': 'Кейтеринг',
      'animation': 'Аниматоры',
      'hosting': 'Ведущие'
    }
  }
};

// Районы Москвы
const DISTRICTS = {
  'cao': 'ЦАО - Центральный',
  'sao': 'САО - Северный', 
  'svao': 'СВАО - Северо-Восточный',
  'vao': 'ВАО - Восточный',
  'uvao': 'ЮВАО - Юго-Восточный',
  'uao': 'ЮАО - Южный',
  'uzao': 'ЮЗАО - Юго-Западный',
  'zao': 'ЗАО - Западный',
  'szao': 'СЗАО - Северо-Западный',
  'zelenao': 'ЗелАО - Зеленоградский',
  'novomoskva': 'НАО - Новомосковский',
  'troitsk': 'ТАО - Троицкий'
};

// Статусы объявлений
const AD_STATUSES = {
  DRAFT: 'draft',
  MODERATION: 'moderation',
  ACTIVE: 'active',
  PAUSED: 'paused',
  REJECTED: 'rejected',
  EXPIRED: 'expired'
};

// Типы пользователей
const USER_TYPES = {
  CLIENT: 'client',
  PROVIDER: 'provider',
  BUSINESS: 'business'
};

// Состояния пользователя в боте
const STATES = {
  MAIN_MENU: 'main_menu',
  BROWSING_CATEGORIES: 'browsing_categories',
  VIEWING_SUBCATEGORY: 'viewing_subcategory',
  FILTERING: 'filtering',
  VIEWING_PROVIDER: 'viewing_provider',
  CREATING_AD: 'creating_ad',
  EDITING_PROFILE: 'editing_profile',
  VERIFICATION: 'verification'
};

// Фильтры поиска
const FILTERS = {
  urgency: {
    name: 'Срочность',
    options: {
      '24_7': '24/7 - Круглосуточно',
      'urgent': 'Срочно (в течение часа)',
      'today': 'Сегодня',
      'this_week': 'На этой неделе',
      'flexible': 'Время гибкое'
    }
  },
  price_range: {
    name: 'Цена',
    options: {
      'budget': 'До 2000₽',
      'medium': '2000-5000₽', 
      'premium': '5000-15000₽',
      'luxury': 'От 15000₽',
      'negotiable': 'Договорная'
    }
  },
  rating: {
    name: 'Рейтинг',
    options: {
      '5': '5 звезд',
      '4+': '4+ звезды',
      '3+': '3+ звезды',
      'any': 'Любой'
    }
  },
  verification: {
    name: 'Верификация',
    options: {
      'verified': 'Только верифицированные',
      'trust_badge': 'Со значком доверия',
      'any': 'Любые'
    }
  }
};

module.exports = {
  CATEGORIES,
  DISTRICTS,
  AD_STATUSES,
  USER_TYPES,
  STATES,
  FILTERS
};