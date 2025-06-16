// ✅ Ultra Pro Max Upgrade of setwelcome.js with Real-World Working Logic & API Compatible Code

const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
  config: {
    name: "setwelcome",
    aliases: ["setwc"],
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    countDown: 5,
    role: 1,
    shortDescription: {
      vi: "Chỉnh sửa nội dung chào mừng",
      en: "Edit welcome message content"
    },
    longDescription: {
      vi: "Chỉnh sửa nội dung và file đính kèm cho tin nhắn chào mừng",
      en: "Edit content and attachments for welcome message"
    },
    category: "custom",
    guide: {
      en: {
        body: `
{pn} text <message | reset>
- Customize welcome text or reset.

Shortcuts:
- {userName}, {userNameTag}, {boxName}, {multiple}, {session}, {memLength}

{pn} file <reset>
- Attach file by replying or reset attachments.
        `
      },
      bn: {
        body: `
{pn} text <message | reset>
- Welcome text edit korba ba reset diba.

Shortcuts:
- {userName}, {userNameTag}, {boxName}, {multiple}, {session}, {memLength}

{pn} file <reset>
- Reply kore file (image, video, audio) add koro ba reset diba.
        `
      }
    }
  },

  langs: {
    en: {
      turnedOn: "✅ Welcome message enabled",
      turnedOff: "❌ Welcome message disabled",
      missingContent: "⚠️ Please provide welcome message text",
      edited: "✏️ Updated welcome message: %1",
      reseted: "♻️ Welcome message reset to default",
      noFile: "⚠️ No attachments found to remove",
      resetedFile: "✅ Attachments removed",
      missingFile: "⚠️ Please reply with image/video/audio to add",
      addedFile: "📎 Added %1 file(s) to welcome message"
    },
    bn: {
      turnedOn: "✅ Welcome message on kora hoise",
      turnedOff: "❌ Welcome message off kora hoise",
      missingContent: "⚠️ Welcome text likho",
      edited: "✏️ Welcome text update hoise: %1",
      reseted: "♻️ Welcome message default e chole gese",
      noFile: "⚠️ Kono attachment nai delete korar moto",
      resetedFile: "✅ File gula remove kora gese",
      missingFile: "⚠️ File reply koro add korar jonno (image/video/audio)",
      addedFile: "📎 %1 file welcome message e add kora gese"
    }
  },

  onStart: async function ({ args, threadsData, message, event, commandName, getLang }) {
    const { threadID, senderID, body } = event;
    const { data, settings } = await threadsData.get(threadID);

    const arg0 = args[0]?.toLowerCase();

    switch (arg0) {
      case "text": {
        if (!args[1]) return message.reply(getLang("missingContent"));
        if (args[1] === "reset") {
          delete data.welcomeMessage;
          await threadsData.set(threadID, { data });
          return message.reply(getLang("reseted"));
        } else {
          const msgText = body.slice(body.indexOf("text") + 4).trim();
          data.welcomeMessage = msgText;
          await threadsData.set(threadID, { data });
          return message.reply(getLang("edited", msgText));
        }
      }

      case "file": {
        if (args[1] === "reset") {
          const files = data.welcomeAttachment || [];
          if (files.length === 0) return message.reply(getLang("noFile"));
          try {
            await Promise.all(files.map(id => drive.deleteFile(id)));
            delete data.welcomeAttachment;
            await threadsData.set(threadID, { data });
            return message.reply(getLang("resetedFile"));
          } catch (err) {
            console.error("[SETWELCOME FILE DELETE ERROR]", err);
            return message.reply("❌ Error deleting attachments");
          }
        } else {
          const hasAttachments = event.attachments.length > 0 || (event.messageReply && event.messageReply.attachments.length > 0);
          if (!hasAttachments) {
            return message.reply(getLang("missingFile"), (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                messageID: info.messageID,
                author: senderID,
                commandName
              });
            });
          }
          return saveChanges(message, event, threadID, senderID, threadsData, getLang);
        }
      }

      case "on":
      case "off": {
        settings.sendWelcomeMessage = arg0 === "on";
        await threadsData.set(threadID, { settings });
        return message.reply(getLang(arg0 === "on" ? "turnedOn" : "turnedOff"));
      }

      default:
        return message.SyntaxError();
    }
  },

  onReply: async function ({ event, Reply, message, threadsData, getLang }) {
    if (event.senderID !== Reply.author) return;
    if (!event.attachments.length && !(event.messageReply && event.messageReply.attachments.length))
      return message.reply(getLang("missingFile"));
    return saveChanges(message, event, event.threadID, event.senderID, threadsData, getLang);
  }
};

async function saveChanges(message, event, threadID, senderID, threadsData, getLang) {
  const { data } = await threadsData.get(threadID);
  const attachments = [...event.attachments, ...(event.messageReply?.attachments || [])]
    .filter(({ type }) => ["photo", "animated_image", "video", "audio"].includes(type));

  if (!attachments.length) return message.reply(getLang("missingFile"));

  if (!data.welcomeAttachment) data.welcomeAttachment = [];

  await Promise.all(attachments.map(async ({ url }) => {
    const ext = getExtFromUrl(url);
    const fileName = `${getTime()}.${ext}`;
    const fileInfo = await drive.uploadFile(`welcome_${threadID}_${senderID}_${fileName}`, await getStreamFromURL(url));
    data.welcomeAttachment.push(fileInfo.id);
  }));

  await threadsData.set(threadID, { data });
  return message.reply(getLang("addedFile", attachments.length));
}
