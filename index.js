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

const bot = new Bot(process.env.BOT_API_TOKEN);

bot.use(
  session({
    initial() {
      // return empty object for now
      return {};
    },
  })
);
bot.use(hydrate());
bot.use(conversations());

const adminId = 661659768;

function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
}

const randomEmoji = getRandomElement(emojiArray);

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
  .text("📛 Отменить курс", "delete_course")
  .row()
  .text("📑 Разослать новость", "send_news");

// Add course

let messageListenerActive = false;

let courses = [];

const messageListener = async (ctx) => {
  if (!messageListenerActive) return; // Выход, если обработчик неактивен

  try {
    if (ctx.session.state === "waiting_for_day") {
      const dayOfWeek = ctx.message.text;
      ctx.session.newCourse = { day: dayOfWeek };
      await ctx.reply("Введите название курса:");
      ctx.session.state = "waiting_for_course";
    } else if (ctx.session.state === "waiting_for_course") {
      const courseName = ctx.message.text;
      ctx.session.newCourse.course = courseName;
      await ctx.reply("Введите время курса:");
      ctx.session.state = "waiting_for_time";
    } else if (ctx.session.state === "waiting_for_time") {
      const courseTime = ctx.message.text;
      const newCourse = {
        day: ctx.session.newCourse.day,
        course: ctx.session.newCourse.course,
        time: courseTime,
      };
      courses.push(newCourse);
      await ctx.reply(
        `Курс "${ctx.session.newCourse.course}" для дня ${ctx.session.newCourse.day} на время ${courseTime} успешно создан.`
      );
      delete ctx.session.newCourse;
      delete ctx.session.state;
      messageListenerActive = false; // Сбрасываем флаг после создания курса
    }
  } catch (error) {
    console.error("Ошибка в обработчике сообщений:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте снова.");
  }
};

bot.use((ctx, next) => {
  if (messageListenerActive) {
    return messageListener(ctx);
  } else {
    return next();
  }
});

bot.callbackQuery("create_course", async (ctx) => {
  await ctx.reply("Введите день недели для нового курса:");
  // Устанавливаем состояние ожидания дня недели
  ctx.session.state = "waiting_for_day";
  messageListenerActive = true;
});
///////

bot.use(createConversation(deleteCourse));

bot.callbackQuery("delete_course", async (ctx) => {
  try {
    let deleteMessage = "Выберите номер курса для удаления:\n";
    // Формируем сообщение со списком курсов с их номерами
    courses.forEach((course, index) => {
      deleteMessage += `${index + 1}. ${course.course} - ${course.day}\n`;
    });

    // Отправляем сообщение с вариантами для удаления
    await ctx.reply(deleteMessage);

    // Запускаем диалог удаления курса
    await ctx.conversation.enter("deleteCourse");
    // await deleteCourse(conversation, ctx);
  } catch (error) {
    console.error("Ошибка при попытке удаления курса:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
  await ctx.answerCallbackQuery();
});

// Определение функции диалога удаления курса
async function deleteCourse(conversation, ctx) {
  // Ожидание ввода номера курса для удаления
  const courseNumberCtx = await conversation.waitFor("msg:text");

  try {
    // Преобразование полученного текста в число
    const courseNumber = parseInt(courseNumberCtx.msg.text);

    // Проверка корректности введенного номера курса
    if (courseNumber > 0 && courseNumber <= courses.length) {
      // Удаление курса из массива courses
      const deletedCourse = courses.splice(courseNumber - 1, 1);

      // Отправка сообщения о успешном удалении курса
      await ctx.reply(
        `Курс "${deletedCourse[0].course}" для дня ${deletedCourse[0].day} успешно удален.`
      );
    } else {
      // Отправка сообщения, если введен некорректный номер курса
      await ctx.reply(
        "Некорректный номер курса. Пожалуйста, выберите номер курса из списка."
      );
    }
  } catch (error) {
    // Отправка сообщения об ошибке, если произошла ошибка в процессе
    console.error("Ошибка в обработке сообщения:", error);
    await ctx.reply("Произошла ошибка. Пожалуйста, попробуйте позже.");
  }
}

//
// Send News

bot.use(createConversation(sendNews));

bot.callbackQuery("send_news", async (ctx) => {
  try {
    // Запускаем диалог для ввода текста новости
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

  // Get the news text from the context
  const newsText = newsTextCtx.msg.text;

  // Reply with the news text and ask for confirmation
  await ctx.reply(
    `Ваша новость: "${newsText}"\nВы уверены, что хотите опубликовать её?`,
    {
      reply_markup: publishKeyboard,
    }
  );

  try {
    // Here you can implement the logic to actually publish the news to users
  } catch (error) {
    // Handle error if occurred while sending news
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
    // Рассылаем новость всем пользователям

    const newsText = ctx.callbackQuery.message.text.split(": ")[1]; // Получаем текст новости из сообщения

    try {
      await ctx.reply("Новость успешно разослана всем пользователям.");
    } catch (error) {
      console.error(`Ошибка при отправке новости пользователям:`, error);
    }

    // Отправляем сообщение об успешной рассылке новости
  } catch (error) {
    console.error("Ошибка при публикации новости:", error);
    await ctx.reply(
      "Произошла ошибка при публикации новости. Пожалуйста, попробуйте позже."
    );
  }
});

//

// Определение функции диалога рассылки новостей

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

bot.callbackQuery("schedule", async (ctx) => {
  const weekScheduleString = `🎒 Расписание на неделю\n${courses
    .map((item) => `${item.day} - ${item.course} (${item.time})`)
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
