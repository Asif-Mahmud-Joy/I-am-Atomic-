const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["adonly", "onlyad", "onlyadmin"],
    version: "2.0", // ✅ Updated
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 2,
    shortDescription: {
      vi: "bật/tắt chỉ admin sử dụng bot",
      en: "turn on/off only admin can use bot"
    },
    longDescription: {
      vi: "bật/tắt chế độ chỉ admin mới có thể sử dụng bot",
      en: "turn on/off only admin can use bot"
    },
    category: "owner",
    guide: {
      en: "{pn} [on | off] → enable/disable admin-only mode\n{pn} noti [on | off] → show/hide warning to non-admin users"
    }
  },

  langs: {
    en: {
      turnedOn: "✅ Only admin can use the bot now!",
      turnedOff: "✅ Anyone can use the bot now!",
      turnedOnNoti: "🔔 Warning message will be shown to non-admins.",
      turnedOffNoti: "🔕 Warning message will be hidden for non-admins.",
      syntaxError: "❌ Invalid command format. Use: on/off or noti on/off."
    }
  },

  onStart: function ({ args, message, getLang }) {
    let isSetNoti = false;
    let value;
    let index = 0;

    // 🔄 Check if setting notification toggle
    if (args[0] === "noti") {
      isSetNoti = true;
      index = 1;
    }

    const val = args[index]?.toLowerCase();
    if (val === "on") value = true;
    else if (val === "off") value = false;
    else return message.reply(getLang("syntaxError"));

    // ✅ Update config values
    try {
      if (isSetNoti) {
        config.hideNotiMessage.adminOnly = !value;
        message.reply(getLang(value ? "turnedOnNoti" : "turnedOffNoti"));
      } else {
        config.adminOnly.enable = value;
        message.reply(getLang(value ? "turnedOn" : "turnedOff"));
      }

      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));
    } catch (err) {
      message.reply("❌ Config update e problem hoise:\n" + err.message);
    }
  }
};
