const axios = require("axios");
const { findUid } = global.utils;
const regExCheckURL = /^(http|https):\/\/[^\s"]+$/;

module.exports = {
  config: {
    name: "uid",
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Xem uid Facebook",
      en: "Get Facebook UID",
      bn: "ফেসবুক UID দেখুন"
    },
    longDescription: {
      vi: "Xem Facebook UID của người dùng",
      en: "View Facebook user ID of a person",
      bn: "কারো ফেসবুক UID দেখতে পারবেন"
    },
    category: "info",
    guide: {
      vi: "{pn}: xem uid của bạn\n{pn} @tag: xem uid người được tag\n{pn} <link>: uid từ link\nReply một tin nhắn với {pn} để lấy uid",
      en: "{pn}: get your UID\n{pn} @tag: get UID of tagged user\n{pn} <link>: UID from link\nReply to message with {pn} to get UID",
      bn: "{pn}: আপনার UID দেখুন\n{pn} @tag: ট্যাগ করা ব্যক্তির UID\n{pn} <link>: লিঙ্ক থেকে UID\n{pn} রিপ্লাই করুন মেসেজে UID জানতে"
    }
  },

  langs: {
    vi: {
      syntaxError: "⚠️ Vui lòng tag người dùng hoặc để trống để lấy uid của bạn."
    },
    en: {
      syntaxError: "⚠️ Please tag a user or leave blank to get your UID."
    },
    bn: {
      syntaxError: "⚠️ অনুগ্রহ করে একজনকে ট্যাগ করুন অথবা নিজের UID পেতে ফাঁকা রাখুন।"
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    const lang = getLang();
    const reply = (msg) => message.reply(msg);

    try {
      if (event.messageReply)
        return reply(`✅ UID: ${event.messageReply.senderID}`);

      if (!args[0] && !Object.keys(event.mentions || {}).length)
        return reply(`✅ Your UID: ${event.senderID}`);

      if (args[0]?.match(regExCheckURL)) {
        let msg = "";
        for (const link of args) {
          try {
            const uid = await findUid(link);
            msg += `✅ ${link} => ${uid}\n`;
          } catch (e) {
            msg += `❌ ${link} => ${e.message}\n`;
          }
        }
        return reply(msg);
      }

      let msg = "";
      const { mentions } = event;
      for (const id in mentions)
        msg += `✅ ${mentions[id].replace("@", "")}: ${id}\n`;

      reply(msg || lang.syntaxError);
    } catch (err) {
      console.error("[UID ERROR]", err);
      reply("❌ An error occurred while processing your request.");
    }
  }
};
