require("dotenv").config();
require("./controllers/database.js");

const Course = require("./models/course.js");
const User = require("./models/user.js");

const punycode = require("punycode");

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
  session,
  Context,
} = require("grammy");

const { hydrate } = require("@grammyjs/hydrate");

const {
  conversations,
  createConversation,
} = require("@grammyjs/conversations");

const bot = new Bot(process.env.BOT_API_TOKEN);

bot.use(
  session({
    initial() {
      return {};
    },
  })
);
bot.use(hydrate());
bot.use(conversations());

const adminId = process.env.DEV_ADMIN_TOKEN;

// Check if user is Admin
bot.use(async (ctx, next) => {
  if (ctx.from.id === adminId) {
    ctx.isAdmin = true;
  }
  await next();
});

//

bot.api.setMyCommands([
  {
    command: "start",
    description: "Начать работу с ботом",
  },
  {
    command: "help",
    description: "Полезные команды бота",
  },
  {
    command: "id",
    description: "Информация о вашем ID",
  },
  {
    command: "channel",
    description: "Наш Telegram-канал",
  },
]);

async function getAllUserIds() {
  try {
    const users = await User.find({}).select("_id");
    const userIds = users.map((user) => user._id);
    return userIds;
  } catch (error) {
    console.error("Ошибка при получении ID пользователей:", error);
    throw error;
  }
}

const emojiArray = [
  "✌",
  "😂",
  "😝",
  "😁",
  "😱",
  "👉",
  "🙌",
  "🍻",
  "🔥",
  "🌈",
  "☀",
  "🎈",
  "🌹",
  "💄",
  "🎀",
  "⚽",
  "🎾",
  "🏁",
  "😡",
  "👿",
  "🐻",
  "🐶",
  "🐬",
  "🐟",
  "🍀",
  "👀",
  "🚗",
  "🍎",
  "💝",
  "💙",
  "👌",
  "❤",
  "😍",
  "😉",
  "😓",
  "😳",
  "💪",
  "💩",
  "🍸",
  "🔑",
  "💖",
  "🌟",
  "🎉",
  "🌺",
  "🎶",
  "👠",
  "🏈",
  "⚾",
  "🏆",
  "👽",
  "💀",
  "🐵",
  "🐮",
  "🐩",
  "🐎",
  "💣",
  "👃",
  "👂",
  "🍓",
  "💘",
  "💜",
  "👊",
  "💋",
  "😘",
  "😜",
  "😵",
  "🙏",
  "👋",
  "🚽",
  "💃",
  "💎",
  "🚀",
  "🌙",
  "🎁",
  "⛄",
  "🌊",
  "⛵",
  "🏀",
  "🎱",
  "💰",
  "👶",
  "👸",
  "🐰",
  "🐷",
  "🐍",
  "🐫",
  "🔫",
  "👄",
  "🚲",
  "🍉",
  "💛",
  "💚",
];
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}
const randomEmoji = getRandomElement(emojiArray);

const permanentKeyboard = new Keyboard()
  .text("📃 Новости")
  .text("📢 Анонсы")
  .row()
  .text("📕 Курсы")
  .text("❓ FAQ")
  .resized();

bot.command("start", async (ctx) => {
  try {
    const newUser = new User({ userId: ctx.from.id, isAdmin: false });
    await newUser.save();
  } catch (error) {
    console.error(error);
  }
  await ctx.react("❤");

  await ctx.reply("👋 Привет! Я American Corner бот", {
    parse_mode: "Markdown",
  });

  await new Promise((resolve) => setTimeout(resolve, 700));
  await ctx.reply(
    "ℹ️ Получай информацию о предстоящих ивентах, свежих новостях и анонсов с помощью этого бота!",
    { parse_mode: "Markdown" }
  );

  await new Promise((resolve) => setTimeout(resolve, 700));
  await ctx.reply(
    "📚 Изучай английский язык, окунись в атмосферу Америки и присоединяйся к другим любителям английского языка! 🤝 ",
    { parse_mode: "Markdown" }
  );

  await new Promise((resolve) => setTimeout(resolve, 700));
  await ctx.reply(
    "❓ Узнавай информацию про предстоящие курсы и волонтерство!",
    {
      parse_mode: "Markdown",
    }
  );
  await new Promise((resolve) => setTimeout(resolve, 700));
  await ctx.reply(
    "👀 Привет! Я American Corner Bot 🇺🇸\n📁 Я помогу тебе найти нужную информацию о ближайших курсах и новостях с уголка\nНажми на кнопку меню, чтобы продолжить взаимодействие с ботом 👇",

    {
      reply_markup: permanentKeyboard,
    }
  );
});

