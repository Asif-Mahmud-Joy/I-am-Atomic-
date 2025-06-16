const axios = require('axios');
const fs = require('fs-extra');

module.exports = {
  config: {
    name: "art2",
    version: "2.0.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 10,
    role: 0,
    shortDescription: {
      en: 'Prompt to Image (reply image + prompt)' // ✅ Updated
    },
    longDescription: {
      en: 'Reply to an image, add a prompt and model to generate AI artwork.'
    },
    category: "image",
    guide: {
      en: '{pn} prompt | model (optional)' // ✅ Clear format
    }
  },

  onStart: async function ({ api, event, args }) {
    const imageLink = event.messageReply?.attachments?.[0]?.url;
    const content = args.join(" ").split("|").map(i => i.trim());
    const prompt = content[0];
    const model = content[1] || '3';

    if (!imageLink || !prompt) {
      return api.sendMessage(
        "📌 *Usage:* Reply to an image and type prompt like this:\nart2 your_prompt_here | model_number (1/2/3)",
        event.threadID,
        event.messageID
      );
    }

    const API_URL = `https://sandipapi.onrender.com/art?imgurl=${encodeURIComponent(imageLink)}&prompt=${encodeURIComponent(prompt)}&model=${model}`;

    let statusMsgID;
    try {
      const statusMsg = await api.sendMessage("🧠 Generating your image, please wait...", event.threadID);
      statusMsgID = statusMsg.messageID;

      // Stream fetch image
      const response = await axios.get(API_URL, { responseType: 'stream' });
      const imgStream = response.data;

      return api.sendMessage({
        body: `🎨 Prompt: ${prompt}\n🔢 Model: ${model}`,
        attachment: imgStream
      }, event.threadID, () => {
        if (statusMsgID) api.unsendMessage(statusMsgID);
      }, event.messageID);
    } catch (err) {
      console.error("❌ Error:", err.message || err);
      if (statusMsgID) api.unsendMessage(statusMsgID);
      return api.sendMessage("❎ Image generation failed. Please check the image URL or try again later.", event.threadID, event.messageID);
    }
  }
};
