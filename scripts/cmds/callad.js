const { getStreamsFromAttachment, log } = global.utils;
const mediaTypes = ["photo", "png", "animated_image", "video", "audio"];

module.exports = {
  config: {
    name: "calladmin",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      vi: "Gửi báo cáo, góp ý, báo lỗi,... tới admin bot",
      en: "Send report, feedback, bug,... to bot admin"
    },
    category: "contacts admin",
    guide: {
      vi: "{pn} <tin nhắn>",
      en: "{pn} <message>"
    }
  },

  langs: {
    vi: {
      missingMessage: "⚠️ Vui lòng nhập tin nhắn bạn muốn gửi tới admin",
      sendByGroup: "\n📍 Từ nhóm: %1\n🆔 Thread ID: %2",
      sendByUser: "\n📍 Từ người dùng riêng",
      content: "\n\n📨 Nội dung:\n─────────────────\n%1\n─────────────────\n📩 Phản hồi tin nhắn này để trả lời người dùng",
      success: "✅ Đã gửi tin nhắn tới %1 admin thành công!\n%2",
      failed: "❌ Lỗi khi gửi tới %1 admin\n%2\n➡️ Xem console để biết chi tiết lỗi",
      reply: "📥 Phản hồi từ admin %1:\n─────────────────\n%2\n─────────────────\n💬 Phản hồi tin nhắn này để tiếp tục gửi đến admin",
      replySuccess: "✅ Đã phản hồi thành công đến admin!",
      feedback: "📬 Phản hồi từ người dùng %1:\n🆔 User ID: %2%3\n\n📨 Nội dung:\n─────────────────\n%4\n─────────────────\n📩 Phản hồi tin nhắn này để trả lời người dùng",
      replyUserSuccess: "✅ Đã phản hồi thành công đến người dùng!",
      noAdmin: "❌ Bot chưa có admin nào cấu hình"
    },
    en: {
      missingMessage: "⚠️ Please enter the message you want to send to admin",
      sendByGroup: "\n📍 Sent from group: %1\n🆔 Thread ID: %2",
      sendByUser: "\n📍 Sent from private user",
      content: "\n\n📨 Content:\n─────────────────\n%1\n─────────────────\n📩 Reply this message to respond to user",
      success: "✅ Sent your message to %1 admin successfully!\n%2",
      failed: "❌ An error occurred while sending to %1 admin\n%2\n➡️ Check console for details",
      reply: "📥 Reply from admin %1:\n─────────────────\n%2\n─────────────────\n💬 Reply this message to continue replying",
      replySuccess: "✅ Sent your reply to admin successfully!",
      feedback: "📬 Feedback from user %1:\n🆔 User ID: %2%3\n\n📨 Content:\n─────────────────\n%4\n─────────────────\n📩 Reply this message to respond to user",
      replyUserSuccess: "✅ Sent your reply to user successfully!",
      noAdmin: "❌ No admin has been set up in the bot"
    }
  },

  onStart: async function ({ args, message, event, usersData, threadsData, api, commandName, getLang }) {
    const { config } = global.GoatBot;
    if (!args[0]) return message.reply(getLang("missingMessage"));
    const { senderID, threadID, isGroup } = event;
    if (!config.adminBot?.length) return message.reply(getLang("noAdmin"));

    const senderName = await usersData.getName(senderID);
    const groupInfo = isGroup ? await threadsData.get(threadID) : null;

    const msg = "==📨️ CALL ADMIN 📨️=="
      + `\n👤 User: ${senderName}`
      + `\n🆔 ID: ${senderID}`
      + (isGroup ? getLang("sendByGroup", groupInfo?.threadName || "Unknown", threadID) : getLang("sendByUser"));

    const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
      .filter(item => mediaTypes.includes(item.type));

    const formMessage = {
      body: msg + getLang("content", args.join(" ")),
      mentions: [{ id: senderID, tag: senderName }],
      attachment: await getStreamsFromAttachment(attachments)
    };

    const successIDs = [], failedIDs = [], adminNames = [];
    for (const adminID of config.adminBot) {
      try {
        const name = await usersData.getName(adminID);
        const sent = await api.sendMessage(formMessage, adminID);
        successIDs.push(adminID);
        adminNames.push({ id: adminID, name });
        global.GoatBot.onReply.set(sent.messageID, {
          commandName,
          messageID: sent.messageID,
          threadID,
          messageIDSender: event.messageID,
          type: "userCallAdmin"
        });
      } catch (err) {
        log.err("CALL ADMIN", err);
        failedIDs.push(adminID);
      }
    }

    const msg2 = (successIDs.length > 0
      ? getLang("success", successIDs.length, adminNames.map(a => `<@${a.id}> (${a.name})`).join("\n"))
      : "") +
      (failedIDs.length > 0
        ? getLang("failed", failedIDs.length, failedIDs.map(id => `<@${id}>`).join("\n"))
        : "");

    return message.reply({
      body: msg2,
      mentions: adminNames.map(a => ({ id: a.id, tag: a.name }))
    });
  },

  onReply: async ({ args, event, api, message, Reply, usersData, commandName, getLang }) => {
    const { type, threadID, messageIDSender } = Reply;
    const senderName = await usersData.getName(event.senderID);
    const attachments = event.attachments?.filter(item => mediaTypes.includes(item.type)) || [];

    switch (type) {
      case "userCallAdmin": {
        const msg = {
          body: getLang("reply", senderName, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(attachments)
        };
        api.sendMessage(msg, threadID, (err, info) => {
          if (!err) {
            message.reply(getLang("replyUserSuccess"));
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              threadID: event.threadID,
              messageIDSender: event.messageID,
              type: "adminReply"
            });
          }
        }, messageIDSender);
        break;
      }
      case "adminReply": {
        const sendByGroup = event.isGroup
          ? getLang("sendByGroup", (await api.getThreadInfo(event.threadID)).threadName, event.threadID)
          : "";

        const msg = {
          body: getLang("feedback", senderName, event.senderID, sendByGroup, args.join(" ")),
          mentions: [{ id: event.senderID, tag: senderName }],
          attachment: await getStreamsFromAttachment(attachments)
        };

        api.sendMessage(msg, threadID, (err, info) => {
          if (!err) {
            message.reply(getLang("replySuccess"));
            global.GoatBot.onReply.set(info.messageID, {
              commandName,
              messageID: info.messageID,
              threadID: event.threadID,
              messageIDSender: event.messageID,
              type: "userCallAdmin"
            });
          }
        }, messageIDSender);
        break;
      }
    }
  }
};
