module.exports = {
  config: {
    name: "onlyadminbox",
    aliases: ["quantumadmin", "atomadmin", "adminlock"],
    version: "2.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 1,
    description: {
      en: "⚛️ Enable/disable quantum admin restrictions"
    },
    category: "⚡ Box Management",
    guide: {
      en: "   {pn} [on | off]: Toggle quantum admin mode\n"
        + "   {pn} noti [on | off]: Toggle quantum notification alerts"
    }
  },

  langs: {
    en: {
      turnedOn: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐌𝐎𝐃𝐄 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nOnly quantum admins can access the system",
      turnedOff: "⚡ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐌𝐎𝐃𝐄 𝐃𝐄𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nUniversal access restored",
      turnedOnNoti: "🔔 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐄𝐍𝐀𝐁𝐋𝐄𝐃\nNon-admin alerts activated",
      turnedOffNoti: "🔕 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃\nNon-admin alerts silenced",
      syntaxError: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐒𝐘𝐍𝐓𝐀𝐗 𝐄𝐑𝐑𝐎𝐑\nUse: {pn} [on/off] or {pn} noti [on/off]"
    },
    bn: {
      turnedOn: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐌𝐎𝐃𝐄 𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nএখন শুধু গ্রুপ অ্যাডমিন বট ব্যবহার করতে পারবেন",
      turnedOff: "⚡ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐌𝐎𝐃𝐄 𝐃𝐄𝐀𝐂𝐓𝐈𝐕𝐀𝐓𝐄𝐃\nসবার জন্য বট ব্যবহারের অনুমতি দেওয়া হলো",
      turnedOnNoti: "🔔 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐄𝐍𝐀𝐁𝐋𝐄𝐃\nঅ্যাডমিন না হলে সতর্কবার্তা দেখানো হবে",
      turnedOffNoti: "🔕 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐋𝐄𝐑𝐓𝐒 𝐃𝐈𝐒𝐀𝐁𝐋𝐄𝐃\nঅ্যাডমিন না হলেও সতর্কবার্তা আসবে না",
      syntaxError: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐒𝐘𝐍𝐓𝐀𝐗 𝐄𝐑𝐑𝐎𝐑\nব্যবহার: {pn} [on/off] অথবা {pn} noti [on/off]"
    }
  },

  onStart: async function ({ args, message, event, threadsData, getLang }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃𝐌𝐈𝐍 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 ⚛️",
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
      let keySetData = "data.onlyAdminBox";
      let indexGetVal = 0;

      if (args[0] === "noti") {
        isSetNoti = true;
        indexGetVal = 1;
        keySetData = "data.hideNotiMessageOnlyAdminBox";
      }

      const action = args[indexGetVal]?.toLowerCase();
      
      if (action === "on") {
        value = true;
      } else if (action === "off") {
        value = false;
      } else {
        return message.reply(formatResponse(getLang("syntaxError")));
      }

      // Set quantum lock state
      await threadsData.set(event.threadID, isSetNoti ? !value : value, keySetData);

      let response;
      if (isSetNoti) {
        response = value ? getLang("turnedOnNoti") : getLang("turnedOffNoti");
      } else {
        response = value ? getLang("turnedOn") : getLang("turnedOff");
      }

      return message.reply(formatResponse(response));

    } catch (error) {
      console.error("Quantum Admin Error:", error);
      return message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
