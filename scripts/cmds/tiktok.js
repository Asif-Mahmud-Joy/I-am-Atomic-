const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  config: {
    name: "tiktok",
    version: "2.1",
    author: "Mr.Smokey {Asif Mahmud}",
    countDown: 20,
    role: 0,
    shortDescription: "Search and download TikTok videos",
    longDescription: {
      en: "Search for TikTok videos based on keywords and download the first result."
    },
    category: "media",
    guide: {
      en: "{pn} <search text> - Search for TikTok videos"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const searchQuery = args.join(" ");

    if (!searchQuery) {
      return api.sendMessage("Usage: tiktok <search text>", event.threadID);
    }

    let searchMessageID;
    api.sendMessage("🔍 Searching TikTok... Please wait.", event.threadID, (err, info) => {
      if (!err) searchMessageID = info.messageID;
    });

    try {
      const apiUrl = `https://tanjiro-api-v2.vercel.app/tiktok/search?q=${encodeURIComponent(searchQuery)}`;
      const response = await axios.get(apiUrl);

      const videos = response.data.result;
      if (!videos || videos.length === 0) {
        return api.sendMessage("❌ No TikTok videos found.", event.threadID);
      }

      const video = videos[0];
      const videoUrl = video.play;
      const caption = `🎬 TikTok Video
👤 Author: ${video.author.unique_id || video.author.nickname}`;

      const filePath = path.join(__dirname, "/cache/tiktok_video.mp4");
      const writer = fs.createWriteStream(filePath);

      const videoStream = await axios({ method: 'get', url: videoUrl, responseType: 'stream' });
      videoStream.data.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: caption,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, event.messageID);

        fs.unlinkSync(filePath);
        if (searchMessageID) api.unsendMessage(searchMessageID);
      });

    } catch (error) {
      console.error("TikTok API Error:", error);
      api.sendMessage("❌ Failed to fetch TikTok video.", event.threadID);
      if (searchMessageID) api.unsendMessage(searchMessageID);
    }
  }
};
