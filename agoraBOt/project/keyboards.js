const { Markup } = require('telegraf');
const { CATEGORIES, DISTRICTS, FILTERS } = require('./constants');

class Keyboards {
  // Главное меню
  static mainMenu() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Найти Услугу', 'search_service')],
      [Markup.button.callback('📢 Разместить Объявление', 'create_ad')],
      [Markup.button.callback('📋 Мои Заказы/Запросы', 'my_orders')],
      [Markup.button.callback('⭐️ Избранное', 'favorites')],
      [Markup.button.callback('👤 Мой Профиль', 'profile')],
      [Markup.button.callback('❓ Поддержка', 'support'), Markup.button.callback('🏛️ О Проекте', 'about')]
    ]);
  }

  // Категории услуг
  static categories() {
    const buttons = Object.keys(CATEGORIES).map(key => {
      return [Markup.button.callback(CATEGORIES[key].name, `category_${key}`)];
    });
    buttons.push([Markup.button.callback('🔙 Назад', 'main_menu')]);
    return Markup.inlineKeyboard(buttons);
  }

  // Подкатегории
  static subcategories(categoryKey) {
    const category = CATEGORIES[categoryKey];
    if (!category) return null;

    const buttons = Object.keys(category.subcategories).map(key => {
      return [Markup.button.callback(category.subcategories[key], `subcategory_${categoryKey}_${key}`)];
    });
    buttons.push([Markup.button.callback('🔙 К категориям', 'search_service')]);
    return Markup.inlineKeyboard(buttons);
  }

  // Фильтры поиска
  static searchFilters(currentFilters = {}) {
    const buttons = [];
    
    buttons.push([Markup.button.callback('🏘 Район', 'filter_district')]);
    buttons.push([Markup.button.callback('⏰ Срочность', 'filter_urgency')]);
    buttons.push([Markup.button.callback('💰 Цена', 'filter_price')]);
    buttons.push([Markup.button.callback('⭐️ Рейтинг', 'filter_rating')]);
    buttons.push([Markup.button.callback('✅ Верификация', 'filter_verification')]);
    buttons.push([Markup.button.callback('🔍 Найти', 'search_execute')]);
    buttons.push([Markup.button.callback('🔙 Назад', 'search_service')]);
    
    return Markup.inlineKeyboard(buttons);
  }

  // Районы Москвы
  static districts() {
    const buttons = Object.keys(DISTRICTS).map(key => {
      return [Markup.button.callback(DISTRICTS[key], `district_${key}`)];
    });
    buttons.push([Markup.button.callback('🔙 Назад', 'search_filters')]);
    return Markup.inlineKeyboard(buttons);
  }

  // Карточка поставщика
  static providerCard(providerId, isFavorite = false) {
    const favoriteText = isFavorite ? '💔 Убрать из избранного' : '⭐️ В избранное';
    return Markup.inlineKeyboard([
      [Markup.button.callback('💬 Написать в TG', `message_${providerId}`)],
      [Markup.button.callback('📞 Показать телефон', `phone_${providerId}`)],
      [Markup.button.callback('📝 Оставить запрос', `request_${providerId}`)],
      [Markup.button.callback(favoriteText, `favorite_${providerId}`)],
      [Markup.button.callback('⭐️ Отзывы', `reviews_${providerId}`)],
      [Markup.button.callback('👎 Пожаловаться', `report_${providerId}`)],
      [Markup.button.callback('🔙 Назад к результатам', 'search_results')]
    ]);
  }

  // Профиль пользователя
  static profile() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📝 Редактировать профиль', 'edit_profile')],
      [Markup.button.callback('✅ Верификация', 'verification')],
      [Markup.button.callback('💰 Баланс', 'balance')],
      [Markup.button.callback('📋 Мои объявления', 'my_ads')],
      [Markup.button.callback('⚙️ Настройки', 'settings')],
      [Markup.button.callback('🔙 Главное меню', 'main_menu')]
    ]);
  }

  // Мои объявления
  static myAdsMenu() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('➕ Создать объявление', 'create_ad')],
      [Markup.button.callback('📊 Активные', 'ads_active')],
      [Markup.button.callback('⏳ На модерации', 'ads_moderation')],
      [Markup.button.callback('📋 Архив', 'ads_archive')],
      [Markup.button.callback('🔙 Профиль', 'profile')]
    ]);
  }

  // Управление объявлением
  static adManagement(adId, status) {
    const buttons = [];
    
    if (status === 'active') {
      buttons.push([Markup.button.callback('⏸ Приостановить', `ad_pause_${adId}`)]);
      buttons.push([Markup.button.callback('📈 Поднять в ТОП', `ad_promote_${adId}`)]);
    } else if (status === 'paused') {
      buttons.push([Markup.button.callback('▶️ Активировать', `ad_activate_${adId}`)]);
    }
    
    buttons.push([Markup.button.callback('✏️ Редактировать', `ad_edit_${adId}`)]);
    buttons.push([Markup.button.callback('📊 Статистика', `ad_stats_${adId}`)]);
    buttons.push([Markup.button.callback('🗑 Удалить', `ad_delete_${adId}`)]);
    buttons.push([Markup.button.callback('🔙 К объявлениям', 'my_ads')]);
    
    return Markup.inlineKeyboard(buttons);
  }

  // Верификация
  static verification() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('📱 Верификация телефона', 'verify_phone')],
      [Markup.button.callback('🏢 Верификация ИНН', 'verify_inn')],
      [Markup.button.callback('🏆 Значок доверия (Premium)', 'trust_badge')],
      [Markup.button.callback('🔙 Профиль', 'profile')]
    ]);
  }

  // Поддержка
  static support() {
    return Markup.inlineKeyboard([
      [Markup.button.callback('❓ Часто задаваемые вопросы', 'faq')],
      [Markup.button.callback('💬 Чат с модератором', 'chat_moderator')],
      [Markup.button.callback('📋 Правила платформы', 'rules')],
      [Markup.button.callback('🔙 Главное меню', 'main_menu')]
    ]);
  }

  // Простая навигация назад
  static backButton(action) {
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔙 Назад', action)]
    ]);
  }

  // Подтверждение действия
  static confirmation(confirmAction, cancelAction) {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback('✅ Да', confirmAction),
        Markup.button.callback('❌ Нет', cancelAction)
      ]
    ]);
  }

  // Результаты поиска
  static searchResults(total, page = 1) {
    const buttons = [];
    
    if (page > 1) {
      buttons.push(Markup.button.callback('⬅️ Назад', `results_page_${page - 1}`));
    }
    if (total > page * 10) {
      buttons.push(Markup.button.callback('➡️ Далее', `results_page_${page + 1}`));
    }
    
    if (buttons.length > 0) {
      return Markup.inlineKeyboard([
        buttons,
        [Markup.button.callback('🔍 Изменить фильтры', 'search_filters')],
        [Markup.button.callback('🔙 К категориям', 'search_service')]
      ]);
    }
    
    return Markup.inlineKeyboard([
      [Markup.button.callback('🔍 Изменить фильтры', 'search_filters')],
      [Markup.button.callback('🔙 К категориям', 'search_service')]
    ]);
  }

  // Создание объявления - шаги
  static adCreationStep(step) {
    const buttons = [];
    
    switch(step) {
      case 'category':
        return this.categories();
      case 'districts':
        return this.districts();
      case 'media':
        buttons.push([Markup.button.callback('📷 Добавить фото', 'add_photo')]);
        buttons.push([Markup.button.callback('🎥 Добавить видео', 'add_video')]);
        buttons.push([Markup.button.callback('📄 Добавить документы', 'add_documents')]);
        buttons.push([Markup.button.callback('➡️ Далее', 'ad_next_step')]);
        break;
      case 'options':
        buttons.push([Markup.button.callback('🚨 Срочно/24/7 (+100₽)', 'ad_urgent')]);
        buttons.push([Markup.button.callback('📈 Поднять в ТОП (+500₽)', 'ad_top')]);
        buttons.push([Markup.button.callback('➡️ Опубликовать', 'ad_publish')]);
        break;
    }
    
    buttons.push([Markup.button.callback('🔙 Назад', 'ad_prev_step')]);
    return Markup.inlineKeyboard(buttons);
  }
}

module.exports = Keyboards;