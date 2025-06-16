module.exports = {
  config: {
    name: "antiout",
    version: "2.0", // ✅ Updated
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 ",
    countDown: 5,
    role: 0,
    shortDescription: "Enable or disable anti-out protection",
    longDescription: "Auto add back user if they leave the chat.",
    category: "boxchat",
    guide: "{pn} on/off",
    envConfig: {}
  },

  onStart: async function({ message, event, threadsData, args }) {
    const threadID = event.threadID;
    let antiout = await threadsData.get(threadID, "settings.antiout");

    if (antiout === undefined) {
      await threadsData.set(threadID, false, "settings.antiout");
      antiout = false;
    }

    if (!args[0] || !["on", "off"].includes(args[0])) {
      return message.reply("🔧 Use `{pn} on` to enable or `{pn} off` to disable antiout feature.");
    }

    const newStatus = args[0] === "on";
    await threadsData.set(threadID, newStatus, "settings.antiout");
    return message.reply(`✅ Antiout feature is now ${newStatus ? "enabled" : "disabled"}.`);
  },

  onEvent: async function({ api, event, threadsData }) {
    const threadID = event.threadID;
    const antiout = await threadsData.get(threadID, "settings.antiout");

    if (!antiout) return;

    if (
      event.logMessageType === "log:unsubscribe" &&
      event.logMessageData?.leftParticipantFbId &&
      event.logMessageData.leftParticipantFbId !== api.getCurrentUserID()
    ) {
      const userID = event.logMessageData.leftParticipantFbId;

      try {
        const threadInfo = await api.getThreadInfo(threadID);
        const isStillInGroup = threadInfo.participantIDs.includes(userID);

        if (!isStillInGroup) {
          await api.addUserToGroup(userID, threadID);
          api.sendMessage(`😼 User ${userID} left and has been auto-added back to the chat.`, threadID);
        }
      } catch (err) {
        console.log("❌ Failed to re-add user:", err.message);
      }
    }
  }
};
