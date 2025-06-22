module.exports = {
  config: {
    name: "kick",
    aliases: ["remove"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 3,
    role: 1,
    shortDescription: {
      en: "Remove members from chat",
      bn: "সদস্যদের চ্যাট থেকে সরান"
    },
    longDescription: {
      en: "Remove tagged or replied members from the group chat",
      bn: "ট্যাগ করা বা রিপ্লাই করা সদস্যদের গ্রুপ চ্যাট থেকে সরান"
    },
    category: "group",
    guide: {
      en: "{pn} @tags - Kick tagged members\n{pn} reply - Kick replied user",
      bn: "{pn} @tags - ট্যাগ করা সদস্যদের সরান\n{pn} reply - রিপ্লাই করা ব্যবহারকারীকে সরান"
    }
  },

  langs: {
    en: {
      needAdmin: "⚠️ Please make me admin to use this feature",
      notTagged: "❌ Please tag members or reply to a message",
      noReply: "❌ Please reply to a user's message",
      kicked: "✅ Successfully kicked: {names}",
      failed: "⚠️ Failed to kick: {name} ({uid})",
      cantKickBot: "🤖 I can't kick myself!",
      cantKickAdmin: "⛔ Can't kick admin: {name}"
    },
    bn: {
      needAdmin: "⚠️ এই ফিচার ব্যবহার করতে আমাকে অ্যাডমিন করুন",
      notTagged: "❌ সদস্যদের ট্যাগ করুন বা একটি মেসেজে রিপ্লাই করুন",
      noReply: "❌ একটি ব্যবহারকারীর মেসেজে রিপ্লাই করুন",
      kicked: "✅ সফলভাবে সরানো হয়েছে: {names}",
      failed: "⚠️ সরাতে ব্যর্থ: {name} ({uid})",
      cantKickBot: "🤖 আমি নিজেকে সরাতে পারব না!",
      cantKickAdmin: "⛔ অ্যাডমিন সরানো যাবে না: {name}"
    }
  },

  onStart: async function ({ message, event, api, threadsData, getLang, participants }) {
    try {
      // Check bot admin status
      const botID = api.getCurrentUserID();
      const adminIDs = await threadsData.get(event.threadID, "adminIDs") || [];
      
      if (!adminIDs.includes(botID)) {
        return message.reply(getLang("needAdmin"));
      }

      // Get group participants
      const allMembers = await api.getThreadInfo(event.threadID);
      const adminList = allMembers.adminIDs.map(admin => admin.id);

      // Kick by reply
      if (event.type === "message_reply") {
        return this.kickUser(event.messageReply.senderID, event, api, message, getLang, adminList);
      }

      // Kick by mentions
      const mentions = Object.keys(event.mentions);
      if (mentions.length === 0) {
        return message.reply(getLang("notTagged"));
      }

      // Process multiple kicks
      const results = {
        success: [],
        failed: []
      };

      for (const uid of mentions) {
        const result = await this.kickUser(uid, event, api, null, getLang, adminList, true);
        if (result.success) {
          results.success.push(result.name);
        } else {
          results.failed.push({name: result.name, uid});
        }
      }

      // Send summary
      let replyMsg = "";
      if (results.success.length > 0) {
        replyMsg += getLang("kicked", {names: results.success.join(", ")});
      }
      if (results.failed.length > 0) {
        replyMsg += "\n\n" + results.failed.map(user => 
          getLang("failed", {name: user.name, uid: user.uid})
        ).join("\n");
      }

      if (replyMsg) {
        message.reply(replyMsg);
      }
    } catch (error) {
      console.error("Kick Command Error:", error);
      message.reply("❌ An error occurred. Please try again later.");
    }
  },

  kickUser: async function (uid, event, api, message, getLang, adminList, silent = false) {
    const botID = api.getCurrentUserID();
    const userInfo = await api.getUserInfo(uid);
    const userName = userInfo[uid]?.name || "Unknown User";

    try {
      // Check special cases
      if (uid === botID) {
        if (!silent) message.reply(getLang("cantKickBot"));
        return { success: false, name: userName };
      }

      if (adminList.includes(uid)) {
        if (!silent) message.reply(getLang("cantKickAdmin", {name: userName}));
        return { success: false, name: userName };
      }

      // Perform kick
      await api.removeUserFromGroup(uid, event.threadID);
      
      if (!silent) {
        message.reply(getLang("kicked", {names: userName}));
      }
      
      return { success: true, name: userName };
    } catch (error) {
      if (!silent) {
        message.reply(getLang("failed", {name: userName, uid}));
      }
      return { success: false, name: userName };
    }
  }
};
