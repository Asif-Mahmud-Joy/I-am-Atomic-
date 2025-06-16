const { getStreamsFromAttachment } = global.utils;
const axios = require("axios");

module.exports = {
  config: {
    name: "notification",
    aliases: ["notify", "noti"],
    version: "1.7",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 2,
    shortDescription: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all box",
      bn: "Admin theke sob group e notification pathano"
    },
    longDescription: {
      vi: "Gửi thông báo từ admin đến all box",
      en: "Send notification from admin to all box",
      bn: "Admin theke shob group e message o image er notification pathano"
    },
    category: "owner",
    guide: {
      en: "{pn} your message here",
      bn: "{pn} apnar message likhun"
    },
    envConfig: {
      delayPerGroup: 300
    }
  },

  langs: {
    en: {
      missingMessage: "Please enter the message you want to send to all groups",
      notification: "🔔 Notification from bot admin (do not reply)",
      sendingNotification: "Sending notification to %1 groups...",
      sentNotification: "✅ Successfully sent to %1 groups",
      errorSendingNotification: "❌ Failed to send to %1 groups:\n%2"
    },
    bn: {
      missingMessage: "🔴 Apnar message ta likhun ja pathate chan sob group e",
      notification: "🔔 Bot admin theke notun notification (reply korben na)",
      sendingNotification: "📨 Notification pathano hocche %1 group e...",
      sentNotification: "✅ Sothik bhabe %1 group e pathano hoyeche",
      errorSendingNotification: "❌ %1 group e pathate somossa hoise:\n%2"
    }
  },

  onStart: async function ({ message, api, event, args, commandName, envCommands, threadsData, getLang, role }) {
    const lang = getLang;
    const { delayPerGroup } = envCommands[commandName];

    if (!args[0]) return message.reply(lang("missingMessage"));

    const formSend = {
      body: `${lang("notification")}\n────────────────\n${args.join(" ")}`,
      attachment: await getStreamsFromAttachment(
        [
          ...event.attachments,
          ...(event.messageReply?.attachments || [])
        ].filter(item => ["photo", "png", "animated_image", "video", "audio"].includes(item.type))
      )
    };

    const allThreadID = (await threadsData.getAll()).filter(
      t => t.isGroup && t.members.find(m => m.userID == api.getCurrentUserID())?.inGroup
    );

    message.reply(lang("sendingNotification", allThreadID.length));

    let sendSuccess = 0;
    const sendError = [];
    const waitingSend = [];

    for (const thread of allThreadID) {
      try {
        const tid = thread.threadID;
        waitingSend.push({
          threadID: tid,
          pending: api.sendMessage(formSend, tid)
        });
        await new Promise(res => setTimeout(res, delayPerGroup));
      } catch (e) {
        sendError.push({ threadIDs: [thread.threadID], errorDescription: e.message });
      }
    }

    for (const sended of waitingSend) {
      try {
        await sended.pending;
        sendSuccess++;
      } catch (e) {
        const { message: errorDescription } = e;
        const existing = sendError.find(item => item.errorDescription === errorDescription);
        if (existing) existing.threadIDs.push(sended.threadID);
        else sendError.push({ threadIDs: [sended.threadID], errorDescription });
      }
    }

    let msg = "";
    if (sendSuccess > 0) msg += lang("sentNotification", sendSuccess) + "\n";
    if (sendError.length > 0)
      msg += lang(
        "errorSendingNotification",
        sendError.reduce((a, b) => a + b.threadIDs.length, 0),
        sendError.map(err => `\n - ${err.errorDescription}\n  + ${err.threadIDs.join("\n  + ")}`).join("")
      );
    
    message.reply(msg);
  }
};
