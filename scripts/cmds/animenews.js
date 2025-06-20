const axios = require("axios");

module.exports = {
  config: {
    name: "aninews",
    aliases: ["animenews", "malnews"],
    version: "3.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & KSHITIZ",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "✨ Latest anime news from MyAnimeList"
    },
    longDescription: {
      en: "📰 Get the top anime news headlines with beautiful presentation"
    },
    category: "🎭 Anime",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
    const atomic = {
      loading: "📡 Connecting to MyAnimeList servers...",
      success: "✨ TOP 5 ANIME NEWS UPDATES",
      error: "⚠️ Failed to fetch news updates",
      noNews: "🔍 No recent anime news found",
      divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
      footer: "☣️ ATOMIC v3.1 | Source: MyAnimeList"
    };

    try {
      // Send loading message with typing animation simulation
      const loadingMsg = await api.sendMessage(
        `⏳ ${atomic.loading}\n${atomic.divider}\n${atomic.footer}`,
        event.threadID
      );

      // Simulate news loading process with typing animation effect
      const progressStages = [
        {text: "📡 Retrieving news feed...", delay: 1800},
        {text: "📊 Analyzing top headlines...", delay: 1500},
        {text: "✨ Formatting news presentation...", delay: 1200},
        {text: "🎨 Applying ATOMIC design...", delay: 1000},
        {text: "✅ Preparing final updates...", delay: 800}
      ];

      for (const [index, stage] of progressStages.entries()) {
        await new Promise(resolve => {
          // Simulate typing effect
          let typedText = "";
          let i = 0;
          const typingInterval = setInterval(() => {
            if (i < stage.text.length) {
              typedText += stage.text.charAt(i);
              api.editMessage(
                `${typedText}\n${atomic.divider}\n${Math.round((index + 1) * 20)}% complete...`,
                loadingMsg.messageID
              );
              i++;
            } else {
              clearInterval(typingInterval);
              setTimeout(resolve, stage.delay);
            }
          }, 50);
        });
      }

      // Fetch anime news from Jikan API
      const { data } = await axios.get("https://api.jikan.moe/v4/news/anime", {
        timeout: 10000
      });

      if (!data || !data.data || data.data.length === 0) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(
          `${atomic.noNews}\n${atomic.divider}\n${atomic.footer}`,
          event.threadID
        );
      }

      // Process top 5 news items
      const newsList = data.data.slice(0, 5);
      
      // Format news with beautiful presentation
      let newsBody = `📰 ${atomic.success}\n${atomic.divider}\n\n`;
      
      newsList.forEach((news, index) => {
        // Format date
        const date = new Date(news.date);
        const formattedDate = `${date.getDate()}/${date.getMonth()+1}/${date.getFullYear()}`;
        
        // Create news card
        newsBody += `🔹 ${index + 1}. ${news.title}\n`;
        newsBody += `   ┣✦ Author: ${news.author_username}\n`;
        newsBody += `   ┣✦ Date: ${formattedDate}\n`;
        newsBody += `   ┗✦ URL: ${news.url}\n\n`;
      });

      // Add final divider and footer
      newsBody += `${atomic.divider}\n${atomic.footer}`;

      // Send final news updates
      await api.editMessage(newsBody, loadingMsg.messageID);

    } catch (err) {
      console.error("Anime News Error:", err);
      api.sendMessage(
        `${atomic.error}\n${atomic.divider}\n` +
        `💡 Please try again later\n${atomic.footer}`,
        event.threadID
      );
    }
  }
};
