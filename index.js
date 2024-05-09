require("dotenv").config();

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

bot.use(session({ initial: () => ({}) }));
bot.use(hydrate());
bot.use(conversations());

const adminId = 661659768;

let daySchedule = [
  {
    name: "English Course",
  },
];
let weekSchedule = [
  {
    day: "Monday",
    course: "English Course",
  },
  {
    day: "Tuesday",
    course: "A.I Course",
  },
];

// Check if user is Admin

bot.use(async (ctx, next) => {
  if (ctx.from.id === adminId) {
    ctx.isAdmin = true;
  }
  await next();
});

//

const courses = [];

bot.api.setMyCommands([
  {
    command: "start",
    description: "Start a bot",
  },
  {
    command: "help",
    description: "Get help",
  },
  {
    command: "menu",
    description: "Menu",
  },
  {
    command: "id",
    description: "Provide your ID",
  },
  {
    command: "channel",
    description: "Our announcements channel",
  },
]);

// start
bot.command("start", async (ctx) => {
  await ctx.react("❤");

  if (ctx.isAdmin) {
    await ctx.reply(
      "⚙️ Вы - Админ, используйте админское меню, чтобы взаимодействовать с курсами и новостями",
      {
        reply_markup: adminMenuKeyboard,
      }
    );
  } else {
    // Send the first message
    await ctx.reply("👋 Привет! Я бот American Corner", {
      parse_mode: "Markdown",
    });

    // Send the second message with a delay
    await new Promise((resolve) => setTimeout(resolve, 700)); // Adjust delay as needed
    await ctx.reply(
      "ℹ️ Получай информацию о предстоящих ивентах, свежих новостей и анонсов с помощью этого бота!",
      { parse_mode: "Markdown" }
    );

    // Send the third message with another delay
    await new Promise((resolve) => setTimeout(resolve, 700)); // Adjust delay as needed
    await ctx.reply(
      "📚 Изучай английский язык, окунись в атмосферу Америки и присоединяйся к другим любителям английского языка! 🤝 ",
      { parse_mode: "Markdown" }
    );

    // Send the fourth message with another delay
    await new Promise((resolve) => setTimeout(resolve, 700)); // Adjust delay as needed
    await ctx.reply(
      "❓ Спроси меня что угодно про предстоящие курсы и волонтерство!",
      {
        parse_mode: "Markdown",
      }
    );
  }
});

////

// admin panel

const adminMenuKeyboard = new InlineKeyboard()
  .row()
  .text("🔨 Создать курс", "create_course")
  .text("📛 Отменить курс", "cancel_course")
  .row()
  .text("📑 Разослать новость", "send_news");

// bot.use(session());

// Check if the user is an admin
bot.callbackQuery("create_course", async (ctx) => {
  await ctx.reply("Введите день недели для нового курса:");
  // Устанавливаем состояние ожидания дня недели
  ctx.session.state = "waiting_for_day";
  messageListener();
});

const messageListener = () => {
  bot.on("message", async (ctx) => {
    // Проверяем, ожидает ли бот информацию о новом курсе
    if (ctx.session.state === "waiting_for_day") {
      // Получаем введенный день недели
      const dayOfWeek = ctx.message.text;
      // Сохраняем день недели в сессии
      ctx.session.newCourse = { day: dayOfWeek };
      // Запрашиваем название курса
      await ctx.reply("Введите название курса:");
      // Устанавливаем состояние ожидания названия курса
      ctx.session.state = "waiting_for_course";
    } else if (ctx.session.state === "waiting_for_course") {
      // Получаем введенное название курса
      const courseName = ctx.message.text;
      // Создаем новый курс и добавляем его в массив курсов
      const newCourse = { day: ctx.session.newCourse.day, course: courseName };
      courses.push(newCourse);
      // Отправляем сообщение об успешном создании курса
      await ctx.reply(
        `Курс "${courseName}" для дня ${ctx.session.newCourse.day} успешно создан.`
      );
      // Сбрасываем состояние сессии
      delete ctx.session.newCourse;
      delete ctx.session.state;
    }
  });
};

//

let course = { name: "", time: "" };

// bot.callbackQuery("create_course", async (ctx) => {
//   await ctx.callbackQuery.message.editText("Напишите название курса", {
//     reply_markup: backKeyboard,
//   });

//   bot.on("msg", async (ctx) => {
//     course.name = ctx.message.text;
//   });

//   await ctx.answerCallbackQuery();
// });

// bot.on("callback_query:data", async (ctx) => {
//   if (ctx.callbackQuery.data === "cancel_course") {
//     await ctx.reply("Курс отменен");
//     await ctx.answerCallbackQuery();
//   }
// });

/////

bot.command("panel", async (ctx) => {
  // const panelKeyobardLabels = ["📃 Новости", "📢 Анонсы", "📕 Курсы", "❓ FAQ"];

  // const rows = panelKeyobardLabels.map((label) => {
  //   return [Keyboard.text(label)];
  // });

  const panelKeyboard = new Keyboard()
    .text("📃 Новости", "news")
    .text("📢 Анонсы", "announcements")
    .row()
    .text("📕 Курсы", "courses")
    .text("❓ FAQ", "faq")
    .resized();

  await ctx.reply(
    "👀 Привет! Я American Corner Bot 🇺🇸\n📁 Я помогу тебе найти нужную информацию о ближайших курсах и новостях с уголка\nНажми на кнопку меню, чтобы продолжить взаимодействие с ботом 👇",
    {
      reply_markup: panelKeyboard,
    }
  );
});

// menu keyboard

const menuKeyboard = new InlineKeyboard()
  .text("📊 Расписание на день", "cources-today")
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

bot.callbackQuery("schedule", async (ctx) => {
  const weekScheduleString = `🎒 Расписание на неделю\n${weekSchedule
    .map((item) => `${item.day} - ${item.course}`)
    .join("\n")}`;

  await ctx.callbackQuery.message.editText(weekScheduleString, {
    reply_markup: backKeyboard,
  });
  await ctx.answerCallbackQuery();
});
bot.callbackQuery("cources-today", async (ctx) => {
  await ctx.callbackQuery.message.editText(
    `📊 Расписание на день\n ${daySchedule.course}`,
    {
      reply_markup: backKeyboard,
    }
  );
  await ctx.answerCallbackQuery();
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
    return; // Просто выходим из обработчика, если ожидается ввод дня недели или названия курса
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
  await ctx.reply(`Your ID : ${ctx.from.id}`);
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

// bot.on("msg").filter(
//   (ctx) => {
//     return ctx.from.id === 661659768;
//   },
//   async (ctx) => {
//     ctx.reply("Admin");
//   }
// );
// bot.on(":photo").on("::hashtag", () => {});
// bot.command(["say_hello", "hello", "hi"], async (ctx) => {
//     await ctx.reply("Hi");
//   });

// error listener

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
