const { findUid } = global.utils;
const axios = require('axios');

module.exports = {
  config: {
    name: "uid",
    aliases: ["userid", "fb-id"],
    version: "3.0",
    author: "NTKhang & Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "✨ Get Facebook user IDs with multiple options ✨"
    },
    category: "info",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  📌 USER ID COMMAND 📌
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} - Get your own UID
❯ {pn} @mention - Get UID of tagged users
❯ {pn} <profile link> - Get UID from profile URL
❯ Reply to a message with {pn} - Get sender's UID

💎 Examples:
❯ {pn}
❯ {pn} @Mark Zuckerberg
❯ {pn} https://facebook.com/zuck
      `
    }
  },

  langs: {
    en: {
      yourUid: "🔍 Your Facebook UID: %1",
      uidResult: "📌 UID Results:",
      noUidFound: "⚠️ Couldn't find UID for: %1",
      error: "❌ An error occurred: %1"
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    try {
      // Handle message reply case
      if (event.messageReply) {
        return message.reply(
          `${getLang("uidResult")}\n` +
          `├ Name: ${event.messageReply.senderID}\n` +
          `└ UID: ${event.messageReply.senderID}`
        );
      }

      // Handle no arguments (show own UID)
      if (!args[0]) {
        return message.reply(getLang("yourUid", event.senderID));
      }

      // Handle URL case
      if (this.isValidUrl(args[0])) {
        const results = [];
        
        for (const url of args.filter(arg => this.isValidUrl(arg))) {
          try {
            const uid = await findUid(url);
            results.push(`✅ ${url} => ${uid}`);
          } catch (e) {
            results.push(`❌ ${url} => ${getLang("noUidFound", e.message)}`);
          }
        }

        return message.reply(
          `${getLang("uidResult")}\n${results.join("\n")}`
        );
      }

      // Handle mentions case
      if (Object.keys(event.mentions).length > 0) {
        const mentionResults = Object.entries(event.mentions).map(
          ([uid, name]) => `├ ${name.replace("@", "")}\n└ UID: ${uid}`
        );

        return message.reply(
          `${getLang("uidResult")}\n${mentionResults.join("\n\n")}`
        );
      }

      // Default case (invalid input)
      return message.reply(getLang("noUidFound", "Invalid input provided"));
    } catch (err) {
      console.error("[UID COMMAND ERROR]", err);
      return message.reply(getLang("error", err.message));
    }
  },

  isValidUrl: function(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }
};
