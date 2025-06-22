const deltaNext = global.GoatBot.configCommands.envCommands.rank.deltaNext;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
const { drive } = global.utils;

module.exports = {
  config: {
    name: "rankup",
    version: "2.1.0",
    author: "NTKhang & Modified by ✨Asif✨",
    countDown: 5,
    role: 0,
    description: {
      vi: "Bật/tắt thông báo level up",
      en: "Turn on/off level up notification",
      bn: "Level up notification চালু/বন্ধ করুন"
    },
    category: "rank",
    guide: {
      en: "{pn} [on | off]",
      bn: "{pn} [on | off]"
    },
    envConfig: {
      deltaNext: 5
    }
  },

  langs: {
    vi: {
      syntaxError: "Sai cú pháp, chỉ có thể dùng {pn} on hoặc {pn} off",
      turnedOn: "Đã bật thông báo level up",
      turnedOff: "Đã tắt thông báo level up",
      notiMessage: "🎉🎉 chúc mừng bạn đạt level %1"
    },
    en: {
      syntaxError: "Syntax error, only use {pn} on or {pn} off",
      turnedOn: "Turned on level up notification",
      turnedOff: "Turned off level up notification",
      notiMessage: "🎉🎉 Congratulations on reaching level %1"
    },
    bn: {
      syntaxError: "ভুল সিনট্যাক্স, শুধুমাত্র {pn} on অথবা {pn} off ব্যবহার করুন",
      turnedOn: "লেভেল আপ নোটিফিকেশন চালু করা হয়েছে",
      turnedOff: "লেভেল আপ নোটিফিকেশন বন্ধ করা হয়েছে",
      notiMessage: "🎉🎉 অভিনন্দন! আপনি লেভেল %1 এ পৌঁছেছেন"
    }
  },

  onStart: async function ({ message, event, threadsData, args, getLang }) {
    if (!["on", "off"].includes(args[0]))
      return message.reply(getLang("syntaxError"));
    
    await threadsData.set(event.threadID, args[0] === "on", "settings.sendRankupMessage");
    return message.reply(getLang(args[0] === "on" ? "turnedOn" : "turnedOff"));
  },

  onChat: async function ({ threadsData, usersData, event, message, getLang }) {
    const threadData = await threadsData.get(event.threadID);
    if (!threadData.settings?.sendRankupMessage)
      return;

    const { exp } = await usersData.get(event.senderID);
    const currentLevel = expToLevel(exp);
    const previousLevel = expToLevel(exp - 1);

    if (currentLevel <= previousLevel)
      return;

    // Get custom message and attachments
    const rankupData = threadData.data?.rankup || {};
    let { message: customMessage, attachments: files = [] } = rankupData;
    const userData = await usersData.get(event.senderID);

    // Prepare message content
    const formMessage = {
      body: customMessage 
        ? this.processCustomMessage(customMessage, userData, currentLevel, previousLevel)
        : getLang("notiMessage", currentLevel)
    };

    // Handle attachments if any
    if (files.length > 0) {
      try {
        formMessage.attachment = await this.getAttachments(files);
      } catch (error) {
        console.error("Error loading attachments:", error);
      }
    }

    // Add mention if needed
    if (customMessage?.includes("{userNameTag}")) {
      formMessage.mentions = [{
        tag: `@${userData.name}`,
        id: event.senderID
      }];
    }

    // Send the rankup message
    message.reply(formMessage);
  },

  // Helper function to process custom message templates
  processCustomMessage: (message, userData, currentLevel, previousLevel) => {
    return message
      .replace(/{userName}/g, userData.name)
      .replace(/{userNameTag}/g, `@${userData.name}`)
      .replace(/{oldRank}/g, previousLevel)
      .replace(/{currentRank}/g, currentLevel);
  },

  // Helper function to get attachments
  getAttachments: async function(files) {
    const attachments = await Promise.allSettled(
      files.map(file => drive.getFile(file, "stream"))
    );
    return attachments
      .filter(({ status }) => status === "fulfilled")
      .map(({ value }) => value);
  }
};
