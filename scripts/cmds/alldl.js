const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

// ⚛️ Atomic design configuration
const ATOMIC_EMOJIS = {
  processing: "⚛️",
  success: "✅",
  error: "❌",
  download: "📥",
  link: "🔗",
  media: "🎬",
  clock: "⏱️"
};

const baseApiUrl = async () => {
  try {
    const base = await axios.get("https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json");
    return base.data.api;
  } catch (error) {
    console.error("⚛️ Atomic API Error:", error.message);
    return "https://fallback-api.example.com";
  }
};

module.exports = {
  config: {
    name: "alldl",
    version: "3.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | Atomic Design",
    countDown: 2,
    role: 0,
    description: {
      en: "⚛️ Download media from various platforms with atomic precision"
    },
    category: "𝗠𝗘𝗗𝗜𝗔",
    guide: {
      en: "{pn} <video_link> or reply to a message with link"
    }
  },

  onStart: async function ({ api, args, event }) {
    const { threadID, messageID, senderID } = event;
    const inputUrl = event.messageReply?.body || args[0];
    
    // Atomic design helper function
    const atomicMessage = (content) => {
      return `╔═══════════════════════╗
║   ⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗠𝗘𝗗𝗜𝗔  ⚛️   ║
╚═══════════════════════╝

${content}
❖━━━━━━━━━━━━━━━━━━━━━━━━━━━❖`;
    };

    if (!inputUrl) {
      api.setMessageReaction(ATOMIC_EMOJIS.error, messageID, () => {}, true);
      return api.sendMessage(
        atomicMessage("⚠️ Please provide a valid link to download"),
        threadID,
        messageID
      );
    }

    try {
      // Show atomic processing indicator
      api.setMessageReaction(ATOMIC_EMOJIS.processing, messageID, () => {}, true);
      
      // Send processing message
      const processingMsg = await api.sendMessage(
        atomicMessage(`${ATOMIC_EMOJIS.processing} Processing your request with atomic precision...`),
        threadID
      );

      // Get API URL
      const apiUrl = await baseApiUrl();
      const { data } = await axios.get(`${apiUrl}/alldl?url=${encodeURIComponent(inputUrl)}`);
      
      // Ensure cache directory exists
      const cacheDir = path.join(__dirname, "cache", "atomic_media");
      await fs.ensureDir(cacheDir);
      const filePath = path.join(cacheDir, `atomic_media_${Date.now()}.mp4`);

      // Download the media with progress tracking
      let progressPercent = 0;
      const videoResponse = await axios.get(data.result, { 
        responseType: "arraybuffer",
        onDownloadProgress: progressEvent => {
          const newPercent = Math.floor((progressEvent.loaded * 100) / progressEvent.total);
          if (newPercent > progressPercent + 25 || newPercent === 100) {
            progressPercent = newPercent;
            api.sendMessage(
              atomicMessage(`${ATOMIC_EMOJIS.download} Downloading... ${progressPercent}%`),
              threadID
            );
          }
        }
      });

      await fs.writeFile(filePath, Buffer.from(videoResponse.data, "binary"));
      
      // Get file size
      const stats = fs.statSync(filePath);
      const fileSize = (stats.size / (1024 * 1024)).toFixed(2);
      const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Prepare success message
      const successMsg = atomicMessage(
        `${ATOMIC_EMOJIS.success} Download Complete!\n\n` +
        `⚡ Source: ${data.cp || 'Unknown Platform'}\n` +
        `${ATOMIC_EMOJIS.link} URL: ${await global.utils.shortenURL(data.result)}\n` +
        `📦 Size: ${fileSize} MB\n` +
        `${ATOMIC_EMOJIS.clock} Time: ${timestamp}`
      );

      // Send media with success message
      await api.sendMessage({
        body: successMsg,
        attachment: fs.createReadStream(filePath)
      }, threadID, () => fs.unlinkSync(filePath));

      // Remove processing message
      api.unsendMessage(processingMsg.messageID);

      // Update reaction to success
      api.setMessageReaction(ATOMIC_EMOJIS.success, messageID, () => {}, true);

    } catch (error) {
      // Error handling with atomic design
      api.setMessageReaction(ATOMIC_EMOJIS.error, messageID, () => {}, true);
      
      const errorMsg = atomicMessage(
        `❌ Atomic Download Failed!\n\n` +
        `⚡ Reason: ${error.message || 'Unknown error'}\n` +
        `🔧 Tip: Please check your link and try again`
      );
      
      api.sendMessage(errorMsg, threadID, messageID);
    }
  }
};
