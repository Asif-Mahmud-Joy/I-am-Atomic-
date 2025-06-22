const axios = require('axios');
const defaultEmoji = "🌐";

module.exports = {
  config: {
    name: "translate",
    aliases: ["trans", "tl"],
    version: "3.0",
    author: "NTKhang & Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "✨ Advanced text translation with multiple features ✨"
    },
    category: "utility",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🌍 TRANSLATION COMMAND 🌍
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} <text> -> <lang> - Translate text
❯ Reply to message with {pn} -> <lang>
❯ {pn} -r on/off - Toggle auto-translate
❯ {pn} -r set <emoji> - Set reaction emoji

💎 Examples:
❯ {pn} Hello -> vi
❯ {pn} -r on
❯ {pn} -r set 🔍
      `
    }
  },

  langs: {
    en: {
      translateTo: "🌐 Translated from %1 to %2",
      invalidArg: "⚠️ Invalid argument. Use 'on' or 'off'",
      autoOn: "✅ Auto-translate enabled! React with %1 to translate",
      autoOff: "✅ Auto-translate disabled",
      setEmoji: "🌀 React to this message to set translation emoji",
      emojiSet: "✅ Translation emoji set to %1",
      noText: "📝 Please provide text to translate",
      error: "❌ Translation error: %1"
    }
  },

  onStart: async function ({ event, message, args, threadsData, getLang }) {
    try {
      // Handle reaction settings
      if (["-r", "-react"].includes(args[0])) {
        if (args[1] === "set") {
          return message.reply(getLang("setEmoji"), (err, info) => {
            global.GoatBot.onReaction.set(info.messageID, {
              type: "setEmoji",
              commandName: this.config.name,
              authorID: event.senderID
            });
          });
        }

        const state = args[1] === "on" ? true : args[1] === "off" ? false : null;
        if (state === null) return message.reply(getLang("invalidArg"));

        await threadsData.set(event.threadID, state, "data.translate.autoTranslateWhenReaction");
        const emoji = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || defaultEmoji;
        return message.reply(state ? getLang("autoOn", emoji) : getLang("autoOff"));
      }

      // Handle translation
      let content, langCode;
      const threadLang = await threadsData.get(event.threadID, "data.lang") || "en";

      if (event.messageReply) {
        content = event.messageReply.body;
        const langMatch = event.body.match(/->\s*(\w{2})/);
        langCode = langMatch ? langMatch[1] : threadLang;
      } else {
        const parts = event.body.split("->");
        if (parts.length > 1) {
          content = parts[0].replace(this.config.name, "").trim();
          langCode = parts[1].trim();
        } else {
          content = event.body.replace(this.config.name, "").trim();
          langCode = threadLang;
        }
      }

      if (!content) return message.reply(getLang("noText"));

      const { text, lang } = await this.translateText(content, langCode);
      return message.reply(`${text}\n\n${getLang("translateTo", lang, langCode)}`);

    } catch (err) {
      console.error("[TRANSLATE ERROR]", err);
      return message.reply(getLang("error", err.message));
    }
  },

  onChat: async ({ event, threadsData }) => {
    if (await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction")) {
      global.GoatBot.onReaction.set(event.messageID, {
        commandName: "translate",
        body: event.body,
        type: "translate"
      });
    }
  },

  onReaction: async ({ event, Reaction, message, threadsData, getLang }) => {
    try {
      if (Reaction.type === "setEmoji" && event.userID === Reaction.authorID) {
        await threadsData.set(event.threadID, event.reaction, "data.translate.emojiTranslate");
        return message.reply(getLang("emojiSet", event.reaction));
      }

      if (Reaction.type === "translate") {
        const emoji = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || defaultEmoji;
        if (event.reaction === emoji) {
          const langCode = await threadsData.get(event.threadID, "data.lang") || "en";
          const { text, lang } = await this.translateText(Reaction.body, langCode);
          return message.reply(`${text}\n\n${getLang("translateTo", lang, langCode)}`);
        }
      }
    } catch (err) {
      console.error("[REACTION ERROR]", err);
    }
  },

  translateText: async function(text, langCode) {
    const response = await axios.get(`https://translate.googleapis.com/translate_a/single`, {
      params: {
        client: "gtx",
        sl: "auto",
        tl: langCode,
        dt: "t",
        q: text
      },
      timeout: 10000
    });

    return {
      text: response.data[0].map(item => item[0]).join(''),
      lang: response.data[2]
    };
  }
};
