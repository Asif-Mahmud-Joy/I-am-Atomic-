module.exports = {
  config: {
    name: "botnick",
    aliases: ["atomicnick", "setnick"],
    version: "3.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "⚡ Change bot's nickname across all groups"
    },
    longDescription: {
      en: "⚡ Atomically update the bot's nickname in every group with precision"
    },
    category: "owner",
    guide: {
      en: "{pn} <new atomic nickname>"
    },
    envConfig: {
      delayPerGroup: 300
    }
  },

  langs: {
    en: {
      missingNickname: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗔𝗠𝗘 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ Please enter a new nickname for the bot",
      changingNickname: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 𝗨𝗣𝗗𝗔𝗧𝗘\n\n▸ Changing to 『%1』 in %2 groups...",
      successMessage: "✅ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n\n▸ Updated nickname to 『%1』 in %2 groups",
      partialSuccess: "⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗣𝗔𝗥𝗧𝗜𝗔𝗟 𝗦𝗨𝗖𝗖𝗘𝗦𝗦\n\n▸ Updated 『%1』 in %2/%3 groups\n▸ Failed in %4 groups:\n%5",
      errorChanging: "❌ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗡𝗜𝗖𝗞𝗡𝗔𝗠𝗘 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to update nickname in all groups",
      startingProcess: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗣𝗥𝗢𝗖𝗘𝗦𝗦 𝗦𝗧𝗔𝗥𝗧𝗘𝗗\n\n▸ Initializing global nickname update...",
      processingGroup: "▸ Processing group %1/%2"
    }
  },

  onStart: async function({ api, args, threadsData, message, event, getLang }) {
    const { sendTyping, sendMessage } = api;
    const { threadID } = event;
    
    try {
      // Start typing animation
      sendTyping(threadID);
      
      const newNickname = args.join(" ");
      if (!newNickname) {
        return message.reply(getLang("missingNickname"));
      }

      // Send start message
      const startMsg = getLang("startingProcess");
      await message.reply(startMsg);
      
      // Get all group threads
      const allThreads = (await threadsData.getAll())
        .filter(t => t.isGroup && t.members.some(m => 
          m.userID === api.getCurrentUserID() && m.inGroup
        ));
      
      const threadIds = allThreads.map(t => t.threadID);
      const totalGroups = threadIds.length;
      
      // Send processing message
      const processingMsg = getLang("changingNickname", newNickname, totalGroups);
      await message.reply(processingMsg);
      
      const failed = [];
      let successCount = 0;
      
      // Process each group with delay
      for (let i = 0; i < threadIds.length; i++) {
        const threadId = threadIds[i];
        sendTyping(threadID);
        
        try {
          // Update status message every 5 groups
          if (i % 5 === 0) {
            const statusMsg = getLang("processingGroup", i + 1, totalGroups);
            await message.reply(statusMsg);
          }
          
          // Change nickname
          await api.changeNickname(newNickname, threadId, api.getCurrentUserID());
          successCount++;
          
          // Add delay between operations
          await new Promise(resolve => setTimeout(resolve, this.config.envConfig.delayPerGroup));
          
        } catch (err) {
          const threadName = allThreads.find(t => t.threadID === threadId)?.threadName || threadId;
          failed.push(`• ${threadName}: ${err.message}`);
        }
      }
      
      // Send result
      if (failed.length === 0) {
        const successMsg = getLang("successMessage", newNickname, successCount);
        await message.reply(successMsg);
      } else {
        const partialMsg = getLang("partialSuccess", newNickname, successCount, totalGroups, failed.length, failed.join("\n"));
        await message.reply(partialMsg);
      }
      
    } catch (error) {
      console.error("Atomic Nickname Error:", error);
      const errorMsg = getLang("errorChanging");
      await message.reply(errorMsg);
    }
  }
};
