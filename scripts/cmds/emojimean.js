const axios = require("axios");
const cheerio = require("cheerio");
const { createCanvas, loadImage } = require('canvas');
const fs = require("fs-extra");

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
    name: "emojimean",
    aliases: ["em", "atomicemoji"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Atomic Emoji Decoder",
    longDescription: "Get detailed emoji meanings with atomic design visualization",
    category: "⚡ Atomic",
    guide: {
      en: "{pn} <emoji>"
    }
  },

  langs: {
    en: {
      missingEmoji: "⚡ Please provide an emoji to decode",
      notFound: "❌ Emoji not found in quantum database",
      failed: "⚠️ Quantum decoding failed. Try again later",
      meaningHeader: "⚛️ ATOMIC EMOJI ANALYSIS ⚛️",
      emoji: "🔤 Emoji: %1",
      meaning: "📝 Meaning: %1",
      shortcode: "⌨️ Shortcode: %1",
      source: "🌐 Source: %1",
      platformHeader: "🖼️ Platform Representations:",
      loading: "🔍 Decoding emoji quantum signature..."
    }
  },

  onStart: async function({ args, message, event, getLang }) {
    const emoji = args[0];
    if (!emoji) return message.reply(getLang("missingEmoji"));

    // Show loading indicator
    const loadingMsg = await message.reply(getLang("loading"));
    
    try {
      const { meaning, shortcode, source, platforms } = await this.fetchEmojiData(emoji);
      if (!meaning) return message.reply(getLang("notFound"));

      // Generate atomic design card
      const cardBuffer = await this.generateAtomicCard(emoji, meaning, shortcode, source, platforms);
      
      // Prepare response
      let response = `✨ ${getLang("meaningHeader")} ✨\n\n`;
      response += `${getLang("emoji", emoji)}\n`;
      response += `${getLang("meaning", meaning)}\n`;
      response += `${getLang("shortcode", shortcode || "N/A")}\n`;
      response += `${getLang("source", source)}\n\n`;
      response += `💎 ${getLang("platformHeader")}`;

      // Edit loading message with results
      message.edit({
        body: response,
        attachment: cardBuffer
      }, loadingMsg.messageID);
      
    } catch (err) {
      console.error("Atomic Emoji Error:", err);
      message.edit(getLang("failed"), loadingMsg.messageID);
    }
  },

  fetchEmojiData: async function(emoji) {
    const url = `https://emojipedia.org/search/?q=${encodeURIComponent(emoji)}`;
    const res = await axios.get(url);
    const $ = cheerio.load(res.data);
    
    // Find first search result
    const firstLink = $('ul.search-results li a').first().attr('href');
    if (!firstLink) return {};
    
    const emojiUrl = `https://emojipedia.org${firstLink}`;
    const emojiRes = await axios.get(emojiUrl);
    const $_ = cheerio.load(emojiRes.data);
    
    // Extract emoji details
    const meaning = $_("section.description p").first().text().trim();
    const shortcode = $_("code").first().text().trim();
    
    // Extract platform images
    const platforms = [];
    $_('.vendor-rollout-target').each((i, el) => {
      const platform = $_(el).attr('data-vendor');
      const img = $_(el).find('img').attr('data-src') || $_(el).find('img').attr('src');
      if (img && platform) {
        platforms.push({ platform, img });
      }
    });
    
    return { meaning, shortcode, source: emojiUrl, platforms };
  },

  generateAtomicCard: async function(emoji, meaning, shortcode, source, platforms) {
    const canvasWidth = 800;
    const canvasHeight = 600;
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
    ctx.fillText('⚛️ ATOMIC EMOJI DECODER ⚛️', canvasWidth / 2, 50);
    
    // Emoji display
    ctx.font = 'bold 100px "Segoe UI"';
    ctx.fillText(emoji, canvasWidth / 2, 150);
    
    // Meaning box
    ctx.fillStyle = 'rgba(45, 43, 85, 0.7)'; // DarkSlateBlue with opacity
    this.roundRect(ctx, 50, 180, canvasWidth - 100, 100, 20);
    ctx.fill();
    
    // Meaning text
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    this.wrapText(ctx, meaning, canvasWidth / 2, 220, canvasWidth - 120, 30);
    
    // Details
    ctx.font = 'bold 20px "Segoe UI"';
    ctx.textAlign = 'left';
    ctx.fillText(`⌨️ Shortcode: ${shortcode || 'N/A'}`, 70, 320);
    ctx.fillText(`🌐 Source: ${source.substring(0, 60)}...`, 70, 350);
    
    // Platform header
    ctx.textAlign = 'center';
    ctx.font = 'bold 28px "Segoe UI"';
    ctx.fillText('💎 PLATFORM REPRESENTATIONS', canvasWidth / 2, 400);
    
    // Render platform images
    if (platforms.length > 0) {
      const platformSize = 60;
      const spacing = 30;
      const startX = (canvasWidth - ((platformSize + spacing) * platforms.length - spacing)) / 2;
      
      for (let i = 0; i < Math.min(platforms.length, 8); i++) {
        const platform = platforms[i];
        const x = startX + i * (platformSize + spacing);
        
        try {
          const img = await loadImage(platform.img);
          ctx.drawImage(img, x, 420, platformSize, platformSize);
          
          // Platform label
          ctx.font = '14px "Segoe UI"';
          ctx.fillText(platform.platform, x + platformSize/2, 420 + platformSize + 20);
        } catch (e) {
          console.error("Failed to load platform image:", platform.img);
        }
      }
    }
    
    // Add atomic elements
    ctx.font = '40px Arial';
    ctx.fillStyle = ATOMIC.COLORS.ACCENT;
    ctx.fillText(ATOMIC.ELEMENTS[0], 50, 550);
    ctx.fillText(ATOMIC.ELEMENTS[1], canvasWidth - 50, 550);
    
    return canvas.toBuffer('image/png');
  },

  // Helper functions
  roundRect: function(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
  },

  wrapText: function(ctx, text, x, y, maxWidth, lineHeight) {
    const words = text.split(' ');
    let line = '';
    let testLine;
    let metrics;
    
    for (let n = 0; n < words.length; n++) {
      testLine = line + words[n] + ' ';
      metrics = ctx.measureText(testLine);
      
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, y);
        line = words[n] + ' ';
        y += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, y);
  }
};
