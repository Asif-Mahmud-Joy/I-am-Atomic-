module.exports = {
  config: {
    name: "botnick",
    aliases: ["sn"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Change bot's nickname in all groups"
    },
    longDescription: {
      en: "Changes the bot's nickname in every group where it is present"
    },
    category: "owner",
    guide: {
      en: "{pn} <new nickname>"
    },
    envConfig: {
      delayPerGroup: 250
    }
  },

  langs: {
    en: {
      missingNickname: "❌ Please enter a new nickname for the bot.",
      changingNickname: "🔄 Changing bot nickname to '%1' in %2 group chats...",
      successMessage: "✅ Successfully changed nickname in %1 groups to '%2'",
      errorChangingNickname: "⚠️ Couldn't change nickname in %1 groups:\n%2",
      sendingNotification: "📨 Sending nickname change to %1 groups."
    },
    bn: {
      missingNickname: "❌ দয়া করে একটি নতুন ডাকনাম লিখুন।",
      changingNickname: "🔄 %2টি গ্রুপে বটের নাম '%1' এ পরিবর্তন করা হচ্ছে...",
      successMessage: "✅ %1টি গ্রুপে সফলভাবে বটের নাম '%2' করা হয়েছে।",
      errorChangingNickname: "⚠️ %1টি গ্রুপে নাম পরিবর্তন ব্যর্থ:\n%2",
      sendingNotification: "📨 মোট %1টি গ্রুপে পাঠানো হচ্ছে..."
    }
  },

  onStart: async function({ api, args, threadsData, message, getLang, event }) {
    const newNickname = args.join(" ");
    if (!newNickname) return message.reply(getLang("missingNickname"));

    const allThreads = (await threadsData.getAll())
      .filter(t => t.isGroup && t.members.find(m => m.userID === api.getCurrentUserID())?.inGroup);

    const threadIds = allThreads.map(t => t.threadID);
    message.reply(getLang("changingNickname", newNickname, threadIds.length));

    const failed = [];

    for (const threadId of threadIds) {
      try {
        await api.changeNickname(newNickname, threadId, api.getCurrentUserID());
        await new Promise(r => setTimeout(r, module.exports.config.envConfig.delayPerGroup));
      } catch (err) {
        failed.push(`${threadId}: ${err.message}`);
      }
    }

    if (failed.length === 0) {
      message.reply(getLang("successMessage", threadIds.length, newNickname));
    } else {
      message.reply(getLang("errorChangingNickname", failed.length, failed.join("\n")));
    }
  }
};
