const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

// ⚛️ Atomic design configuration
const ATOMIC_EMOJIS = {
  processing: "⚛️",
  success: "✅",
  error: "❌",
  art: "🎨",
  magic: "✨",
  clock: "⏱️"
};

module.exports = {
  config: {
    name: "anigen",
    aliases: ["animegen", "atomic-art"],
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | Atomic Design",
    version: "3.0",
    cooldowns: 7,
    role: 0,
    shortDescription: {
      en: "⚛️ Generate atomic anime art"
    },
    longDescription: {
      en: "Create high-quality anime images with atomic precision using AI"
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{pn} <your anime prompt>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const cachePath = path.join(__dirname, "cache", "atomic_anigen");
    
    // Atomic design helper function
    const atomicMessage = (content) => {
      return `╔═══════════════════════╗
║   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗥𝗧  ⚛️   ║
╚═══════════════════════╝

${content}
❖━━━━━━━━━━━━━━━━━━━━━━━━━━━❖`;
    };

    if (!args[0]) {
      return api.sendMessage(
        atomicMessage("📝 Please provide a prompt for your anime art!\nExample: /anigen magical girl in neon city"),
        threadID,
        messageID
      );
    }

    try {
      // Set processing reaction
      api.setMessageReaction(ATOMIC_EMOJIS.processing, messageID, () => {}, true);
      
      // Send processing message
      const processingMsg = await api.sendMessage(
        atomicMessage(`${ATOMIC_EMOJIS.processing} Crafting your atomic anime art...`),
        threadID
      );

      const userPrompt = args.join(" ");
      const encodedPrompt = encodeURIComponent(userPrompt);
      
      // ✅ Updated API endpoint
      const apiUrl = `https://api.nekosapi.com/v2/image/random?rating=safe&tags=anime&prompt=${encodedPrompt}`;
      
      const response = await axios.get(apiUrl, {
        headers: {
          'User-Agent': 'AtomicAnigen/3.0',
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      if (!response.data || !response.data.imageUrl) {
        throw new Error("API response was invalid");
      }

      const imageUrl = response.data.imageUrl;
      await fs.ensureDir(cachePath);
      const imagePath = path.join(cachePath, `atomic_art_${Date.now()}.png`);
      
      const imageStream = await axios.get(imageUrl, { 
        responseType: 'stream',
        onDownloadProgress: progressEvent => {
          const percent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          if (percent % 25 === 0) {
            api.sendMessage(
              atomicMessage(`${ATOMIC_EMOJIS.art} Rendering art... ${percent}%`),
              threadID
            );
          }
        }
      });

      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(imagePath);
        imageStream.data.pipe(file);
        file.on("finish", resolve);
        file.on("error", reject);
      });

      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      // Success message
      const successMsg = atomicMessage(
        `${ATOMIC_EMOJIS.success} Atomic Art Created!\n\n` +
        `✨ Prompt: ${userPrompt}\n` +
        `🎨 Style: Anime\n` +
        `⏱️ Time: ${timestamp}`
      );

      // Send the final image
      await api.sendMessage({
        body: successMsg,
        attachment: fs.createReadStream(imagePath)
      }, threadID, () => {
        fs.unlinkSync(imagePath);
        api.unsendMessage(processingMsg.messageID);
      });

      // Update reaction to success
      api.setMessageReaction(ATOMIC_EMOJIS.success, messageID, () => {}, true);

    } catch (error) {
      console.error("Atomic Art Error:", error);
      
      // Error handling with atomic design
      api.setMessageReaction(ATOMIC_EMOJIS.error, messageID, () => {}, true);
      
      const errorMsg = atomicMessage(
        `❌ Atomic Art Creation Failed!\n\n` +
        `⚡ Reason: ${error.message || 'API timeout or invalid response'}\n` +
        `🔧 Tip: Try a different prompt or try again later`
      );
      
      api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};
