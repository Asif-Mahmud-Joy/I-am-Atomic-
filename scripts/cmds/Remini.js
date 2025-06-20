// ============================== ⚡️ CONFIGURATION ⚡️ ============================== //
const ADMIN_IDS = ["61571630409265"];
const CACHE_DIR = join(__dirname, "cache");
const PRIMARY_API = "https://image-enhancer-api.vercel.app/upscale?image_url=";
const FALLBACK_API = "https://vex-kshitiz.vercel.app/upscale?url=";
const VALID_ATTACHMENT_TYPES = ["photo", "sticker"];
// ================================================================================= //

// =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
const design = {
  header: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗠𝗔𝗚𝗘 𝗘𝗡𝗛𝗔𝗡𝗖𝗘𝗥 ⚛️",
  footer: "☢️ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 | 𝗔𝗧𝗢𝗠 𝗘𝗱𝗶𝘁𝗶𝗼𝗻 ☢️",
  separator: "⚡•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•⚡",
  emoji: {
    success: "✅",
    error: "☢️",
    processing: "⏳",
    image: "🔬"
  },
  effects: {
    typing: ["🔭", "⏳", "⚗️", "🧪", "💫"]
  }
};

const formatMessage = (content) => {
  return `${design.emoji.image} ${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ================================================================================= //

const { writeFileSync, existsSync, mkdirSync, createReadStream, unlinkSync } = require("fs");
const { join } = require("path");
const axios = require("axios");
const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "remini",
    aliases: ["atom", "enhance"],
    version: "4.1",
    author: "Asif Mahmud | Atomic Edition by Grok",
    countDown: 15,
    role: 0,
    shortDescription: { en: "Enhance image quality with atomic precision" },
    longDescription: { 
      en: "Upscales images using quantum-inspired AI algorithms. Reply to an image to initiate atomic enhancement" 
    },
    category: "science",
    guide: { en: `{p}remini (reply to an image)` }
  },

  langs: {
    en: {
      noReply: "Please reply to an image (photo or sticker)",
      invalidType: "Only photos/stickers can be atomically enhanced",
      success: "Quantum enhancement complete at %1!",
      apiError: "Atomic decay detected in API matrix",
      fileError: "Particle collision in file stream",
      error: "Quantum entanglement disrupted"
    },
    vi: { /* Vietnamese translations */ },
    bn: { /* Bangla translations */ }
  },

  onStart: async function ({ message, event, api, getLang }) {
    const { messageID, threadID, type, messageReply } = event;
    const time = moment().tz(global.GoatBot.config.timeZone).format("HH:mm:ss DD/MM/YYYY");

    // Enhanced typing animation
    const sendAtomicResponse = async (content, attachment = null) => {
      let currentEmoji = 0;
      const typingInterval = setInterval(() => {
        api.setMessageReaction(design.effects.typing[currentEmoji], messageID);
        currentEmoji = (currentEmoji + 1) % design.effects.typing.length;
      }, 500);

      setTimeout(async () => {
        clearInterval(typingInterval);
        await message.reply({
          body: formatMessage(content),
          attachment: attachment ? createReadStream(attachment) : null
        });
        api.setMessageReaction("", messageID);
        if (attachment) unlinkSync(attachment);
      }, 3000);
    };

    if (type !== "message_reply" || !messageReply?.attachments?.length) {
      return sendAtomicResponse(`${design.emoji.error} ${getLang("noReply")}`);
    }

    const [attachment] = messageReply.attachments;
    if (!VALID_ATTACHMENT_TYPES.includes(attachment.type)) {
      return sendAtomicResponse(`${design.emoji.error} ${getLang("invalidType")}`);
    }

    try {
      let response;
      try {
        response = await axios.get(`${PRIMARY_API}${encodeURIComponent(attachment.url)}`, {
          responseType: "arraybuffer",
          timeout: 30000
        });
      } catch (err) {
        response = await axios.get(`${FALLBACK_API}${encodeURIComponent(attachment.url)}`, {
          responseType: "arraybuffer",
          timeout: 30000
        });
      }

      if (!existsSync(CACHE_DIR)) mkdirSync(CACHE_DIR, { recursive: true });
      const filePath = join(CACHE_DIR, `atomic_${Date.now()}.png`);
      writeFileSync(filePath, response.data);

      return sendAtomicResponse(
        `${design.emoji.success} ${getLang("success", time)}`,
        filePath
      );
    } catch (err) {
      console.error("[AtomicError]", err);
      const errorMsg = err.response ? getLang("apiError") : getLang("fileError");
      return sendAtomicResponse(`${design.emoji.error} ${errorMsg}`);
    }
  }
};
