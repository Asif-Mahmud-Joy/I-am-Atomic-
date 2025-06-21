const { removeHomeDir, log } = global.utils;

module.exports = {
  config: {
    name: "eval",
    version: "2.1",
    author: "☣️ 𝐀𝐬𝐢𝐟 ⚛️",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "⚡ Execute JavaScript code dynamically",
      bn: "⚡ JavaScript কোড ডাইনামিক্যালি এক্সিকিউট করুন"
    },
    longDescription: {
      en: "🔧 Powerful code evaluation with enhanced output formatting and error handling",
      bn: "🔧 শক্তিশালী কোড ইভ্যালুয়েশন উন্নত আউটপুট ফরম্যাটিং এবং এরর হ্যান্ডলিং সহ"
    },
    category: "👑 Owner",
    guide: {
      en: "{pn} <code>",
      bn: "{pn} <কোড>"
    }
  },

  langs: {
    en: { 
      error: "☢️ 𝗘𝗩𝗥𝗢𝗥 𝗢𝗖𝗖𝗨𝗥𝗘𝗗:",
      success: "⚡ 𝗘𝗩𝗔𝗟 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟𝗟𝗬 𝗘𝗫𝗘𝗖𝗨𝗧𝗘𝗗:",
      undefined: "🫥 𝗨𝗡𝗗𝗘𝗙𝗜𝗡𝗘𝗗"
    },
    bn: {
      error: "☢️ 𝗘𝗥𝗥𝗢𝗥 𝗛𝗢𝗜𝗦𝗘:",
      success: "⚡ 𝗦𝗔𝗙𝗔𝗟𝗬 𝗘𝗫𝗘𝗖𝗨𝗧𝗘 𝗛𝗢𝗜𝗦𝗘:",
      undefined: "🫥 𝗔𝗡𝗗𝗘𝗙𝗜𝗡𝗘𝗗"
    }
  },

  onStart: async function (context) {
    const { api, args, message, getLang } = context;
    const lang = getLang();

    if (!args[0]) {
      return message.reply("☣️ 𝗣𝗟𝗘𝗔𝗦𝗘 𝗣𝗥𝗢𝗩𝗜𝗗𝗘 𝗖𝗢𝗗𝗘 𝗧𝗢 𝗘𝗩𝗔𝗟𝗨𝗔𝗧𝗘\n\n" + 
                         "⚡ 𝗘𝗫𝗔𝗠𝗣𝗟𝗘:\n" + 
                         "• eval 2+2\n" + 
                         "• eval api.sendMessage('Hi', event.threadID)");
    }

    try {
      const startTime = Date.now();
      const result = await eval(`(async () => { ${args.join(" ")} })()`);
      const executionTime = Date.now() - startTime;
      
      const formattedResult = this.formatResult(result, lang);
      const successMessage = `⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗘𝗩𝗔𝗟 𝗥𝗘𝗦𝗨𝗟𝗧 ⚛️\n\n` +
                           `📝 𝗖𝗢𝗗𝗘:\n${args.join(" ")}\n\n` +
                           `✅ ${lang.success}\n${formattedResult}\n\n` +
                           `⏱️ 𝗘𝗫𝗘𝗖𝗨𝗧𝗜𝗢𝗡 𝗧𝗜𝗠𝗘: ${executionTime}ms`;
      
      message.reply(successMessage);
    } catch (err) {
      log.error("eval command", err);
      const errorMessage = `☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗘𝗩𝗔𝗟 𝗙𝗔𝗜𝗟𝗘𝗗 ⚛️\n\n` +
                         `📝 𝗖𝗢𝗗𝗘:\n${args.join(" ")}\n\n` +
                         `❌ ${lang.error}\n${this.formatError(err)}`;
      
      message.reply(errorMessage);
    }
  },

  formatResult: function(result, lang) {
    if (result === undefined) return lang.undefined;
    if (result === null) return "⛔ 𝗡𝗨𝗟𝗟";
    
    switch (typeof result) {
      case "function":
        return "🔧 𝗙𝗨𝗡𝗖𝗧𝗜𝗢𝗡:\n" + result.toString();
      case "object":
        if (result instanceof Map) {
          const obj = {};
          result.forEach((v, k) => (obj[k] = v));
          return `🗺️ 𝗠𝗔𝗣 (${result.size}):\n` + this.safeStringify(obj);
        }
        if (result instanceof Set) {
          return `📦 𝗦𝗘𝗧 (${result.size}):\n` + this.safeStringify([...result]);
        }
        return "📊 𝗢𝗕𝗝𝗘𝗖𝗧:\n" + this.safeStringify(result);
      case "string":
        return `📄 𝗦𝗧𝗥𝗜𝗡𝗚:\n${result}`;
      case "number":
        return `🔢 𝗡𝗨𝗠𝗕𝗘𝗥:\n${result}`;
      case "boolean":
        return `🔘 𝗕𝗢𝗢𝗟𝗘𝗔𝗡:\n${result}`;
      default:
        return "✨ 𝗨𝗡𝗞𝗡𝗢𝗪𝗡 𝗧𝗬𝗣𝗘:\n" + this.safeStringify(result);
    }
  },

  safeStringify: function(obj, indent = 2) {
    const cache = new Set();
    return JSON.stringify(obj, (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (cache.has(value)) return "[Circular]";
        cache.add(value);
      }
      return value;
    }, indent);
  },

  formatError: function(err) {
    const stack = err.stack ? removeHomeDir(err.stack) : "No stack trace";
    return `🛠️ 𝗘𝗥𝗥𝗢𝗥 𝗧𝗬𝗣𝗘: ${err.name || "Unknown"}\n\n` +
           `📜 𝗠𝗘𝗦𝗦𝗔𝗚𝗘:\n${err.message || "No message"}\n\n` +
           `🔍 𝗦𝗧𝗔𝗖𝗞 𝗧𝗥𝗔𝗖𝗘:\n${stack}`;
  }
};
