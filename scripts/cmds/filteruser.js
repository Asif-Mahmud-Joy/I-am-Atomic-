function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  config: {
    name: "filteruser",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 1,
    shortDescription: {
      vi: "lọc thành viên nhóm",
      en: "filter group members"
    },
    longDescription: {
      vi: "lọc thành viên nhóm theo số tin nhắn hoặc bị khóa acc",
      en: "filter group members by number of messages or locked account"
    },
    category: "box chat",
    guide: {
      vi: "   {pn} [<số tin nhắn> | die]",
      en: "   {pn} [<number of messages> | die]"
    }
  },

  langs: {
    en: {
      needAdmin: "⚠️ | Please make the bot admin to use this command",
      confirm: "⚠️ | Are you sure you want to remove members with less than %1 messages? React to confirm.",
      kickByBlock: "✅ | Removed %1 locked account(s)",
      kickByMsg: "✅ | Removed %1 members with less than %2 messages",
      kickError: "❌ | Failed to kick %1 members:\n%2",
      noBlock: "✅ | No locked members found",
      noMsg: "✅ | No members with less than %1 messages"
    },
    bn: {
      needAdmin: "⚠️ | এই কমান্ড চালানোর জন্য বটকে গ্রুপ অ্যাডমিন করতে হবে",
      confirm: "⚠️ | %1 টার চেয়ে কম মেসেজ যাদের, তাদের রিমুভ করতে চান? কনফার্ম করতে রিয়াক্ট দিন",
      kickByBlock: "✅ | %1 জন লকড ইউজারকে রিমুভ করা হয়েছে",
      kickByMsg: "✅ | %1 জন ইউজারকে রিমুভ করা হয়েছে যাদের মেসেজ %2 এর কম",
      kickError: "❌ | %1 জনকে রিমুভ করতে সমস্যা হয়েছে:\n%2",
      noBlock: "✅ | কোনো লকড ইউজার পাওয়া যায়নি",
      noMsg: "✅ | %1 টার কম মেসেজের ইউজার পাওয়া যায়নি"
    }
  },

  onStart: async function ({ api, args, threadsData, message, event, commandName, getLang }) {
    const threadData = await threadsData.get(event.threadID);
    if (!threadData.adminIDs.includes(api.getCurrentUserID()))
      return message.reply(getLang("needAdmin"));

    if (!isNaN(args[0])) {
      message.reply(getLang("confirm", args[0]), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          author: event.senderID,
          messageID: info.messageID,
          minimum: Number(args[0]),
          commandName
        });
      });
    } else if (args[0] === "die") {
      const info = await api.getThreadInfo(event.threadID);
      const blocked = info.userInfo.filter(user => user.type !== "User");
      const errors = [], success = [];
      for (const user of blocked) {
        if (!info.adminIDs.includes(user.id)) {
          try {
            await api.removeUserFromGroup(user.id, event.threadID);
            success.push(user.id);
          } catch (e) {
            errors.push(user.name);
          }
          await sleep(700);
        }
      }

      let msg = success.length ? getLang("kickByBlock", success.length) + "\n" : getLang("noBlock") + "\n";
      if (errors.length)
        msg += getLang("kickError", errors.length, errors.join("\n"));
      message.reply(msg.trim());
    } else message.SyntaxError();
  },

  onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
    const { minimum = 1, author } = Reaction;
    if (event.userID !== author) return;

    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();
    const targets = threadData.members.filter(m => m.count < minimum && m.inGroup && m.userID !== botID && !threadData.adminIDs.includes(m.userID));

    const errors = [], success = [];
    for (const member of targets) {
      try {
        await api.removeUserFromGroup(member.userID, event.threadID);
        success.push(member.userID);
      } catch (e) {
        errors.push(member.name);
      }
      await sleep(700);
    }

    let msg = success.length ? getLang("kickByMsg", success.length, minimum) + "\n" : getLang("noMsg", minimum) + "\n";
    if (errors.length)
      msg += getLang("kickError", errors.length, errors.join("\n"));
    message.reply(msg.trim());
  }
};
