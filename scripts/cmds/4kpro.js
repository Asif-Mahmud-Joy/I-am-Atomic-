const axios = require("axios");
const fs = require("fs-extra");
const moment = require("moment-timezone");

// ☣️⚛️ ATOMIC CONFIGURATION ⚛️☣️
const config = {
  ADMIN_IDS: ["61571630409265"],
  MAX_INPUT_SIZE_MB: 5,
  TIMEOUT_MS: 30000,
  PRIMARY_API: "https://api.popcat.xyz/upscale",
  FALLBACK_API: "https://smfahim.onrender.com/4k",
  TEMP_DIR: __dirname + "/cache",
  DESIGN: {
    HEADER: "☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝟒𝐊 𝐔𝐏𝐒𝐂𝐀𝐋𝐄𝐑 ⚛️☣️",
    FOOTER: "✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡 ⚡️",
    SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
    EMOJI: {
      SUCCESS: "✅",
      ERROR: "❌",
      WARNING: "⚠️",
      PROCESSING: "⏳",
      IMAGE: "🖼️",
      DOWNLOAD: "📥",
      UPSAMPLE: "🚀"
    }
  }
};

// ▰▰▰▰▰▰▰▰▰▰ PROGRESS BAR ▰▰▰▰▰▰▰▰▰▰
function generateProgressBar(percentage) {
  const blocks = 15;
  const completed = Math.round(blocks * (percentage / 100));
  return `▰`.repeat(completed) + `▱`.repeat(blocks - completed);
}

