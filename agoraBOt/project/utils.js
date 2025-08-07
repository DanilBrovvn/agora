const moment = require('moment');
require('moment/locale/ru');
moment.locale('ru');

class Utils {
  // Форматирование сообщений
  static formatProviderCard(provider, ad) {
    const ratingStars = '⭐️'.repeat(Math.floor(provider.rating)) + '☆'.repeat(5 - Math.floor(provider.rating));
    const verificationBadge = provider.verified ? (provider.trustBadge ? '🏆' : '✅') : '';
    
    return `${verificationBadge} *${ad.title}*

👤 *${provider.name || 'Поставщик услуг'}*
⭐️ ${provider.rating.toFixed(1)} (${provider.reviewsCount} отзывов) ${ratingStars}

📍 *Районы работы:* ${ad.districts ? ad.districts.map(d => d.toUpperCase()).join(', ') : 'Не указано'}
💰 *Цена:* от ${ad.priceFrom || 'договорной'}₽

📝 *Описание:*
${ad.description || 'Описание отсутствует'}

🕐 *Создано:* ${moment(ad.createdAt).fromNow()}
👀 *Просмотров:* ${ad.views} | 📞 *Откликов:* ${ad.responses}`;
  }

  static formatAdCard(ad, showControls = false) {
    const statusEmoji = {
      'active': '🟢',
      'moderation': '🟡', 
      'paused': '⏸',
      'rejected': '🔴',
      'expired': '⏳'
    };

    let text = `${statusEmoji[ad.status] || '⚪️'} *${ad.title}*

📝 ${ad.description?.substring(0, 100)}${ad.description?.length > 100 ? '...' : ''}
💰 от ${ad.priceFrom || 'договорной'}₽
📍 ${ad.districts ? ad.districts.join(', ') : 'Все районы'}
🕐 ${moment(ad.createdAt).format('DD MMMM, HH:mm')}`;

    if (showControls) {
      text += `\n👀 Просмотров: ${ad.views} | 📞 Откликов: ${ad.responses}`;
    }

    return text;
  }

  static formatUserProfile(user) {
    const typeEmoji = {
      'client': '👤',
      'provider': '🔧', 
      'business': '🏢'
    };

    const verificationStatus = user.verified ? 
      (user.trustBadge ? '🏆 Значок доверия' : '✅ Верифицирован') : 
      '⏳ Не верифицирован';

    return `${typeEmoji[user.type] || '👤'} *Мой профиль*

📱 ${user.phone || 'Телефон не указан'}
📧 ${user.email || 'Email не указан'}
🏢 ${user.company || 'Организация не указана'}

🔐 *Статус верификации:* ${verificationStatus}
⭐️ *Рейтинг:* ${user.rating.toFixed(1)}/5.0 (${user.reviewsCount} отзывов)
💰 *Баланс:* ${user.balance}₽

📅 *Регистрация:* ${moment(user.createdAt).format('DD MMMM YYYY')}`;
  }

  // Валидация данных
  static validatePhone(phone) {
    const phoneRegex = /^(\+7|7|8)?[\s\-]?\(?[489][0-9]{2}\)?\s?[\s\-]?[0-9]{1}\d{2}[\s\-]?\d{2}[\s\-]?\d{2}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateINN(inn) {
    if (!inn || inn.length !== 10 && inn.length !== 12) return false;
    return /^\d+$/.test(inn);
  }

  static validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Обработка текста
  static truncateText(text, maxLength = 100) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  }

  static sanitizeInput(input) {
    if (!input) return '';
    return input.replace(/[<>]/g, '').trim();
  }

  // Работа с фильтрами
  static buildFilterText(filters) {
    const parts = [];
    
    if (filters.category) parts.push(`Категория: ${filters.category}`);
    if (filters.subcategory) parts.push(`Подкатегория: ${filters.subcategory}`);
    if (filters.district) parts.push(`Район: ${filters.district}`);
    if (filters.urgency) parts.push(`Срочность: ${filters.urgency}`);
    if (filters.priceRange) parts.push(`Цена: ${filters.priceRange}`);
    if (filters.rating) parts.push(`Рейтинг: ${filters.rating}`);
    if (filters.verified) parts.push(`Верификация: ${filters.verified}`);
    
    return parts.length > 0 ? parts.join('\n') : 'Фильтры не установлены';
  }

  // Генерация ID
  static generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Форматирование цен
  static formatPrice(price) {
    if (!price) return 'договорная';
    return new Intl.NumberFormat('ru-RU').format(price) + '₽';
  }

  // Обработка ошибок
  static handleError(ctx, error, userMessage = 'Произошла ошибка. Попробуйте позже.') {
    console.error('Bot error:', error);
    
    try {
      ctx.reply(userMessage, {
        reply_markup: {
          inline_keyboard: [[
            { text: '🔙 В главное меню', callback_data: 'main_menu' }
          ]]
        }
      });
    } catch (replyError) {
      console.error('Failed to send error message:', replyError);
    }
  }

  // Статистика
  static getAdStats(ad) {
    const daysActive = Math.ceil((new Date() - new Date(ad.createdAt)) / (1000 * 60 * 60 * 24));
    const viewsPerDay = daysActive > 0 ? (ad.views / daysActive).toFixed(1) : 0;
    const responseRate = ad.views > 0 ? ((ad.responses / ad.views) * 100).toFixed(1) : 0;

    return `📊 *Статистика объявления*

👀 *Всего просмотров:* ${ad.views}
📞 *Всего откликов:* ${ad.responses}
📈 *Просмотров в день:* ${viewsPerDay}
🎯 *Конверсия в отклики:* ${responseRate}%
📅 *Дней активно:* ${daysActive}

*Последняя активность:* ${moment(ad.updatedAt).fromNow()}`;
  }

  // Пагинация
  static paginateResults(results, page = 1, limit = 10) {
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const items = results.slice(offset, offset + limit);

    return {
      items,
      total,
      page,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    };
  }
}

module.exports = Utils;