////

bot.hears("📃 Новости", async (ctx) => {
  await ctx.reply("Здесь будет информация для Новости.");
});

bot.hears("📢 Анонсы", async (ctx) => {
  await ctx.reply("Здесь будет информация для Анонсы.");
});

bot.hears("📕 Курсы", async (ctx) => {
  await ctx.reply("👋 Выберите пункт меню : ", {
    reply_markup: menuKeyboard,
  });
});

bot.hears("❓ FAQ", async (ctx) => {
  await ctx.reply(
    "<b>Q: Что такое American Corner Pavlodar?</b>\n" +
    "A: American Corner Pavlodar - это культурно-образовательный центр, предназначенный для укрепления понимания и сотрудничества между Казахстаном и Соединенными Штатами. Здесь проводятся различные мероприятия, включая языковые курсы, образовательные семинары и культурные мероприятия.\n\n" +
    "<b>Q: Какие услуги предлагает American Corner?</b>\n" +
    "A: Мы предлагаем широкий спектр услуг, включая доступ к образовательным ресурсам, помощь в изучении английского языка, культурные мероприятия, лекции и мастер-классы, а также информационную поддержку для студентов, интересующихся образованием в США.\n\n" +
    "<b>Q: Нужно ли регистрироваться для посещения мероприятий?</b>\n" +
    "A: Для большинства мероприятий требуется предварительная регистрация. Пожалуйста, следите за нашими объявлениями в социальных сетях или на нашем сайте, чтобы получить информацию о предстоящих событиях и процедуре регистрации.\n\n" +
    "<b>Q: Есть ли в American Corner библиотека или читальный зал?</b>\n" +
    "A: Да, у нас есть библиотека с большим выбором книг на английском языке, а также уютный читальный зал, где вы можете спокойно работать или проводить время с книгой.\n\n" +
    "<b>Q: Могу ли я стать волонтером в American Corner?</b>\n" +
    "A: Мы всегда рады новым волонтерам! Если вы хотите присоединиться к нашей команде, отправьте нам заявку с информацией о себе и тем, как вы хотели бы помочь.\n\n" +
    "<b>Q: Как я могу узнать больше о мероприятиях и новостях American Corner?</b>\n" +
    "A: Чтобы быть в курсе всех наших мероприятий и новостей, подписывайтесь на наши страницы в социальных сетях и посещайте наш сайт. Мы регулярно обновляем информацию о предстоящих событиях и программах.",
    { parse_mode: "HTML" }
  );
});

