const axios = require("axios");
const { createCanvas, loadImage } = require('canvas');
const fs = require("fs-extra");
const path = require("path");

// Atomic Design Constants
const ATOMIC = {
  COLORS: {
    PRIMARY: "#6A5ACD",   // SlateBlue
    SECONDARY: "#48D1CC", // MediumTurquoise
    ACCENT: "#FF6B6B",    // LightCoral
    BACKGROUND: "#2D2B55" // DarkSlateBlue
  },
  ELEMENTS: ["⚛️", "🔬", "✨", "🌀", "🌌"]
};

module.exports = {
  config: {
    name: "emojimix",
    aliases: ["atomicmix", "emojifusion"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Atomic Emoji Fusion",
    longDescription: "Combine emojis with atomic energy to create unique hybrids",
    category: "⚡ Atomic",
    guide: {
      en: "{pn} <emoji1> <emoji2>"
    }
  },

  langs: {
    en: {
      missingEmoji: "⚡ Please provide two emojis to mix",
      error: "❌ Quantum fusion failed for %1 and %2",
      success: "✨ ATOMIC FUSION SUCCESSFUL!\n🔤 Emoji: %1 + %2",
      loading: "⚡ Charging emoji particles..."
    }
  },

  onStart: async function({ message, args, getLang }) {
    const emoji1 = args[0];
    const emoji2 = args[1];

    if (!emoji1 || !emoji2) return message.reply(getLang("missingEmoji"));

    // Show loading indicator
    const loadingMsg = await message.reply(getLang("loading"));
    
    try {
      // Fetch mixed emoji images
      const [mix1, mix2] = await Promise.all([
        this.fetchEmojiMix(emoji1, emoji2),
        this.fetchEmojiMix(emoji2, emoji1)
      ]);

      const validImages = [mix1, mix2].filter(img => img !== null);
      
      if (validImages.length === 0) {
        return message.edit(getLang("error", emoji1, emoji2), loadingMsg.messageID);
      }

      // Generate atomic design card
      const cardBuffer = await this.generateAtomicCard(emoji1, emoji2, validImages);
      
      // Edit loading message with results
      message.edit({
        body: getLang("success", emoji1, emoji2),
        attachment: cardBuffer
      }, loadingMsg.messageID);
      
    } catch (err) {
      console.error("Atomic Emoji Mix Error:", err);
      message.edit(getLang("error", emoji1, emoji2), loadingMsg.messageID);
    }
  },

  fetchEmojiMix: async function(emoji1, emoji2) {
    try {
      const encoded1 = encodeURIComponent(emoji1);
      const encoded2 = encodeURIComponent(emoji2);
      
      // Try primary API
      const apiUrl = `https://emojimix-api1.vercel.app/mix?emoji1=${encoded1}&emoji2=${encoded2}`;
      const response = await axios.get(apiUrl, { responseType: "arraybuffer" });
      
      if (response.status !== 200 || !response.data) {
        throw new Error("API response error");
      }
      
      return Buffer.from(response.data, 'binary');
    } catch (error) {
      // Fallback to secondary API
      try {
        const fallbackUrl = `https://emojimix-api2.vercel.app/mix?emoji1=${encodeURIComponent(emoji1)}&emoji2=${encodeURIComponent(emoji2)}`;
        const fallbackResponse = await axios.get(fallbackUrl, { responseType: "arraybuffer" });
        
        if (fallbackResponse.status !== 200 || !fallbackResponse.data) {
          return null;
        }
        
        return Buffer.from(fallbackResponse.data, 'binary');
      } catch {
        return null;
      }
    }
  },

  generateAtomicCard: async function(emoji1, emoji2, images) {
    const canvasWidth = 800;
    const canvasHeight = 400 + (images.length > 1 ? 300 : 0);
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');
    
    // Create atomic background
    const gradient = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight);
    gradient.addColorStop(0, ATOMIC.COLORS.PRIMARY);
    gradient.addColorStop(1, ATOMIC.COLORS.SECONDARY);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);
    
    // Add atomic particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 100; i++) {
      const size = Math.random() * 10 + 2;
      const x = Math.random() * canvasWidth;
      const y = Math.random() * canvasHeight;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Header
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ATOMIC EMOJI FUSION ⚡', canvasWidth / 2, 50);
    
    // Original emojis
    ctx.font = 'bold 60px "Segoe UI"';
    ctx.fillText(`${emoji1} + ${emoji2} =`, canvasWidth / 2, 150);
    
    // Render mixed emojis
    const imageSize = 150;
    const spacing = 50;
    
    if (images.length === 1) {
      const img = await loadImage(images[0]);
      ctx.drawImage(img, canvasWidth / 2 - imageSize / 2, 180, imageSize, imageSize);
    } 
    else {
      // Position for two results
      const totalWidth = (imageSize * 2) + spacing;
      const startX = (canvasWidth - totalWidth) / 2;
      
      for (let i = 0; i < Math.min(images.length, 2); i++) {
        const img = await loadImage(images[i]);
        const x = startX + i * (imageSize + spacing);
        ctx.drawImage(img, x, 180, imageSize, imageSize);
        
        // Add order label
        ctx.font = 'bold 24px "Segoe UI"';
        ctx.fillText(`${i === 0 ? "Primary" : "Reverse"} Fusion`, x + imageSize / 2, 180 + imageSize + 30);
      }
    }
    
    // Add atomic elements
    ctx.font = '40px Arial';
    ctx.fillStyle = ATOMIC.COLORS.ACCENT;
    ctx.fillText(ATOMIC.ELEMENTS[0], 50, canvasHeight - 50);
    ctx.fillText(ATOMIC.ELEMENTS[1], canvasWidth - 50, canvasHeight - 50);
    
    return canvas.toBuffer('image/png');
  }
};
