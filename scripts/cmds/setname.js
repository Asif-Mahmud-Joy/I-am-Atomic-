async function processNickname(nickname, uid, usersData) {
  try {
    const replacements = {
      "{userName}": await usersData.getName(uid),
      "{userID}": uid
    };

    return Object.entries(replacements).reduce((result, [key, value]) => {
      return result.replace(new RegExp(key, "gi"), value);
    }, nickname);
  } catch (error) {
    console.error("Error processing nickname:", error);
    return nickname;
  }
}

module.exports = {
  config: {
    name: "setname",
    aliases: ["nickname", "changenick"],
    version: "2.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 5,
    role: 1, // Requires admin privileges
    description: {
      en: "Advanced nickname management system for group chats",
      vi: "Hệ thống quản lý biệt danh nâng cao cho nhóm chat",
      bn: "গ্রুপ চ্যাটের জন্য উন্নত নাম ব্যবস্থাপনা সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Command Guide:
• {pn} <nickname> - Change your nickname
• {pn} @tags <nickname> - Change nicknames of tagged members
• {pn} all <nickname> - Change nicknames of all members

🔄 Available placeholders:
- {userName} - Member's name
- {userID} - Member's ID

⚠️ Note: You need admin privileges to change others' nicknames`,
      bn: `📌 ব্যবহার নির্দেশিকা:
• {pn} <নাম> - আপনার নাম পরিবর্তন করুন
• {pn} @ট্যাগ <নাম> - ট্যাগ করা সদস্যদের নাম পরিবর্তন করুন
• {pn} all <নাম> - সকল সদস্যের নাম পরিবর্তন করুন

🔄 ব্যবহারযোগ্য প্লেসহোল্ডার:
- {userName} - সদস্যের নাম
- {userID} - সদস্যের আইডি

⚠️ নোট: অন্যের নাম পরিবর্তন করতে আপনার অ্যাডমিন অধিকার প্রয়োজন`
    }
  },

  langs: {
    en: {
      success: "✅ Nicknames updated successfully",
      noPermission: "⛔ You don't have permission to change nicknames",
      invalidFormat: "⚠️ Please provide a valid nickname format",
      error: "❌ An error occurred while updating nicknames",
      help: `📚 Need help? Use '{pn} guide' for detailed instructions`
    },
    bn: {
      success: "✅ নাম সফলভাবে আপডেট করা হয়েছে",
      noPermission: "⛔ আপনার নাম পরিবর্তন করার অনুমতি নেই",
      invalidFormat: "⚠️ একটি বৈধ নাম ফরম্যাট প্রদান করুন",
      error: "❌ নাম আপডেট করার সময় একটি ত্রুটি ঘটেছে",
      help: `📚 সাহায্য প্রয়োজন? '{pn} guide' ব্যবহার করুন বিস্তারিত নির্দেশনার জন্য`
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    api, 
    usersData, 
    getLang,
    prefix,
    role
  }) {
    try {
      const { threadID, senderID, mentions } = event;
      const lang = getLang;

      if (!args.length || args[0] === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      // Determine targets and nickname
      let targetUIDs = [];
      let nickname = args.join(" ");

      if (args[0].toLowerCase() === "all") {
        if (role < 1) return message.reply(lang("noPermission"));
        const threadInfo = await api.getThreadInfo(threadID);
        targetUIDs = threadInfo.participantIDs;
        nickname = args.slice(1).join(" ");
      } 
      else if (Object.keys(mentions).length > 0) {
        if (role < 1) return message.reply(lang("noPermission"));
        targetUIDs = Object.keys(mentions);
        
        // Remove mentions from nickname
        const mentionNames = Object.values(mentions).map(name => 
          name.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&")
        ).join("|");
        
        nickname = nickname.replace(new RegExp(mentionNames, "g"), "").trim();
      } 
      else {
        targetUIDs = [senderID];
        nickname = nickname.trim();
      }

      if (!nickname) {
        return message.reply(lang("invalidFormat"));
      }

      // Process nicknames in batches to avoid rate limiting
      const batchSize = 5;
      const batches = [];
      
      for (let i = 0; i < targetUIDs.length; i += batchSize) {
        batches.push(targetUIDs.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        await Promise.all(batch.map(async uid => {
          try {
            const processedNickname = await processNickname(nickname, uid, usersData);
            await api.changeNickname(processedNickname, threadID, uid);
          } catch (error) {
            console.error(`Error changing nickname for ${uid}:`, error);
          }
        }));
        
        // Add delay between batches
        if (batches.indexOf(batch) < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      return message.reply(lang("success"));
    } catch (error) {
      console.error("Error in setname command:", error);
      return message.reply(getLang("error"));
    }
  }
};
