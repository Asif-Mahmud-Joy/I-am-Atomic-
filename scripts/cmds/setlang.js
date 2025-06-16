const fs = require("fs-extra");

module.exports = {
  config: {
    name: "setlang",
    version: "2.0-ultra",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    description: {
      vi: "Cài ngôn ngữ cho nhóm chat hoặc toàn bộ bot",
      en: "Set language for current chat or globally"
    },
    category: "owner",
    guide: {
      vi: "   {pn} <mã ngôn ngữ ISO 639-1> [all | -g]"
        + "\n   Ví dụ: {pn} vi hoặc {pn} en all",
      en: "   {pn} <language code ISO 639-1> [all | -g]"
        + "\n   Example: {pn} en or {pn} vi all"
    }
  },

  langs: {
    vi: {
      setLangForAll: "Đã đặt ngôn ngữ mặc định toàn bot: %1",
      setLangForCurrent: "Đã đặt ngôn ngữ cho nhóm này: %1",
      noPermission: "Lệnh này chỉ dành cho admin bot",
      langNotFound: "Không tìm thấy file ngôn ngữ: %1"
    },
    en: {
      setLangForAll: "Set default language globally: %1",
      setLangForCurrent: "Set language for this chat: %1",
      noPermission: "Only bot admin can use this command",
      langNotFound: "Language file not found: %1"
    },
    bn: {
      setLangForAll: "Bot-er global language set kora holo: %1",
      setLangForCurrent: "Ei chat-er language set holo: %1",
      noPermission: "Ei command sudhu bot admin use korte pare",
      langNotFound: "Language file paoa jai nai: %1"
    }
  },

  onStart: async function ({ message, args, getLang, threadsData, role, event }) {
    if (!args[0]) return message.SyntaxError();

    let langCode = args[0].toLowerCase();
    if (["default", "reset"].includes(langCode)) langCode = null;

    const isGlobal = ["-g", "--global", "all"].includes(args[1]?.toLowerCase());

    // Global set lang
    if (isGlobal) {
      if (role < 2) return message.reply(getLang("noPermission"));
      const pathLanguageFile = `${process.cwd()}/languages/${langCode}.lang`;
      if (!fs.existsSync(pathLanguageFile)) return message.reply(getLang("langNotFound", langCode));

      const languageData = fs.readFileSync(pathLanguageFile, "utf-8")
        .split(/\r?\n/)
        .filter(line => line.trim() && !line.startsWith("#") && !line.startsWith("//"));

      global.language = {};
      for (const line of languageData) {
        const sep = line.indexOf("=");
        const key = line.slice(0, sep).trim();
        const val = line.slice(sep + 1).trim().replace(/\\n/g, "\n");
        const [head, ...rest] = key.split(".");
        if (!global.language[head]) global.language[head] = {};
        global.language[head][rest.join(".")] = val;
      }

      global.GoatBot.config.language = langCode;
      fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
      return message.reply(getLang("setLangForAll", langCode));
    }

    // Set lang for current thread only
    await threadsData.set(event.threadID, langCode, "data.lang");

    const replyLang = this.langs[langCode]?.setLangForCurrent || `Set language for this chat: %1`;
    return message.reply(replyLang.replace("%1", langCode));
  }
};
