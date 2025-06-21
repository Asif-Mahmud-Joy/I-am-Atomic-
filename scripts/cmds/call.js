const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: "🚨 Report to Admin",
    longDescription: "☢️ Send critical reports directly to bot administrators",
    category: "💎 Premium Support",
    guide: "{pn} <urgent message>"
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api }) {
    const { config } = global.GoatBot;
    
    // Check if message is empty
    if (!args[0]) {
      return message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Critical Information Missing\n🔸 | Please provide your urgent message\n━━━━━━━━━━━━━━\n💡 | Usage: callad <your message>`,
        mentions: []
      });
    }

    // Check if admins exist
    if (config.adminBot.length === 0) {
      return message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n☢️ | System Failure\n🔸 | No administrators configured\n━━━━━━━━━━━━━━\n⚠️ | Contact server maintainer`,
        mentions: []
      });
    }

    const { senderID, threadID, isGroup } = event;
    
    // Send processing indicator
    const processingMsg = await message.reply({
      body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Encrypting transmission\n▰▰▱▱▱▱▱▱ 25%`,
      mentions: []
    });

    try {
      const [senderName, threadName] = await Promise.all([
        usersData.getName(senderID),
        isGroup ? threadsData.get(threadID).then(t => t.threadName) : null
      ]);

      // Prepare context information
      const contextInfo = isGroup 
        ? `👥 | Group: ${threadName}\n🔑 | Thread ID: ${threadID}` 
        : `👤 | Private Transmission`;

      // Format the message to admins
      const adminMessage = {
        body: `☢️ | ATOMIC PRIORITY ALERT\n━━━━━━━━━━━━━━\n👤 | Sender: ${senderName}\n🆔 | UID: ${senderID}\n${contextInfo}\n\n📨 | Message:\n┌──────────────────\n│ ${args.join(" ")}\n└──────────────────\n💬 | Reply to this message to respond`,
        mentions: [{ id: senderID, tag: senderName }],
        attachment: await getStreamsFromAttachment([
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => mediaTypes.includes(item.type)))
      };

      const success = [];
      const failed = [];
      const adminInfo = [];

      // Send to all admins with progress simulation
      for (const [index, adminID] of config.adminBot.entries()) {
        try {
          const progress = Math.floor((index + 1) / config.adminBot.length * 100);
          await message.reply({
            body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Transmitting to admin ${index+1}/${config.adminBot.length}\n▰▰▰▰▱▱▱ ${progress}%`,
            messageID: processingMsg.messageID,
            mentions: []
          });

          const adminName = await usersData.getName(adminID);
          const msg = await api.sendMessage(adminMessage, adminID);
          
          success.push(adminID);
          adminInfo.push({ id: adminID, name: adminName });

          // Set reply handler
          global.GoatBot.onReply.set(msg.messageID, {
            commandName: this.config.name,
            messageID: msg.messageID,
            threadID,
            messageIDSender: event.messageID,
            type: "userCallAdmin"
          });
          
          // Simulate transmission delay
          await new Promise(resolve => setTimeout(resolve, 500));
        } 
        catch (err) {
          failed.push(adminID);
          log.error("CALLAD TRANSMISSION FAILURE", err);
        }
      }

      // Prepare final result
      const successList = success.map(id => {
        const admin = adminInfo.find(a => a.id === id);
        return `▫️ ${admin?.name || id} • ✅`;
      });

      const failedList = failed.map(id => {
        const admin = adminInfo.find(a => a.id === id);
        return `▫️ ${admin?.name || id} • ❌`;
      });

      // Send final report
      await message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n📊 | Transmission Report\n\n✅ Successful:\n${successList.join('\n') || "  None"}\n\n❌ Failed:\n${failedList.join('\n') || "  None"}\n━━━━━━━━━━━━━━\n💎 Priority message delivered`,
        mentions: adminInfo.map(a => ({ id: a.id, tag: a.name })),
        messageID: processingMsg.messageID
      });

    } catch (error) {
      console.error("☢️ ATOMIC SUPPORT ERROR", error);
      await message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n☢️ | Critical System Failure\n🔸 | ${error.message}\n━━━━━━━━━━━━━━\n⚠️ | Contact server administrator`,
        messageID: processingMsg.messageID,
        mentions: []
      });
    }
  },

  onReply: async ({ args, event, api, message, Reply, usersData }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const replyContent = args.join(" ") || "🔇 [No content provided]";

    try {
      // Handle admin replies to users
      if (type === "userCallAdmin") {
        const response = {
          body: `🌀| ATOMIC SUPPORT RESPONSE\n━━━━━━━━━━━━━━\n👤 | From Administrator: ${senderName}\n\n💬 | Message:\n┌──────────────────\n│ ${replyContent}\n└──────────────────\n💎 | Reply to continue conversation`,
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
        };

        await api.sendMessage(response, threadID, (err, info) => {
          if (err) throw err;
          
          // Set up reply handler
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "adminReply"
          });
          
          message.reply({
            body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n✅ | Response delivered successfully\n🔸 | Recipient will receive your message`,
            mentions: []
          });
        }, messageIDSender);
      }

      // Handle user replies to admins
      else if (type === "adminReply") {
        const isGroup = event.isGroup;
        const groupInfo = isGroup ? 
          `👥 | Group: ${(await api.getThreadInfo(event.threadID)).threadName}\n🔑 | Thread ID: ${event.threadID}\n` : 
          '';

        const userResponse = {
          body: `☢️ | ATOMIC USER RESPONSE\n━━━━━━━━━━━━━━\n👤 | From: ${senderName}\n🆔 | UID: ${event.senderID}\n${groupInfo}\n📨 | Message:\n┌──────────────────\n│ ${replyContent}\n└──────────────────\n💬 | Reply to continue conversation`,
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(
            event.attachments.filter(item => mediaTypes.includes(item.type))
        };

        await api.sendMessage(userResponse, threadID, (err, info) => {
          if (err) throw err;
          
          // Set up reply handler
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            messageID: info.messageID,
            messageIDSender: event.messageID,
            threadID: event.threadID,
            type: "userCallAdmin"
          });
          
          message.reply({
            body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n✅ | Response delivered to administrator`,
            mentions: []
          });
        }, messageIDSender);
      }
    } catch (error) {
      console.error("☢️ REPLY HANDLER ERROR", error);
      message.reply({
        body: `🌀| ATOMIC SUPPORT SYSTEM\n━━━━━━━━━━━━━━\n❌ | Transmission Failed\n🔸 | ${error.message}`,
        mentions: []
      });
    }
  }
};
