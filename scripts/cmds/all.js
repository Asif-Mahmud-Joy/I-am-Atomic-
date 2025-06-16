module.exports = {
  config: {
    name: "all",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 1,
    description: {
      vi: "Tag tất cả thành viên trong nhóm chat của bạn",
      en: "Tag all members in your group chat"
    },
    category: "box chat",
    guide: {
      vi: "{pn} [nội dung | để trống]",
      en: "{pn} [content | empty]"
    }
  },

  onStart: async function ({ message, event, args, api }) {
    const threadID = event.threadID;
    const messageID = event.messageID;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const participantIDs = threadInfo.participantIDs || [];

      if (participantIDs.length === 0) {
        return message.reply("⚠️ Group e kono member nai tag korar jonne.");
      }

      const mentions = [];
      let body = args.join(" ") || "@all";

      for (const uid of participantIDs) {
        mentions.push({ tag: "@all", id: uid });
      }

      message.reply({ body, mentions });

    } catch (err) {
      message.reply("❌ Somossa hoise tag korar somoy: " + err.message);
    }
  }
};
