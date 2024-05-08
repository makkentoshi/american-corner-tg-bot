require("dotenv").config();

const {
  Bot,
  GrammyError,
  HttpError,
  Keyboard,
  InlineKeyboard,
} = require("grammy");

const { hydrate } = require("@grammyjs/hydrate");

const bot = new Bot(process.env.BOT_API_TOKEN);
bot.use(hydrate());

const adminId = 661659768;

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

function once(bot, event, callback) {
  const listener = bot.on(event, async (ctx) => {
    callback(ctx);
    bot.off(event, listener);
  });
}

// start
bot.command("start", async (ctx) => {
  await ctx.react("❤");

  if (ctx.isAdmin) {
    await ctx.reply("Welcome, admin! Use the Admin menu to manage content", {
      reply_markup: adminMenuKeyboard,
    });
  } else {
    // Send the first message
    await ctx.reply("Привет! Я бот American Corner 👋", {
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
  .text("📑 Разослать новость", "send_news");

// Check if the user is an admin
bot.use(async (ctx, next) => {
  if (ctx.from.id === adminId) {
    ctx.isAdmin = true;
  }
  await next();
});

//

let course = { name: "", time: "" };

bot.callbackQuery("create_course", async (ctx) => {
  await ctx.callbackQuery.message.editText("Напишите название курса", {
    reply_markup: backKeyboard,
  });

  bot.on("msg", async (ctx) => {
    course.name = ctx.message.text;
  });

  await ctx.answerCallbackQuery();
});

bot.on("callback_query:data", async (ctx) => {
  if (ctx.callbackQuery.data === "cancel_course") {
    await ctx.reply("Курс отменен");
    await ctx.answerCallbackQuery();
  }
});

/////

bot.command("panel", async (ctx) => {
  // const panelKeyobardLabels = ["📃 Новости", "📢 Анонсы", "📕 Курсы", "❓ FAQ"];

  // const rows = panelKeyobardLabels.map((label) => {
  //   return [Keyboard.text(label)];
  // });

  const panelKeyboard = new Keyboard()
    .text("📃 Новости")
    .text("📢 Анонсы")
    .row()
    .text("📕 Курсы")
    .text("❓ FAQ")
    .resized();

  await ctx.reply(
    "👀 Привет! Я American Corner Bot \nЯ помогу тебе найти нужную информацию о ближайших курсах и новостях с уголка 👇",
    {
      reply_markup: panelKeyboard,
    }
  );
});

// menu keyboard

const menuKeyboard = new InlineKeyboard()
  .text("Все курсы на сегодня", "cources-today")
  .text("Расписание на неделю", "schedule");

const backKeyboard = new InlineKeyboard().text(" ⬅ Назад в меню", "back");

bot.command("menu", async (ctx) => {
  await ctx.reply("Выберите пункт меню", {
    reply_markup: menuKeyboard,
  });
});

// bot.callbackQuery("cources-today", async (ctx) => {
//   await ctx.callbackQuery.message.editText("Курсы на сегодня", {
//     reply_markup: backKeyboard,
//   });
//   await ctx.answerCallbackQuery();
// });
bot.hears("", async(ctx) => {
  
})

bot.callbackQuery("schedule", async (ctx) => {
  await ctx.callbackQuery.message.editText("Расписание на неделю", {
    reply_markup: backKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("Выберите пункт меню", {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

//

// admin panel

//

// hears listener

bot.hears("📃 Новости", async (ctx) => {
  await ctx.reply("Список последних новостей! :");
  await new Promise((resolve) => setTimeout(resolve, 300));
  await ctx.reply(
    "Don't miss out! Join our Telegram channel now for limited-time offers and community events."
  );
});
bot.command("help", async (ctx) => {
  await ctx.reply("Hi");
});
bot.command("id", async (ctx) => {
  await ctx.reply(`Your ID : ${ctx.from.id}`);
});

bot.command("channel", async (ctx) => {
  const inlineKeyboardChannel = new InlineKeyboard().url(
    "Перейти в тг-канал",
    "https://t.me/ACnMS_PVL"
  );
  await ctx.reply(
    "Телеграм канал American Corner Pavlodar, где вы сможете оставаться в курсе всех событий!",
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
