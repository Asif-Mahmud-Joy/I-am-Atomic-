const fs = require("fs-extra");
const { config } = global.GoatBot;
const { client } = global;

module.exports = {
  config: {
    name: "adminonly",
    aliases: ["quantumlock", "atomiclock", "admincore"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 2,
    shortDescription: {
      en: "⚛️ Quantum Admin Lock"
    },
    longDescription: {
      en: "Control quantum access protocols for admin-only commands"
    },
    category: "⚡ System Control",
    guide: {
      en: "{pn} [on|off] → Toggle quantum admin lock\n"
        + "{pn} noti [on|off] → Configure quantum alert system"
    }
  },

  langs: {
    en: {
      turnedOn: "✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐋𝐎𝐂𝐊 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nOnly quantum admins can access the system",
      turnedOff: "⚡ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐋𝐎𝐂𝐊 𝐃𝐄𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nUniversal access restored",
      turnedOnNoti: "🔔 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐄𝐍𝐀𝐁𝐋𝐄𝐃\nNon-admin intrusions will trigger quantum alerts",
      turnedOffNoti: "🔕 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃\nStealth mode activated",
      syntaxError: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐒𝐘𝐍𝐓𝐀𝐗 𝐄𝐑𝐑𝐎𝐑\nUse: on/off or noti on/off"
    }
  },

  onStart: async function ({ message, event, args, getLang }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐋𝐎𝐂𝐊 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "🔒", "🔓", "🔔", "🔕"]
    };
    // ================================================================================== //

    const formatResponse = (content) => {
      return [
        design.header,
        design.separator,
        content,
        design.separator,
        design.footer
      ].join("\n");
    };

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      let isSetNoti = false;
      let value;
      let index = 0;

      // Quantum command parsing
      if (args[0] === "noti") {
        isSetNoti = true;
        index = 1;
      }

      const action = args[index]?.toLowerCase();
      
      if (action === "on") {
        value = true;
      } else if (action === "off") {
        value = false;
      } else {
        return message.reply(formatResponse(getLang("syntaxError")));
      }

      // Update quantum security protocols
      if (isSetNoti) {
        config.hideNotiMessage.adminOnly = !value;
        message.reply(formatResponse(value ? getLang("turnedOnNoti") : getLang("turnedOffNoti")));
      } else {
        config.adminOnly.enable = value;
        message.reply(formatResponse(value ? getLang("turnedOn") : getLang("turnedOff")));
      }

      // Save quantum configuration
      fs.writeFileSync(client.dirConfig, JSON.stringify(config, null, 2));

    } catch (error) {
      console.error("Quantum Lock Error:", error);
      message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
