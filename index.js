require("dotenv").config();
require("./controllers/database.js");

const Course = require("./models/course.js");
const User = require("./models/user.js");
const cron = require("node-cron");
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

bot.use(session({ initial: () => ({ newsText: null }) }));
bot.use(hydrate());
bot.use(conversations());

const adminIds = process.env.DEV_ADMIN_TOKENS.split(",");

// Check if user is Admin
bot.use(async (ctx, next) => {
  if (adminIds.includes(String(ctx.from.id))) {
    ctx.isAdmin = true;
  }
  await next();
});
//
bot.api.setMyCommands([
  {
    command: "start",
    description: "🛠️ Начать работу с ботом",
  },
  {
    command: "help",
    description: "📎 Полезные команды бота",
  },
  {
    command: "settings",
    description: "⚙️ Настройки",
  },
  {
    command: "channel",
    description: "💼 Наш Telegram-канал",
  },
  {
    command: "admin",
    description: "😎 Админская панель",
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
const permanentKeyboard = new Keyboard()
  .text("📃 Новости")
  .text("📢 Анонсы")
  .row()
  .text("📕 Курсы")
  .text("❓ FAQ")
  .resized();

const inlineKeyboardChannel = new InlineKeyboard().url(
  "Перейти в тг-канал",
  "https://t.me/ACnMS_PVL"
);
bot.command("start", async (ctx) => {
  try {
    const existingUser = await User.findOne({ userId: ctx.from.id });

    if (!existingUser) {
      const newUser = new User({ userId: ctx.from.id, isAdmin: false });
      await newUser.save();
      await ctx.react("❤");
    }
  } catch (error) {
    console.error(error);
  }

  await ctx.reply("👋 Привет! Я American Corner Bot 🇺🇸", {
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
    "🫶 Узнавай информацию про предстоящие курсы и волонтерство!",
    {
      parse_mode: "Markdown",
    }
  );
  await new Promise((resolve) => setTimeout(resolve, 700));
  await ctx.reply(
    "🤓☝️ Я помогу тебе найти нужную информацию о ближайших курсах и новостях с уголка 👀\nНажми на кнопку меню, чтобы продолжить взаимодействие с ботом 👇",

    {
      reply_markup: permanentKeyboard,
    }
  );
});
////
bot.hears("📃 Новости", async (ctx) => {
  await ctx.reply("⚡ Читай актуальные новости в нашем Telegram-канале 👇", {
    reply_markup: inlineKeyboardChannel,
  });
});

bot.hears("📢 Анонсы", async (ctx) => {
  await ctx.reply(
    "📫 Получи первым информацию об анонсах и новых ивентах в нашем Telegram-канале 👇",
    {
      reply_markup: inlineKeyboardChannel,
    }
  );
});

bot.hears("📕 Курсы", async (ctx) => {
  await ctx.reply("👋 Выберите пункт меню: ", {
    reply_markup: menuKeyboard,
  });
});

bot.hears("❓ FAQ", async (ctx) => {
  await ctx.reply(
    "<b>Q: Что такое American Corner Pavlodar?</b>\n" +
      "<i>A: American Corner Pavlodar - это культурно-образовательный центр, предназначенный для укрепления понимания и сотрудничества между Казахстаном и Соединенными Штатами. Здесь проводятся различные мероприятия, включая языковые курсы, образовательные семинары и культурные мероприятия.</i>\n\n" +
      "<b>Q: Какие услуги предлагает American Corner?</b>\n" +
      "<i>A: Мы предлагаем широкий спектр услуг, включая доступ к образовательным ресурсам, помощь в изучении английского языка, культурные мероприятия, лекции и мастер-классы, а также информационную поддержку для студентов, интересующихся образованием в США.</i>\n\n" +
      "<b>Q: Нужно ли регистрироваться для посещения мероприятий?</b>\n" +
      "<i>A: Для большинства мероприятий требуется предварительная регистрация. Пожалуйста, следите за нашими объявлениями в социальных сетях или на нашем сайте, чтобы получить информацию о предстоящих событиях и процедуре регистрации.</i>\n\n" +
      "<b>Q: Есть ли в American Corner библиотека или читальный зал?</b>\n" +
      "<i>A: Да, у нас есть библиотека с большим выбором книг на английском языке, а также уютный читальный зал, где вы можете спокойно работать или проводить время с книгой.</i>\n\n" +
      "<b>Q: Могу ли я стать волонтером в American Corner?</b>\n" +
      "<i>A: Мы всегда рады новым волонтерам! Если вы хотите присоединиться к нашей команде, отправьте нам заявку с информацией о себе и тем, как вы хотели бы помочь.</i>\n\n" +
      "<b>Q: Как я могу узнать больше о мероприятиях и новостях American Corner?</b>\n" +
      "<i>A: Чтобы быть в курсе всех наших мероприятий и новостей, подписывайтесь на наши страницы в социальных сетях и посещайте наш сайт. Мы регулярно обновляем информацию о предстоящих событиях и программах.</i>",
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
  await ctx.reply("Введите время начала и конца курса, например 10:00-12:00:");

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
      deleteMessage += `${index + 1}. ${course.title} - ${
        course.dayschedule.day
      } ( ${course.dayschedule.time} )\n`;
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
      const deletedCourse = await Course.findByIdAndDelete(
        courses[courseNumber - 1]._id
      );

      await ctx.reply(
        `Курс "${deletedCourse.title}" для дня ${deletedCourse.dayschedule.day} успешно удален.`
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

bot.use(createConversation(sendNews));

bot.callbackQuery("send_news", async (ctx) => {
  await ctx.conversation.enter("sendNews");
});

async function sendNews(conversation, ctx) {
  try {
    await ctx.reply(
      "✍️ У вас есть картинка в тексте новости? Введите 1, если да, или 2, если нет:"
    );
    const imageChoiceResponse = await conversation.wait();
    const imageChoice = imageChoiceResponse.message?.text;

    let photoIds = [];

    if (imageChoice === "1") {
      await ctx.reply(
        "🤗 Пожалуйста, отправьте все изображения новости. Когда закончите, введите 'готово'."
      );

      while (true) {
        const imageResponse = await conversation.wait();
        if (imageResponse.message?.text?.toLowerCase() === "готово") break;

        const photo = imageResponse.message?.photo;
        if (photo && photo.length > 0) {
          const photoId = photo[photo.length - 1].file_id;
          photoIds.push(photoId);
        } else {
          await ctx.reply(
            "🤗 Пожалуйста, отправьте изображение или введите 'готово', если вы закончили отправку изображений."
          );
        }
      }
    } else if (imageChoice !== "2") {
      await ctx.reply("🚫 Некорректный выбор. Отмена операции.");
      return;
    }

    await ctx.reply("✍️ Пожалуйста, отправьте текст новости:");
    const textResponse = await conversation.wait();
    const newsText = textResponse.message?.text;

    if (!newsText) {
      await ctx.reply("⛔️ Текст новости не был отправлен. Отмена операции.");
      return;
    }

    if (photoIds.length > 0) {
      const media = photoIds.map((photoId) => ({
        type: "photo",
        media: photoId,
      }));

      media[0].caption = newsText;
      await bot.api.sendMediaGroup(ctx.chat.id, media);
    } else {
      await ctx.reply(newsText);
    }

    await ctx.reply(
      `Вы уверены, что хотите опубликовать следующий текст и фотографии (если есть)?`,
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "✅ Да", callback_data: "confirm" }],
            [{ text: "❌ Нет", callback_data: "cancel" }],
          ],
        },
      }
    );

    const confirmationResponse = await conversation.waitFor(
      "callback_query:data"
    );
    const confirmation = confirmationResponse.callbackQuery?.data;

    if (confirmation === "confirm") {
      await ctx.reply("✅ Новость отправлена!");

      const users = await User.find({});

      for (const user of users) {
        try {
          if (photoIds.length > 0) {
            const media = photoIds.map((photoId) => ({
              type: "photo",
              media: photoId,
            }));
            media[0].caption = newsText;
            await bot.api.sendMediaGroup(user.userId, media);
          } else {
            await bot.api.sendMessage(user.userId, newsText);
          }
        } catch (error) {
          console.error(`Error sending message to user ${user.userId}`, error);
        }
      }
    } else {
      await ctx.reply("🚫 Отправка новости отменена.");
    }
  } catch (error) {
    console.error("Error while handling update", error);
    await ctx.reply(
      "⚠️ Произошла ошибка при обработке вашего запроса. Возможно, кто-то заблокировал бота, поэтому ему не была отправлена рассылка. Остальным людям рассылка была успешно совершена."
    );
  }
}

// Settings
const settingsKeyboard = new InlineKeyboard()
  .text("🔒 Информация о вашем ID", "id_info")
  .row();

const backToMenu = new InlineKeyboard().text("🔙 Меню", "back_to_menu");

bot.command("settings", async (ctx) => {
  await ctx.reply("⚙️ Настройки:", {
    reply_markup: settingsKeyboard,
  });
});

bot.callbackQuery("id_info", async (ctx) => {
  await ctx.answerCallbackQuery();
  try {
    const user = await User.findOne({ userId: ctx.from.id });
    if (user) {
      await ctx.editMessageText(`Ваш ID: ${user.userId}`, {
        reply_markup: backToMenu,
      });
    } else {
      await ctx.editMessageText("Вы не зарегистрированы.", {
        reply_markup: backToMenu,
      });
    }
  } catch (error) {
    console.error(error);
    await ctx.editMessageText("Ошибка получения ID.", {
      reply_markup: backToMenu,
    });
  }
});

bot.callbackQuery("back_to_menu", async (ctx) => {
  await ctx.editMessageText("⚙️ Настройки: ", {
    reply_markup: settingsKeyboard,
  });
});
//
const menuKeyboard = new InlineKeyboard()
  .text("📊 Расписание на сегодняшний день", "cources-today")
  .row()
  .text("📅 Расписание на эту неделю", "schedule");

const backKeyboard = new InlineKeyboard().text(" ⬅ Назад в меню", "back");

bot.command("menu", async (ctx) => {
  await ctx.reply("👋 Выберите пункт меню: ", {
    reply_markup: menuKeyboard,
  });
});

bot.callbackQuery("faq", async (ctx) => {
  await ctx.answerCallbackQuery();
  await ctx.editMessageText("Здесь будет информация для FAQ.");
});

bot.callbackQuery("courses", async (ctx) => {
  await ctx.reply("👋 Выберите пункт меню: ", {
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

const emojiArray = [
  "✌",
  "😂",
  "😝",
  "😁",
  "😱",
  "👉",
  "🙌",
  "🔥",
  "🌈",
  "☀",
  "🎈",
  "🌹",
  "🎀",
  "📚",
  "🎓",
  "📖",
  "📝",
  "🔬",
  "🧪",
  "🧬",
  "🖊️",
  "🖋️",
  "✏️",
  "📐",
  "📏",
  "✂️",
  "🗂️",
  "📋",
  "💼",
  "👩‍🏫",
  "👨‍🏫",
  "👩‍🎓",
  "👨‍🎓",
  "🧠",
  "💡",
  "⏰",
  "🔔",
  "😄",
  "😜",
  "😂",
  "🤣",
  "😡",
  "👿",
  "🍀",
  "👀",
  "💝",
  "💙",
  "👌",
  "❤",
  "😍",
  "😉",
  "😓",
  "😳",
  "💪",
  "💖",
  "🌟",
  "🎉",
  "🌺",
  "🎶",
  "🏆",
  "👽",
  "💘",
  "👊",
  "😘",
  "😜",
  "😵",
  "🙏",
  "👋",
  "💃",
  "💎",
  "🚀",
  "🌙",
  "🎁",
  "🌊",
  "💰",
];
function getRandomElement(array) {
  return array[Math.floor(Math.random() * array.length)];
  return array.splice(index, 1)[0];
}

bot.callbackQuery("schedule", async (ctx) => {
  try {
    const courses = await Course.find({});

    const daysOrder = [
      "Понедельник",
      "Вторник",
      "Среда",
      "Четверг",
      "Пятница",
      "Суббота",
      "Воскресенье",
    ];
    courses.sort((a, b) => {
      return (
        daysOrder.indexOf(a.dayschedule.day) -
        daysOrder.indexOf(b.dayschedule.day)
      );
    });

    const weekScheduleString = `🎒 Расписание на неделю :\n${courses
      .map((course) => {
        const emoji = getRandomElement(emojiArray);
        return `${emoji} ${course.dayschedule.day} - ${course.title} (${course.dayschedule.time})`;
      })
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
    const todayCourses = await Course.find({
      "dayschedule.day": currentDay,
    }).sort("dayschedule.time");

    let dayScheduleString;
    if (!todayCourses || todayCourses.length === 0) {
      dayScheduleString = "📆 К сожалению, сегодня нет никаких курсов 💔";
    } else {
      dayScheduleString = `📊 Расписание на ${currentDay}\n${todayCourses
        .map((course) => `${course.title} (${course.dayschedule.time})`)
        .join("\n")}`;
    }

    await ctx.callbackQuery.message.editText(dayScheduleString, {
      reply_markup: backKeyboard,
    });
    await ctx.answerCallbackQuery();
  } catch (error) {
    console.error("Ошибка при получении расписания курсов на сегодня:", error);
    await ctx.reply("Произошла ошибка при получении расписания на сегодня.");
  }
});

async function sendToAllUsersDaySchedule(bot) {
  try {
    const currentDay = getCurrentDay();
    const todayCourses = await Course.find({ "dayschedule.day": currentDay });

    console.log("Сегодняшние курсы:", todayCourses);

    let dayScheduleString;
    if (!todayCourses || todayCourses.length === 0) {
      dayScheduleString = "📆 К сожалению, сегодня нет никаких курсов 💔";
    } else {
      dayScheduleString = `📊 Расписание на ${currentDay}\n${todayCourses
        .map((course) => {
          console.log("Курс:", course);
          return `${course.title} (${course.dayschedule.time})`;
        })
        .join("\n")}`;
    }

    const users = await User.find({});

    for (const user of users) {
      if (user.userId) {
        await bot.api.sendMessage(user.userId, dayScheduleString);
      } else {
        console.error(`Пользователь с _id ${user._id} не имеет userId.`);
      }
    }
  } catch (error) {
    console.error("Ошибка при отправке расписания на день:", error);
  }
}

async function sendToAllUsersWeekSchedule(bot) {
  try {
    try {
      const courses = await Course.find({});

      const daysOrder = [
        "Понедельник",
        "Вторник",
        "Среда",
        "Четверг",
        "Пятница",
        "Суббота",
        "Воскресенье",
      ];
      courses.sort((a, b) => {
        return (
          daysOrder.indexOf(a.dayschedule.day) -
          daysOrder.indexOf(b.dayschedule.day)
        );
      });

      const weekScheduleString = `🎒 Расписание на неделю:\n${courses
        .map((course) => {
          const emoji = getRandomElement(emojiArray);
          return `${emoji} ${course.dayschedule.day} - ${course.title} (${course.dayschedule.time})`;
        })
        .join("\n")}`;

      const users = await User.find({});

      for (const user of users) {
        if (user.userId) {
          await bot.api.sendMessage(user.userId, weekScheduleString);
        } else {
          console.error(`Пользователь с _id ${user._id} не имеет userId.`);
        }
      }
    } catch (error) {
      console.error("Ошибка при получении расписания курсов:", error);
      await ctx.reply("Произошла ошибка при получении расписания.");
    }
  } catch (error) {
    console.error("Ошибка при отправке расписания на неделю:", error);
  }
}
// Newsletter
cron.schedule(
  "0 10 * * *",
  () => {
    console.log("Рассылка сделана", new Date());
    sendToAllUsersDaySchedule(bot);
  },
  {
    scheduled: true,
    timezone: "Asia/Almaty",
  }
);

cron.schedule(
  "0 10 */7 * *",
  () => {
    console.log("Рассылка сделана", new Date());
    sendToAllUsersWeekSchedule(bot);
  },
  {
    scheduled: true,
    timezone: "Asia/Almaty",
  }
);
//
bot.callbackQuery("back", async (ctx) => {
  await ctx.callbackQuery.message.editText("👋 Выберите пункт меню: ", {
    reply_markup: menuKeyboard,
  });
  await ctx.answerCallbackQuery();
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    "🤖 Команды и возможности бота : \n /start - начало работы с ботом \n /channel - TG канал American Corner Pavlodar \n /settings - настройки \n /menu - главное меню \n /help - помощь в навигации \n"
  );
});

bot.command("channel", async (ctx) => {
  await ctx.reply(
    "🔗 Телеграм канал American Corner Pavlodar, где вы сможете оставаться в курсе всех событий! 👇",
    {
      reply_markup: inlineKeyboardChannel,
    }
  );
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.log(`Error whiile handling update ${ctx.update.update_id}`);
  const e = err.error;

  if (e instanceof GrammyError) {
    console.error("Error in request:", e.description);
  } else if (e instanceof HttpError) {
    console.error("Could not contact Telegram:", e);
  } else {
    console.error("Unknown error", e);
  }
});

bot.start();
