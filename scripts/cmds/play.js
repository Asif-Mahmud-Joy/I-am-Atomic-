module.exports = {
  config: {
    name: "play",
    version: "2.0",
    role: 0,
    author: "KSHITIZ + Updated by ChatGPT",
    cooldowns: 5,
    shortDescription: {
      en: "Play song with lyrics",
      bn: "গানের সাথেই লিরিক শোনান"
    },
    longDescription: {
      en: "Always use official music title for accurate lyrics.",
      bn: "সঠিক লিরিক পেতে অফিসিয়াল গান টাইটেল ব্যবহার করুন।"
    },
    category: "music",
    guide: {
      en: "{pn} play (song name)",
      bn: "{pn} play (গানের নাম)"
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
    const yts = require("yt-search");

    const input = event.body;
    const song = input.slice(input.indexOf(" ") + 1);

    if (!song) return api.sendMessage("⚠️ অনুগ্রহ করে গানের নাম লিখুন।\n🔊 উদাহরণ: play Tum Hi Ho", event.threadID);

    try {
      api.sendMessage(`🕵️‍♂️ গানের নামঃ "${song}"\n🔍 লিরিক্স এবং গান খোঁজা হচ্ছে...⏳`, event.threadID);

      const lyricsRes = await axios.get(`https://lyrist.vercel.app/api/${encodeURIComponent(song)}`);
      const { lyrics = "Lyrics not found.", title = song, artist = "Unknown Artist" } = lyricsRes.data;

      const ytRes = await yts(song);
      const video = ytRes.videos[0];
      if (!video) return api.sendMessage("❌ গান পাওয়া যায়নি! অন্য নাম দিয়ে চেষ্টা করুন।", event.threadID);

      const filePath = `${__dirname}/cache/${event.senderID}_song.mp3`;
      const stream = ytdl(video.url, { filter: "audioonly" });

      stream.pipe(fs.createWriteStream(filePath));

      stream.on("end", async () => {
        if (fs.statSync(filePath).size > 26214400) {
          fs.unlinkSync(filePath);
          return api.sendMessage("❌ গানটি 25MB এর বেশি হওয়ায় পাঠানো যাচ্ছে না।", event.threadID);
        }

        api.sendMessage({
          body: `🎵 Title: ${title}\n🎤 Artist: ${artist}\n📜 Lyrics:\n${lyrics}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID, () => fs.unlinkSync(filePath));
      });

    } catch (err) {
      console.error("[PLAY ERROR]", err);
      api.sendMessage("⚠️ কিছু ভুল হয়েছে! পরে আবার চেষ্টা করুন।", event.threadID);
    }
  }
};
