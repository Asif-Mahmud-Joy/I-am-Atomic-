const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["animedetails"],
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "MyAnimeList theke anime info khojo"
    },
    longDescription: {
      en: "MyAnimeList API diye kono anime'r full info ber koro with poster"
    },
    category: "anime",
    guide: {
      en: "{pn} animeinfo <anime name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const query = args.join(" ");
    if (!query)
      return api.sendMessage("❌ Kono anime name dao. Usage: animeinfo <anime name>", event.threadID, event.messageID);

    const loading = await api.sendMessage(`🔎 Anime khoja hocche: ${query}`, event.threadID);

    try {
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
      const anime = res.data.data[0];

      if (!anime) return api.sendMessage("❌ Kono info pawa jaini.", event.threadID, event.messageID);

      const imageURL = anime.images.jpg.large_image_url || anime.images.jpg.image_url;
      const imgPath = path.join(__dirname, `tmp_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imgPath);

      const response = await axios({ url: imageURL, method: 'GET', responseType: 'stream' });
      response.data.pipe(writer);

      writer.on("finish", () => {
        const message = `🎌 Title: ${anime.title}
🈶 Japanese: ${anime.title_japanese}
📺 Type: ${anime.type}
📅 Aired: ${anime.aired.string}
📊 Score: ${anime.score} (${anime.scored_by} users)
🏅 Rank: ${anime.rank} | Popularity: ${anime.popularity}
🔞 Rating: ${anime.rating}
📺 Episodes: ${anime.episodes}
⏱️ Duration: ${anime.duration}
📚 Source: ${anime.source}
📜 Synopsis:\n${anime.synopsis}\n🔗 URL: ${anime.url}`;

        api.sendMessage({ body: message, attachment: fs.createReadStream(imgPath) }, event.threadID, () => fs.unlinkSync(imgPath), event.messageID);
      });

    } catch (err) {
      console.error(err);
      return api.sendMessage("❌ Error: Anime info pawa jayna.", event.threadID, event.messageID);
    }

    setTimeout(() => {
      api.unsendMessage(loading.messageID);
    }, 3000);
  }
};
