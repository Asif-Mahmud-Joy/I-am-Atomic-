module.exports = {
  config: {
    name: "youtube",
    version: "1.1",
    role: 0,
    author: "Mr.Smokey[Asif Mahmud]",
    cooldowns: 40,
    shortDescription: {
      en: "Send YouTube video",
      bn: "ইউটিউব ভিডিও পাঠান",
      bnglish: "Youtube video pathan"
    },
    longDescription: {
      en: "Searches and sends YouTube video",
      bn: "ইউটিউব ভিডিও খুঁজে পাঠানো হয়",
      bnglish: "Youtube video khuje pathano hoy"
    },
    category: "video",
    usages: {
      en: "{pn} video name",
      bn: "{pn} ভিডিওর নাম",
      bnglish: "{pn} video nam"
    },
    dependencies: {
      "fs-extra": "",
      "request": "",
      "axios": "",
      "ytdl-core": "",
      "yt-search": ""
    }
  },

  onStart: async ({ api, event }) => {
    const axios = require("axios");
    const fs = require("fs-extra");
    const ytdl = require("ytdl-core");
    const request = require("request");
    const yts = require("yt-search");

    const input = event.body;
    const text = input.substring(12);
    const data = input.split(" ");

    if (data.length < 2) {
      return api.sendMessage("⚠️ ভিডিওর নাম দিন বা video name likhun.", event.threadID);
    }

    data.shift();
    const videoName = data.join(" ");

    try {
      api.sendMessage(`🔎 \"${videoName}\" খোঁজা হচ্ছে... Please wait...`, event.threadID);

      const searchResults = await yts(videoName);
      if (!searchResults.videos.length) {
        return api.sendMessage("❌ কোনো ভিডিও পাওয়া যায়নি / No video found.", event.threadID, event.messageID);
      }

      const video = searchResults.videos[0];
      const videoUrl = video.url;
      const stream = ytdl(videoUrl, { filter: "audioandvideo" });

      const fileName = `${event.senderID}.mp4`;
      const filePath = __dirname + `/cache/${fileName}`;

      stream.pipe(fs.createWriteStream(filePath));

      stream.on('response', () => {
        console.info('[DOWNLOADER]', 'Starting download now!');
      });

      stream.on('info', (info) => {
        console.info('[DOWNLOADER]', `Downloading video: ${info.videoDetails.title}`);
      });

      stream.on('end', () => {
        console.info('[DOWNLOADER] Downloaded');

        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage('❌ ফাইলটি 25MB এর বেশি হওয়ায় পাঠানো যাচ্ছে না / File too large to send (25MB limit).', event.threadID);
        }

        const message = {
          body: `🎬 আপনার ভিডিওটি নিচে দেওয়া হলো / Here is your video:

📌 শিরোনাম / Title: ${video.title}
⏰ সময় / Duration: ${video.duration.timestamp}`,
          attachment: fs.createReadStream(filePath)
        };

        api.sendMessage(message, event.threadID, () => {
          fs.unlinkSync(filePath);
        });
      });
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('❗ একটি ত্রুটি হয়েছে / An error occurred.', event.threadID);
    }
  }
};
