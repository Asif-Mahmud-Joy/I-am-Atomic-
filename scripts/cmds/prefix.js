const fs = require("fs-extra");
const { utils } = global;

module.exports = {
  config: {
    name: "prefix",
    version: "1.6",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Bot prefix change per group or globally",
    longDescription: "Use this command to change bot prefix locally in a group or globally (admin only).",
    category: "⚙️ Configuration",
    guide: {
      en:
        "┌─『 Prefix Settings 』─┐\n"
      + "│\n"
      + "│ 🔹 {pn} <prefix>\n"
      + "│     Set prefix for this chat\n"
      + "│     Example: {pn} $\n"
      + "│\n"
      + "│ 🔹 {pn} <prefix> -g\n"
      + "│     Set global prefix (Admin only)\n"
      + "│     Example: {pn} $ -g\n"
      + "│\n"
      + "│ ♻️ {pn} reset\n"
      + "│     Reset to default prefix\n"
      + "│\n"
      + "└──────────────────────┘"
    }
  },

  langs: {
    en: {
      reset: "✅ Reset kora hoise default prefix e: %1",
      onlyAdmin: "⛔ Global prefix change korar permission nai!",
      confirmGlobal: "🛠️ Global prefix update confirm korte reaction dao.",
      confirmThisThread: "🛠️ Ei chat-er prefix change korte reaction dao.",
      successGlobal: "✅ Global prefix update hoyeche: %1",
      successThisThread: "✅ Ei chat-er prefix update hoyeche: %1",
      myPrefix: "🔧 Current Prefix Info:\n🌍 Global: %1\n💬 Chat: %2\nUse: %2help dekhar jonno"
    }
  },

  onStart: async function ({ message, role, args, commandName, event, threadsData, getLang }) {
    if (!args[0]) return message.SyntaxError();

    if (args[0] === "reset") {
      await threadsData.set(event.threadID, null, "data.prefix");
      return message.reply(getLang("reset", global.GoatBot.config.prefix));
    }

    const newPrefix = args[0];
    const setGlobal = args[1] === "-g";

    if (setGlobal && role < 2) return message.reply(getLang("onlyAdmin"));

    const confirmMsg = setGlobal ? getLang("confirmGlobal") : getLang("confirmThisThread");

    return message.reply(confirmMsg, (err, info) => {
      if (err) return;
      global.GoatBot.onReaction.set(info.messageID, {
        commandName,
        author: event.senderID,
        newPrefix,
        setGlobal,
        messageID: info.messageID
      });
    });
  },

  onReaction: async function ({ message, threadsData, event, Reaction, getLang }) {
    if (event.userID !== Reaction.author) return;

    if (Reaction.setGlobal) {
      global.GoatBot.config.prefix = Reaction.newPrefix;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("successGlobal", Reaction.newPrefix));
    }

    await threadsData.set(event.threadID, Reaction.newPrefix, "data.prefix");
    return message.reply(getLang("successThisThread", Reaction.newPrefix));
  },

  onChat: async function ({ event, message, threadsData }) {
    const globalPrefix = global.GoatBot.config.prefix;
    const threadPrefix = await threadsData.get(event.threadID, "data.prefix") || globalPrefix;

    if (event.body?.toLowerCase() === "prefix") {
      return message.reply({
        body: `╔══『 𝐏𝐑𝐄𝐅𝐈𝐗 』══╗\n║ 🌍 System: ${globalPrefix}\n║ 💬 Chatbox: ${threadPrefix}\n║ ➤ ${threadPrefix}help commands dekhar jonno 🧠\n╚════════════════╝`,
        attachment: await utils.getStreamFromURL("https://files.catbox.moe/k8kwue.jpg")
      });
    }
  }
};
