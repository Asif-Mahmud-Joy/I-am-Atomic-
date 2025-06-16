const fs = require("fs-extra");

module.exports = {
  config: {
    name: "restart",
    version: "2.0",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Restart the bot",
      vi: "Khởi động lại bot"
    },
    category: "Owner",
    guide: {
      en: "{pn}: Restart the bot",
      vi: "{pn}: Khởi động lại bot"
    }
  },

  langs: {
    en: {
      restarting: "🔄 | Restarting bot...",
      restarted: "✅ | Bot restarted\n⏰ | Uptime: %1s"
    },
    vi: {
      restarting: "🔄 | Đang khởi động lại bot...",
      restarted: "✅ | Đã khởi động lại bot\n⏰ | Thời gian: %1s"
    }
  },

  onLoad: function ({ api, getLang }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    if (fs.existsSync(pathFile)) {
      const [tid, time] = fs.readFileSync(pathFile, "utf-8").split(" ");
      const duration = ((Date.now() - Number(time)) / 1000).toFixed(2);
      api.sendMessage(getLang("restarted", duration), tid);
      fs.unlinkSync(pathFile);
    }
  },

  onStart: async function ({ message, event, getLang }) {
    const pathFile = `${__dirname}/tmp/restart.txt`;
    try {
      fs.ensureDirSync(`${__dirname}/tmp`);
      fs.writeFileSync(pathFile, `${event.threadID} ${Date.now()}`);
      await message.reply(getLang("restarting"));
      process.exit(2);
    } catch (err) {
      console.error("❌ Restart error:", err);
      return message.reply("❌ | Failed to restart bot. Please check logs.");
    }
  }
};
