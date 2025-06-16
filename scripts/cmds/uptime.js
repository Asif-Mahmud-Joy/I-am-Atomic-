module.exports = {
  config: {
    name: "uptime",
    aliases: ["up", "upt"],
    version: "2.0",
    author: "Mr.Smokey[Asif Mahmud]",
    role: 0,
    shortDescription: {
      en: "Check how long the bot has been running.",
      bn: "বট কতক্ষণ চালু আছে দেখুন।"
    },
    longDescription: {
      en: "Displays the bot's total uptime since the last restart.",
      bn: "শেষবার রিস্টার্ট হওয়ার পর থেকে বট কতক্ষণ চালু আছে তা দেখায়।"
    },
    category: "System",
    guide: {
      en: "Use {p}uptime to display uptime info.",
      bn: "{p}uptime লিখে আপটাইম দেখুন।"
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const uptime = process.uptime();
      const seconds = Math.floor(uptime % 60);
      const minutes = Math.floor((uptime / 60) % 60);
      const hours = Math.floor((uptime / 3600) % 24);
      const days = Math.floor(uptime / 86400);

      const banglaDigits = num => num.toString().replace(/\d/g, d => "০১২৩৪৫৬৭৮৯"[d]);

      const uptimeString = `📊 বট চালু আছে:
📅 দিন: ${banglaDigits(days)}
⏰ ঘণ্টা: ${banglaDigits(hours)}
🕒 মিনিট: ${banglaDigits(minutes)}
⏱️ সেকেন্ড: ${banglaDigits(seconds)}\n\n✨ বট চালু রাখার জন্য ধন্যবাদ!`;

      await api.sendMessage(uptimeString, event.threadID);
    } catch (err) {
      console.error("[Uptime Command Error]", err);
      api.sendMessage("❌ দুঃখিত, আপটাইম দেখতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
