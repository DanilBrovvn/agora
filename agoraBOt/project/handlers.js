const { CATEGORIES, DISTRICTS, AD_STATUSES, STATES } = require('./constants');
const Keyboards = require('./keyboards');
const Utils = require('./utils');
const Database = require('./database');

class Handlers {
  // Обработчик команды /start
  static async start(ctx) {
    try {
      const userId = ctx.from.id;
      let user = Database.getUser(userId);
      
      if (!user) {
        user = Database.createUser(userId, {
          firstName: ctx.from.first_name,
          username: ctx.from.username,
          state: STATES.MAIN_MENU
        });
      }

      const welcomeText = `🏛️ *Добро пожаловать в AgoraHub!*

Ваш надежный помощник в поиске качественных услуг в Москве.

🔍 Найдите проверенных специалистов
📢 Размещайте свои услуги  
⭐️ Читайте честные отзывы
🛡️ Работайте с гарантией качества

Выберите действие:`;

      await ctx.reply(welcomeText, {
        parse_mode: 'Markdown',
        ...Keyboards.mainMenu()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Главное меню
  static async mainMenu(ctx) {
    try {
      const menuText = `🏛️ *AgoraHub* - Главное меню

Выберите раздел:`;

      if (ctx.callbackQuery) {
        await ctx.editMessageText(menuText, {
          parse_mode: 'Markdown',
          ...Keyboards.mainMenu()
        });
      } else {
        await ctx.reply(menuText, {
          parse_mode: 'Markdown',
          ...Keyboards.mainMenu()
        });
      }
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Поиск услуг - показать категории
  static async searchService(ctx) {
    try {
      const searchText = `🔍 *Поиск услуг*

Выберите категорию или воспользуйтесь поиском по ключевым словам:`;

      await ctx.editMessageText(searchText, {
        parse_mode: 'Markdown',
        ...Keyboards.categories()
      });

      Database.updateUser(ctx.from.id, { state: STATES.BROWSING_CATEGORIES });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Выбор категории
  static async selectCategory(ctx, categoryKey) {
    try {
      const category = CATEGORIES[categoryKey];
      if (!category) return;

      const categoryText = `📂 *${category.name}*

Выберите подкатегорию:`;

      await ctx.editMessageText(categoryText, {
        parse_mode: 'Markdown',
        ...Keyboards.subcategories(categoryKey)
      });

      const user = Database.getUser(ctx.from.id);
      Database.updateUser(ctx.from.id, { 
        state: STATES.VIEWING_SUBCATEGORY,
        currentCategory: categoryKey 
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Выбор подкатегории
  static async selectSubcategory(ctx, categoryKey, subcategoryKey) {
    try {
      const category = CATEGORIES[categoryKey];
      if (!category || !category.subcategories[subcategoryKey]) return;

      const subcategoryName = category.subcategories[subcategoryKey];
      
      const user = Database.getUser(ctx.from.id);
      Database.updateUser(ctx.from.id, {
        currentSubcategory: subcategoryKey,
        searchFilters: { category: categoryKey, subcategory: subcategoryKey }
      });

      const filtersText = `🎯 *${category.name}*
📝 *Подкатегория:* ${subcategoryName}

Настройте фильтры поиска или сразу найдите услуги:`;

      await ctx.editMessageText(filtersText, {
        parse_mode: 'Markdown',
        ...Keyboards.searchFilters()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Выполнить поиск
  static async executeSearch(ctx) {
    try {
      const user = Database.getUser(ctx.from.id);
      const filters = user.searchFilters || {};

      const results = Database.searchAds(filters);
      
      if (results.length === 0) {
        await ctx.editMessageText(`❌ *Ничего не найдено*

По вашему запросу не найдено подходящих предложений.
Попробуйте изменить фильтры поиска.`, {
          parse_mode: 'Markdown',
          ...Keyboards.searchFilters(filters)
        });
        return;
      }

      const paginatedResults = Utils.paginateResults(results, 1, 5);
      let resultText = `🔍 *Результаты поиска*\n\nНайдено: ${paginatedResults.total} предложений\n\n`;

      paginatedResults.items.forEach((ad, index) => {
        const provider = Database.getUser(ad.userId);
        const ratingStars = '⭐️'.repeat(Math.floor(provider?.rating || 0));
        const verificationBadge = provider?.verified ? (provider.trustBadge ? '🏆' : '✅') : '';
        
        resultText += `${index + 1}. ${verificationBadge} *${ad.title}*\n`;
        resultText += `👤 ${provider?.name || 'Поставщик'} ${ratingStars}\n`;
        resultText += `📍 ${ad.districts?.join(', ') || 'Все районы'}\n`;
        resultText += `💰 от ${Utils.formatPrice(ad.priceFrom)}\n`;
        resultText += `📝 ${Utils.truncateText(ad.description, 80)}\n\n`;
      });

      await ctx.editMessageText(resultText, {
        parse_mode: 'Markdown',
        ...Keyboards.searchResults(paginatedResults.total, paginatedResults.page)
      });

      Database.updateUser(ctx.from.id, { 
        state: 'search_results',
        currentResults: results 
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Профиль пользователя
  static async showProfile(ctx) {
    try {
      const user = Database.getUser(ctx.from.id);
      const profileText = Utils.formatUserProfile(user);

      await ctx.editMessageText(profileText, {
        parse_mode: 'Markdown',
        ...Keyboards.profile()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Создание объявления
  static async createAd(ctx) {
    try {
      const user = Database.getUser(ctx.from.id);
      
      if (!user.verified) {
        await ctx.editMessageText(`🔐 *Необходима верификация*

Для размещения объявлений требуется верификация аккаунта.
Это помогает нам поддерживать высокое качество услуг.

*Что нужно сделать:*
✅ Подтвердить номер телефона
✅ Указать контактные данные

После верификации вы сможете:
📢 Размещать неограниченное количество объявлений
⭐️ Получать отзывы от клиентов  
📊 Просматривать статистику просмотров
🏆 Получить значок доверия`, {
          parse_mode: 'Markdown',
          ...Keyboards.verification()
        });
        return;
      }

      const adText = `📢 *Создание объявления*

*Шаг 1 из 6: Выбор категории*

Выберите категорию для вашей услуги:`;

      await ctx.editMessageText(adText, {
        parse_mode: 'Markdown',
        ...Keyboards.categories()
      });

      Database.updateUser(ctx.from.id, { 
        state: STATES.CREATING_AD,
        adDraft: { step: 'category' }
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Мои объявления
  static async showMyAds(ctx) {
    try {
      const user = Database.getUser(ctx.from.id);
      const userAds = Database.getUserAds(ctx.from.id);

      const activeAds = userAds.filter(ad => ad.status === 'active').length;
      const moderationAds = userAds.filter(ad => ad.status === 'moderation').length;
      const totalViews = userAds.reduce((sum, ad) => sum + ad.views, 0);
      const totalResponses = userAds.reduce((sum, ad) => sum + ad.responses, 0);

      const adsText = `📋 *Мои объявления*

📊 *Статистика:*
🟢 Активных: ${activeAds}
🟡 На модерации: ${moderationAds}
👀 Всего просмотров: ${totalViews}
📞 Всего откликов: ${totalResponses}

Выберите раздел:`;

      await ctx.editMessageText(adsText, {
        parse_mode: 'Markdown',
        ...Keyboards.myAdsMenu()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Избранное
  static async showFavorites(ctx) {
    try {
      const favorites = Database.getUserFavorites(ctx.from.id);

      if (favorites.length === 0) {
        await ctx.editMessageText(`⭐️ *Избранное пусто*

Вы еще не добавили услуги в избранное.
Найдите интересные предложения в поиске и сохраните их для быстрого доступа.`, {
          parse_mode: 'Markdown',
          ...Keyboards.backButton('main_menu')
        });
        return;
      }

      let favoritesText = `⭐️ *Избранное*\n\nУ вас ${favorites.length} сохраненных предложений:\n\n`;

      favorites.slice(0, 5).forEach((ad, index) => {
        const provider = Database.getUser(ad.userId);
        favoritesText += `${index + 1}. *${ad.title}*\n`;
        favoritesText += `👤 ${provider?.name || 'Поставщик'}\n`;
        favoritesText += `💰 от ${Utils.formatPrice(ad.priceFrom)}\n\n`;
      });

      await ctx.editMessageText(favoritesText, {
        parse_mode: 'Markdown',
        ...Keyboards.backButton('main_menu')
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Поддержка
  static async showSupport(ctx) {
    try {
      const supportText = `❓ *Поддержка AgoraHub*

Мы готовы помочь вам решить любые вопросы:

📋 *Часто задаваемые вопросы* - быстрые ответы на популярные вопросы
💬 *Чат с модератором* - живое общение со специалистом  
📝 *Правила платформы* - как пользоваться сервисом

*Время работы поддержки:*
⏰ Пн-Пт: 9:00-21:00
⏰ Сб-Вс: 10:00-18:00

📞 Телефон: +7 (495) 123-45-67
📧 Email: support@agorahub.ru`;

      await ctx.editMessageText(supportText, {
        parse_mode: 'Markdown',
        ...Keyboards.support()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // О проекте
  static async showAbout(ctx) {
    try {
      const aboutText = `🏛️ *О проекте AgoraHub*

*Миссия:* Создание надежной экосистемы услуг в Москве, где качество и доверие стоят на первом месте.

*Наши принципы:*
🛡️ *Безопасность* - обязательная верификация всех исполнителей
⭐️ *Качество* - система рейтингов и честные отзывы
💰 *Справедливость* - прозрачное ценообразование  
🤝 *Доверие* - гарантия возврата при некачественном сервисе

*Гарантии AgoraHub:*
✅ Проверенные специалисты
✅ Страхование сделок до 100 000₽
✅ Служба разрешения споров 24/7
✅ Возврат средств при нарушениях

*Статистика:*
👥 Более 50 000 пользователей
🔧 Более 5 000 проверенных специалистов  
⭐️ Средний рейтинг услуг: 4.8/5
📈 98% успешно завершенных заказов

*Контакты:*
🌐 agorahub.ru
📧 info@agorahub.ru
📞 +7 (495) 123-45-67`;

      await ctx.editMessageText(aboutText, {
        parse_mode: 'Markdown',
        ...Keyboards.backButton('main_menu')
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }

  // Обработчик неизвестных команд
  static async handleUnknown(ctx) {
    try {
      await ctx.reply(`❓ Команда не распознана.

Используйте /start для возврата в главное меню или выберите действие из доступных вариантов.`, {
        ...Keyboards.mainMenu()
      });
    } catch (error) {
      Utils.handleError(ctx, error);
    }
  }
}

module.exports = Handlers;