const { writeFileSync, existsSync, mkdirSync } = require("fs");
const { join } = require("path");
const axios = require("axios");
const fs = require("fs");

module.exports = {
  config: {
    name: "remini",
    aliases: [],
    version: "3.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 20,
    role: 2,
    shortDescription: "image enhancement",
    longDescription: "Enhance low quality images using online AI API.",
    category: "tool",
    guide: {
      en: "{p}remini (reply to an image)"
    }
  },

  onStart: async function ({ message, event, api }) {
    api.setMessageReaction("🕐", event.messageID, () => {}, true);

    const { type, messageReply } = event;
    if (type !== "message_reply" || !messageReply?.attachments?.length) {
      return message.reply("📌 দয়া করে একটি ছবির উপর reply দিন");
    }

    const [attachment] = messageReply.attachments;
    const { url, type: attachmentType } = attachment;

    if (!["photo"].includes(attachmentType)) {
      return message.reply("❌ শুধুমাত্র ছবি reply করলেই enhancement কাজ করবে।");
    }

    try {
      // Enhance API (working, no need for TinyURL)
      const enhanceApiUrl = `https://image-enhancer-api.vercel.app/upscale?image_url=${encodeURIComponent(url)}`;
      const { data } = await axios.get(enhanceApiUrl, { responseType: "arraybuffer" });

      const cachePath = join(__dirname, "cache");
      if (!existsSync(cachePath)) mkdirSync(cachePath);
      const filePath = join(cachePath, `remini_${Date.now()}.png`);
      writeFileSync(filePath, data);

      await message.reply({ body: "✅ ছবিটি উন্নত করা হয়েছে!", attachment: fs.createReadStream(filePath) });
    } catch (err) {
      console.error(err);
      message.reply("❌ ছবি উন্নত করতে গিয়ে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }
  }
};
