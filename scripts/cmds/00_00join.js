const sleep = ms => new Promise(res => setTimeout(res, ms));

async function smoothTyping(api, threadID, duration = 2500, interval = 600) {
  const start = Date.now();
  while (Date.now() - start < duration) {
    try {
      await api.sendTyping(threadID);
    } catch (e) {
      // ignore errors
    }
    await sleep(interval);
  }
}

function getPageIndicator(current, total) {
  let str = "";
  for (let i = 1; i <= total; i++) {
    str += i === current ? "💖[" + i + "]💖 " : "[" + i + "] ";
  }
  return str.trim();
}

module.exports = {
  config: {
    name: "join24",
    version: "3.3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: "Join group via bot",
    longDescription: "Browse and join groups the bot is in. Romantic UI + pagination + ❤️ vibe!",
    category: "user",
    guide: { en: "{p}join24" }
  },

  onStart: async function ({ api, event }) {
    try {
      // পারমিশন চেক (bot group এর admin কিনা)
      const botID = api.getCurrentUserID ? api.getCurrentUserID() : null;
      if (!botID) return api.sendMessage("❌ Bot ID পাওয়া যায়নি।", event.threadID);

      const groups = await api.getThreadList(100, null, ["INBOX"]);
      const groupList = groups.filter(g => g.isGroup && g.threadName && g.threadID !== event.threadID);

      if (groupList.length === 0)
        return api.sendMessage("😔 Jaan... ekhono kono onno group e jete parbo na. Ami sudhu tomar jonno ekhanei. 💌", event.threadID);

      // পারমিশন চেক - bot কি ওই গ্রুপে admin?
      const filteredList = [];
      for (const g of groupList) {
        try {
          const info = await api.getThreadInfo(g.threadID);
          if (info.adminIDs && info.adminIDs.some(adm => adm.id === botID)) filteredList.push(g);
        } catch {
          // ignore error, skip group
        }
      }

      if (filteredList.length === 0)
        return api.sendMessage("❌ Sorry jaan, bot kisu group e admin na. Tai join korte parbe na.", event.threadID);

      const pageSize = 7;
      const page = 1;
      const totalPages = Math.ceil(filteredList.length / pageSize);
      const pageList = filteredList.slice(0, pageSize);

      await smoothTyping(api, event.threadID, 2500);

      const formattedList = pageList.map((g, i) =>
        `💘 Group ${i + 1}: ${g.threadName}\n🔐 ID: ${g.threadID}\n💫 ───────────────────────────`
      ).join("\n");

      const msg = `╭💞───[ 𝐋𝐎𝐕𝐄 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 ]───💞╮\n` +
        formattedList + `\n` +
        `╰💘────────────────────────────╯\n\n` +
        `🌹 Just reply the number to join.\n` +
        `➡️ 'next' | ⬅️ 'prev' | 🔍 'search <name>'\n` +
        `\n💌 Page ${page}/${totalPages} • ${getPageIndicator(page, totalPages)}\n❤️ Bot only for you jaan...`;

      const sentMessage = await api.sendMessage(msg, event.threadID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        commandName: this.config.name,
        messageID: sentMessage.messageID,
        author: event.senderID,
        groupList: filteredList,
        pageSize,
        page
      });
    } catch (err) {
      console.error("💔 Error fetching group list:", err);
      api.sendMessage("❌ Sorry jaan, kichu ekta bhul hoye geche. Pore try koro na please?", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    let input = event.body.trim().toLowerCase();
    const totalPages = Math.ceil(Reply.groupList.length / Reply.pageSize);
    let page = Reply.page;

    if (input === "next") {
      page = page >= totalPages ? 1 : page + 1;
    } else if (input === "prev") {
      page = page <= 1 ? totalPages : page - 1;
    } else if (input.startsWith("search ")) {
      const searchTerm = input.slice(7).trim();
      if (!searchTerm)
        return api.sendMessage("🔍 Search korte kichu likho jaan...", event.threadID);

      const filtered = Reply.groupList.filter(g =>
        g.threadName.toLowerCase().includes(searchTerm)
      );

      if (filtered.length === 0)
        return api.sendMessage("❌ Kono group name paoa jay na oi naam diye...", event.threadID);

      // Search result pagination reset
      page = 1;

      const totalPagesSearch = Math.ceil(filtered.length / Reply.pageSize);
      const pageList = filtered.slice(0, Reply.pageSize);
      const formattedList = pageList.map((g, i) =>
        `💘 Group ${i + 1}: ${g.threadName}\n🔐 ID: ${g.threadID}\n💫 ───────────────────────────`
      ).join("\n");

      const msg = `╭💞───[ 𝐒𝐄𝐀𝐑𝐂𝐇 𝐑𝐄𝐒𝐔𝐋𝐓𝐒 ]───💞╮\n` +
        formattedList + `\n` +
        `╰💘────────────────────────────╯\n\n` +
        `🌹 Just reply the number to join.\n` +
        `➡️ 'next' | ⬅️ 'prev'\n` +
        `\n💌 Page ${page}/${totalPagesSearch} • ${getPageIndicator(page, totalPagesSearch)}\n❤️ Bot only for you jaan...`;

      const sentMessage = await api.sendMessage(msg, event.threadID);
      global.GoatBot.onReply.set(sentMessage.messageID, {
        ...Reply,
        messageID: sentMessage.messageID,
        groupList: filtered,
        page,
        totalPages: totalPagesSearch
      });
      return;
    } else if (!isNaN(input)) {
      const index = (page - 1) * Reply.pageSize + (parseInt(input) - 1);
      const group = Reply.groupList[index];

      if (!group) return api.sendMessage("😥 Bhul number diyacho jaan. Ar ektu mon diye dekho na. 🥺", event.threadID);

      try {
        await api.addUserToGroup(event.senderID, group.threadID);
        return api.sendMessage(`💞 Tumake group e invite kora holo: ${group.threadName} 🎉`, event.threadID);
      } catch (err) {
        return api.sendMessage("😔 Bot e admin permission nai jaan... tai add korte parlam na. 💔", event.threadID);
      }
    } else {
      return api.sendMessage("❓ Bhul input... sudhu number ba next/prev/search reply koro jaan 😇", event.threadID);
    }

    // Normal pagination render
    const start = (page - 1) * Reply.pageSize;
    const end = start + Reply.pageSize;
    const pageList = Reply.groupList.slice(start, end);

    const formattedList = pageList.map((g, i) =>
      `💘 Group ${i + 1}: ${g.threadName}\n🔐 ID: ${g.threadID}\n💫 ───────────────────────────`
    ).join("\n");

    const msg = `╭💞───[ 𝐋𝐎𝐕𝐄 𝐆𝐑𝐎𝐔𝐏 𝐋𝐈𝐒𝐓 ]───💞╮\n` +
      formattedList + `\n` +
      `╰💘────────────────────────────╯\n\n` +
      `🌹 Just reply the number to join.\n` +
      `➡️ 'next' | ⬅️ 'prev' | 🔍 'search <name>'\n` +
      `\n💌 Page ${page}/${totalPages} • ${getPageIndicator(page, totalPages)}\n❤️ Bot only for you jaan...`;

    const sentMessage = await api.sendMessage(msg, event.threadID);
    global.GoatBot.onReply.set(sentMessage.messageID, {
      ...Reply,
      page,
      messageID: sentMessage.messageID
    });
  }
};
