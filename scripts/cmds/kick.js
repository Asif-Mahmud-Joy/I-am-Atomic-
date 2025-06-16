module.exports = {
  config: {
    name: "kick",
    version: "1.3",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 1,
    shortDescription: {
      vi: "Kick thành viên",
      en: "Kick member"
    },
    longDescription: {
      vi: "Kick thành viên khỏi box chat",
      en: "Kick member out of chat box"
    },
    category: "box chat",
    guide: {
      vi: "{pn} @tags: dùng để kick những người được tag\n{pn} reply: kick người trong tin nhắn reply",
      en: "{pn} @tags: use to kick members who are tagged\n{pn} reply: kick the person in replied message"
    }
  },

  langs: {
    vi: {
      needAdmin: "⚠️ Vui lòng thêm bot làm quản trị viên trước.",
      notTagged: "⚠️ Bạn chưa tag ai để kick.",
      noReply: "⚠️ Vui lòng reply tin nhắn người cần kick."
    },
    en: {
      needAdmin: "⚠️ Please add admin rights to the bot first.",
      notTagged: "⚠️ You didn't tag anyone to kick.",
      noReply: "⚠️ Please reply to a user's message to kick."
    }
  },

  onStart: async function ({ message, event, args, threadsData, api, getLang }) {
    const botID = api.getCurrentUserID();
    const adminIDs = await threadsData.get(event.threadID, "adminIDs");

    if (!adminIDs.includes(botID))
      return message.reply(getLang("needAdmin"));

    async function kick(uid) {
      try {
        await api.removeUserFromGroup(uid, event.threadID);
      } catch (err) {
        return message.reply(`⚠️ Failed to kick UID: ${uid}\n${err.message}`);
      }
    }

    if (args.length === 0 && !event.messageReply)
      return message.reply(getLang("notTagged") + "\n" + getLang("noReply"));

    // Kick from reply
    if (args.length === 0 && event.messageReply) {
      return kick(event.messageReply.senderID);
    }

    // Kick from tag list
    const mentionIDs = Object.keys(event.mentions);
    if (mentionIDs.length === 0)
      return message.reply(getLang("notTagged"));

    for (const uid of mentionIDs) {
      await kick(uid);
    }
  }
};
