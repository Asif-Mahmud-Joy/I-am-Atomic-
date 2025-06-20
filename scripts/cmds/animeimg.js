const axios = require('axios');

module.exports = {
  config: {
    name: 'animeimg',
    version: '3.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & KSHITIZ',
    role: 0,
    category: '🎭 Anime',
    shortDescription: {
      en: '✨ Generate stunning anime-style images'
    },
    longDescription: {
      en: '🎨 Creates beautiful anime artwork using advanced AI algorithms'
    },
    guide: {
      en: '{pn} [optional theme]'
    }
  },

  onStart: async function ({ api, event, args }) {
    // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
    const atomic = {
      loading: "🎨 Generating your anime masterpiece...",
      success: "✨ Your anime artwork is ready!",
      error: "⚠️ Art generation failed",
      noResults: "🔍 No matching anime art found",
      themes: "🌟 Available themes: waifu, neko, shinobu, megumin",
      divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
      footer: "☣️ ATOMIC v3.0 | Powered by NeuralArt AI"
    };

    try {
      // Show loading message with typing animation
      const loadingMsg = await api.sendMessage(
        `🖌️ ${atomic.loading}\n${atomic.divider}\n${atomic.footer}`,
        event.threadID
      );

      // Determine theme from arguments
      const validThemes = ['waifu', 'neko', 'shinobu', 'megumin'];
      let theme = 'waifu';
      
      if (args[0] && validThemes.includes(args[0].toLowerCase())) {
        theme = args[0].toLowerCase();
      } else if (args[0]) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(
          `${atomic.themes}\n${atomic.divider}\n` +
          `💡 Example: animeimg neko\n${atomic.footer}`,
          event.threadID
        );
      }

      // Simulate art creation process
      const progressStages = [
        "🔍 Analyzing artistic patterns...",
        "🎨 Applying anime art style...",
        "✨ Adding magical elements...",
        "💫 Finalizing masterpiece..."
      ];
      
      for (const [index, stage] of progressStages.entries()) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        await api.sendMessage(
          `${stage}\n${atomic.divider}\n${Math.round((index + 1) * 25)}% complete...`,
          event.threadID
        );
      }

      // Fetch anime image from API
      const response = await axios.get(`https://api.waifu.pics/sfw/${theme}`);
      
      if (!response.data || !response.data.url) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(
          `${atomic.noResults}\n${atomic.divider}\n` +
          `💡 Try a different theme\n${atomic.footer}`,
          event.threadID
        );
      }

      // Get image stream
      const imageStream = await global.utils.getStreamFromURL(response.data.url);

      // Send final result
      await api.sendMessage({
        body: `${atomic.success}\n${atomic.divider}\n` +
              `🎭 Theme: #${theme.toUpperCase()}\n` +
              `${atomic.divider}\n${atomic.footer}`,
        attachment: imageStream
      }, event.threadID, () => {
        api.unsendMessage(loadingMsg.messageID);
      });

    } catch (error) {
      console.error('Anime Image Error:', error);
      api.sendMessage(
        `${atomic.error}\n${atomic.divider}\n` +
        `💡 Please try again later\n${atomic.footer}`,
        event.threadID
      );
    }
  }
};
