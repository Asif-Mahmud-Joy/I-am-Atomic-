// Fixed & Upgraded Album Command with working API injected

const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "album",
    version: "2.0.0",
    role: 0,
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    description: "Stream media from various categories with real-time API support.",
    category: "Media",
    countDown: 5,
    guide: {
      en: "{p}{n} [cartoon/photo/lofi/sad/islamic/funny/horny/anime/love/lyrics/sigma/aesthetic/cat/ff/sex/football/girl/friend/music/gaming] or reply with number",
    },
  },

  onStart: async function ({ api, event, args }) {
    const validCommands = [
      "cartoon", "photo", "lofi", "sad", "islamic", "funny", "horny", "anime",
      "love", "lyrics", "sigma", "aesthetic", "cat", "ff", "sex", "football",
      "girl", "friend", "music", "gaming"
    ];
    const adminID = "61571630409265";
    const baseApiUrl = "https://ultraproapi.onrender.com";
    const jikanApiUrl = "https://api.jikan.moe/v4";

    if (!args[0]) {
      api.setMessageReaction("😘", event.messageID, () => {}, true);
      const albumOptions = [
        "Funny Video", "Islamic Video", "Sad Video", "Anime Video",
        "Cartoon Video", "LoFi Video", "Horny Video (Admin Only)", "Love Video",
        "Flower Video", "Random Photo", "Aesthetic Video", "Sigma Rule",
        "Lyrics Video", "Cat Video", "18+ Video (Admin Only)", "Free Fire Video",
        "Football Video", "Girl Video", "Friends Video", "Music Video", "Gaming Video"
      ];
      const message = 
        "❤️‍🩹 Bhai, ekta option choose kor! <💝\n" +
        "✿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✿\n" +
        albumOptions.map((option, i) => `${i + 1}. ${option} 🐤`).join("\n") +
        "\n✿━━━━━━━━━━━━━━━━━━━━━━━━━━━━━✿\n" +
        "Reply kor number (1–21) diye!";

      await api.sendMessage(message, event.threadID, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          link: albumOptions,
        });
      }, event.messageID);
      return;
    }

    if (["list", "listAll"].includes(args[0])) {
      try {
        const res = await axios.get(`${baseApiUrl}/album?list=dipto`);
        const data = res.data.data;
        const videoCount = data.match(/\d+/g)?.reduce((acc, num) => acc + parseInt(num), 0) || 0;
        if (args[0] === "list") {
          api.sendMessage(`🎥 Total video count: ${videoCount}`, event.threadID, event.messageID);
        } else {
          api.sendMessage(
            `💼 Sob video list dekh! 🩵\n\n${data}\n\n🎥 Total video count: ${videoCount}`,
            event.threadID, event.messageID
          );
        }
      } catch (error) {
        api.sendMessage("⚠️ API down, bhai! Try again later.", event.threadID, event.messageID);
      }
      return;
    }

    const d1 = args[1]?.toLowerCase();
    if (validCommands.includes(d1) && event.messageReply?.attachments?.[0]?.url) {
      api.setMessageReaction("👀", event.messageID, () => {}, true);
      const attachmentUrl = event.messageReply.attachments[0].url;
      let query = d1.replace("photo", "addPhoto");

      try {
        const imgurRes = await axios.get(`${baseApiUrl}/imgur?url=${encodeURIComponent(attachmentUrl)}`);
        const imgurLink = imgurRes.data.data;
        const ext = path.extname(imgurLink).toLowerCase();
        let query2 = ext.match(/\.jpg|\.jpeg|\.png/) ? "addPhoto" : `add${d1.charAt(0).toUpperCase() + d1.slice(1)}`;
        if (!ext.match(/\.jpg|\.jpeg|\.png|\.mp4/)) {
          return api.sendMessage("⚠️ Ei file format support kori na, bhai! (.jpg, .jpeg, .png, .mp4)", event.threadID, event.messageID);
        }
        const uploadRes = await axios.get(`${baseApiUrl}/album?add=${query2}&url=${encodeURIComponent(imgurLink)}`);
        api.sendMessage(
          `✅ ${uploadRes.data.data}\n🔰 ${uploadRes.data.data2}\n🔥 URL: ${imgurLink}`,
          event.threadID, event.messageID
        );
      } catch (error) {
        api.sendMessage(`⚠️ Upload failed! Error: ${error.message}`, event.threadID, event.messageID);
      }
      return;
    }

    if (validCommands.includes(args[0].toLowerCase())) {
      let query = args[0].toLowerCase();
      let cp = `🎥 Naw Baby ${query.charAt(0).toUpperCase() + query.slice(1)} Video`;
      if (query === "anime") {
        try {
          const res = await axios.get(`${jikanApiUrl}/random/anime`);
          const anime = res.data.data;
          const stream = await axios.get(anime.images.jpg.image_url, { responseType: "stream" });
          api.sendMessage({ body: `🎌 Anime: ${anime.title}`, attachment: stream.data }, event.threadID, event.messageID);
        } catch {
          api.sendMessage("⚠️ Anime API nosto!", event.threadID, event.messageID);
        }
      } else {
        try {
          const res = await axios.get(`${baseApiUrl}/album?type=${query}`);
          const stream = await axios.get(res.data.data, { responseType: "stream" });
          api.sendMessage({ body: `${cp}\n🔗 URL: ${res.data.data}`, attachment: stream.data }, event.threadID, event.messageID);
        } catch {
          api.sendMessage("⚠️ Media load holo na, bhai!", event.threadID, event.messageID);
        }
      }
    }
  },

  onReply: async function ({ api, event, Reply }) {
    const adminID = "61571630409265";
    api.unsendMessage(Reply.messageID);
    const reply = parseInt(event.body);
    if (isNaN(reply) || reply < 1 || reply > 21) {
      return api.sendMessage("🔰 Bhai, 1–21 er moddhe reply kor!", event.threadID, event.messageID);
    }

    const baseApiUrl = "https://ultraproapi.onrender.com";
    const jikanApiUrl = "https://api.jikan.moe/v4";
    const options = [
      "funny", "islamic", "sad", "anime", "video", "lofi", "horny", "love", "baby",
      "photo", "aesthetic", "sigma", "lyrics", "cat", "sex", "ff", "football",
      "girl", "friend", "music", "gaming"
    ];
    const captions = [
      "🤣 Naw Baby Funny Video", "😇 Naw Baby Islamic Video", "🥺 Naw Baby Sad Video",
      "😘 Naw Baby Anime Video", "😇 Naw Baby Cartoon Video", "😇 Naw Baby LoFi Video",
      "🥵 Naw Baby Horny Video", "😍 Naw Baby Love Video", "🧑‍🍼 Naw Baby Flower Video",
      "😙 Naw Baby Random Photo", "😙 Naw Baby Aesthetic Video", "🐤 Naw Baby Sigma Rule",
      "🥰 Naw Baby Lyrics Video", "😙 Naw Baby Cat Video", "😙 Naw Baby 18+ Video",
      "😙 Naw Baby Free Fire Video", "😙 Naw Baby Football Video", "😙 Naw Baby Girl Video",
      "😙 Naw Baby Friends Video", "🎶 Naw Baby Music Video", "🎮 Naw Baby Gaming Video"
    ];

    const query = options[reply - 1];
    const cp = captions[reply - 1];
    if (["horny", "sex"].includes(query) && event.senderID !== adminID) {
      return api.sendMessage("⚠️ Ei option shudhu admin er jonno!", event.threadID, event.messageID);
    }

    try {
      if (query === "anime") {
        const res = await axios.get(`${jikanApiUrl}/random/anime`);
        const stream = await axios.get(res.data.data.images.jpg.image_url, { responseType: "stream" });
        api.sendMessage({ body: `🎌 Anime: ${res.data.data.title}`, attachment: stream.data }, event.threadID, event.messageID);
      } else {
        const res = await axios.get(`${baseApiUrl}/album?type=${query}`);
        const stream = await axios.get(res.data.data, { responseType: "stream" });
        api.sendMessage({ body: `${cp}\n🔗 URL: ${res.data.data}`, attachment: stream.data }, event.threadID, event.messageID);
      }
    } catch {
      api.sendMessage("⚠️ Media load holo na, bhai!", event.threadID, event.messageID);
    }
  }
};
