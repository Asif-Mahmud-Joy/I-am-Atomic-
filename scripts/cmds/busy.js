if (!global.client.busyList)
  global.client.busyList = {};

module.exports = {
  config: {
    name: "busy",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      vi: "bật chế độ không làm phiền, khi bạn được tag bot sẽ thông báo",
      en: "turn on do not disturb mode, when you are tagged bot will notify"
    },
    category: "box chat",
    guide: {
      vi: "   {pn} [để trống | <lý do>]: bật chế độ không làm phiền"
        + "\n   {pn} off: tắt chế độ không làm phiền",
      en: "   {pn} [empty | <reason>]: turn on do not disturb mode"
        + "\n   {pn} off: turn off do not disturb mode"
    }
  },

  langs: {
    vi: {
      turnedOff: "✅ | Đã tắt chế độ không làm phiền",
      turnedOn: "✅ | Đã bật chế độ không làm phiền",
      turnedOnWithReason: "✅ | Đã bật chế độ không làm phiền với lý do: %1",
      turnedOnWithoutReason: "✅ | Đã bật chế độ không làm phiền",
      alreadyOn: "Hiện tại người dùng %1 đang bận",
      alreadyOnWithReason: "Hiện tại người dùng %1 đang bận với lý do: %2"
    },
    en: {
      turnedOff: "✅ | Do not disturb mode has been turned off",
      turnedOn: "✅ | Do not disturb mode has been turned on",
      turnedOnWithReason: "✅ | Do not disturb mode has been turned on with reason: %1",
      turnedOnWithoutReason: "✅ | Do not disturb mode has been turned on",
      alreadyOn: "User %1 is currently busy",
      alreadyOnWithReason: "User %1 is currently busy with reason: %2"
    },
    bn: {
      turnedOff: "✅ | ব্যস্ত মোড বন্ধ করা হয়েছে",
      turnedOn: "✅ | ব্যস্ত মোড চালু করা হয়েছে",
      turnedOnWithReason: "✅ | ব্যস্ত মোড চালু করা হয়েছে এই কারণে: %1",
      turnedOnWithoutReason: "✅ | ব্যস্ত মোড চালু করা হয়েছে",
      alreadyOn: "ব্যবহারকারী %1 বর্তমানে ব্যস্ত",
      alreadyOnWithReason: "ব্যবহারকারী %1 বর্তমানে ব্যস্ত এই কারণে: %2"
    }
  },

  onStart: async function ({ args, message, event, getLang, usersData }) {
    const { senderID } = event;

    if (args[0]?.toLowerCase() === "off") {
      await usersData.set(senderID, null, "data.busy");
      return message.reply(getLang("turnedOff"));
    }

    const reason = args.join(" ");
    await usersData.set(senderID, reason, "data.busy");
    return message.reply(
      reason
        ? getLang("turnedOnWithReason", reason)
        : getLang("turnedOnWithoutReason")
    );
  },

  onChat: async function ({ event, message, getLang }) {
    const { mentions } = event;

    if (!mentions || Object.keys(mentions).length === 0)
      return;

    for (const userID of Object.keys(mentions)) {
      const user = global.db.allUserData.find(u => u.userID == userID);
      const reason = user?.data?.busy;

      if (reason) {
        return message.reply(
          reason
            ? getLang("alreadyOnWithReason", mentions[userID].replace("@", ""), reason)
            : getLang("alreadyOn", mentions[userID].replace("@", ""))
        );
      }
    }
  }
};
