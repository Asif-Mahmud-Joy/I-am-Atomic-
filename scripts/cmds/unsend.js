module.exports = {
  config: {
    name: "unsend",
    aliases: ["un", "uns", "unsef", "u"],
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 5,
    role: 0,
    shortDescription: {
      vi: "Gỡ tin nhắn của bot",
      en: "Unsend bot's message",
      bn: "বটের পাঠানো মেসেজ মুছে ফেলুন"
    },
    longDescription: {
      vi: "Gỡ tin nhắn của bot",
      en: "Unsend bot's message",
      bn: "আপনার রিপ্লাই করা বটের পাঠানো মেসেজ মুছে ফেলবে।"
    },
    category: "box chat",
    guide: {
      vi: "reply tin nhắn muốn gỡ của bot và gọi lệnh {pn}",
      en: "reply the message you want to unsend and call the command {pn}",
      bn: "যে মেসেজটি মুছতে চান সেটিতে রিপ্লাই দিয়ে {pn} কমান্ড দিন"
    }
  },

  langs: {
    vi: {
      syntaxError: "Vui lòng reply tin nhắn muốn gỡ của bot",
      done: "✅ | Đã gỡ tin nhắn."
    },
    en: {
      syntaxError: "❌ | Please reply the message you want to unsend",
      done: "✅ | Message unsent successfully."
    },
    bn: {
      syntaxError: "❌ | যে মেসেজটি মুছতে চান সেটিতে রিপ্লাই দিন",
      done: "✅ | মেসেজটি সফলভাবে মুছে ফেলা হয়েছে।"
    }
  },

  onStart: async function ({ message, event, api, getLang }) {
    try {
      const botID = api.getCurrentUserID();
      if (!event.messageReply || event.messageReply.senderID != botID)
        return message.reply(getLang("syntaxError"));

      await message.unsend(event.messageReply.messageID);
      return message.reply(getLang("done"));
    } catch (error) {
      console.error("[Unsend Error]", error);
      return message.reply("❌ | কোনো একটি সমস্যা হয়েছে। অনুগ্রহ করে পরে আবার চেষ্টা করুন।");
    }
  }
};
