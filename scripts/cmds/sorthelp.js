module.exports = {
  config: {
    name: "sorthelp",
    version: "1.2",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Sort help list"
    },
    longDescription: {
      en: "Sort help command list either by name or by category"
    },
    category: "system",
    guide: {
      en: "{pn} [name | category]"
    }
  },

  langs: {
    en: {
      savedName: "✅ Help list will now be sorted by command name (A-Z).",
      savedCategory: "✅ Help list will now be sorted by command category.",
      invalid: "❌ Please choose either 'name' or 'category'. Example: {pn} name"
    },
    bn: {
      savedName: "✅ এখন help list command name অনুজাই sort হবে (A-Z)।",
      savedCategory: "✅ এখন help list category অনুযায়ী sort হবে।",
      invalid: "❌ দয়া করে 'name' বা 'category' লিখুন। উদাহরণ: {pn} name"
    }
  },

  onStart: async function ({ message, event, args, threadsData, getLang, getText }) {
    const lang = await threadsData.get(event.threadID, "settings.language") || "en";
    const $t = this.langs[lang] || this.langs.en;

    const option = args[0]?.toLowerCase();
    if (option === "name") {
      await threadsData.set(event.threadID, "name", "settings.sortHelp");
      return message.reply($t.savedName);
    } else if (option === "category") {
      await threadsData.set(event.threadID, "category", "settings.sortHelp");
      return message.reply($t.savedCategory);
    } else {
      return message.reply($t.invalid.replace('{pn}', global.config.PREFIX + this.config.name));
    }
  }
};
