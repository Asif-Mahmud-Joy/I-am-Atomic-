module.exports = {
  config: {
    name: "count",
    version: "1.4",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem số lượng tin nhắn của thành viên (tính từ lúc bot vào nhóm)",
      en: "Check how many messages each member sent (since bot joined group)",
      bn: "Group e kotogula message pathaise ta dekha jai"
    },
    category: "box chat",
    guide: {
      vi: "   {pn}: xem tin nhắn của bạn\n   {pn} @tag: xem tin nhắn người được tag\n   {pn} all: xem tin nhắn mọi người",
      en: "   {pn}: see your messages\n   {pn} @tag: see tagged users\n   {pn} all: see all members",
      bn: "   {pn}: nijer message dekho\n   {pn} @tag: tag kora member er dekho\n   {pn} all: shobar dekho"
    }
  },

  langs: {
    en: {
      count: "Message count of group members:",
      endMessage: "Names not shown = 0 messages",
      page: "Page [%1/%2]",
      reply: "Reply with page number to see more",
      result: "%1 rank %2 with %3 messages",
      yourResult: "You're ranked %1 and sent %2 messages in this group",
      invalidPage: "Invalid page number"
    },
    bn: {
      count: "Group member der message count:",
      endMessage: "Jar naam nai tar message nai",
      page: "Page [%1/%2]",
      reply: "Reply dao page number diye aro dekhte",
      result: "%1 %2 position e ache with %3 message",
      yourResult: "Tumi %1 position e acho with %2 message",
      invalidPage: "Thik page number dao"
    }
  },

  onStart: async function ({ args, threadsData, message, event, api, commandName, getLang }) {
    const { threadID, senderID } = event;
    const threadData = await threadsData.get(threadID);
    const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
    let members = threadData.members || [];

    const list = members
      .filter(m => usersInGroup.includes(m.userID))
      .map((m, index) => ({
        name: m.name,
        count: m.count || 0,
        uid: m.userID,
        stt: 0
      }));

    list.sort((a, b) => b.count - a.count);
    list.forEach((user, i) => user.stt = i + 1);

    const lang = getLang();
    const getUser = uid => list.find(user => user.uid == uid);

    if (args[0]) {
      if (args[0].toLowerCase() == "all") {
        const allPages = global.utils.splitPage(list, 50);
        let page = parseInt(args[1]) || 1;
        if (page < 1 || page > allPages.totalPage) return message.reply(lang.invalidPage);
        let msg = lang.count;
        allPages.allPage[page - 1].forEach(u => {
          if (u.count > 0) msg += `\n${u.stt}/ ${u.name}: ${u.count}`;
        });
        msg += `\n${lang.page.replace('%1', page).replace('%2', allPages.totalPage)}`;
        msg += `\n${lang.reply}\n\n${lang.endMessage}`;
        return message.reply(msg, (err, info) => {
          if (!err) global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            splitPage: allPages,
            author: senderID
          });
        });
      } else if (event.mentions) {
        let msg = "";
        for (const id in event.mentions) {
          const u = getUser(id);
          if (u) msg += `\n${lang.result.replace('%1', u.name).replace('%2', u.stt).replace('%3', u.count)}`;
        }
        return message.reply(msg || lang.endMessage);
      }
    }

    const u = getUser(senderID);
    return message.reply(lang.yourResult.replace('%1', u.stt).replace('%2', u.count));
  },

  onReply: ({ message, event, Reply, commandName, getLang }) => {
    const { senderID, body } = event;
    const { author, splitPage } = Reply;
    if (author != senderID) return;

    const page = parseInt(body);
    if (isNaN(page) || page < 1 || page > splitPage.totalPage) return message.reply(getLang("invalidPage"));

    let msg = getLang("count");
    splitPage.allPage[page - 1].forEach(u => {
      if (u.count > 0) msg += `\n${u.stt}/ ${u.name}: ${u.count}`;
    });
    msg += `\n${getLang("page", page, splitPage.totalPage)}\n${getLang("reply")}\n\n${getLang("endMessage")}`;

    message.reply(msg, (err, info) => {
      if (!err) {
        message.unsend(Reply.messageID);
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          splitPage,
          author: senderID
        });
      }
    });
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    let members = await threadsData.get(threadID, "members") || [];
    const index = members.findIndex(u => u.userID == senderID);

    if (index === -1) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        nickname: null,
        inGroup: true,
        count: 1
      });
    } else {
      members[index].count = (members[index].count || 0) + 1;
    }

    await threadsData.set(threadID, members, "members");
  }
};
