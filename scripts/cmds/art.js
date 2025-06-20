const axios = require("axios");

// ======================== 🎨 ARTISTIC DESIGN SYSTEM 🎨 ======================== //
const ARTISTIC = {
  HEADER: "✨ 𝓐𝓻𝓽𝓲𝓼𝓽𝓲𝓬 𝓥𝓲𝓼𝓲𝓸𝓷 ✨",
  FOOTER: "🖌️ 𝓒𝓻𝓮𝓪𝓽𝓮𝓭 𝓫𝔂 𝓐𝓼𝓲𝓯 𝓜𝓪𝓱𝓶𝓾𝓭 🖌️",
  BORDERS: {
    TOP: "╔═════ ∘◦❀◦∘ ═════╗",
    BOTTOM: "╚═════ ∘◦❀◦∘ ═════╝",
    DIVIDER: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰"
  },
  ELEMENTS: {
    PALETTE: "🎨",
    BRUSH: "🖌️",
    CANVAS: "🖼️",
    FRAME: "🖼️",
    SPARKLE: "✨",
    HOURGLASS: "⏳",
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    MODEL: "🧠",
    PROMPT: "📝",
    MAGIC: "🔮"
  },
  COLORS: {
    HEADER: "#FF6B6B",
    FOOTER: "#4ECDC4"
  }
};

const createArtisticMessage = (content) => {
  return `${ARTISTIC.BORDERS.TOP}
  
${content}

${ARTISTIC.BORDERS.DIVIDER}
${ARTISTIC.FOOTER}
${ARTISTIC.BORDERS.BOTTOM}`;
};

const simulatePainting = async (api, threadID, duration = 2000) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ============================================================================== //

