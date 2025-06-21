function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  config: {
    name: "filteruser",
    version: "3.0",
    author: "☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛️",
    countDown: 3,
    role: 1,
    shortDescription: "⚡ Filter inactive or blocked group members",
    longDescription: "🛡️ Remove members by message count or blocked accounts",
    category: "👑 Owner",
    guide: {
      en: "▸ {pn} <min_messages> → Filter by activity\n▸ {pn} die → Remove blocked accounts"
    }
  },

  langs: {
    en: {
      needAdmin: "☢️ 𝗘𝗥𝗥𝗢𝗥: Bot needs admin rights to perform this action",
      confirm: "⚠️ 𝗖𝗢𝗡𝗙𝗜𝗥𝗠𝗔𝗧𝗜𝗢𝗡 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ Remove members with less than %1 messages?\n▸ React ✅ to confirm removal",
      kickByBlock: "✅ 𝗦𝗨𝗖𝗖𝗘𝗦𝗦𝗙𝗨𝗟 𝗣𝗨𝗥𝗚𝗘\n\n▸ Removed %1 blocked accounts\n▸ Group integrity enhanced",
      kickByMsg: "⚡ 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬 𝗙𝗜𝗟𝗧𝗘𝗥\n\n▸ Removed %1 inactive members\n▸ Minimum messages: %2",
      kickError: "☢️ 𝗣𝗔𝗥𝗧𝗜𝗔𝗟 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to remove %1 members:\n%2",
      noBlock: "🛡️ 𝗦𝗘𝗖𝗨𝗥𝗜𝗧𝗬 𝗦𝗖𝗔𝗡\n\n▸ No blocked accounts found\n▸ Group is secure",
      noMsg: "📊 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬 𝗥𝗘𝗣𝗢𝗥𝗧\n\n▸ All members meet %1+ messages\n▸ No removal needed",
      processing: "⚙️ 𝗣𝗥𝗢𝗖𝗘𝗦𝗦𝗜𝗡𝗚\n\n▸ Scanning group members...",
      successFooter: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗙𝗶𝗹𝘁𝗲𝗿 𝗦𝘆𝘀𝘁𝗲𝗺"
    }
  },

  onStart: async function ({ api, args, threadsData, message, event, getLang }) {
    const ATOMIC = {
      HEADER: "☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗨𝗦𝗘𝗥 𝗙𝗜𝗟𝗧𝗘𝗥 ⚛️",
      DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
      FOOTER: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗦𝘆𝘀𝘁𝗲𝗺"
    };

    const formatMessage = (content) => {
      return `${ATOMIC.HEADER}\n${ATOMIC.DIVIDER}\n${content}\n${ATOMIC.DIVIDER}\n${getLang('successFooter')}`;
    };

    const threadData = await threadsData.get(event.threadID);
    if (!threadData.adminIDs.includes(api.getCurrentUserID())) {
      return message.reply(formatMessage(getLang('needAdmin')));
    }

    if (!isNaN(args[0])) {
      message.reply(formatMessage(getLang('confirm', args[0])), (err, info) => {
        global.GoatBot.onReaction.set(info.messageID, {
          author: event.senderID,
          messageID: info.messageID,
          minimum: Number(args[0]),
          commandName: this.config.name
        });
      });
    }
    else if (args[0] === "die") {
      message.reply(formatMessage(getLang('processing')));
      
      const threadInfo = await api.getThreadInfo(event.threadID);
      const blockedAccounts = threadInfo.userInfo.filter(user => 
        user.type !== "User" && 
        !threadInfo.adminIDs.some(id => id == user.id)
      );
      
      if (blockedAccounts.length === 0) {
        return message.reply(formatMessage(getLang('noBlock')));
      }

      const results = { success: 0, errors: [] };
      for (const user of blockedAccounts) {
        try {
          await api.removeUserFromGroup(user.id, event.threadID);
          results.success++;
        }
        catch (e) {
          results.errors.push(user.name);
        }
        await sleep(500);
      }

      let response = getLang('kickByBlock', results.success);
      if (results.errors.length > 0) {
        response += `\n\n${getLang('kickError', results.errors.length, results.errors.slice(0, 5).join("\n"))}`;
        if (results.errors.length > 5) response += `\n...and ${results.errors.length - 5} more`;
      }
      
      message.reply(formatMessage(response));
    }
    else {
      message.reply(
        `${ATOMIC.HEADER}\n${ATOMIC.DIVIDER}\n` +
        "⚡ 𝗨𝗦𝗔𝗚𝗘 𝗚𝗨𝗜𝗗𝗘:\n" +
        "▸ filteruser <min_messages> → Remove inactive members\n" +
        "▸ filteruser die → Purge blocked accounts\n" +
        `${ATOMIC.DIVIDER}\n${ATOMIC.FOOTER}`
      );
    }
  },

  onReaction: async function ({ api, Reaction, event, threadsData, message, getLang }) {
    const ATOMIC = {
      HEADER: "⚡ 𝗔𝗖𝗧𝗜𝗩𝗜𝗧𝗬 𝗙𝗜𝗟𝗧𝗘𝗥 𝗔𝗖𝗧𝗜𝗩𝗔𝗧𝗘𝗗 ⚛️",
      DIVIDER: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
      FOOTER: "⚡ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘁𝗼𝗺𝗶𝗰 𝗣𝘂𝗿𝗴𝗲 𝗦𝘆𝘀𝘁𝗲𝗺"
    };

    const formatMessage = (content) => {
      return `${ATOMIC.HEADER}\n${ATOMIC.DIVIDER}\n${content}\n${ATOMIC.DIVIDER}\n${getLang('successFooter')}`;
    };

    const { minimum = 1, author } = Reaction;
    if (event.userID !== author) return;

    message.reply(formatMessage("🔍 Scanning group activity..."));
    
    const threadData = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();
    const targets = threadData.members.filter(member => 
      member.count < minimum &&
      member.inGroup &&
      member.userID !== botID &&
      !threadData.adminIDs.includes(member.userID)
    );
    
    if (targets.length === 0) {
      return message.reply(formatMessage(getLang('noMsg', minimum)));
    }

    const results = { success: 0, errors: [] };
    for (const member of targets) {
      try {
        await api.removeUserFromGroup(member.userID, event.threadID);
        results.success++;
      }
      catch (e) {
        results.errors.push(member.name);
      }
      await sleep(500);
    }

    let response = getLang('kickByMsg', results.success, minimum);
    if (results.errors.length > 0) {
      response += `\n\n${getLang('kickError', results.errors.length, results.errors.slice(0, 5).join("\n"))}`;
      if (results.errors.length > 5) response += `\n...and ${results.errors.length - 5} more`;
    }
    
    message.reply(formatMessage(response));
  }
};
