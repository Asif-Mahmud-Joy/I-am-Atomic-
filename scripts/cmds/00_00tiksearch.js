const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "tiktokid",
    aliases: ["tikuser"],
    version: "7.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 15,
    role: 0,
    shortDescription: "Download TikTok videos from username",
    longDescription: "Get latest TikTok videos from a username and choose which to download.",
    category: "downloader",
    guide: {
      en: "{pn} [username] [limit]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const user = args[0];
    const limit = args[1] || 1;

    if (!user) return api.sendMessage("Please provide a TikTok username.", event.threadID, event.messageID);

    try {
      const response = await axios.get(`https://api.tikwm.com/user/posts?unique_id=${user}&count=${limit}`);
      const videos = response.data.data;

      if (!videos || videos.length === 0) return api.sendMessage("No videos found for this username.", event.threadID, event.messageID);

      const options = videos.map((video, i) => `${i + 1}. ${video.title || 'No Title'}`);
      const msg = `🎵 TikTok Videos by @${user}

` + options.join("\n") + "\n\n👉 Reply with the number of the video to download.";

      const filenames = [];
      for (let i = 0; i < limit; i++) {
        const imgUrl = videos[i].cover;
        const filename = path.join(__dirname, `cache/tiktok_thumb_${i + 1}.jpg`);
        const imgData = await axios.get(imgUrl, { responseType: 'arraybuffer' });
        fs.writeFileSync(filename, Buffer.from(imgData.data, 'binary'));
        filenames.push(filename);
      }

      const attachments = filenames.map(file => fs.createReadStream(file));

      api.sendMessage({
        body: msg,
        attachment: attachments
      }, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: 'reply',
          messageID: info.messageID,
          author: event.senderID,
          videos,
          thumbs: filenames
        });
      }, event.messageID);
    } catch (err) {
      api.sendMessage("❌ Failed to fetch videos. Username invalid or API error.", event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const { videos, thumbs, messageID } = Reply;

    api.unsendMessage(messageID);
    const index = parseInt(event.body);
    if (isNaN(index) || index < 1 || index > videos.length) {
      return api.sendMessage(`Please reply with a number between 1 and ${videos.length}.`, event.threadID, event.messageID);
    }

    try {
      const videoUrl = videos[index - 1].play;
      const res = await axios.get(videoUrl, { responseType: 'arraybuffer' });
      const filepath = path.join(__dirname, 'cache', `tiktok_video.mp4`);
      fs.writeFileSync(filepath, Buffer.from(res.data, 'binary'));

      api.sendMessage({
        body: `✅ Here's your video from TikTok`,
        attachment: fs.createReadStream(filepath)
      }, event.threadID, () => {
        fs.unlinkSync(filepath);
        thumbs.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
      });
    } catch (err) {
      api.sendMessage("❌ Failed to download video.", event.threadID, event.messageID);
    }
  }
};