module.exports = {
  config: {
    name: "art",
    aliases: ["vision", "transform"],
    role: 0,
    author: "Asif Mahmud",
    countDown: 3,
    longDescription: "Transform images with artistic styles",
    category: "creativity",
    guide: {
      en: createArtisticMessage(
        `${ARTISTIC.ELEMENTS.BRUSH} 𝗨𝘀𝗮𝗴𝗲 𝗚𝘂𝗶𝗱𝗲:\n\n` +
        `1. Reply to an image with:\n` +
        `   ${ARTISTIC.ELEMENTS.PROMPT} <description> | ${ARTISTIC.ELEMENTS.MODEL} <1-52>\n\n` +
        `2. Model Examples:\n` +
        `   • 12: Cyberpunk\n` +
        `   • 37: Realistic\n` +
        `   • 8: Watercolor\n\n` +
        `3. Example:\n` +
        `   "starry night sky | 8"`
      )
    }
  },

  onStart: async function ({ message, api, args, event }) {
    const threadID = event.threadID;
    
    // Show painting simulation
    await simulatePainting(api, threadID);
    
    // Validate image reply
    if (!event.messageReply?.attachments?.[0]?.url) {
      return message.reply(createArtisticMessage(
        `${ARTISTIC.ELEMENTS.ERROR} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗥𝗲𝗾𝘂𝗲𝘀𝘁\n` +
        `${ARTISTIC.ELEMENTS.CANVAS} Please reply to an image\n` +
        `${ARTISTIC.ELEMENTS.BRUSH} Format: <description> | <1-52>`
      ));
    }

    const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
    const text = args.join(' ');
    const [prompt, modelInput] = text.split('|').map(s => s.trim());
    
    // Validate prompt
    if (!prompt) {
      return message.reply(createArtisticMessage(
        `${ARTISTIC.ELEMENTS.WARNING} 𝗠𝗶𝘀𝘀𝗶𝗻𝗴 𝗩𝗶𝘀𝗶𝗼𝗻\n` +
        `${ARTISTIC.ELEMENTS.PROMPT} Describe your artistic vision\n` +
        `Example: "watercolor landscape with mountains"`
      ));
    }

    // Validate model
    const model = modelInput || "37";
    if (isNaN(model) || model < 1 || model > 52) {
      return message.reply(createArtisticMessage(
        `${ARTISTIC.ELEMENTS.WARNING} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗦𝘁𝘆𝗹𝗲\n` +
        `${ARTISTIC.ELEMENTS.MODEL} Choose style 1-52\n` +
        `Default: #37 (Realistic)`
      ));
    }

    // Send painting process message
    api.setMessageReaction(ARTISTIC.ELEMENTS.PALETTE, event.messageID, () => {}, true);
    const processingMsg = await message.reply(createArtisticMessage(
      `${ARTISTIC.ELEMENTS.PALETTE} 𝗣𝗮𝗶𝗻𝘁𝗶𝗻𝗴 𝗬𝗼𝘂𝗿 𝗩𝗶𝘀𝗶𝗼𝗻\n\n` +
      `${ARTISTIC.ELEMENTS.BRUSH} 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${prompt}\n` +
      `${ARTISTIC.ELEMENTS.MODEL} 𝗦𝘁𝘆𝗹𝗲: #${model}\n` +
      `${ARTISTIC.ELEMENTS.HOURGLASS} 𝗘𝘀𝘁𝗶𝗺𝗮𝘁𝗲𝗱: 20-40 seconds\n\n` +
      `${ARTISTIC.ELEMENTS.SPARKLE} 𝗣𝗹𝗲𝗮𝘀𝗲 𝗯𝗲 𝗽𝗮𝘁𝗶𝗲𝗻𝘁, 𝗮𝗿𝘁 𝘁𝗮𝗸𝗲𝘀 𝘁𝗶𝗺𝗲...`
    ));

    try {
      // Generate art
      const apiUrl = `https://sandipapi.onrender.com/art?imgurl=${imageUrl}&prompt=${encodeURIComponent(prompt)}&model=${model}`;
      const attachment = await global.utils.getStreamFromURL(apiUrl);
      
      // Send masterpiece
      await message.reply({
        body: createArtisticMessage(
          `${ARTISTIC.ELEMENTS.SUCCESS} 𝗠𝗮𝘀𝘁𝗲𝗿𝗽𝗶𝗲𝗰𝗲 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!\n\n` +
          `${ARTISTIC.ELEMENTS.FRAME} 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${prompt}\n` +
          `${ARTISTIC.ELEMENTS.MODEL} 𝗦𝘁𝘆𝗹𝗲: #${model}\n` +
          `${ARTISTIC.ELEMENTS.SPARKLE} 𝗘𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝗮𝗿𝘁𝗶𝘀𝘁𝗶𝗰 𝘃𝗶𝘀𝗶𝗼𝗻!`
        ),
        attachment: attachment
      });
      
      // Cleanup
      message.unsend(processingMsg.messageID);
      api.setMessageReaction(ARTISTIC.ELEMENTS.SUCCESS, event.messageID, () => {}, true);
      
    } catch (error) {
      // Handle errors artistically
      message.unsend(processingMsg.messageID);
      api.setMessageReaction(ARTISTIC.ELEMENTS.ERROR, event.messageID, () => {}, true);
      
      message.reply(createArtisticMessage(
        `${ARTISTIC.ELEMENTS.ERROR} 𝗖𝗿𝗲𝗮𝘁𝗶𝘃𝗲 𝗕𝗹𝗼𝗰𝗸\n\n` +
        `${ARTISTIC.ELEMENTS.WARNING} 𝗣𝗼𝘀𝘀𝗶𝗯𝗹𝗲 𝗰𝗮𝘂𝘀𝗲𝘀:\n` +
        `• Server is busy\n` +
        `• Vision too complex\n` +
        `• Style conflict\n\n` +
        `${ARTISTIC.ELEMENTS.MAGIC} 𝗧𝗿𝘆: Simpler vision or different style`
      ));
    }
  }
};
