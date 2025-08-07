require('dotenv').config();
const { Telegraf } = require('telegraf');
const Handlers = require('./handlers');
const Utils = require('./utils');
const Database = require('./database');

// Создание экземпляра бота
const bot = new Telegraf(process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE');

// Middleware для логирования
bot.use((ctx, next) => {
  const user = ctx.from;
  const message = ctx.message?.text || ctx.callbackQuery?.data || 'unknown';
  console.log(`[${new Date().toISOString()}] User ${user.id} (${user.first_name}): ${message}`);
  return next();
});

// Команды
bot.start(Handlers.start);
bot.help((ctx) => {
  ctx.reply(`🏛️ *AgoraHub - Помощь*

*Основные команды:*
/start - Главное меню
/help - Показать эту справку

*Как пользоваться:*
1️⃣ Найдите нужную услугу через поиск
2️⃣ Выберите подходящего исполнителя  
3️⃣ Свяжитесь напрямую или оставьте запрос
4️⃣ Оцените качество работы

*Для исполнителей:*
📢 Размещайте объявления бесплатно
⭐️ Получайте отзывы и рейтинг
💰 Увеличивайте доходы

Если возникли вопросы - воспользуйтесь разделом "Поддержка" в главном меню.`, {
    parse_mode: 'Markdown'
  });
});

// Обработчики callback-кнопок
bot.action('main_menu', Handlers.mainMenu);
bot.action('search_service', Handlers.searchService);
bot.action('create_ad', Handlers.createAd);
bot.action('profile', Handlers.showProfile);
bot.action('my_ads', Handlers.showMyAds);
bot.action('favorites', Handlers.showFavorites);
bot.action('support', Handlers.showSupport);
bot.action('about', Handlers.showAbout);

// Обработчики категорий
bot.action(/^category_(.+)$/, (ctx) => {
  const categoryKey = ctx.match[1];
  Handlers.selectCategory(ctx, categoryKey);
});

// Обработчики подкатегорий  
bot.action(/^subcategory_(.+)_(.+)$/, (ctx) => {
  const categoryKey = ctx.match[1];
  const subcategoryKey = ctx.match[2];
  Handlers.selectSubcategory(ctx, categoryKey, subcategoryKey);
});

// Фильтры поиска
bot.action('search_filters', (ctx) => {
  const user = Database.getUser(ctx.from.id);
  const filters = user.searchFilters || {};
  
  const filtersText = `🎯 *Настройка фильтров поиска*

*Текущие фильтры:*
${Utils.buildFilterText(filters)}

Выберите параметр для настройки:`;

  ctx.editMessageText(filtersText, {
    parse_mode: 'Markdown',
    ...require('./keyboards').searchFilters(filters)
  });
});

bot.action('search_execute', Handlers.executeSearch);

// Фильтр по району
bot.action('filter_district', (ctx) => {
  ctx.editMessageText(`🏘 *Выбор района*

Выберите район Москвы:`, {
    parse_mode: 'Markdown',
    ...require('./keyboards').districts()
  });
});

bot.action(/^district_(.+)$/, (ctx) => {
  const districtKey = ctx.match[1];
  const user = Database.getUser(ctx.from.id);
  const filters = user.searchFilters || {};
  filters.district = districtKey;
  
  Database.updateUser(ctx.from.id, { searchFilters: filters });
  
  ctx.editMessageText(`✅ Район выбран: ${require('./constants').DISTRICTS[districtKey]}

Настройте другие фильтры или выполните поиск:`, {
    parse_mode: 'Markdown',
    ...require('./keyboards').searchFilters(filters)
  });
});

// Верификация
bot.action('verification', (ctx) => {
  const user = Database.getUser(ctx.from.id);
  
  let verificationText = `🔐 *Верификация аккаунта*

*Ваш статус:* ${user.verified ? '✅ Верифицирован' : '⏳ Не верифицирован'}

*Доступные опции:*`;

  if (!user.phoneVerified) {
    verificationText += `\n📱 *Верификация телефона* - обязательно для размещения объявлений`;
  }
  
  if (!user.innVerified) {
    verificationText += `\n🏢 *Верификация ИНН* - для юридических лиц и ИП`;
  }
  
  if (user.verified && !user.trustBadge) {
    verificationText += `\n🏆 *Значок доверия* - премиум-верификация (500₽/мес)
    • Приоритет в результатах поиска
    • Детальная проверка документов
    • Страховка до 100 000₽`;
  }

  ctx.editMessageText(verificationText, {
    parse_mode: 'Markdown',
    ...require('./keyboards').verification()
  });
});

// Верификация телефона
bot.action('verify_phone', (ctx) => {
  Database.updateUser(ctx.from.id, { state: 'awaiting_phone' });
  
  ctx.editMessageText(`📱 *Верификация телефона*

Отправьте ваш номер телефона в формате:
+7 (XXX) XXX-XX-XX

Или воспользуйтесь кнопкой "Поделиться контактом" ниже:`, {
    parse_mode: 'Markdown',
    reply_markup: {
      keyboard: [
        [{ text: '📱 Поделиться контактом', request_contact: true }]
      ],
      one_time_keyboard: true,
      resize_keyboard: true
    }
  });
});

// Обработка контакта
bot.on('contact', (ctx) => {
  const user = Database.getUser(ctx.from.id);
  
  if (user.state === 'awaiting_phone') {
    const phone = ctx.message.contact.phone_number;
    
    Database.updateUser(ctx.from.id, {
      phone: phone,
      phoneVerified: true,
      verified: true,
      state: 'main_menu'
    });
    
    ctx.reply(`✅ *Телефон успешно верифицирован!*

Номер ${phone} подтвержден.
Теперь вы можете размещать объявления и получать заказы.`, {
      parse_mode: 'Markdown',
      ...require('./keyboards').mainMenu()
    });
  }
});

// Обработка текстовых сообщений
bot.on('text', (ctx) => {
  const user = Database.getUser(ctx.from.id);
  const text = ctx.message.text;

  switch (user?.state) {
    case 'awaiting_phone':
      if (Utils.validatePhone(text)) {
        Database.updateUser(ctx.from.id, {
          phone: text,
          phoneVerified: true, 
          verified: true,
          state: 'main_menu'
        });
        
        ctx.reply(`✅ *Телефон успешно верифицирован!*

Номер ${text} подтвержден.
Теперь вы можете размещать объявления.`, {
          parse_mode: 'Markdown',
          ...require('./keyboards').mainMenu()
        });
      } else {
        ctx.reply(`❌ Неверный формат номера телефона.

Пример правильного формата:
+7 (495) 123-45-67
8 (903) 123-45-67

Попробуйте еще раз:`);
      }
      break;
      
    case 'awaiting_inn':
      if (Utils.validateINN(text)) {
        Database.updateUser(ctx.from.id, {
          inn: text,
          innVerified: true,
          state: 'main_menu'
        });
        
        ctx.reply(`✅ *ИНН успешно верифицирован!*

ИНН ${text} подтвержден.
Ваш аккаунт получил статус "Бизнес".`, {
          parse_mode: 'Markdown',
          ...require('./keyboards').mainMenu()
        });
      } else {
        ctx.reply(`❌ Неверный формат ИНН.

ИНН должен содержать 10 или 12 цифр.
Попробуйте еще раз:`);
      }
      break;
      
    default:
      // Поиск по ключевым словам
      if (text.length > 3) {
        const searchResults = Database.searchAds({ query: text.toLowerCase() });
        
        if (searchResults.length > 0) {
          let resultText = `🔍 *Результаты поиска по запросу "${text}"*\n\nНайдено: ${searchResults.length} предложений:\n\n`;
          
          searchResults.slice(0, 3).forEach((ad, index) => {
            const provider = Database.getUser(ad.userId);
            resultText += `${index + 1}. *${ad.title}*\n`;
            resultText += `👤 ${provider?.name || 'Поставщик'}\n`;
            resultText += `💰 от ${Utils.formatPrice(ad.priceFrom)}\n\n`;
          });
          
          ctx.reply(resultText, {
            parse_mode: 'Markdown',
            ...require('./keyboards').backButton('main_menu')
          });
        } else {
          ctx.reply(`❌ По запросу "${text}" ничего не найдено.

Попробуйте:
• Использовать другие ключевые слова
• Воспользоваться поиском по категориям
• Проверить правильность написания`, {
            ...require('./keyboards').backButton('main_menu')
          });
        }
      } else {
        Handlers.handleUnknown(ctx);
      }
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  Utils.handleError(ctx, err);
});

// Запуск бота
const startBot = () => {
  if (!process.env.BOT_TOKEN) {
    console.error('❌ BOT_TOKEN не найден в переменных окружения!');
    console.log('📝 Создайте файл .env и добавьте: BOT_TOKEN=your_bot_token_here');
    process.exit(1);
  }

  if (process.env.BOT_TOKEN === 'YOUR_BOT_TOKEN_HERE') {
    console.error('❌ Необходимо заменить BOT_TOKEN в файле .env!');
    console.log('');
    console.log('📋 Инструкция по получению токена:');
    console.log('1. Найдите @BotFather в Telegram');
    console.log('2. Отправьте команду /newbot');
    console.log('3. Следуйте инструкциям для создания бота');
    console.log('4. Скопируйте полученный токен в файл .env');
    console.log('');
    console.log('Формат токена: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz');
    process.exit(1);
  }

  console.log('🚀 Запуск AgoraHub бота...');
  
  bot.launch()
    .then(() => {
      console.log('✅ AgoraHub бот успешно запущен!');
      console.log('📱 Найдите бота в Telegram и отправьте /start');
    })
    .catch(err => {
      console.error('❌ Ошибка запуска бота:', err.message);
      console.log('');
      console.log('💡 Возможные причины:');
      console.log('• Неверный токен бота (проверьте BOT_TOKEN в .env)');
      console.log('• Проблемы с интернет-соединением');
      console.log('• Бот заблокирован Telegram');
      console.log('');
      console.log('🔧 Для получения нового токена обратитесь к @BotFather');
      process.exit(1);
    });

  // Graceful stop
  process.once('SIGINT', () => bot.stop('SIGINT'));
  process.once('SIGTERM', () => bot.stop('SIGTERM'));
};

module.exports = { bot, startBot };

// Запуск, если файл выполняется напрямую
if (require.main === module) {
  startBot();
}