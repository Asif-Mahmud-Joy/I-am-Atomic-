const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", 'png', "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "callad",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Report/Feedback/Message to Admin",
    longDescription: "Send any bug report, feedback, or message to bot admin",
    category: "contacts admin",
    guide: "{pn} <your message>"
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;
    if (!args[0]) return message.reply("📩 Please type your message to send to the admin.");

    const { senderID, threadID, isGroup, messageReply, attachments } = event;
    if (config.adminBot.length === 0) return message.reply("⚠️ No admin configured for this bot.");

    const senderName = await usersData.getName(senderID);
    let groupName = isGroup ? (await threadsData.get(threadID))?.threadName || "Unnamed Group" : null;
    const contextInfo = isGroup
      ? `👥 From Group: ${groupName}\n🧵 Thread ID: ${threadID}`
      : `👤 From Private Chat`;

    const formMessage = {
      body: `📨️ Message from user\n👤 Name: ${senderName}\n🆔 UID: ${senderID}\n${contextInfo}\n\n📝 Message:\n──────────────\n${args.join(" ")}\n──────────────`,
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment([
        ...attachments,
        ...(messageReply?.attachments || [])
      ].filter(item => mediaTypes.includes(item.type)))
    };

    const success = [], failed = [], adminInfo = [];
    for (const adminID of config.adminBot) {
      try {
        const name = await usersData.getName(adminID);
        const msg = await api.sendMessage(formMessage, adminID);
        success.push(`✅ ${name} (${adminID})`);
        adminInfo.push({ id: adminID, name });

        global.GoatBot.onReply.set(msg.messageID, {
          commandName,
          messageID: msg.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      } catch (err) {
        const name = await usersData.getName(adminID).catch(() => "Unknown");
        failed.push(`❌ ${name} (${adminID})`);
        log.err("CALL ADMIN FAIL:", err);
      }
    }

    const result = `📨 Call Admin Result:\n${success.join("\n")}${failed.length ? `\n\n⚠️ Failed:\n${failed.join("\n")}` : ""}`;
    return message.reply({
      body: result,
      mentions: adminInfo.map(a => ({ id: a.id, tag: a.name }))
    });
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const replyBody = args.join(" ");

    const attachment = await getStreamsFromAttachment(
      event.attachments.filter(item => mediaTypes.includes(item.type))
    );

    if (type === "userCallAdmin") {
      const form = {
        body: `📍 Admin Reply from ${senderName}:\n──────────────\n${replyBody}\n──────────────`,
        mentions: [{ id: event.senderID, tag: senderName }],
        attachment
      };

      return api.sendMessage(form, threadID, (err, info) => {
        if (err) return message.reply("❌ Failed to deliver admin reply.");
        message.reply("✅ Reply sent to user successfully!");
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          messageIDSender: event.messageID,
          threadID: event.threadID,
          type: "adminReply"
        });
      }, messageIDSender);
    }

    if (type === "adminReply") {
      const isGroup = event.isGroup;
      const threadName = isGroup ? (await api.getThreadInfo(event.threadID))?.threadName : null;
      const groupInfo = isGroup ? `👥 Group: ${threadName}\n🧵 Thread ID: ${event.threadID}` : "";

      const form = {
        body: `📝 Reply from ${senderName}\n🆔 UID: ${event.senderID}\n${groupInfo}\n\n💬 Message:\n──────────────\n${replyBody}\n──────────────`,
        mentions: [{ id: event.senderID, tag: senderName }],
        attachment
      };

      return api.sendMessage(form, threadID, (err, info) => {
        if (err) return message.reply("❌ Failed to deliver user reply.");
        message.reply("✅ Reply sent to admin successfully!");
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          messageIDSender: event.messageID,
          threadID: event.threadID,
          type: "userCallAdmin"
        });
      }, messageIDSender);
    }
  }
};
