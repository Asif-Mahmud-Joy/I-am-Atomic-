const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');
const https = require('https');

// 🌌 Atomic Design System
const ATOMIC = {
  COLORS: {
    PRIMARY: "#6A5ACD",   // SlateBlue
    SECONDARY: "#48D1CC", // MediumTurquoise
    ACCENT: "#FF6B6B",    // LightCoral
    DARK: "#2D2B55",      // DarkSlateBlue
    LIGHT: "#E6E6FA"      // Lavender
  },
  ELEMENTS: ["⚛️", "🔮", "✨", "🌀", "🌌", "🎭", "💫"]
};

// Create temp directory
const tempDir = path.join(__dirname, 'cosplay_temp');
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir, { recursive: true });
}

// 🌟 Create Atomic Banner
async function createAtomicBanner(title) {
  const canvas = createCanvas(800, 200);
  const ctx = canvas.getContext('2d');
  
  // Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, ATOMIC.COLORS.PRIMARY);
  gradient.addColorStop(1, ATOMIC.COLORS.SECONDARY);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 200);
  
  // Atomic Particles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 50; i++) {
    const size = Math.random() * 20 + 5;
    const x = Math.random() * 800;
    const y = Math.random() * 200;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Title Text
  ctx.font = 'bold 48px "Segoe UI"';
  ctx.fillStyle = ATOMIC.COLORS.LIGHT;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  
  // Text Glow Effect
  ctx.shadowColor = ATOMIC.COLORS.ACCENT;
  ctx.shadowBlur = 20;
  ctx.fillText(`🎭 ${title} 🎭`, 400, 100);
  ctx.shadowBlur = 0;
  
  // Animated Elements
  ctx.fillStyle = ATOMIC.COLORS.ACCENT;
  for (let i = 0; i < 7; i++) {
    const element = ATOMIC.ELEMENTS[i];
    const size = 30 + i * 5;
    ctx.font = `${size}px Arial`;
    const x = 150 + i * 80;
    const y = 180 + Math.sin(Date.now()/1000 + i) * 10;
    ctx.fillText(element, x, y);
  }
  
  return canvas.toBuffer('image/png');
}

module.exports = {
  config: {
    name: "cosplay",
    aliases: ["animecos", "costume"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "⚡ Get stunning anime cosplay images",
      bn: "⚡ আশ্চর্যজনক অ্যানিমে কসপ্লে ছবি পান"
    },
    longDescription: {
      en: "Discover beautiful anime cosplay images with atomic design enhancements",
      bn: "এটমিক ডিজাইন সহ সুন্দর অ্যানিমে কসপ্লে ছবি আবিষ্কার করুন"
    },
    category: "🎭 Anime",
    guide: {
      en: "{pn}",
      bn: "{pn}"
    }
  },

  onStart: async function ({ api, event, message }) {
    try {
      // ⚛️ Show processing reaction
      api.setMessageReaction("⏳", event.messageID, () => {}, true);
      
      // ✨ Create loading banner
      const loadingBanner = await createAtomicBanner("PREPARING COSPLAY");
      const loadingMsg = await message.reply({
        body: "🌀 Preparing quantum cosplay portal...",
        attachment: loadingBanner
      });

      // ⚡ Fetch cosplay data
      const response = await axios.get('https://nekos.best/api/v2/cosplay');
      const cosplayData = response.data.results[0];
      
      // 🎭 Extract cosplay info
      const artist = cosplayData.artist_name || "Unknown Artist";
      const character = cosplayData.anime_name || "Mystery Character";
      const imageUrl = cosplayData.url;
      
      // 📥 Download image
      const fileName = `cosplay_${Date.now()}.jpg`;
      const filePath = path.join(tempDir, fileName);
      
      await new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filePath);
        https.get(imageUrl, (response) => {
          response.pipe(file);
          file.on('finish', resolve);
        }).on('error', reject);
      });

      // ✨ Create success banner
      const successBanner = await createAtomicBanner("COSPLAY READY");
      
      // 🚀 Send result
      await api.unsendMessage(loadingMsg.messageID);
      message.reply({
        body: `✨ Atomic Cosplay Revealed ✨\n\n` +
              `🎭 Character: ${character}\n` +
              `🎨 Artist: ${artist}\n` +
              `💫 Enjoy this stunning creation!`,
        attachment: [successBanner, fs.createReadStream(filePath)]
      }, () => {
        // Clean up
        fs.unlinkSync(filePath);
        api.setMessageReaction("✅", event.messageID, () => {}, true);
      });

    } catch (error) {
      console.error("Cosplay Error:", error);
      
      // ❌ Create error banner
      const errorBanner = await createAtomicBanner("COSPLAY FAILED");
      
      message.reply({
        body: "❌ Quantum Cosplay Malfunction!\n\n" +
              "⚡ Error: " + (error.message || "Unknown anomaly") + "\n" +
              "🔧 Possible causes:\n" +
              "- Interdimensional interference\n" +
              "- Temporal displacement\n" +
              "- Server instability\n" +
              "💫 Please try again later",
        attachment: errorBanner
      });
      
      api.setMessageReaction("❌", event.messageID, () => {}, true);
    }
  }
};
