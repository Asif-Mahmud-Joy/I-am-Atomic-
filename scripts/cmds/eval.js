// ✅ GoatBot Eval Command v2.0
// 🔧 Fixed, Upgraded, Fully Working with Real Output Handling + Banglish Added

const { removeHomeDir, log } = global.utils;

module.exports = {
  config: {
    name: "eval",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "Test code nhanh",
      en: "Test code quickly",
      bn: "Code test korar jonne"
    },
    longDescription: {
      vi: "Test code nhanh",
      en: "Test code quickly",
      bn: "Taratari kono code test korar jonne"
    },
    category: "owner",
    guide: {
      vi: "{pn} <đoạn code cần test>",
      en: "{pn} <code to test>",
      bn: "{pn} <test korar code>"
    }
  },

  langs: {
    vi: { error: "❌ Đã có lỗi xảy ra:" },
    en: { error: "❌ An error occurred:" },
    bn: { error: "❌ Somossa hoise:" }
  },

  onStart: async function (context) {
    const {
      api,
      args,
      message,
      getLang,
      event,
      threadsData,
      usersData,
      dashBoardData,
      globalData,
      threadModel,
      userModel,
      dashBoardModel,
      globalModel,
      role,
      commandName
    } = context;

    const lang = getLang();

    const code = args.join(" ");
    if (!code) return message.reply("⚠️ | Kono code likho eval er por");

    try {
      const result = await eval(`(async () => { ${code} })()`);
      message.reply(format(result));
    } catch (err) {
      log.err("eval command", err);
      message.reply(`${lang.error}\n${formatError(err)}`);
    }

    function format(result) {
      if (typeof result === "undefined") return "undefined";
      if (typeof result === "function") return result.toString();
      if (typeof result === "object") {
        if (result instanceof Map) {
          const obj = {};
          result.forEach((v, k) => (obj[k] = v));
          return `Map(${result.size}):\n` + JSON.stringify(obj, null, 2);
        }
        return JSON.stringify(result, null, 2);
      }
      return result.toString();
    }

    function formatError(err) {
      return removeHomeDir(
        err.stack ? err.stack : JSON.stringify(err, null, 2) || "Unknown error"
      );
    }
  }
};
