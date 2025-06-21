const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "calladmin",
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "🚨 Contact Administrators"
    },
    longDescription: {
      en: "☢️ Send priority messages directly to bot administrators"
    },
    category: "💎 Premium Support",
    guide: {
      en: "{pn} <urgent message>"
    }
  },

  langs: {
    en: {
      missingMessage: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Critical Information Missing\n🔸 | Please provide your urgent message\n━━━━━━━━━━━━━━\n💡 | Usage: calladmin <your message>",
      noAdmin: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n☢️ | System Failure\n🔸 | No administrators configured\n━━━━━━━━━━━━━━\n⚠️ | Contact server maintainer",
      sendByGroup: "\n📍 | Group: %1\n🔑 | Thread ID: %2",
      sendByUser: "\n👤 | Private Transmission",
      content: "\n\n📨 | Message:\n┌──────────────────\n│ %1\n└──────────────────\n💬 | Reply to this message to respond",
      success: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n✅ | Transmission Successful\n🔸 | Delivered to %1 administrator(s)\n\n%s",
      failed: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n❌ | Transmission Failed\n🔸 | Failed for %1 administrator(s)\n\n%s",
      reply: "☢️ | ADMIN RESPONSE\n━━━━━━━━━━━━━━\n👤 | From: %1\n\n💬 | Message:\n┌──────────────────\n│ %2\n└──────────────────\n💎 | Reply to continue conversation",
      replySuccess: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n✅ | Response delivered successfully",
      feedback: "☢️ | USER RESPONSE\n━━━━━━━━━━━━━━\n👤 | From: %1\n🆔 | UID: %2%3\n\n💬 | Message:\n┌──────────────────\n│ %4\n└──────────────────\n💎 | Reply to continue conversation",
      replyUserSuccess: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n✅ | Response delivered to user"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;
    
    // Validate input
    if (!args[0]) {
      return message.reply(getLang("missingMessage"));
    }
    
    // Check admin configuration
    if (!config.adminBot?.length) {
      return message.reply(getLang("noAdmin"));
    }

    const { senderID, threadID, isGroup } = event;
    
    // Send processing indicator
    const processingMsg = await message.reply({
      body: "🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Encrypting transmission\n▰▱▱▱▱▱▱▱ 15%",
      mentions: []
    });

    try {
      const [senderName, threadInfo] = await Promise.all([
        usersData.getName(senderID),
        isGroup ? threadsData.get(threadID) : null
      ]);

      // Prepare context information
      const contextInfo = isGroup 
        ? getLang("sendByGroup", threadInfo?.threadName || "Unknown Group", threadID) 
        : getLang("sendByUser");

      // Format admin message
      const adminMessage = {
        body: `☢️ | PRIORITY ALERT\n━━━━━━━━━━━━━━\n👤 | Sender: ${senderName}\n🆔 | UID: ${senderID}${contextInfo}` + 
               getLang("content", args.join(" ")),
        mentions: [{ id: senderID, tag: senderName }],
        attachment: await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => mediaTypes.includes(item.type)))
      };

      const successIDs = [];
      const failedIDs = [];
      const adminInfo = [];

      // Send to admins with progress simulation
      for (const [index, adminID] of config.adminBot.entries()) {
        try {
          // Update progress
          const progress = Math.floor((index + 1) / config.adminBot.length * 100);
          await message.reply({
            body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Transmitting to admin ${index+1}/${config.adminBot.length}\n${this.getProgressBar(progress)} ${progress}%`,
            messageID: processingMsg.messageID,
            mentions: []
          });

          const adminName = await usersData.getName(adminID);
          const sentMessage = await api.sendMessage(adminMessage, adminID);
          
          successIDs.push(adminID);
          adminInfo.push({ id: adminID, name: adminName });

          // Set reply handler
          global.GoatBot.onReply.set(sentMessage.messageID, {
            commandName,
            messageID: sentMessage.messageID,
            threadID,
            messageIDSender: event.messageID,
            type: "userCallAdmin"
          });

          // Simulate transmission delay
          await new Promise(resolve => setTimeout(resolve, 500));
        } 
        catch (err) {
          failedIDs.push(adminID);
          log.error("ATOMIC TRANSMISSION FAILURE", err);
        }
      }

      // Prepare results
      const successList = successIDs.map(id => {
        const admin = adminInfo.find(a => a.id === id);
        return `▫️ ${admin?.name || id} • ✅`;
      }).join('\n') || "  None";

      const failedList = failedIDs.map(id => {
        const admin = adminInfo.find(a => a.id === id);
        return `▫️ ${admin?.name || id} • ❌`;
      }).join('\n') || "  None";

      // Send final report
      return message.reply({
        body: successIDs.length > 0 
          ? getLang("success", successIDs.length, successList) + 
            (failedIDs.length > 0 ? `\n\n${getLang("failed", failedIDs.length, failedList)}` : "")
          : getLang("failed", failedIDs.length, failedList),
        mentions: adminInfo.map(a => ({ id: a.id, tag: a.name })),
        messageID: processingMsg.messageID
      });

    } catch (error) {
      console.error("☢️ ATOMIC SUPPORT ERROR", error);
      return message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n☢️ | Critical System Failure\n🔸 | ${error.message}`,
        messageID: processingMsg.messageID,
        mentions: []
      });
    }
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const replyContent = args.join(" ") || "🔇 [No content provided]";

    try {
      // Prepare attachments
      const attachments = event.attachments?.filter(item => mediaTypes.includes(item.type)) || [];
      const attachmentStreams = await getStreamsFromAttachment(attachments);

      if (type === "userCallAdmin") {
        // Admin replying to user
        const response = {
          body: getLang("reply", senderName, replyContent),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: attachmentStreams
        };

        await api.sendMessage(response, threadID, (err, info) => {
          if (err) throw err;
          
          // Set reply handler
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "adminReply"
          });
          
          message.reply(getLang("replyUserSuccess"));
        }, messageIDSender);
      }
      else if (type === "adminReply") {
        // User replying to admin
        const isGroup = event.isGroup;
        const groupInfo = isGroup 
          ? getLang("sendByGroup", (await api.getThreadInfo(event.threadID)).threadName, event.threadID)
          : '';

        const userResponse = {
          body: getLang("feedback", senderName, event.senderID, groupInfo, replyContent),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: attachmentStreams
        };

        await api.sendMessage(userResponse, threadID, (err, info) => {
          if (err) throw err;
          
          // Set reply handler
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "userCallAdmin"
          });
          
          message.reply(getLang("replySuccess"));
        }, messageIDSender);
      }
    } catch (error) {
      console.error("☢️ REPLY HANDLER ERROR", error);
      message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n❌ | Transmission Failed\n🔸 | ${error.message}`,
        mentions: []
      });
    }
  },

  // Helper function for progress bar
  getProgressBar: function (percentage) {
    const bars = 8;
    const filledBars = Math.round(percentage / 100 * bars);
    return '▰'.repeat(filledBars) + '▱'.repeat(bars - filledBars);
  }
};
