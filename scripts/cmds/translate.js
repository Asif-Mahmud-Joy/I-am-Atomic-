const axios = require("axios");
const defaultEmojiTranslate = "🌐";

module.exports = {
  config: {
    name: "translate",
    aliases: ["trans"],
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    description: {
      vi: "Dịch văn bản sang ngôn ngữ mong muốn",
      en: "Translate text to the desired language",
      bn: "Chaiya language e text onubad korun"
    },
    category: "utility",
    guide: {
      vi: "{pn} <văn bản> -> <ISO 639-1>",
      en: "{pn} <text> -> <ISO 639-1>",
      bn: "{pn} <lekha> -> <language code>"
    }
  },

  langs: {
    en: {
      translateTo: "🌐 Translate from %1 to %2",
      invalidArgument: "❌ Invalid argument, use 'on' or 'off'",
      turnOnTransWhenReaction: `✅ Auto-translate turned ON. React with \"${defaultEmojiTranslate}\" to any message to translate it.`,
      turnOffTransWhenReaction: "✅ Auto-translate turned OFF.",
      inputEmoji: "🌀 React to this message to set the translate emoji",
      emojiSet: "✅ Translate emoji set to %1"
    },
    bn: {
      translateTo: "🌐 %1 theke %2 e onubad kora holo",
      invalidArgument: "❌ Thik bhabe on/off bolo",
      turnOnTransWhenReaction: `✅ Auto translate on kora holo. \"${defaultEmojiTranslate}\" diye react korle message translate hobe.`,
      turnOffTransWhenReaction: "✅ Auto translate off kora holo.",
      inputEmoji: "🌀 Ei message e react korun emoji set korar jonno",
      emojiSet: "✅ Onubad emoji set kora holo %1"
    }
  },

  onStart: async function ({ event, message, args, threadsData, getLang, commandName }) {
    const lang = await threadsData.get(event.threadID, "data.lang") || "en";
    const $t = (key, ...v) => module.exports.langs[lang][key]?.replace(/%1|%2/g, (_, i) => v[i]) || "";

    if (["-r", "-react", "-reaction"].includes(args[0])) {
      if (args[1] === "set") {
        return message.reply($t("inputEmoji"), (err, info) =>
          global.GoatBot.onReaction.set(info.messageID, {
            type: "setEmoji",
            commandName,
            authorID: event.senderID
          })
        );
      }
      const enable = args[1] === "on" ? true : args[1] === "off" ? false : null;
      if (enable === null) return message.reply($t("invalidArgument"));

      await threadsData.set(event.threadID, enable, "data.translate.autoTranslateWhenReaction");
      return message.reply(enable ? $t("turnOnTransWhenReaction") : $t("turnOffTransWhenReaction"));
    }

    let content, langCode;

    if (event.messageReply) {
      content = event.messageReply.body;
    } else {
      content = event.body;
    }

    let lastIndex = content.lastIndexOf("->") !== -1 ? content.lastIndexOf("->") : content.lastIndexOf("=>");
    if (lastIndex !== -1) {
      langCode = content.slice(lastIndex + 2).trim();
      content = content.slice(0, lastIndex).trim();
    } else {
      langCode = lang;
    }

    if (!content) return message.reply("❗ No text provided to translate.");

    const result = await translate(content, langCode);
    return message.reply(`${result.text}\n\n${$t("translateTo", result.lang, langCode)}`);
  },

  onChat: async ({ event, threadsData }) => {
    if (!await threadsData.get(event.threadID, "data.translate.autoTranslateWhenReaction")) return;
    global.GoatBot.onReaction.set(event.messageID, {
      commandName: "translate",
      body: event.body,
      type: "translate"
    });
  },

  onReaction: async ({ event, message, Reaction, threadsData }) => {
    const lang = await threadsData.get(event.threadID, "data.lang") || "en";
    const $t = (key, ...v) => module.exports.langs[lang][key]?.replace(/%1|%2/g, (_, i) => v[i]) || "";

    if (Reaction.type === "setEmoji") {
      if (event.userID !== Reaction.authorID) return;
      const emoji = event.reaction;
      if (!emoji) return;
      await threadsData.set(event.threadID, emoji, "data.translate.emojiTranslate");
      return message.reply($t("emojiSet", emoji));
    }

    if (Reaction.type === "translate") {
      const emojiTrans = await threadsData.get(event.threadID, "data.translate.emojiTranslate") || defaultEmojiTranslate;
      if (event.reaction === emojiTrans) {
        const langCode = await threadsData.get(event.threadID, "data.lang") || "en";
        const result = await translate(Reaction.body, langCode);
        return message.reply(`${result.text}\n\n${$t("translateTo", result.lang, langCode)}`);
      }
    }
  }
};

async function translate(text, langCode) {
  const res = await axios.get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${langCode}&dt=t&q=${encodeURIComponent(text)}`);
  return {
    text: res.data[0].map(item => item[0]).join(''),
    lang: res.data[2]
  };
}
