const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "setlang",
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 3,
    role: 1, // Bot admin only
    description: {
      en: "Advanced language configuration system for bot",
      vi: "Hệ thống cấu hình ngôn ngữ nâng cao cho bot",
      bn: "বটের জন্য উন্নত ভাষা কনফিগারেশন সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Usage Guide:
• {pn} <language code> - Set language for current chat
• {pn} <language code> -g - Set global language (admin only)
• {pn} list - Show available languages
• {pn} reset - Reset to default language

🌐 Supported Language Codes: en, vi, bn, etc.`,
      bn: `📌 ব্যবহার নির্দেশিকা:
• {pn} <ভাষা কোড> - বর্তমান চ্যাটের জন্য ভাষা সেট করুন
• {pn} <ভাষা কোড> -g - গ্লোবাল ভাষা সেট করুন (শুধুমাত্র অ্যাডমিন)
• {pn} list - উপলব্ধ ভাষাগুলি দেখুন
• {pn} reset - ডিফল্ট ভাষায় রিসেট করুন

🌐 সমর্থিত ভাষা কোড: en, vi, bn, ইত্যাদি`
    }
  },

  langs: {
    en: {
      successCurrent: "✅ Language set to '%1' for this chat",
      successGlobal: "🌍 Global language set to '%1'",
      noPermission: "⛔ Only bot admins can change global language",
      invalidLang: "❌ Invalid language code '%1'",
      langList: "📜 Available Languages:\n%1",
      resetCurrent: "🔄 Language reset to default for this chat",
      resetGlobal: "🔄 Global language reset to default",
      error: "❌ An error occurred: %1"
    },
    bn: {
      successCurrent: "✅ এই চ্যাটের ভাষা সেট করা হয়েছে '%1'",
      successGlobal: "🌍 গ্লোবাল ভাষা সেট করা হয়েছে '%1'",
      noPermission: "⛔ শুধুমাত্র বট অ্যাডমিনরা গ্লোবাল ভাষা পরিবর্তন করতে পারে",
      invalidLang: "❌ অবৈধ ভাষা কোড '%1'",
      langList: "📜 উপলব্ধ ভাষাসমূহ:\n%1",
      resetCurrent: "🔄 এই চ্যাটের ভাষা ডিফল্টে রিসেট করা হয়েছে",
      resetGlobal: "🔄 গ্লোবাল ভাষা ডিফল্টে রিসেট করা হয়েছে",
      error: "❌ একটি ত্রুটি ঘটেছে: %1"
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    threadsData, 
    role, 
    getLang,
    prefix
  }) {
    try {
      const action = args[0]?.toLowerCase();
      const langCode = action === "list" || action === "reset" ? null : args[0];
      const isGlobal = args[1]?.toLowerCase() === "-g";

      // Show language list
      if (action === "list") {
        const langFiles = fs.readdirSync(path.join(__dirname, "../../languages"))
          .filter(file => file.endsWith('.lang'))
          .map(file => file.replace('.lang', ''))
          .join(', ');
        return message.reply(getLang("langList", langFiles));
      }

      // Reset language
      if (action === "reset") {
        if (isGlobal) {
          if (role < 2) return message.reply(getLang("noPermission"));
          global.GoatBot.config.language = null;
          fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
          return message.reply(getLang("resetGlobal"));
        }
        await threadsData.set(event.threadID, null, "data.lang");
        return message.reply(getLang("resetCurrent"));
      }

      // Validate language code
      if (!langCode) return message.SyntaxError();

      const langFilePath = path.join(__dirname, `../../languages/${langCode}.lang`);
      if (!fs.existsSync(langFilePath)) {
        return message.reply(getLang("invalidLang", langCode));
      }

      // Set language globally
      if (isGlobal) {
        if (role < 2) return message.reply(getLang("noPermission"));
        
        const langData = fs.readFileSync(langFilePath, "utf-8")
          .split(/\r?\n/)
          .filter(line => line.trim() && !line.startsWith("#") && !line.startsWith("//"));

        global.language = {};
        for (const line of langData) {
          const [key, ...valueParts] = line.split("=");
          const value = valueParts.join("=").trim().replace(/\\n/g, "\n");
          const [category, ...keyParts] = key.trim().split(".");
          
          if (!global.language[category]) {
            global.language[category] = {};
          }
          global.language[category][keyParts.join(".")] = value;
        }

        global.GoatBot.config.language = langCode;
        fs.writeFileSync(global.client.dirConfig, JSON.stringify(global.GoatBot.config, null, 2));
        return message.reply(getLang("successGlobal", langCode));
      }

      // Set language for current thread
      await threadsData.set(event.threadID, langCode, "data.lang");
      return message.reply(getLang("successCurrent", langCode));

    } catch (error) {
      console.error("Language setting error:", error);
      return message.reply(getLang("error", error.message));
    }
  }
};
