module.exports = {
  config: {
    name: "bio",
    version: "3.0",
    author: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "⚡ Change bot's atomic bio",
      bn: "⚡ বটের অ্যাটমিক বায়ো পরিবর্তন করুন"
    },
    longDescription: {
      en: "Transform the bot's bio with atomic precision and royal flair",
      bn: "অ্যাটমিক নির্ভুলতা এবং রাজকীয় শৈলী দিয়ে বটের বায়ো রূপান্তর করুন"
    },
    category: "owner",
    guide: {
      en: "{pn} <new bio text>",
      bn: "{pn} <নতুন বায়ো টেক্সট>"
    }
  },

  langs: {
    en: {
      missingInput: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗡𝗣𝗨𝗧 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ Please enter the new bio text.",
      success: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗜𝗢 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n\n▸ Bot's bio transformed to:\n『 %1 』\n\n⚡ Successfully updated with atomic precision",
      error: "⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ Failed to reconfigure bio parameters."
    },
    bn: {
      missingInput: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗡𝗣𝗨𝗧 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n▸ দয়া করে নতুন বায়ো টেক্সট লিখুন।",
      success: "☢️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗜𝗢 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n\n▸ বটের বায়ো সফলভাবে পরিবর্তন করা হয়েছে:\n『 %1 』\n\n⚡ অ্যাটমিক নির্ভুলতার সাথে আপডেট করা হয়েছে",
      error: "⚠️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ বায়ো প্যারামিটার পুনরায় কনফিগার করতে ব্যর্থ হয়েছে।"
    }
  },

  onStart: async function ({ args, message, api, event, getLang }) {
    try {
      // Simulate atomic processing animation
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
      
      const newBio = args.join(" ");
      if (!newBio) {
        api.setMessageReaction("⚠️", event.messageID, () => {}, true);
        return message.reply(getLang("missingInput"));
      }

      // Simulate typing effect
      api.sendTyping(event.threadID);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      await api.changeBio(newBio);
      
      // Success reaction and message
      api.setMessageReaction("✅", event.messageID, () => {}, true);
      const successMessage = getLang("success", newBio);
      
      // Enhanced formatting for success message
      const formattedMessage = 
        `☣️┃𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗜𝗢 𝗨𝗣𝗗𝗔𝗧𝗘𝗥☣️\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `${successMessage}\n` +
        `━━━━━━━━━━━━━━━━━━━\n` +
        `✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨`;
      
      message.reply(formattedMessage);
      
    } catch (err) {
      console.error("Atomic bio error:", err);
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      message.reply(getLang("error"));
    }
  }
};