module.exports = {
  config: {
    name: "4kpro",
    aliases: ["upscale", "enhance"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "☣️⚛️ Enhance images to 4K quality",
    longDescription: "Professional image upscaling with Atomic design",
    category: "media",
    guide: {
      en: `{pn} [reply to image]: Enhance to 4K resolution`
    }
  },

  langs: {
    en: {
      noImage: "Please reply to an image to enhance it",
      invalidImageType: "Attachment must be an image file",
      imageTooLarge: "Image exceeds size limit (%1MB)",
      processing: "Enhancing your image...",
      success: "4K enhancement complete!",
      apiError: "Upscaling service unavailable",
      networkError: "Network connection issue",
      fileError: "Image processing failed",
      timeoutError: "Processing timed out (%1s)",
      progress: "Processing: %1% complete"
    }
  },

  onStart: async function ({ message, event, getLang, api }) {
    // Create cache directory if needed
    if (!fs.existsSync(config.TEMP_DIR)) {
      fs.mkdirSync(config.TEMP_DIR, { recursive: true });
    }

    // Validate reply and attachment
    if (!event.messageReply || !event.messageReply.attachments?.[0]) {
      return this.sendAtomicMessage(message, `${config.DESIGN.EMOJI.ERROR} ${getLang("noImage")}`);
    }
    
    const attachment = event.messageReply.attachments[0];
    if (!attachment.type?.startsWith("image")) {
      return this.sendAtomicMessage(message, `${config.DESIGN.EMOJI.ERROR} ${getLang("invalidImageType")}`);
    }

    const imageURL = attachment.url;
    const tempPath = path.join(config.TEMP_DIR, `atomic_4k_${Date.now()}.png`);
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");

    // Start typing simulation
    api.setMessageReaction(config.DESIGN.EMOJI.PROCESSING, event.messageID, () => {}, true);

    // Check image size
    try {
      const headResponse = await axios.head(imageURL);
      const contentLength = headResponse.headers["content-length"];
      const sizeMB = contentLength ? contentLength / (1024 * 1024) : 0;
      
      if (sizeMB > config.MAX_INPUT_SIZE_MB) {
        return this.sendAtomicMessage(
          message, 
          `${config.DESIGN.EMOJI.WARNING} ${getLang("imageTooLarge", config.MAX_INPUT_SIZE_MB)}`
        );
      }
    } catch (error) {
      return this.sendAtomicMessage(
        message, 
        `${config.DESIGN.EMOJI.ERROR} ${getLang("networkError")}`
      );
    }

    // Send initial processing message
    const processingMsg = await this.sendAtomicMessage(
      message,
      `${config.DESIGN.EMOJI.PROCESSING} ${getLang("processing")}\n` +
      `${generateProgressBar(25)} 25%\n` +
      `🕒 ${time} | 🔄 Starting enhancement...`
    );

    try {
      // Update progress
      await this.updateProgress(message, processingMsg.messageID, 50, "Downloading image...");
      
      // Try primary API
      let response;
      try {
        response = await axios.get(`${config.PRIMARY_API}?image=${encodeURIComponent(imageURL)}`, {
          responseType: "arraybuffer",
          timeout: config.TIMEOUT_MS
        });
      } catch (primaryError) {
        // Try fallback API
        await this.updateProgress(message, processingMsg.messageID, 65, "Using backup service...");
        
        try {
          const fallbackResponse = await axios.get(`${config.FALLBACK_API}?url=${encodeURIComponent(imageURL)}`, {
            timeout: config.TIMEOUT_MS
          });
          response = { 
            data: await axios.get(fallbackResponse.data.image, { 
              responseType: "arraybuffer" 
            }).then(res => res.data) 
          };
        } catch (fallbackError) {
          throw new Error("API_FAILURE");
        }
      }

      // Update progress
      await this.updateProgress(message, processingMsg.messageID, 85, "Finalizing enhancement...");
      
      // Save output
      fs.writeFileSync(tempPath, Buffer.from(response.data));
      const stats = fs.statSync(tempPath);
      if (stats.size === 0) throw new Error("EMPTY_FILE");

      // Final progress update
      await this.updateProgress(message, processingMsg.messageID, 100, "Ready to send!");

      // Send result
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate typing
      await api.unsendMessage(processingMsg.messageID);
      
      return message.reply({
        body: this.formatAtomicMessage(
          `${config.DESIGN.EMOJI.SUCCESS} ${getLang("success")}\n` +
          `⏱️ ${time} | 🖼️ Enhanced to 4K resolution\n` +
          `${config.DESIGN.SEPARATOR}\n` +
          `💡 Tip: For best results, use high-quality originals`
        ),
        attachment: fs.createReadStream(tempPath)
      });

    } catch (error) {
      console.error("Upscale error:", error);
      
      let errorMsg;
      switch (error.message) {
        case "API_FAILURE":
          errorMsg = getLang("apiError");
          break;
        case "EMPTY_FILE":
          errorMsg = getLang("fileError");
          break;
        case "TIMEOUT":
          errorMsg = getLang("timeoutError", config.TIMEOUT_MS / 1000);
          break;
        default:
          errorMsg = getLang("networkError");
      }
      
      await this.updateProgress(message, processingMsg.messageID, 0, `Error: ${errorMsg}`);
      await new Promise(resolve => setTimeout(resolve, 3000));
      await api.unsendMessage(processingMsg.messageID);
      
      return this.sendAtomicMessage(
        message, 
        `${config.DESIGN.EMOJI.ERROR} ${errorMsg}\n` +
        `💡 Solutions:\n` +
        `• Try a smaller image\n` +
        `• Check your connection\n` +
        `• Contact support if problem persists`
      );
    } finally {
      // Clean up temp files
      if (fs.existsSync(tempPath)) {
        fs.unlinkSync(tempPath);
      }
      api.setMessageReaction("", event.messageID, () => {}, true);
    }
  },

  // Helper function to format Atomic messages
  formatAtomicMessage(content) {
    return `${config.DESIGN.HEADER}\n${config.DESIGN.SEPARATOR}\n${content}\n${config.DESIGN.SEPARATOR}\n${config.DESIGN.FOOTER}`;
  },

  // Helper to send Atomic-styled messages
  async sendAtomicMessage(message, content) {
    return message.reply(this.formatAtomicMessage(content));
  },

  // Helper to update progress
  async updateProgress(message, messageID, percent, status) {
    try {
      await message.reply(
        this.formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} ${this.langs.en.progress.replace("%1", percent)}\n` +
          `${generateProgressBar(percent)} ${percent}%\n` +
          `🔄 ${status}`
        ),
        (err, info) => {
          if (info && info.messageID !== messageID) {
            message.unsend(messageID);
          }
        }
      );
    } catch (e) {
      console.error("Progress update error:", e);
    }
  }
};
