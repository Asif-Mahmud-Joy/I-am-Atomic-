module.exports = {
  config: {
    name: "count",
    version: "2.0",
    author: "Asif",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "⚡ Atomic Message Counter",
      bn: "⚡ অ্যাটমিক মেসেজ কাউন্টার"
    },
    longDescription: {
      en: "Track message statistics with atomic design visualization",
      bn: "অ্যাটমিক ডিজাইনের সাথে মেসেজ পরিসংখ্যান ট্র্যাক করুন"
    },
    category: "⚡ Atomic",
    guide: {
      en: "{pn} [@tag | all]",
      bn: "{pn} [@ট্যাগ | all]"
    }
  },

  langs: {
    en: {
      leaderboard: "⚡ ATOMIC MESSAGE LEADERBOARD ⚡",
      yourStats: "🌟 YOUR ATOMIC STATS 🌟",
      userStats: "⚛️ USER MESSAGE STATS ⚛️",
      rank: "🏆 Rank",
      messages: "💬 Messages",
      position: "📍 Position",
      pageInfo: "📄 Page %1/%2",
      nextPage: "⏭️ Reply with page number to view next",
      noMessages: "🌌 Zero messages detected in quantum field",
      medal: ["🥇", "🥈", "🥉", "🔹", "🔸"]
    },
    bn: {
      leaderboard: "⚡ অ্যাটমিক মেসেজ লিডারবোর্ড ⚡",
      yourStats: "🌟 আপনার পরিসংখ্যান 🌟",
      userStats: "⚛️ ব্যবহারকারীর পরিসংখ্যান ⚛️",
      rank: "🏆 র‌্যাঙ্ক",
      messages: "💬 মেসেজ",
      position: "📍 অবস্থান",
      pageInfo: "📄 পাতা %1/%2",
      nextPage: "⏭️ পরের পাতার জন্য পেজ নম্বর দিয়ে রিপ্লাই করুন",
      noMessages: "🌌 কোয়ান্টাম ক্ষেত্রে শূন্য বার্তা সনাক্ত করা হয়েছে",
      medal: ["🥇", "🥈", "🥉", "🔹", "🔸"]
    }
  },

  onStart: async function ({ args, threadsData, message, event, api, commandName, getLang }) {
    try {
      const { threadID, senderID } = event;
      const threadData = await threadsData.get(threadID);
      const usersInGroup = (await api.getThreadInfo(threadID)).participantIDs;
      
      // Get members and filter inactive
      let members = threadData.members || [];
      members = members.filter(m => usersInGroup.includes(m.userID));
      
      // Add missing members
      for (const participantID of usersInGroup) {
        if (!members.some(m => m.userID === participantID)) {
          members.push({
            userID: participantID,
            name: await global.utils.getUserName(api, participantID),
            count: 0
          });
        }
      }

      // Sort by message count
      members.sort((a, b) => b.count - a.count);
      members.forEach((member, index) => member.rank = index + 1);

      // Atomic Design Visualization
      const getProgressBar = (count, max) => {
        const barLength = 10;
        const progress = Math.min(1, count / max);
        const filled = Math.round(progress * barLength);
        return '█'.repeat(filled) + '▁'.repeat(barLength - filled);
      };

      const maxMessages = members[0]?.count || 1;

      if (args[0]?.toLowerCase() === "all") {
        // Atomic Leaderboard
        const lang = getLang();
        const itemsPerPage = 10;
        const totalPages = Math.ceil(members.length / itemsPerPage);
        let page = parseInt(args[1]) || 1;
        
        if (page < 1 || page > totalPages) {
          return message.reply(lang.pageInfo.replace("%1", page).replace("%2", totalPages));
        }

        const startIdx = (page - 1) * itemsPerPage;
        const pageData = members.slice(startIdx, startIdx + itemsPerPage);
        
        let leaderboard = `╔═══════  ${lang.leaderboard}  ═══════╗\n`;
        leaderboard += `║ ${lang.rank.padEnd(6)} ${lang.messages.padEnd(8)} 👤 User\n`;
        leaderboard += `╟${"─".repeat(45)}╢\n`;
        
        pageData.forEach(user => {
          const medal = lang.medal[user.rank - 1] || `${user.rank}.`;
          const progressBar = getProgressBar(user.count, maxMessages);
          leaderboard += `║ ${medal.padEnd(6)} ${String(user.count).padEnd(8)} ${user.name}\n`;
          leaderboard += `║      ${progressBar} ${Math.round((user.count/maxMessages)*100)}%\n`;
          leaderboard += `╟${"─".repeat(45)}╢\n`;
        });
        
        leaderboard += `║ ${lang.pageInfo.replace("%1", page).replace("%2", totalPages)}\n`;
        leaderboard += `║ ${lang.nextPage}\n`;
        leaderboard += `╚═══════════════════════════════╝`;
        
        return message.reply(leaderboard, (err, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            members,
            page,
            totalPages,
            author: senderID
          });
        });
      }
      else if (Object.keys(event.mentions).length > 0) {
        // User-specific stats
        const lang = getLang();
        let userStats = `╔══════  ${lang.userStats}  ══════╗\n`;
        
        for (const id in event.mentions) {
          const user = members.find(u => u.userID === id);
          if (user) {
            const medal = lang.medal[user.rank - 1] || `${user.rank}.`;
            const progressBar = getProgressBar(user.count, maxMessages);
            userStats += `║ 👤 ${user.name}\n`;
            userStats += `║ ${lang.rank}: ${medal}\n`;
            userStats += `║ ${lang.messages}: ${user.count}\n`;
            userStats += `║ ${progressBar} ${Math.round((user.count/maxMessages)*100)}%\n`;
            userStats += `╟${"─".repeat(35)}╢\n`;
          }
        }
        
        userStats += `╚═══════════════════════════╝`;
        return message.reply(userStats);
      }
      else {
        // Personal stats
        const user = members.find(u => u.userID === senderID);
        const lang = getLang();
        const medal = lang.medal[user.rank - 1] || `${user.rank}.`;
        const progressBar = getProgressBar(user.count, maxMessages);
        
        const personalStats = `╔══════  ${lang.yourStats}  ══════╗\n` +
                              `║ ${lang.position}: ${medal}\n` +
                              `║ ${lang.messages}: ${user.count}\n` +
                              `║ ${progressBar} ${Math.round((user.count/maxMessages)*100)}%\n` +
                              `╚═══════════════════════════╝`;
                              
        return message.reply(personalStats);
      }
    } catch (error) {
      console.error("Atomic Count Error:", error);
      message.reply("⚠️ Quantum fluctuation detected! Please try again.");
    }
  },

  onReply: async ({ message, event, Reply, commandName, getLang }) => {
    const { senderID, body } = event;
    const { author, members, page, totalPages } = Reply;
    
    if (author !== senderID) {
      return message.reply("🔒 Quantum signature mismatch! Access denied.");
    }

    const newPage = parseInt(body);
    if (isNaN(newPage) return;
    
    const lang = getLang();
    const itemsPerPage = 10;
    const maxMessages = members[0]?.count || 1;
    
    const getProgressBar = (count, max) => {
      const barLength = 10;
      const progress = Math.min(1, count / max);
      const filled = Math.round(progress * barLength);
      return '█'.repeat(filled) + '▁'.repeat(barLength - filled);
    };

    const startIdx = (newPage - 1) * itemsPerPage;
    const pageData = members.slice(startIdx, startIdx + itemsPerPage);
    
    let leaderboard = `╔═══════  ${lang.leaderboard}  ═══════╗\n`;
    leaderboard += `║ ${lang.rank.padEnd(6)} ${lang.messages.padEnd(8)} 👤 User\n`;
    leaderboard += `╟${"─".repeat(45)}╢\n`;
    
    pageData.forEach(user => {
      const medal = lang.medal[user.rank - 1] || `${user.rank}.`;
      const progressBar = getProgressBar(user.count, maxMessages);
      leaderboard += `║ ${medal.padEnd(6)} ${String(user.count).padEnd(8)} ${user.name}\n`;
      leaderboard += `║      ${progressBar} ${Math.round((user.count/maxMessages)*100)}%\n`;
      leaderboard += `╟${"─".repeat(45)}╢\n`;
    });
    
    leaderboard += `║ ${lang.pageInfo.replace("%1", newPage).replace("%2", totalPages)}\n`;
    leaderboard += `║ ${lang.nextPage}\n`;
    leaderboard += `╚═══════════════════════════════╝`;
    
    message.reply(leaderboard, (err, info) => {
      message.unsend(Reply.messageID);
      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        messageID: info.messageID,
        members,
        page: newPage,
        totalPages,
        author: senderID
      });
    });
  },

  onChat: async ({ usersData, threadsData, event }) => {
    const { senderID, threadID } = event;
    let members = await threadsData.get(threadID, "members") || [];
    const userIndex = members.findIndex(u => u.userID === senderID);

    if (userIndex === -1) {
      members.push({
        userID: senderID,
        name: await usersData.getName(senderID),
        count: 1
      });
    } else {
      members[userIndex].count = (members[userIndex].count || 0) + 1;
    }

    await threadsData.set(threadID, members, "members");
  }
};
