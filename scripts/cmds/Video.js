const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "video",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Get anime video by category",
    longDescription: "Send a random video from a specific anime category",
    category: "media",
    guide: "{p}{n} <category>",
  },

  sentVideos: {},

  videos: {
    naruto: [
      "https://drive.google.com/uc?export=download&id=1OP2zmycLmFihRISVLzFwrw__LRBsF9GN"
    ],
    bleach: [
      "https://drive.google.com/uc?export=download&id=1bds-i6swtqi2k4YCoglPKTV7kL7f-SF7"
    ],
    onepiece: [
      "https://drive.google.com/uc?export=download&id=1QaK3EfNmbwAgpJm4czY8n8QRau9MXoaR"
    ]
  },

  onStart: async function ({ api, event, message, args }) {
    const senderID = event.senderID;

    const loadingMessage = await message.reply("⏳ Loading your anime video... Please wait!");

    if (!args.length) {
      api.unsendMessage(loadingMessage.messageID);
      return message.reply(`📂 Please provide a category. Available: ${Object.keys(this.videos).join(", ")}`);
    }

    const category = args[0].toLowerCase();
    const categoryVideos = this.videos[category];

    if (!categoryVideos) {
      api.unsendMessage(loadingMessage.messageID);
      return message.reply(`❌ Invalid category. Available: ${Object.keys(this.videos).join(", ")}`);
    }

    if (!this.sentVideos[category]) this.sentVideos[category] = [];

    let availableVideos = categoryVideos.filter(v => !this.sentVideos[category].includes(v));

    if (availableVideos.length === 0) {
      this.sentVideos[category] = [];
      availableVideos = [...categoryVideos];
    }

    const selectedVideo = availableVideos[Math.floor(Math.random() * availableVideos.length)];
    this.sentVideos[category].push(selectedVideo);

    try {
      const stream = await global.utils.getStreamFromURL(selectedVideo);
      message.reply({
        body: `🎬 Enjoy this ${category} video! 💫`,
        attachment: stream,
      });
    } catch (e) {
      message.reply("⚠️ Failed to load the video. Please try again later.");
    } finally {
      api.unsendMessage(loadingMessage.messageID);
    }
  },
};
