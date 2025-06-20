const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "animeinfo",
    aliases: ["anime-details", "mal-search"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & AceGun",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "✨ Search anime details from MyAnimeList"
    },
    longDescription: {
      en: "🔍 Get comprehensive anime information with beautiful presentation"
    },
    category: "🎭 Anime",
    guide: {
      en: "{pn} <anime name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
    const atomic = {
      loading: "🔍 Searching MyAnimeList database...",
      noQuery: "❌ Please provide an anime name to search",
      notFound: "⚠️ Anime not found in database",
      error: "⚠️ Information retrieval failed",
      divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
      footer: "☣️ ATOMIC v3.0 | Powered by MyAnimeList API"
    };

    try {
      const query = args.join(" ");
      
      // Validate query
      if (!query) {
        return api.sendMessage(
          `${atomic.noQuery}\n${atomic.divider}\n` +
          `💡 Usage: animeinfo <anime name>\n` +
          `📝 Example: animeinfo Attack on Titan\n${atomic.footer}`,
          event.threadID,
          event.messageID
        );
      }

      // Send initial loading message
      const loadingMsg = await api.sendMessage(
        `⏳ ${atomic.loading}\n${atomic.divider}\n` +
        `🔎 Searching: "${query}"\n${atomic.footer}`,
        event.threadID
      );

      // Simulate search progress
      const progressStages = [
        "📚 Querying MAL database...",
        "✨ Analyzing anime details...",
        "🎨 Preparing information display...",
        "🖼️ Retrieving artwork..."
      ];

      for (const [index, stage] of progressStages.entries()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await api.sendMessage(
          `${stage}\n${atomic.divider}\n${Math.round((index + 1) * 25)}% complete...`,
          event.threadID
        );
      }

      // Fetch anime data from Jikan API
      const res = await axios.get(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=1`);
      
      if (!res.data.data || res.data.data.length === 0) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(
          `${atomic.notFound}\n${atomic.divider}\n` +
          `💡 Tip: Check spelling or try different keywords\n${atomic.footer}`,
          event.threadID
        );
      }

      const anime = res.data.data[0];
      const imageURL = anime.images.jpg.large_image_url;

      // Download anime image
      const imgPath = path.join(__dirname, `cache/anime_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imgPath);
      const imageResponse = await axios({ url: imageURL, method: 'GET', responseType: 'stream' });
      imageResponse.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on("finish", resolve);
        writer.on("error", reject);
      });

      // Format anime information
      const messageBody = 
        `🎌 ${anime.title}${anime.title_japanese ? ` (${anime.title_japanese})` : ''}\n` +
        `${atomic.divider}\n` +
        `📺 Type: ${anime.type || 'N/A'}\n` +
        `⭐ Score: ${anime.score || 'N/A'} (${anime.scored_by ? `${anime.scored_by.toLocaleString()} votes` : 'N/A'})\n` +
        `📅 Aired: ${anime.aired?.string || 'N/A'}\n` +
        `📊 Status: ${anime.status || 'N/A'}\n` +
        `📝 Episodes: ${anime.episodes || 'N/A'}\n` +
        `⏱️ Duration: ${anime.duration || 'N/A'}\n` +
        `🎭 Genres: ${anime.genres?.map(g => g.name).join(', ') || 'N/A'}\n` +
        `${atomic.divider}\n` +
        `📜 Synopsis:\n${anime.synopsis?.substring(0, 350) || 'No synopsis available'}${anime.synopsis && anime.synopsis.length > 350 ? '...' : ''}\n` +
        `${atomic.divider}\n` +
        `🔗 MyAnimeList: ${anime.url}\n` +
        `${atomic.footer}`;

      // Send results
      await api.sendMessage({
        body: messageBody,
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => {
        fs.unlinkSync(imgPath);
        api.unsendMessage(loadingMsg.messageID);
      });

    } catch (err) {
      console.error("Anime Info Error:", err);
      api.sendMessage(
        `${atomic.error}\n${atomic.divider}\n` +
        `💡 Please try again later\n${atomic.footer}`,
        event.threadID
      );
    }
  }
};
