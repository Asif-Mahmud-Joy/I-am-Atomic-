const { getStreamsFromAttachment } = global.utils;
const axios = require("axios");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "announce"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "Send notifications to all groups",
      bn: "সব গ্রুপে বিজ্ঞপ্তি পাঠান"
    },
    longDescription: {
      en: "Send messages to all groups with detailed status reports",
      bn: "সমস্ত গ্রুপে বার্তা পাঠান এবং বিস্তারিত অবস্থা রিপোর্ট পান"
    },
    category: "owner",
    guide: {
      en: "{pn} [message]",
      bn: "{pn} [বার্তা]"
    },
    envConfig: {
      delayPerGroup: 300
    }
  },

  langs: {
    en: {
      missingMessage: "📝 Please enter the message you want to send",
      notification: "📢 Notification from Bot Admin\n━━━━━━━━━━━━━━\n",
      sendingNotification: "⏳ Sending notification to %1 groups...",
      sentNotification: "✅ Successfully sent to %1 groups",
      errorSendingNotification: "❌ Failed to send to %1 groups",
      successTitle: "📬 Notification Summary",
      attachmentNotice: "\n\n📎 Attachment included",
      groupList: "📋 Group List:\n",
      errorList: "⚠️ Errors occurred in:\n",
      noGroups: "❌ No groups found to send notification"
    },
    bn: {
      missingMessage: "📝 অনুগ্রহ করে বার্তাটি লিখুন",
      notification: "📢 বট অ্যাডমিন থেকে বিজ্ঞপ্তি\n━━━━━━━━━━━━━━\n",
      sendingNotification: "⏳ %1 টি গ্রুপে বিজ্ঞপ্তি পাঠানো হচ্ছে...",
      sentNotification: "✅ %1 টি গ্রুপে সফলভাবে পাঠানো হয়েছে",
      errorSendingNotification: "❌ %1 টি গ্রুপে পাঠানো যায়নি",
      successTitle: "📬 বিজ্ঞপ্তির সারাংশ",
      attachmentNotice: "\n\n📎 সংযুক্তি যুক্ত করা হয়েছে",
      groupList: "📋 গ্রুপের তালিকা:\n",
      errorList: "⚠️ ত্রুটি হয়েছে নিম্নলিখিত গ্রুপে:\n",
      noGroups: "❌ বিজ্ঞপ্তি পাঠানোর জন্য কোন গ্রুপ পাওয়া যায়নি"
    }
  },

  onStart: async function ({ 
    message, 
    api, 
    event, 
    args, 
    commandName, 
    envCommands, 
    threadsData, 
    getLang 
  }) {
    try {
      const lang = getLang;
      const { delayPerGroup } = envCommands[commandName];

      // Check if message is provided
      if (!args[0] && event.attachments.length === 0) {
        return message.reply(lang("missingMessage"));
      }

      // Prepare message content
      const notificationMessage = lang("notification") + (args.join(" ") || "");
      const attachments = [
        ...event.attachments,
        ...(event.messageReply?.attachments || [])
      ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type));

      const formSend = {
        body: notificationMessage,
        attachment: await getStreamsFromAttachment(attachments)
      };

      // Get all groups where bot is a member
      const allThreads = await threadsData.getAll();
      const allThreadID = allThreads.filter(t => 
        t.isGroup && 
        t.members.some(m => m.userID === api.getCurrentUserID() && m.inGroup)
      );

      // Check if there are groups to send to
      if (allThreadID.length === 0) {
        return message.reply(lang("noGroups"));
      }

      // Send initial progress message
      const progressMsg = await message.reply(lang("sendingNotification", allThreadID.length));

      let sendSuccess = 0;
      const successGroups = [];
      const errorGroups = [];
      const waitingSend = [];

      // Send notifications with delay
      for (const thread of allThreadID) {
        try {
          const sendPromise = api.sendMessage(
            {...formSend, mentions: []}, 
            thread.threadID
          );
          
          waitingSend.push({
            threadID: thread.threadID,
            threadName: thread.threadName || "Unknown Group",
            pending: sendPromise
          });
          
          await new Promise(resolve => setTimeout(resolve, delayPerGroup));
        } catch (e) {
          errorGroups.push({
            threadID: thread.threadID,
            threadName: thread.threadName || "Unknown Group",
            error: e.message
          });
        }
      }

      // Process results
      for (const sended of waitingSend) {
        try {
          await sended.pending;
          sendSuccess++;
          successGroups.push({
            id: sended.threadID,
            name: sended.threadName
          });
        } catch (e) {
          errorGroups.push({
            threadID: sended.threadID,
            threadName: sended.threadName,
            error: e.message
          });
        }
      }

      // Prepare summary report
      let summaryMessage = `✨ ${lang("successTitle")} ✨\n\n`;
      summaryMessage += `✅ ${lang("sentNotification", sendSuccess)}\n`;
      summaryMessage += `❌ ${lang("errorSendingNotification", errorGroups.length)}\n\n`;
      
      if (successGroups.length > 0) {
        summaryMessage += `${lang("groupList")}`;
        summaryMessage += successGroups.map(g => `• ${g.name} (${g.id})`).join("\n");
      }
      
      if (errorGroups.length > 0) {
        summaryMessage += `\n\n${lang("errorList")}`;
        summaryMessage += errorGroups.map(g => 
          `• ${g.threadName} (${g.threadID})\n   → ${g.error}`
        ).join("\n");
      }
      
      if (attachments.length > 0) {
        summaryMessage += lang("attachmentNotice");
      }

      // Send final summary
      await message.reply(summaryMessage);
      await api.unsendMessage(progressMsg.messageID);
      
    } catch (error) {
      console.error("Notification Command Error:", error);
      message.reply("❌ An unexpected error occurred. Please check logs.");
    }
  }
};
