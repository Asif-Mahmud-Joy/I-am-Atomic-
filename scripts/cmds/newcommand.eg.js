/**
 * GoatBot Command Template (Upgraded & Finalized)
 * Author: ✨ Mr.Smokey [Asif Mahmud] ✨
 * Updated: Real-World Working with Banglish Guide
 */

module.exports = {
  config: {
    name: "hello", // Unique command name
    version: "2.0", // Updated version
    author: "✨ Mr.Smokey [Asif Mahmud] ✨", // Author credit
    countDown: 3, // Cooldown time in seconds
    role: 0, // Role 0 = normal user
    shortDescription: {
      vi: "Xin chào từ bot",
      en: "Say hello from the bot",
      bn: "Bot theke Hello pawar jonno"
    },
    description: {
      vi: "Bot gửi lời chào",
      en: "Bot sends a greeting message",
      bn: "Bot ekta greeting message pathabe"
    },
    category: "utility",
    guide: {
      vi: "{pn}",
      en: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    vi: {
      hello: "Xin chào bạn!",
      helloWithName: "Xin chào, Facebook ID của bạn là %1"
    },
    en: {
      hello: "Hello there!",
      helloWithName: "Hello, your Facebook ID is %1"
    },
    bn: {
      hello: "Hello bhai!",
      helloWithName: "Hello, tomar Facebook ID holo %1"
    }
  },

  onStart: async function ({ api, args, message, event, getLang }) {
    try {
      // Just say hello
      message.reply(getLang("hello"));
      // Uncomment below if you want to include FB ID too
      // message.reply(getLang("helloWithName", event.senderID));
    } catch (err) {
      console.error("❌ Command Error:", err);
      message.reply("⚠️ Command cholate somossa hoise. Try again pore!");
    }
  }
};
