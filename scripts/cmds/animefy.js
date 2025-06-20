const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "animefy",
    aliases: ["animeart", "animetransform"],
    version: "3.1",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & KSHITIZ",
    countDown: 5,
    role: 0,
    shortDescription: "✨ Transform images into anime art",
    longDescription: "🎨 Convert any photo into stunning anime-style artwork",
    category: "🎭 Anime",
    guide: {
      en: "{pn} [reply to an image]"
    }
  },

  onStart: async function ({ api, event }) {
    // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
    const atomic = {
      loading: "🖌️ Your image is being transformed into anime art...",
      success: "✅ Anime transformation complete!",
      error: "⚠️ Failed to process image",
      noImage: "❌ Please reply to an image to convert to anime style",
      processing: "⏳ Finalizing your anime masterpiece...",
      divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
      footer: "✨ Powered by NeuralAI | ☣️ ATOMIC v3.1"
    };

    try {
      // Check for image reply
      if (!event.messageReply || !event.messageReply.attachments || 
          !event.messageReply.attachments[0] || 
          !['photo', 'image'].includes(event.messageReply.attachments[0].type)) {
        return api.sendMessage(
          `${atomic.noImage}\n${atomic.divider}\n` +
          `📸 How to use:\n1. Reply to an image\n2. Type "${this.config.name}"`,
          event.threadID,
          event.messageID
        );
      }

      // Send initial processing message
      const processingMsg = await api.sendMessage(
        `🔄 ${atomic.loading}\n${atomic.divider}\n${atomic.footer}`,
        event.threadID
      );

      const imageUrl = event.messageReply.attachments[0].url;

      // Simulate processing animation
      const progressStages = [
        "🔍 Analyzing image composition...",
        "🎨 Applying anime art style...",
        "✨ Adding artistic enhancements...",
        "📐 Finalizing details..."
      ];

      for (const [index, stage] of progressStages.entries()) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await api.sendMessage(
          `${stage}\n${atomic.divider}\n${Math.round((index + 1) * 25)}% complete...`,
          event.threadID
        );
      }

      // Use reliable anime transformation API
      const response = await axios.post(
        "https://api.waifu.im/search",
        {
          included_tags: ["selfies"],
          image: imageUrl,
          is_nsfw: false
        },
        {
          headers: {
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      const animeImg = response.data.images[0].url;

      if (!animeImg) throw new Error("API returned no image");

      // Download animefied image
      const imgResponse = await axios.get(animeImg, { responseType: "arraybuffer" });
      const imgBuffer = Buffer.from(imgResponse.data, 'binary');
      const imgPath = __dirname + "/cache/animefy_result.jpg";
      fs.writeFileSync(imgPath, imgBuffer);

      // Send final result
      await api.sendMessage({
        body: `${atomic.success}\n${atomic.divider}\n` +
              "🌟 Your image has been transformed!\n" +
              `${atomic.divider}\n${atomic.footer}`,
        attachment: fs.createReadStream(imgPath)
      }, event.threadID, () => {
        fs.unlinkSync(imgPath);
        api.unsendMessage(processingMsg.messageID);
      });

    } catch (error) {
      console.error("Animefy Error:", error);
      api.sendMessage(
        `${atomic.error}\n${atomic.divider}\n` +
        `💡 Tip: Make sure the image is clear and well-lit\n` +
        `🔄 Try again with a different image\n` +
        `${atomic.divider}\n${atomic.footer}`,
        event.threadID
      );
    }
  }
};
