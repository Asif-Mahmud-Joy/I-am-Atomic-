module.exports = {
  config: {
    name: "getlink",
    version: "2.0", // ✅ Updated
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Get direct link of replied media",
    longDescription: {
      en: "Get the direct download link of an image or video by replying to it."
    },
    category: "media",
    guide: {
      en: "{prefix}getlink <reply with img or vid>"
    }
  },

  onStart: async function ({ api, event, message }) {
    const { messageReply } = event;

    if (
      !messageReply ||
      !messageReply.attachments ||
      messageReply.attachments.length !== 1
    ) {
      return message.reply(
        "❌ Format vul! Reply korte hobe ekta image/vid er upor."
      );
    }

    const media = messageReply.attachments[0];
    if (!media.url) {
      return message.reply("❌ File er link khuja paoya jay nai.");
    }

    return message.reply(`✅ File link:
${media.url}`);
  }
};
