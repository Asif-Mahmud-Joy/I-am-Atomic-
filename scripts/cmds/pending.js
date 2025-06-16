module.exports = {
  config: {
    name: "pending",
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Approve/cancel pending groups",
      bn: "Pending group approve/cancel korun"
    },
    longDescription: {
      en: "View and approve/cancel pending groups from bot inbox list.",
      bn: "Bot-er inbox e thaka pending group gulo approve/cancel korar jonno."
    },
    category: "system"
  },

  langs: {
    en: {
      invaildNumber: "%1 is not a valid number",
      cancelSuccess: "❌ Refused %1 thread(s)!",
      approveSuccess: "✅ Approved %1 thread(s)!",
      cantGetPendingList: "❗ Unable to fetch pending list.",
      returnListPending: "📥 Total pending threads: %1\n\n%2",
      returnListClean: "🎉 No threads in pending list."
    },
    bn: {
      invaildNumber: "%1 valid number na",
      cancelSuccess: "❌ %1 ta thread refuse kora hoise!",
      approveSuccess: "✅ %1 ta thread approve kora hoise!",
      cantGetPendingList: "❗ Pending list ana jachchhe na.",
      returnListPending: "📥 Mot pending thread: %1\n\n%2",
      returnListClean: "🎉 Pending list e kono group nai."
    }
  },

  onReply: async function ({ api, event, Reply, getLang }) {
    if (String(event.senderID) !== String(Reply.author)) return;
    const { body, threadID, messageID } = event;
    let count = 0;

    const cancelAction = body.toLowerCase().startsWith("c") || body.toLowerCase().startsWith("cancel");
    const indexes = (cancelAction ? body.slice(1) : body).split(/\s+/);

    for (const idx of indexes) {
      if (isNaN(idx) || idx <= 0 || idx > Reply.pending.length) {
        return api.sendMessage(getLang("invaildNumber", idx), threadID, messageID);
      }

      const thread = Reply.pending[parseInt(idx) - 1];
      if (cancelAction) {
        await api.removeUserFromGroup(api.getCurrentUserID(), thread.threadID);
      } else {
        await api.sendMessage(`✅ Group connected successfully!\n🔹 Group Name: ${thread.name}`, thread.threadID);
      }
      count++;
    }

    return api.sendMessage(getLang(cancelAction ? "cancelSuccess" : "approveSuccess", count), threadID, messageID);
  },

  onStart: async function ({ api, event, getLang, commandName }) {
    const { threadID, messageID } = event;
    let msg = "", index = 1;

    try {
      const spam = await api.getThreadList(100, null, ["OTHER"]);
      const pending = await api.getThreadList(100, null, ["PENDING"]);
      const list = [...spam, ...pending].filter(g => g.isSubscribed && g.isGroup);

      for (const thread of list) {
        msg += `${index++}. ${thread.name} (${thread.threadID})\n`;
      }

      if (list.length === 0) return api.sendMessage(getLang("returnListClean"), threadID, messageID);

      return api.sendMessage(getLang("returnListPending", list.length, msg), threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          pending: list
        });
      }, messageID);

    } catch (err) {
      console.error("[PENDING ERROR]", err);
      return api.sendMessage(getLang("cantGetPendingList"), threadID, messageID);
    }
  }
};
