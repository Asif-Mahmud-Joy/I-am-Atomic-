const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dalle",
    aliases: ["aiart", "dalle3"],
    version: "3.0",
    author: " 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    countDown: 15,
    longDescription: {
      en: "✨ Generate stunning AI art with DALL-E 3 (Multiple API endpoints)"
    },
    category: "ai",
    guide: {
      en: "━━━━━━━━━━━━━━━━━━━\n🎨 𝗗𝗔𝗟𝗟-𝗘 𝗔𝗜 𝗔𝗿𝘁\n━━━━━━━━━━━━━━━━━━━\n{pn} <your prompt>\n\n✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n▸ {pn} futuristic cyberpunk city\n▸ {pn} magical forest at sunset\n━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    const prompt = args.join(" ");
    if (!prompt) {
      return message.reply("⚠️ Please provide a prompt!\nExample: {pn} cute cat wearing sunglasses");
    }

    // Creative loading messages
    const loadingMessages = [
      "🧠 AI is painting your imagination...",
      "🎨 Brush strokes in progress...",
      "✨ Generating artistic masterpiece...",
      "🖌️ Digital canvas coming to life..."
    ];
    const loadingMsg = loadingMessages[Math.floor(Math.random() * loadingMessages.length)];
    
    message.reply(`⏳ ${loadingMsg}\nPrompt: "${prompt}"`);

    try {
      // Try multiple API endpoints for better reliability
      const apiEndpoints = [
        `https://api.azzureapi.com/api/dalle?prompt=${encodeURIComponent(prompt)}`,
        `https://dalle.replit.app/generate?prompt=${encodeURIComponent(prompt)}`,
        `https://ai-tools.replit.app/dalle?prompt=${encodeURIComponent(prompt)}`
      ];

      let imageUrl;
      for (const endpoint of apiEndpoints) {
        try {
          const res = await axios.get(endpoint, { timeout: 15000 });
          if (res.data?.url) {
            imageUrl = res.data.url;
            break;
          }
        } catch (e) {
          continue; // Try next endpoint if this one fails
        }
      }

      if (!imageUrl) {
        return message.reply("❌ All API endpoints failed. Please try again later.");
      }

      // Download the image
      const imgPath = path.join(__dirname, 'cache', `dalle_${Date.now()}.jpg`);
      const writer = fs.createWriteStream(imgPath);
      const response = await axios({
        url: imageUrl,
        method: 'GET',
        responseType: 'stream'
      });

      response.data.pipe(writer);

      await new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });

      // Send the result
      await message.reply({
        body: `━━━━━━━━━━━━━━━━━━━\n🎨 𝗗𝗔𝗟𝗟-𝗘 𝗔𝗜 𝗔𝗿𝘁\n━━━━━━━━━━━━━━━━━━━\n✅ Image generated!\n\n📝 Prompt: "${prompt}"\n━━━━━━━━━━━━━━━━━━━`,
        attachment: fs.createReadStream(imgPath)
      });

      // Clean up
      fs.unlinkSync(imgPath);

    } catch (err) {
      console.error('DALL-E Error:', err);
      message.reply("❌ Failed to generate image. The AI might be overloaded or your prompt needs adjustment.");
    }
  }
};
