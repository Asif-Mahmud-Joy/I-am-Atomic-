const axios = require("axios");
const fs = require("fs-extra");
const gtts = require("gtts");
const path = require("path");

// ============================== ☣️ ATOMIC DESIGN SYSTEM ☣️ ============================== //
const design = {
  header: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗢𝗧 𝗩𝟮 ⚡",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    thinking: "⚛️",
    success: "✅",
    error: "⚠️",
    voice: "🔊",
    image: "🖼️",
    ai: "🤖"
  }
};

const formatMessage = (content, type = "default") => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};

const simulateTyping = (api, threadID, duration = 2000) => {
  api.sendTyping(threadID);
  return new Promise(resolve => setTimeout(resolve, duration));
};
// ======================================================================================== //

module.exports = {
  config: {
    name: "bot2",
    aliases: ["atomicbot", "ai2"],
    version: "3.0",
    usePrefix: true,
    hasPermission: 0,
    credits: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    description: "Atomic AI with OCR and voice response capabilities",
    commandCategory: "ai",
    usages: "{pn} <text | reply image>",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply, body } = event;
    const voicePath = path.join(__dirname, "cache", `atomic_voice_${Date.now()}.mp3`);
    
    try {
      // Start typing animation
      await simulateTyping(api, threadID);
      
      let question = "";
      let processingMessage = null;
      
      // Handle image reply
      if (type === "message_reply" && messageReply?.attachments?.[0]?.type === "photo") {
        processingMessage = await api.sendMessage(
          formatMessage(`${design.emoji.image} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗠𝗔𝗚𝗘 𝗔𝗡𝗔𝗟𝗬𝗦𝗜𝗦\n\n▸ Processing image content...`),
          threadID
        );
        
        const imageURL = messageReply.attachments[0].url;
        const imgToText = await axios.get(`https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`);
        question = imgToText.data.extractedText;
        
        if (!question) {
          const errorMsg = formatMessage(`${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗢𝗖𝗥 𝗙𝗔𝗜𝗟\n\n▸ Could not extract text from image`);
          return api.sendMessage(errorMsg, threadID, messageID);
        }
        
        await api.unsendMessage(processingMessage.messageID);
      } 
      // Handle text input
      else {
        question = body.replace(/^.*?\s/, "").trim();
        if (!question) {
          const guideMsg = formatMessage(`${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗡𝗣𝗨𝗧\n\n▸ Please provide text or reply to an image\n▸ Example: ${this.config.name} explain quantum physics`);
          return api.sendMessage(guideMsg, threadID, messageID);
        }
      }
      
      // Show thinking message
      const thinkingMsg = await api.sendMessage(
        formatMessage(`${design.emoji.thinking} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗛𝗜𝗡𝗞𝗜𝗡𝗚\n\n▸ Processing your request with atomic precision...`),
        threadID
      );
      
      // Get AI response
      const res = await axios.get(`https://bard-ai.arjhilbard.repl.co/bard?ask=${encodeURIComponent(question)}`);
      const reply = res.data.message;
      
      // Generate voice response
      const gttsVoice = new gtts(reply, 'en');
      await new Promise((resolve, reject) => {
        gttsVoice.save(voicePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      
      // Prepare success response
      const successContent = `${design.emoji.ai} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘\n\n${reply}\n\n${design.emoji.voice} Voice response attached`;
      const successMsg = formatMessage(successContent);
      
      // Send response with voice
      await api.unsendMessage(thinkingMsg.messageID);
      await api.sendMessage({
        body: successMsg,
        attachment: fs.createReadStream(voicePath)
      }, threadID);
      
      // Clean up voice file
      fs.unlinkSync(voicePath);
      
    } catch (err) {
      console.error("Atomic Bot Error:", err);
      
      const errorContent = `${design.emoji.error} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗦𝗬𝗦𝗧𝗘𝗠 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n▸ ${err.message || "Error processing request"}\n▸ Please try again later`;
      const errorMsg = formatMessage(errorContent);
      
      api.sendMessage(errorMsg, threadID, messageID);
      
      // Clean up voice file if exists
      if (fs.existsSync(voicePath)) {
        fs.unlinkSync(voicePath);
      }
    }
  }
};
