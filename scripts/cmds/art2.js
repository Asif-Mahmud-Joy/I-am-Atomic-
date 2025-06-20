const axios = require('axios');

// ======================== 🎨 ARTISTIC DESIGN SYSTEM 🎨 ======================== //
const ARTISTRY = {
  FRAME: {
    TOP: "╔═════ ∘◦🎨◦∘ ═════╗",
    BOTTOM: "╚═════ ∘◦🎨◦∘ ═════╝",
    DIVIDER: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰"
  },
  ELEMENTS: {
    PALETTE: "🎨",
    BRUSH: "🖌️",
    CANVAS: "🖼️",
    SPARKLE: "✨",
    HOURGLASS: "⏳",
    SUCCESS: "✅",
    ERROR: "❌",
    MAGIC: "🔮",
    MODEL: "🧠",
    PROMPT: "📝"
  },
  COLORS: {
    PRIMARY: "#FF6B6B",
    SECONDARY: "#4ECDC4"
  }
};

const createArtisticMessage = (content) => {
  return `${ARTISTRY.FRAME.TOP}\n${content}\n${ARTISTRY.FRAME.DIVIDER}\n${ARTISTRY.FRAME.BOTTOM}`;
};

const simulatePainting = async (api, threadID, duration = 2500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};
// ============================================================================== //

module.exports = {
  config: {
    name: "art2",
    aliases: ["visionary", "transform"],
    version: "3.0",
    author: "Asif Mahmud",
    countDown: 3,
    role: 0,
    shortDescription: "Transform images with artistic styles",
    longDescription: "Create stunning AI-generated artwork from your images",
    category: "creativity",
    guide: {
      en: createArtisticMessage(
        `${ARTISTRY.ELEMENTS.BRUSH} 𝗨𝘀𝗮𝗴𝗲 𝗚𝘂𝗶𝗱𝗲:\n\n` +
        `1. Reply to an image with:\n` +
        `   ${ARTISTRY.ELEMENTS.PROMPT} <description> | ${ARTISTRY.ELEMENTS.MODEL} <1-52>\n\n` +
        `2. Model Examples:\n` +
        `   • 12: Cyberpunk\n` +
        `   • 8: Watercolor\n` +
        `   • 37: Realistic\n\n` +
        `3. Example:\n` +
        `   "starry night sky | 8"`
      )
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    
    // Show painting simulation
    await simulatePainting(api, threadID);
    
    // Validate image reply
    if (!event.messageReply?.attachments?.[0]?.url) {
      return api.sendMessage(createArtisticMessage(
        `${ARTISTRY.ELEMENTS.ERROR} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗥𝗲𝗾𝘂𝗲𝘀𝘁\n` +
        `${ARTISTRY.ELEMENTS.CANVAS} Please reply to an image\n` +
        `${ARTISTRY.ELEMENTS.BRUSH} Format: <description> | <1-52>`
      ), threadID);
    }

    const imageUrl = encodeURIComponent(event.messageReply.attachments[0].url);
    const text = args.join(' ');
    const [prompt, modelInput] = text.split('|').map(s => s.trim());
    
    // Validate prompt
    if (!prompt) {
      return api.sendMessage(createArtisticMessage(
        `${ARTISTRY.ELEMENTS.ERROR} 𝗠𝗶𝘀𝘀𝗶𝗻𝗴 𝗩𝗶𝘀𝗶𝗼𝗻\n` +
        `${ARTISTRY.ELEMENTS.PROMPT} Describe your artistic vision\n` +
        `Example: "watercolor landscape with mountains"`
      ), threadID);
    }

    // Validate model
    const model = modelInput || "37";
    if (isNaN(model) || model < 1 || model > 52) {
      return api.sendMessage(createArtisticMessage(
        `${ARTISTRY.ELEMENTS.ERROR} 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗦𝘁𝘆𝗹𝗲\n` +
        `${ARTISTRY.ELEMENTS.MODEL} Choose style 1-52\n` +
        `Default: #37 (Realistic)`
      ), threadID);
    }

    // Send painting process message
    const processingMsg = await api.sendMessage(createArtisticMessage(
      `${ARTISTRY.ELEMENTS.PALETTE} 𝗣𝗮𝗶𝗻𝘁𝗶𝗻𝗴 𝗬𝗼𝘂𝗿 𝗩𝗶𝘀𝗶𝗼𝗻\n\n` +
      `${ARTISTRY.ELEMENTS.BRUSH} 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${prompt}\n` +
      `${ARTISTRY.ELEMENTS.MODEL} 𝗦𝘁𝘆𝗹𝗲: #${model}\n` +
      `${ARTISTRY.ELEMENTS.HOURGLASS} 𝗘𝘀𝘁𝗶𝗺𝗮𝘁𝗲𝗱: 20-40 seconds\n\n` +
      `${ARTISTRY.ELEMENTS.SPARKLE} 𝗣𝗹𝗲𝗮𝘀𝗲 𝗯𝗲 𝗽𝗮𝘁𝗶𝗲𝗻𝘁, 𝗮𝗿𝘁 𝘁𝗮𝗸𝗲𝘀 𝘁𝗶𝗺𝗲...`
    ), threadID);

    try {
      // Generate art
      const apiUrl = `https://sandipapi.onrender.com/art?imgurl=${imageUrl}&prompt=${encodeURIComponent(prompt)}&model=${model}`;
      const response = await axios.get(apiUrl, { responseType: 'stream' });
      
      // Send masterpiece
      await api.sendMessage({
        body: createArtisticMessage(
          `${ARTISTRY.ELEMENTS.SUCCESS} 𝗠𝗮𝘀𝘁𝗲𝗿𝗽𝗶𝗲𝗰𝗲 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲!\n\n` +
          `${ARTISTRY.ELEMENTS.FRAME} 𝗗𝗲𝘀𝗰𝗿𝗶𝗽𝘁𝗶𝗼𝗻: ${prompt}\n` +
          `${ARTISTRY.ELEMENTS.MODEL} 𝗦𝘁𝘆𝗹𝗲: #${model}\n` +
          `${ARTISTRY.ELEMENTS.SPARKLE} 𝗘𝗻𝗷𝗼𝘆 𝘆𝗼𝘂𝗿 𝗮𝗿𝘁𝗶𝘀𝘁𝗶𝗰 𝘃𝗶𝘀𝗶𝗼𝗻!`
        ),
        attachment: response.data
      }, threadID);
      
      // Cleanup
      api.unsendMessage(processingMsg.messageID);
      
    } catch (error) {
      // Handle errors artistically
      api.unsendMessage(processingMsg.messageID);
      
      api.sendMessage(createArtisticMessage(
        `${ARTISTRY.ELEMENTS.ERROR} 𝗖𝗿𝗲𝗮𝘁𝗶𝘃𝗲 𝗕𝗹𝗼𝗰𝗸\n\n` +
        `${ARTISTRY.ELEMENTS.WARNING} 𝗣𝗼𝘀𝘀𝗶𝗯𝗹𝗲 𝗰𝗮𝘂𝘀𝗲𝘀:\n` +
        `• Server is busy\n` +
        `• Vision too complex\n` +
        `• Style conflict\n\n` +
        `${ARTISTRY.ELEMENTS.MAGIC} 𝗧𝗿𝘆: Simpler vision or different style`
      ), threadID);
    }
  }
};
