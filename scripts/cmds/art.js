const axios = require("axios");

module.exports = {
  config: {
    name: "art",
    role: 0,
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    longDescription: "Image AI Art Generator from prompt + image",
    category: "AI",
    guide: {
      en: "{pn} reply to an image with a prompt and optionally choose model (1 - 52), e.g.: 'a dragon flying over city | 12'"
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const text = args.join(' ');

    if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0]?.url) {
      return message.reply("❌ Please reply to an image and give a prompt. Format: prompt | model (optional)");
    }

    const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
    const [prompt, model] = text.split('|').map((s) => s.trim());

    if (!prompt) return message.reply("❌ Prompt missing. Format: prompt | model");

    const chosenModel = model || "37"; // default fallback
    const apiUrl = `https://sandipapi.onrender.com/art?imgurl=${imageUrl}&prompt=${encodeURIComponent(prompt)}&model=${chosenModel}`;

    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    message.reply("✅ Generating image, please wait...", async (err, info) => {
      let statusMsgID = info?.messageID;
      try {
        const attachment = await global.utils.getStreamFromURL(apiUrl);
        await message.reply({ attachment });
        if (statusMsgID) message.unsend(statusMsgID);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      } catch (err) {
        console.error("Image generation error:", err);
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        message.reply("❎ Failed to generate image. Please try again later or check the prompt/API.");
      }
    });
  }
};
