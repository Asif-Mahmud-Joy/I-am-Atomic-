module.exports = {
  config: {
    name: "resend",
    version: "5.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 1,
    role: 2,
    shortDescription: {
      en: "Enable/Disable Anti-Unsend mode"
    },
    longDescription: {
      en: "Prevents users from unsending messages. Works with audio, video, and images."
    },
    category: "Admins",
    guide: {
      en: "{pn} on | off\nEx: {pn} on"
    },
    envConfig: {
      deltaNext: 5
    }
  },

  onStart: async function ({ api, message, event, threadsData, args }) {
    const mode = args[0]?.toLowerCase();
    if (!mode || !["on", "off"].includes(mode))
      return message.reply("❌ Please use: {pn} on | off");

    const enable = mode === "on";
    await threadsData.set(event.threadID, enable, "settings.reSend");

    if (enable) {
      if (!global.reSend) global.reSend = {};
      global.reSend[event.threadID] = await api.getThreadHistory(event.threadID, 100, undefined);
      message.reply("✅ Anti-Unsend mode is now ON.");
    } else {
      if (global.reSend && global.reSend[event.threadID]) delete global.reSend[event.threadID];
      message.reply("❌ Anti-Unsend mode is now OFF.");
    }
  },

  onChat: async function ({ api, threadsData, event }) {
    if (event.type !== "message_unsend") return;

    const isEnabled = await threadsData.get(event.threadID, "settings.reSend");
    if (!isEnabled) return;

    const threadData = global.reSend?.[event.threadID];
    if (!threadData) return;

    const unsentMsg = threadData.find(msg => msg.messageID === event.messageID);
    if (!unsentMsg) return;

    let resendContent = "⚠️ Someone unsent a message but I recovered it!\n";
    if (unsentMsg.body) resendContent += `💬 Message: ${unsentMsg.body}`;
    else resendContent += "📎 Attachment or unknown message content.";

    api.sendMessage(resendContent, event.threadID);
  }
};
