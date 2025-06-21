const fs = require('fs-extra');
const axios = require('axios');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "clown",
    aliases: ["honk"],
    version: "2.0",
    author: "Asif & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "🤡 Transform images into clown memes",
    longDescription: "Apply hilarious clown filters to images with atomic design effects",
    category: "🎭 Fun",
    guide: {
      en: "{pn} [reply-to-image | image-url]"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      // Atomic Design Elements
      const ATOMIC_COLORS = ['#FF5252', '#FFD740', '#40C4FF', '#69F0AE'];
      const CLOWN_EMOJIS = ['🤡', '🎪', '🔴', '🎈'];
      
      // Show typing animation
      api.sendTypingIndicator(event.threadID);
      
      // Get image source
      let imageUrl;
      if (event.messageReply?.attachments?.[0]?.url) {
        imageUrl = event.messageReply.attachments[0].url;
      } else if (args[0]?.match(/^https?:\/\//)) {
        imageUrl = args[0];
      } else {
        return api.sendMessage({
          body: "🎭 Atomic Clown Generator\n\n" +
                "🔹 Please reply to an image or provide an image URL\n" +
                "🔹 Usage: /clown [image-url] or reply to an image",
          attachment: await this.generateAtomicBanner("MISSING INPUT", ATOMIC_COLORS)
        }, event.threadID);
      }

      // Create loading message with animation
      const loadingMessage = await api.sendMessage({
        body: `🎪 Preparing clown transformation...\n` +
              `${this.getRandomClownEmoji(CLOWN_EMOJIS)} Loading atomic design filters...`,
        attachment: await this.generateAtomicBanner("PROCESSING", ATOMIC_COLORS)
      }, event.threadID);

      // Process image through clown API
      const imgurLink = await this.getImgurLink(imageUrl);
      const clownImage = await this.generateClownImage(imgurLink);
      
      // Create atomic frame
      const atomicFrame = await this.createAtomicFrame(clownImage, ATOMIC_COLORS);
      
      // Send result
      await api.unsendMessage(loadingMessage.messageID);
      return api.sendMessage({
        body: `🤡 HONK HONK! Clown transformation complete!\n` +
              `✨ Atomic Design Enhanced\n` +
              `🔴 Enjoy your hilarious meme!`,
        attachment: atomicFrame
      }, event.threadID);
      
    } catch (error) {
      console.error('Clown command error:', error);
      return api.sendMessage({
        body: "🎭 Clown Transformation Failed!\n" +
              `❌ Error: ${error.message || 'Unknown error'}\n` +
              "🔹 Please try again with a different image",
        attachment: await this.generateAtomicBanner("ERROR", ['#FF5252', '#000000'])
      }, event.threadID);
    }
  },

  // Helper functions
  getRandomClownEmoji: (emojis) => emojis[Math.floor(Math.random() * emojis.length)],
  
  getImgurLink: async function(imageUrl) {
    try {
      const res = await axios.get(`https://api-1.huytran6868.repl.co/imgur?link=${encodeURIComponent(imageUrl)}`);
      return res.data.uploaded.image;
    } catch {
      return imageUrl; // Fallback to original URL
    }
  },
  
  generateClownImage: async function(imageUrl) {
    try {
      const response = await axios.get(`https://api.popcat.xyz/clown?image=${imageUrl}`, { 
        responseType: 'arraybuffer' 
      });
      return Buffer.from(response.data, 'binary');
    } catch {
      throw new Error('Failed to apply clown filter');
    }
  },
  
  generateAtomicBanner: async function(text, colors) {
    const canvas = createCanvas(800, 200);
    const ctx = canvas.getContext('2d');
    
    // Create gradient background
    const gradient = ctx.createLinearGradient(0, 0, 800, 0);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 200);
    
    // Add atomic circles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 15; i++) {
      const radius = Math.random() * 30 + 10;
      const x = Math.random() * 800;
      const y = Math.random() * 200;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add text
    ctx.font = 'bold 48px "Arial"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 10;
    ctx.fillText(`✨ ${text} ✨`, 400, 100);
    
    return canvas.toBuffer('image/png');
  },
  
  createAtomicFrame: async function(clownImage, colors) {
    const canvas = createCanvas(800, 600);
    const ctx = canvas.getContext('2d');
    
    // Draw background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 600);
    colors.forEach((color, i) => {
      gradient.addColorStop(i / (colors.length - 1), color);
    });
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 600);
    
    // Load clown image
    const img = await loadImage(clownImage);
    const scale = Math.min(600 / img.height, 600 / img.width);
    const width = img.width * scale * 0.8;
    const height = img.height * scale * 0.8;
    const x = (800 - width) / 2;
    const y = (600 - height) / 2;
    
    // Draw image with rounded corners
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 20);
    ctx.clip();
    ctx.drawImage(img, x, y, width, height);
    
    // Add atomic particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const radius = Math.random() * 10 + 2;
      const posX = Math.random() * 800;
      const posY = Math.random() * 600;
      ctx.beginPath();
      ctx.arc(posX, posY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Add clown hat
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.moveTo(x + width/2 - 50, y - 20);
    ctx.lineTo(x + width/2, y - 70);
    ctx.lineTo(x + width/2 + 50, y - 20);
    ctx.fill();
    
    // Add watermark
    ctx.font = '20px "Arial"';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.fillText('🤡 Atomic Clown Generator v2.0', 20, 580);
    
    return canvas.toBuffer('image/png');
  }
};

// Add rounded rectangle function to Canvas
CanvasRenderingContext2D.prototype.roundRect = function(x, y, w, h, r) {
  if (w < 2 * r) r = w / 2;
  if (h < 2 * r) r = h / 2;
  this.beginPath();
  this.moveTo(x + r, y);
  this.arcTo(x + w, y, x + w, y + h, r);
  this.arcTo(x + w, y + h, x, y + h, r);
  this.arcTo(x, y + h, x, y, r);
  this.arcTo(x, y, x + w, y, r);
  this.closePath();
  return this;
};
