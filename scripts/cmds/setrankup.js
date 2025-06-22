const { drive, getStreamFromURL, getExtFromUrl, getTime } = global.utils;
const URL_REGEX = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

module.exports = {
  config: {
    name: "setrankup",
    aliases: ["rankupconfig", "setuprankup"],
    version: "3.0.0",
    author: "NTKhang & Upgraded by ✨Asif✨",
    countDown: 5,
    role: 1, // Requires admin privileges
    description: {
      en: "Advanced rankup configuration system",
      vi: "Hệ thống cấu hình rankup nâng cao",
      bn: "র‍্যাংকআপ কনফিগারেশন সিস্টেম"
    },
    category: "administration",
    guide: {
      en: `📌 Command Guide:
• {pn} text <message> - Set rankup message
• {pn} media <url> - Set rankup media (image/video)
• {pn} reset - Reset to default configuration

🔄 Available placeholders:
- {userName} - Member's name
- {userNameTag} - Tagged member's name
- {oldRank} - Previous rank
- {currentRank} - New rank

📎 Supported media: Images, Videos`,
      bn: `📌 ব্যবহার নির্দেশিকা:
• {pn} text <message> - র‍্যাংকআপ মেসেজ সেট করুন
• {pn} media <url> - র‍্যাংকআপ মিডিয়া সেট করুন (ছবি/ভিডিও)
• {pn} reset - ডিফল্ট কনফিগারেশনে রিসেট করুন

🔄 ব্যবহারযোগ্য প্লেসহোল্ডার:
- {userName} - সদস্যের নাম
- {userNameTag} - ট্যাগ করা নাম
- {oldRank} - পূর্ববর্তী র‍্যাংক
- {currentRank} - নতুন র‍্যাংক

📎 সমর্থিত মিডিয়া: ছবি, ভিডিও`
    }
  },

  langs: {
    en: {
      changedMessage: "✅ Rankup message set to:\n%1",
      missingMedia: "⚠️ Please attach or provide a URL for the media",
      changedMedia: "📎 Successfully set %1 media file(s) for rankup",
      resetSuccess: "🔄 Rankup configuration reset to default",
      invalidUrl: "❌ Invalid URL provided",
      error: "❌ An error occurred: %1",
      help: `📚 Need help? Use '{pn} guide' for detailed instructions`
    },
    bn: {
      changedMessage: "✅ র‍্যাংকআপ মেসেজ সেট করা হয়েছে:\n%1",
      missingMedia: "⚠️ একটি মিডিয়া ফাইল বা URL প্রদান করুন",
      changedMedia: "📎 %1টি মিডিয়া ফাইল সফলভাবে সেট করা হয়েছে",
      resetSuccess: "🔄 র‍্যাংকআপ কনফিগারেশন ডিফল্টে রিসেট করা হয়েছে",
      invalidUrl: "❌ অবৈধ URL প্রদান করা হয়েছে",
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
      const { threadID, senderID, body, attachments, messageReply } = event;
      const action = args[0]?.toLowerCase();
      const lang = getLang;

      if (!action || action === "help") {
        return message.reply(lang("help").replace(/{pn}/g, prefix + this.config.name));
      }

      const threadData = await threadsData.get(threadID);
      if (!threadData.data.rankup) {
        threadData.data.rankup = {};
      }

      switch (action) {
        case "text": {
          const newContent = body.slice(body.indexOf(args[0]) + args[0].length).trim();
          if (!newContent) return message.reply(lang("missingMessage"));
          
          threadData.data.rankup.message = newContent;
          await threadsData.set(threadID, threadData.data, "data");
          return message.reply(lang("changedMessage", newContent));
        }

        case "media":
        case "file": {
          const mediaUrls = [];
          
          // Check attachments
          const allAttachments = [...(attachments || []), ...(messageReply?.attachments || [])];
          const validAttachments = allAttachments.filter(
            item => ["photo", "animated_image", "video"].includes(item.type)
          );

          // Check URL argument
          const urlArg = args[1];
          if (urlArg && URL_REGEX.test(urlArg)) {
            mediaUrls.push(urlArg);
          }

          if (validAttachments.length === 0 && mediaUrls.length === 0) {
            return message.reply(lang("missingMedia"));
          }

          // Process attachments
          if (!threadData.data.rankup.attachments) {
            threadData.data.rankup.attachments = [];
          }

          // Clear existing attachments
          if (threadData.data.rankup.attachments.length > 0) {
            try {
              await Promise.all(
                threadData.data.rankup.attachments.map(fileId => drive.deleteFile(fileId))
            );
            } catch (error) {
              console.error("Error deleting old files:", error);
            }
            threadData.data.rankup.attachments = [];
          }

          // Upload new attachments
          for (const attachment of validAttachments) {
            try {
              const ext = getExtFromUrl(attachment.url);
              const fileName = `rankup_${threadID}_${senderID}_${getTime()}.${ext}`;
              const fileData = await getStreamFromURL(attachment.url);
              const fileInfo = await drive.uploadFile(fileName, fileData);
              threadData.data.rankup.attachments.push(fileInfo.id);
            } catch (error) {
              console.error("Error uploading attachment:", error);
            }
          }

          // Handle URL media
          for (const url of mediaUrls) {
            try {
              const ext = getExtFromUrl(url);
              const fileName = `rankup_${threadID}_${senderID}_${getTime()}.${ext}`;
              const fileData = await getStreamFromURL(url);
              const fileInfo = await drive.uploadFile(fileName, fileData);
              threadData.data.rankup.attachments.push(fileInfo.id);
            } catch (error) {
              console.error("Error processing URL:", error);
            }
          }

          await threadsData.set(threadID, threadData.data, "data");
          return message.reply(
            lang("changedMedia", threadData.data.rankup.attachments.length)
          );
        }

        case "reset": {
          // Delete existing attachments
          if (threadData.data.rankup?.attachments?.length > 0) {
            try {
              await Promise.all(
                threadData.data.rankup.attachments.map(fileId => drive.deleteFile(fileId))
            );
            } catch (error) {
              console.error("Error deleting files:", error);
            }
          }

          // Reset configuration
          delete threadData.data.rankup;
          await threadsData.set(threadID, threadData.data, "data");
          return message.reply(lang("resetSuccess"));
        }

        default: {
          return message.SyntaxError();
        }
      }
    } catch (error) {
      console.error("Error in setrankup command:", error);
      return message.reply(lang("error", error.message));
    }
  }
};