bot.command("admin", async (ctx) => {
  try {
    const user = await User.findOne({ userId: ctx.from.id });
    if (user && user.isAdmin) {
      await ctx.reply(
        "⚙️ Вы - Админ, используйте админское меню, чтобы взаимодействовать с курсами и новостями",
        {
          reply_markup: adminMenuKeyboard,
        }
      );
    } else {
      await ctx.reply("Вы не админ!");
    }
  } catch (error) {
    console.error("Ошибка при проверке статуса администратора:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
});

const adminMenuKeyboard = new InlineKeyboard()
  .row()
  .text("🔨 Создать курс", "create_course")
  .text("📛 Отменить курс", "delete_course")
  .row()
  .text("📑 Разослать новость", "send_news");

bot.use(createConversation(createCourse));

bot.callbackQuery("create_course", async (ctx) => {
  await ctx.reply("Введите день недели для нового курса:");
  await ctx.conversation.enter("createCourse");
});

async function createCourse(conversation, ctx) {
  const dayOfWeekCtx = await conversation.waitFor("msg:text");
  const dayOfWeek = dayOfWeekCtx.msg.text;
  await ctx.reply("Введите название курса:");

  const courseNameCtx = await conversation.waitFor("msg:text");
  const courseName = courseNameCtx.msg.text;
  await ctx.reply("Введите время курса:");

  const courseTimeCtx = await conversation.waitFor("msg:text");
  const courseTime = courseTimeCtx.msg.text;

  try {
    const course = new Course({
      title: courseName,
      dayschedule: {
        day: dayOfWeek,
        time: courseTime,
      },
    });

    await course.save();
    await ctx.reply(
      `Курс "${courseName}" для дня ${dayOfWeek} на время ${courseTime} успешно создан и сохранен в базе данных.`
    );
  } catch (error) {
    console.error("Ошибка при создании курса:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте снова.");
  }
}

//

bot.use(createConversation(deleteCourse));

bot.callbackQuery("delete_course", async (ctx) => {
  try {
    const courses = await Course.find({});
    let deleteMessage = "Выберите номер курса для удаления:\n";
    courses.forEach((course, index) => {
      deleteMessage += `${index + 1}. ${course.title} - ${course.day}\n`;
    });
    await ctx.reply(deleteMessage);
    await ctx.conversation.enter("deleteCourse");
  } catch (error) {
    console.error("Ошибка при попытке удаления курса:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
  await ctx.answerCallbackQuery();
});

async function deleteCourse(conversation, ctx) {
  const courseNumberCtx = await conversation.waitFor("msg:text");

  try {
    const courseNumber = parseInt(courseNumberCtx.msg.text);
    const courses = await Course.find({});

    if (courseNumber > 0 && courseNumber <= courses.length) {
      const deletedCourse = await Course.findByIdAndRemove(
        courses[courseNumber - 1]._id
      );

      await ctx.reply(
        `Курс "${deletedCourse.title}" для дня ${deletedCourse.day} успешно удален.`
      );
    } else {
      await ctx.reply(
        "Некорректный номер курса. Пожалуйста, выберите номер курса из списка."
      );
    }
  } catch (error) {
    console.error("Ошибка в обработке сообщения:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

// Send News

// Comments

bot.use(createConversation(sendNews));

bot.callbackQuery("send_news", async (ctx) => {
  try {
    await ctx.reply(
      "Напишите любой текст или новость, которую вы желаете разослать:"
    );

    await ctx.conversation.enter("sendNews");
  } catch (error) {
    console.error("Ошибка при запуске диалога рассылки новостей:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
});

const publishKeyboard = new InlineKeyboard()
  .text("✅ Да, опубликовать", "confirm_publish")
  .row()
  .text("❌ Отмена", "cancel_publish");

const readyKeyboard = new InlineKeyboard().text("✅ Готово", "ready");

bot.callbackQuery("ready", async (ctx) => {
  await ctx.callbackQuery.message.editText("Команда успешно сработала", {
    reply_markup: readyKeyboard,
  });

  await ctx.reply("Готово! Ваша новость успешно опубликована.");
  await ctx.answerCallbackQuery();
});

async function sendNews(conversation, ctx) {
  const newsTextCtx = await conversation.waitFor("msg:text");

  const newsText = newsTextCtx.msg.text;

  await ctx.reply(
    `Ваша новость: "${newsText}"\nВы уверены, что хотите опубликовать её?`,
    {
      reply_markup: publishKeyboard,
    }
  );

  try {
  } catch (error) {
    console.error("Ошибка при отправке новости:", error);
    await ctx.reply(
      "Произошла ошибка при рассылке новости. Пожалуйста, попробуйте позже."
    );
  }
}

bot.callbackQuery("cancel_publish", async (ctx) => {
  await ctx.reply("Публикация новости отменена.");
});
bot.callbackQuery("confirm_publish", async (ctx) => {
  try {
    const newsText = ctx.callbackQuery.message.text.split(": ")[1];

    const users = await User.find({});

    for (const user of users) {
      await ctx.telegram.sendMessage(user.userId, newsText);
    }
    await ctx.reply("Новость успешно разослана всем пользователям.");
  } catch (error) {
    console.error(`Ошибка при отправке новости пользователям:`, error);
    await ctx.reply(
      "Произошла ошибка при рассылке новости. Пожалуйста, попробуйте позже."
    );
  }
});

// переместись

const menuKeyboard = new InlineKeyboard()
  .text("📊 Расписание на день", "cources-today")
  .row()
  .text("📅 Расписание на неделю", "schedule");

const backKeyboard = new InlineKeyboard().text(" ⬅ Назад в меню", "back");

bot.command("menu", async (ctx) => {
  if (
    ctx.session.state &&
    (ctx.session.state === "waiting_for_day" ||
      ctx.session.state === "waiting_for_course")
  ) {
    return;
  } else {
    await ctx.reply("👋 Выберите пункт меню : ", {
      reply_markup: menuKeyboard,
    });
  }
});

bot.callbackQuery("faq", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Здесь будет информация для FAQ."); // Измените текст на нужный вам
});

bot.callbackQuery("courses", async (ctx) => {
  await ctx.reply("👋 Выберите пункт меню : ", {
    reply_markup: menuKeyboard,
  });
});

function getCurrentDay() {
  const days = [
    "Воскресенье",
    "Понедельник",
    "Вторник",
    "Среда",
    "Четверг",
    "Пятница",
    "Суббота",
  ];
  const currentDay = new Date().getDay();
  return days[currentDay];
}

bot.callbackQuery("schedule", async (ctx) => {
  try {
    const courses = await Course.find({}).sort("dayschedule.day");
    const weekScheduleString = `🎒 Расписание на неделю\n${courses
      .map(
        (course) =>
          `${course.dayschedule.day} - ${course.title} (${course.dayschedule.time})`
      )
      .join("\n")}`;

    await ctx.callbackQuery.message.editText(weekScheduleString, {
      reply_markup: backKeyboard,
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error("Ошибка при получении расписания курсов:", error);
    await ctx.reply("Произошла ошибка при получении расписания.");
  }
});

bot.callbackQuery("cources-today", async (ctx) => {
  try {
    const currentDay = getCurrentDay();
    const todayCourses = await Course.find({ "dayschedule.day": currentDay });

    const dayScheduleString = `📊 Расписание на ${currentDay}\n${todayCourses
      .map((course) => `${course.title} (${course.dayschedule.time})`)
      .join("\n")}`;

    await ctx.callbackQuery.message.editText(dayScheduleString, {
      reply_markup: backKeyboard,
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error("Ошибка при получении расписания курсов на сегодня:", error);
    await ctx.reply("Произошла ошибка при получении расписания на сегодня.");
  }
});

bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("👋 Выберите пункт меню : ", {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.hears("news", async (ctx) => {
  await ctx.reply("Список последних новостей! :");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await ctx.reply(
    "Don't miss out! Join our Telegram channel now for limited-time offers and community events."
  );
});
bot.command("help", async (ctx) => {
  if (
    ctx.session.state &&
    (ctx.session.state === "waiting_for_day" ||
      ctx.session.state === "waiting_for_course")
  ) {
    return;
  }
  await ctx.reply(
    "🤖 Команды и возможности бота : \n /channel - Telegram канал American Corner Pavlodar \n /id - ваш ID \n /menu - главное меню \n /start - начать бота \n /help - помощь"
  );
});
bot.command("id", async (ctx) => {
  if (
    ctx.session.state &&
    (ctx.session.state === "waiting_for_day" ||
      ctx.session.state === "waiting_for_course")
  ) {
    return;
  }
  try {
    const user = await User.findOne({ userId: ctx.from.id });
    if (user) {
      ctx.reply(`Ваш ID: ${user.userId}`);
    } else {
      ctx.reply("Вы не зарегистрированы.");
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Ошибка получения ID.");
  }
});

bot.command("channel", async (ctx) => {
  if (
    ctx.session.state &&
    (ctx.session.state === "waiting_for_day" ||
      ctx.session.state === "waiting_for_course")
  ) {
    return;
  }
  const inlineKeyboardChannel = new InlineKeyboard().url(
    "Перейти в тг-канал",
    "https://t.me/ACnMS_PVL"
  );
  await ctx.reply(
    "🔗 Телеграм канал American Corner Pavlodar, где вы сможете оставаться в курсе всех событий! 👇",
    {
      reply_markup: inlineKeyboardChannel,
    }
  );
});

bot.on([":media", "::url"], async (ctx) => {
  await ctx.reply("Got a URL");
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.log(`Error whiile handling update ${ctx.update.update_id}`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request : ", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram :", e);
  } else {
    console.error("Unknown error", e);
  }
});

bot.start();
