const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "texttoimage",
    aliases: ["midjourney", "openjourney", "text2image", "aiart"],
    version: "3.0",
    author: "NTKhang & Asif",
    countDown: 10, // Increased for image generation time
    role: 0,
    description: {
      en: "✨ Generate AI-powered images from text prompts ✨"
    },
    category: "ai",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🎨 AI IMAGE GENERATOR 🎨
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} <your detailed prompt>

💎 Tips:
✦ Be descriptive with your prompts
✦ Include style references (e.g., "digital art", "photorealistic")
✦ Specify details like lighting, colors, composition

🎭 Examples:
❯ {pn} A mystical forest with glowing mushrooms, digital art, 4k, fantasy style
❯ {pn} Cyberpunk cityscape at night, neon lights, rain-soaked streets, cinematic
      `
    }
  },

  langs: {
    en: {
      syntaxError: "🖌️ Please provide an image description",
      processing: "⏳ Generating your AI artwork...",
      serverError: "🌐 Server is busy. Please try again later",
      generationError: "❌ Failed to create image. Please try a different prompt",
      timeoutError: "⏱️ Image generation took too long. Please try again"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const prompt = args.join(" ");
    if (!prompt) return message.reply(getLang("syntaxError"));

    try {
      // Send processing message
      const processingMsg = await message.reply(getLang("processing"));

      // Generate unique filename
      const timestamp = Date.now();
      const imagePath = path.join(__dirname, `aiart_${timestamp}.jpg`);

      // Call the AI image API
      const response = await axios({
        method: 'GET',
        url: 'https://api.popcat.xyz/aiimage',
        params: { text: prompt },
        responseType: 'arraybuffer',
        timeout: 30000 // 30 seconds timeout
      });

      // Save the image temporarily
      fs.writeFileSync(imagePath, response.data);

      // Send the generated image
      await message.reply({
        body: "🎨 Your AI-generated artwork:",
        attachment: fs.createReadStream(imagePath)
      });

      // Clean up
      fs.unlinkSync(imagePath);
      await api.unsendMessage(processingMsg.messageID);

    } catch (error) {
      console.error("AI Art Generation Error:", error);

      if (error.code === 'ECONNABORTED') {
        return message.reply(getLang("timeoutError"));
      }
      else if (error.response?.status === 503) {
        return message.reply(getLang("serverError"));
      }
      else {
        return message.reply(getLang("generationError"));
      }
    }
  }
};
