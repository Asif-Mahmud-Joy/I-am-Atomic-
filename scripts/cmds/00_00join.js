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
    str += i === current ? "☣️" : "⚛️";
  }
  return str;
}

module.exports = {
  config: {
    name: "join24",
    version: "4.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: "Atomic group joining system",
    longDescription: "Premium group navigation with atomic design and animations",
    category: "user",
    guide: { en: "{p}join24" }
  },

  onStart: async function ({ api, event }) {
    try {
      // Atomic UI typing animation
      await smoothTyping(api, event.threadID, 2000);
      
      const botID = api.getCurrentUserID ? api.getCurrentUserID() : null;
      if (!botID) return api.sendMessage("☢️ System Error: Bot ID not detected", event.threadID);

      const groups = await api.getThreadList(100, null, ["INBOX"]);
      const groupList = groups.filter(g => g.isGroup && g.threadName && g.threadID !== event.threadID);

      if (groupList.length === 0) {
        return api.sendMessage("☢️ SYSTEM STATUS: No accessible groups detected ⚛️\n☣️ Only available in your current channel", event.threadID);
      }

      // Check admin permissions
      const filteredList = [];
      for (const g of groupList) {
        try {
          const info = await api.getThreadInfo(g.threadID);
          if (info.adminIDs && info.adminIDs.some(adm => adm.id === botID)) filteredList.push(g);
        } catch {
          // skip group
        }
      }

      if (filteredList.length === 0) {
        return api.sendMessage("☢️ PERMISSION DENIED:\n⚛️ Bot admin privileges required in target groups", event.threadID);
      }

      const pageSize = 5;
      const page = 1;
      const totalPages = Math.ceil(filteredList.length / pageSize);
      const pageList = filteredList.slice(0, pageSize);

      // Atomic UI design
      const formattedList = pageList.map((g, i) => 
        `☣️ ${i + 1}. ${g.threadName}\n⚛️ ID: ${g.threadID}\n☢️ ────────────`
      ).join("\n\n");

      const msg = `☢️ ════ ATOMIC GROUP NAVIGATOR ════ ☢️\n\n` +
        `${formattedList}\n\n` +
        `⚛️ COMMAND OPTIONS:\n` +
        `☣️ [number] - Join group\n` +
        `☢️ next - Next page\n` +
        `⚛️ prev - Previous page\n` +
        `☣️ search [name] - Find group\n\n` +
        `☢️ PAGE: ${page}/${totalPages}\n` +
        `${getPageIndicator(page, totalPages)}\n\n` +
        `⚛️ SYSTEM: v4.0 | ATOMIC CORE`;

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
      console.error("☢️ System Error:", err);
      api.sendMessage("⚛️ SYSTEM FAILURE: Command execution failed\n☣️ Please retry operation", event.threadID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    if (event.senderID !== Reply.author) return;

    // Show typing animation
    await smoothTyping(api, event.threadID, 1500);
    
    let input = event.body.trim().toLowerCase();
    const totalPages = Math.ceil(Reply.groupList.length / Reply.pageSize);
    let page = Reply.page;

    if (input === "next") {
      page = page >= totalPages ? 1 : page + 1;
    } else if (input === "prev") {
      page = page <= 1 ? totalPages : page - 1;
    } else if (input.startsWith("search ")) {
      const searchTerm = input.slice(7).trim();
      if (!searchTerm) {
        return api.sendMessage("☢️ INPUT ERROR: Specify search parameters", event.threadID);
      }

      const filtered = Reply.groupList.filter(g =>
        g.threadName.toLowerCase().includes(searchTerm)
      );

      if (filtered.length === 0) {
        return api.sendMessage("⚛️ SEARCH RESULTS: No matching groups found", event.threadID);
      }

      page = 1;
      const totalPagesSearch = Math.ceil(filtered.length / Reply.pageSize);
      const pageList = filtered.slice(0, Reply.pageSize);
      const formattedList = pageList.map((g, i) => 
        `☣️ ${i + 1}. ${g.threadName}\n⚛️ ID: ${g.threadID}\n☢️ ────────────`
      ).join("\n\n");

      const msg = `☢️ ════ SEARCH RESULTS ════ ☢️\n\n` +
        `${formattedList}\n\n` +
        `⚛️ COMMAND OPTIONS:\n` +
        `☣️ [number] - Join group\n` +
        `☢️ next - Next page\n` +
        `⚛️ prev - Previous page\n\n` +
        `☢️ PAGE: ${page}/${totalPagesSearch}\n` +
        `${getPageIndicator(page, totalPagesSearch)}\n\n` +
        `⚛️ SYSTEM: v4.0 | ATOMIC CORE`;

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

      if (!group) {
        return api.sendMessage("☢️ INPUT ERROR: Invalid selection index", event.threadID);
      }

      try {
        await api.addUserToGroup(event.senderID, group.threadID);
        return api.sendMessage(`⚛️ ACCESS GRANTED:\n☣️ Joined: ${group.threadName}`, event.threadID);
      } catch (err) {
        return api.sendMessage("☢️ PERMISSION DENIED:\n⚛️ Bot requires admin privileges", event.threadID);
      }
    } else {
      return api.sendMessage("☢️ INPUT ERROR: Invalid command syntax", event.threadID);
    }

    // Render pagination
    const start = (page - 1) * Reply.pageSize;
    const end = start + Reply.pageSize;
    const pageList = Reply.groupList.slice(start, end);

    const formattedList = pageList.map((g, i) => 
      `☣️ ${i + 1}. ${g.threadName}\n⚛️ ID: ${g.threadID}\n☢️ ────────────`
    ).join("\n\n");

    const msg = `☢️ ════ ATOMIC GROUP NAVIGATOR ════ ☢️\n\n` +
      `${formattedList}\n\n` +
      `⚛️ COMMAND OPTIONS:\n` +
      `☣️ [number] - Join group\n` +
      `☢️ next - Next page\n` +
      `⚛️ prev - Previous page\n` +
      `☣️ search [name] - Find group\n\n` +
      `☢️ PAGE: ${page}/${totalPages}\n` +
      `${getPageIndicator(page, totalPages)}\n\n` +
      `⚛️ SYSTEM: v4.0 | ATOMIC CORE`;

    const sentMessage = await api.sendMessage(msg, event.threadID);
    global.GoatBot.onReply.set(sentMessage.messageID, {
      ...Reply,
      page,
      messageID: sentMessage.messageID
    });
  }
};
