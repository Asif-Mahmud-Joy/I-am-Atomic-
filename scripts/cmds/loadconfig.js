const fs = require("fs-extra");

module.exports = {
  config: {
    name: "loadconfig",
    aliases: ["loadcf"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Reload bot config",
      bn: "বট কনফিগ নতুন করে লোড করুন"
    },
    longDescription: {
      en: "This command reloads the bot configuration and command configuration.",
      bn: "এই কমান্ডটি বট এবং কমান্ডের কনফিগারেশন আবার লোড করে।"
    },
    category: "owner",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      success: "✅ Config has been reloaded successfully."
    },
    bn: {
      success: "✅ কনফিগ সফলভাবে পুনরায় লোড হয়েছে।"
    }
  },

  onStart: async function ({ message, getLang, args, event, api }) {
    try {
      // Reload config JSONs
      global.GoatBot.config = fs.readJsonSync(global.client.dirConfig);
      global.GoatBot.configCommands = fs.readJsonSync(global.client.dirConfigCommands);

      // Reply success
      message.reply(getLang("success"));
    } catch (error) {
      console.error("[LoadConfig Error]", error);
      return message.reply("❌ Config reload করতে গিয়ে সমস্যা হয়েছে। দয়া করে কনসোলে চেক করুন।");
    }
  }
};
