const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;

module.exports = {
  config: {
    name: "setleave",
    aliases: ["setl", "leaveconfig"],
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 5,
    role: 1, // Requires admin privileges
    description: {
      en: "Advanced leave message configuration system",
      vi: "Hệ thống cấu hình tin nhắn rời nhóm nâng cao",
      bn: "গ্রুপ ছেড়ে যাওয়ার বার্তা কনফিগারেশন সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Command Guide:
• {pn} on - Enable leave messages
• {pn} off - Disable leave messages
• {pn} text <message> - Set custom leave message
• {pn} text reset - Reset to default message
• {pn} file - Add attachment (reply with file)
• {pn} file reset - Remove attachments

🔄 Available placeholders:
- {userName} - Member's name
- {userNameTag} - Tagged member's name
- {boxName} - Group name
- {type} - "left" or "kicked"
- {session} - Time of day (morning/afternoon/evening)`,
      bn: `📌 ব্যবহার নির্দেশিকা:
• {pn} on - ছেড়ে যাওয়ার বার্তা সক্রিয় করুন
• {pn} off - ছেড়ে যাওয়ার বার্তা বন্ধ করুন
• {pn} text <message> - কাস্টম বার্তা সেট করুন
• {pn} text reset - ডিফল্ট বার্তায় রিসেট করুন
• {pn} file - ফাইল সংযুক্ত করুন (রিপ্লাই করুন)
• {pn} file reset - সংযুক্তি সরান

🔄 ব্যবহারযোগ্য প্লেসহোল্ডার:
- {userName} - সদস্যের নাম
- {userNameTag} - ট্যাগ করা নাম
- {boxName} - গ্রুপের নাম
- {type} - "left" বা "kicked"
- {session} - দিনের সময় (সকাল/দুপুর/সন্ধ্যা)`
    }
  },

  langs: {
    en: {
      turnedOn: "✅ Leave messages enabled",
      turnedOff: "🚫 Leave messages disabled",
      missingContent: "⚠️ Please provide message content",
      edited: "✏️ Leave message updated:\n%1",
      reseted: "🔄 Leave message reset to default",
      noFile: "ℹ️ No attachments to remove",
      resetedFile: "✅ Attachments removed successfully",
      missingFile: "⚠️ Please reply with an image/video/audio file",
      addedFile: "📎 Added %1 attachment(s) to leave message",
      error: "❌ An error occurred: %1",
      help: `📚 Need help? Use '{pn} guide' for detailed instructions`
    },
    bn: {
      turnedOn: "✅ ছেড়ে যাওয়ার বার্তা সক্রিয় করা হয়েছে",
      turnedOff: "🚫 ছেড়ে যাওয়ার বার্তা বন্ধ করা হয়েছে",
      missingContent: "⚠️ বার্তার বিষয়বস্তু প্রদান করুন",
      edited: "✏️ ছেড়ে যাওয়ার বার্তা আপডেট করা হয়েছে:\n%1",
      reseted: "🔄 ছেড়ে যাওয়ার বার্তা ডিফল্টে রিসেট করা হয়েছে",
      noFile: "ℹ️ সরানোর জন্য কোনো সংযুক্তি নেই",
      resetedFile: "✅ সংযুক্তি সফলভাবে সরানো হয়েছে",
      missingFile: "⚠️ একটি ছবি/ভিডিও/অডিও ফাইল দিয়ে রিপ্লাই করুন",
      addedFile: "📎 %1 টি সংযুক্তি যোগ করা হয়েছে",
      error: "❌ একটি ত্রুটি ঘটেছে: %1",
      help: `📚 সাহায্য প্রয়োজন? '{pn} guide' ব্যবহার করুন বিস্তারিত নির্দেশনার জন্য`
    }
  },

  onStart: async function ({ 
    message, 
    event, 
    args, 
    threadsData, 
    getLang,
    prefix
  }) {
    try {
      const { threadID, senderID, body } = event;
      const action = args[0]?.toLowerCase();
      const lang = getLang;

      if (!action || action === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      const { data, settings } = await threadsData.get(threadID);

      switch (action) {
        case "on":
        case "off": {
          settings.sendLeaveMessage = action === "on";
          await threadsData.set(threadID, { settings });
          return message.reply(lang(action === "on" ? "turnedOn" : "turnedOff"));
        }

        case "text": {
          const content = args.slice(1).join(" ");
          if (!content) return message.reply(lang("missingContent"));
          
          if (content === "reset") {
            delete data.leaveMessage;
          } else {
            data.leaveMessage = body.slice(body.indexOf(args[0]) + args[0].length).trim();
          }

          await threadsData.set(threadID, { data });
          return message.reply(
            data.leaveMessage ? 
              lang("edited", data.leaveMessage) : 
              lang("reseted")
          );
        }

        case "file": {
          if (args[1] === "reset") {
            if (!data.leaveAttachment) {
              return message.reply(lang("noFile"));
            }

            try {
              await Promise.all(data.leaveAttachment.map(id => drive.deleteFile(id)));
              delete data.leaveAttachment;
              await threadsData.set(threadID, { data });
              return message.reply(lang("resetedFile"));
            } catch (error) {
              console.error("Error deleting files:", error);
              return message.reply(lang("error", error.message));
            }
          }

          if (!event.attachments.length && 
              (!event.messageReply || !event.messageReply.attachments.length)) {
            return message.reply(lang("missingFile"), (err, info) => {
              global.GoatBot.onReply.set(info.messageID, {
                messageID: info.messageID,
                author: senderID,
                commandName: this.config.name
              });
            });
          }

          await this.handleFileUpload(message, event, threadID, threadsData, lang);
          break;
        }

        default: {
          return message.SyntaxError();
        }
      }
    } catch (error) {
      console.error("Error in setleave command:", error);
      return message.reply(getLang("error", error.message));
    }
  },

  onReply: async function ({ 
    event, 
    Reply, 
    message, 
    threadsData, 
    getLang 
  }) {
    try {
      if (event.senderID !== Reply.author) return;
      
      if (!event.attachments.length && 
          (!event.messageReply || !event.messageReply.attachments.length)) {
        return message.reply(getLang("missingFile"));
      }

      await this.handleFileUpload(
        message, 
        event, 
        event.threadID, 
        threadsData, 
        getLang
      );
    } catch (error) {
      console.error("Error in reply handler:", error);
      message.reply(getLang("error", error.message));
    }
  },

  handleFileUpload: async function (message, event, threadID, threadsData, lang) {
    const { data } = await threadsData.get(threadID);
    const attachments = [
      ...event.attachments,
      ...(event.messageReply?.attachments || [])
    ].filter(a => ["photo", "animated_image", "video", "audio"].includes(a.type));

    if (!data.leaveAttachment) {
      data.leaveAttachment = [];
    }

    await Promise.all(attachments.map(async (attachment) => {
      try {
        const { url } = attachment;
        const ext = getExtFromUrl(url);
        const fileName = `leave_${getTime()}.${ext}`;
        const stream = await getStreamFromURL(url);
        const infoFile = await drive.uploadFile(
          `leave_${threadID}_${event.senderID}_${fileName}`, 
          stream
        );
        data.leaveAttachment.push(infoFile.id);
      } catch (error) {
        console.error("Error uploading file:", error);
        throw error;
      }
    }));

    await threadsData.set(threadID, { data });
    return message.reply(lang("addedFile", attachments.length));
  }
};
