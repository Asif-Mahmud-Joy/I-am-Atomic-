module.exports = {
  config: {
    name: "choose",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Bot will choose one option for you"
    },
    longDescription: {
      en: "Give multiple options separated by | and the bot will randomly pick one"
    },
    category: "games",
    guide: {
      en: "{pn} Pizza | Burger | Pasta"
    }
  },

  langs: {
    en: {
      many: "Please provide at least two options using '|' to separate them."
    }
  },

  onStart: async function ({ message, args, getLang }) {
    try {
      const input = args.join(" ");
      const options = input.split("|").map(opt => opt.trim()).filter(opt => opt);

      if (options.length < 2) return message.reply(getLang("many"));

      const chosen = options[Math.floor(Math.random() * options.length)];
      return message.reply(`🤖 Bot bollo: "${chosen}"`);
    } catch (err) {
      console.error("[Choose CMD Error]", err);
      return message.reply("😓 Internal error hoise. Try abar porer bar.");
    }
  }
};
