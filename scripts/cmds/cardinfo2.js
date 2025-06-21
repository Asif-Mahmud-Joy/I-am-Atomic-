const sendWaiting = true;
const textWaiting = "🌀| ATOMIC PROFILE SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Initializing quantum particles...";
const fonts = {
  bold: "/cache/Montserrat-Bold.ttf",
  semiBold: "/cache/Montserrat-SemiBold.ttf",
  regular: "/cache/Montserrat-Regular.ttf"
};
const fontDownloads = {
  bold: "https://drive.google.com/uc?id=1nC3xfTRZzK7bzzLxZq9Xwj-MU7G9_Z-4&export=download",
  semiBold: "https://drive.google.com/uc?id=1f8mR1iGXwM0vN7LQk7jK8J3v6W9cY5z0&export=download",
  regular: "https://drive.google.com/uc?id=1T4z3v7QJk7b8X9Y0rR2sD5fG3hH6jL1p&export=download"
};

module.exports = {
  config: {
    name: "cardinfo2",
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Generate Atomic Group Card"
    },
    longDescription: {
      en: "⚛️ Create premium group profile cards with quantum styling"
    },
    category: "💎 Premium",
    guide: {
      en: "{pn} [userID|reply]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const { loadImage, createCanvas } = require("canvas");
    const fs = require("fs-extra");
    const axios = require("axios");
    const Canvas = require("canvas");
    
    if (sendWaiting) await api.sendMessage(textWaiting, event.threadID);

    // Determine target user
    let uid;
    if (event.type === "message_reply") {
      uid = event.messageReply.senderID;
    } else if (Object.keys(event.mentions).length > 0) {
      uid = Object.keys(event.mentions)[0];
    } else if (args[0]) {
      uid = args[0];
    } else {
      uid = event.senderID;
    }

    try {
      // Prepare paths
      const pathImg = __dirname + `/cache/cardinfo2_${Date.now()}.png`;
      const pathAvatar = __dirname + `/cache/avatar_${Date.now()}.png`;
      const pathBg = __dirname + `/cache/bg_${Date.now()}.jpg`;
      
      // Download fonts
      await this.downloadFonts();
      
      // Get user data
      const userInfo = await api.getUserInfo(uid);
      const userData = userInfo[uid];
      if (!userData) throw new Error("User data not found");
      
      // Get avatar and background
      const [avatarBuffer, bgBuffer] = await Promise.all([
        axios.get(`https://graph.facebook.com/${uid}/picture?width=1500&height=1500&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, 
                  { responseType: 'arraybuffer' }),
        axios.get("https://i.ibb.co/4s1t0Cg/atomic-group-bg.jpg", { responseType: 'arraybuffer' })
      ]);
      
      fs.writeFileSync(pathAvatar, Buffer.from(avatarBuffer.data, 'utf-8'));
      fs.writeFileSync(pathBg, Buffer.from(bgBuffer.data, 'utf-8'));
      
      // Process avatar
      const roundedAvatar = await this.createRoundedImage(pathAvatar, 500);
      
      // Create canvas
      const baseImage = await loadImage(pathBg);
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      
      // Draw background
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      
      // Draw atomic elements
      this.drawAtomicElements(ctx, canvas.width, canvas.height);
      
      // Draw profile card with glass effect
      const cardX = 100;
      const cardY = 100;
      const cardWidth = canvas.width - 200;
      const cardHeight = canvas.height - 200;
      
      this.drawGlassCard(ctx, cardX, cardY, cardWidth, cardHeight);
      
      // Draw avatar with glow
      const avatarSize = 280;
      const avatarX = cardX + 80;
      const avatarY = cardY + 80;
      const avatarImg = await loadImage(roundedAvatar);
      ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
      this.drawGlow(ctx, avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2 + 10);
      
      // Draw user info
      const infoX = avatarX + avatarSize + 60;
      const infoY = avatarY + 40;
      
      // Register fonts
      Canvas.registerFont(__dirname + fonts.bold, { family: "Montserrat", weight: "bold" });
      Canvas.registerFont(__dirname + fonts.semiBold, { family: "Montserrat", weight: 600 });
      Canvas.registerFont(__dirname + fonts.regular, { family: "Montserrat", weight: "normal" });
      
      // Draw user name with atomic effect
      ctx.font = "bold 56px Montserrat";
      ctx.fillStyle = "#00FFFF";
      ctx.fillText(userData.name, infoX, infoY);
      
      // Draw animated particle effect for name
      this.drawTextParticles(ctx, userData.name, infoX, infoY, 56);
      
      // Draw user ID
      ctx.font = "32px Montserrat";
      ctx.fillStyle = "#FFFFFF";
      ctx.fillText(`ID: ${uid}`, infoX, infoY + 60);
      
      // Draw details with icons
      const detailsY = infoY + 140;
      const lineHeight = 60;
      
      this.drawDetail(ctx, "⚛️ Gender", userData.gender || "Unknown", infoX, detailsY);
      this.drawDetail(ctx, "❤️ Relationship", userData.relationship_status || "Unknown", infoX, detailsY + lineHeight);
      this.drawDetail(ctx, "👥 Followers", userData.follow ? userData.follow.length : "Unknown", infoX, detailsY + lineHeight * 2);
      this.drawDetail(ctx, "🎂 Birthday", userData.birthday || "Unknown", infoX, detailsY + lineHeight * 3);
      this.drawDetail(ctx, "📍 Location", userData.location || "Unknown", infoX, detailsY + lineHeight * 4);
      
      // Draw QR code for profile
      this.drawQRCode(ctx, `https://facebook.com/${uid}`, cardX + 80, cardY + cardHeight - 180, 120);
      
      // Draw footer
      ctx.font = "28px Montserrat";
      ctx.fillStyle = "#00FFFF";
      ctx.textAlign = "center";
      ctx.fillText("☣️ ATOMIC GROUP CARD • GENERATED BY QUANTUM SYSTEM ⚛️", canvas.width/2, cardY + cardHeight - 40);
      
      // Save and send
      const imageBuffer = canvas.toBuffer();
      fs.writeFileSync(pathImg, imageBuffer);
      
      // Cleanup
      [pathAvatar, pathBg].forEach(path => fs.existsSync(path) && fs.unlinkSync(path));
      
      return api.sendMessage(
        { 
          body: "🌀| ATOMIC PROFILE SYSTEM\n━━━━━━━━━━━━━━\n✅ | Group card generated successfully\n⚛️ | Quantum signature verified",
          attachment: fs.createReadStream(pathImg) 
        },
        event.threadID,
        () => fs.unlinkSync(pathImg),
        event.messageID
      );
      
    } catch (error) {
      console.error("☢️ ATOMIC GROUP CARD ERROR:", error);
      return api.sendMessage("🌀| ATOMIC PROFILE SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum fluctuation detected\n🔸 | Failed to generate group card", event.threadID);
    }
  },

  downloadFonts: async function() {
    const fs = require("fs-extra");
    const axios = require("axios");
    
    for (const [weight, url] of Object.entries(fontDownloads)) {
      const path = __dirname + fonts[weight];
      if (!fs.existsSync(path)) {
        const fontData = (await axios.get(url, { responseType: "arraybuffer" })).data;
        fs.writeFileSync(path, Buffer.from(fontData, "utf-8"));
      }
    }
  },

  createRoundedImage: async function(path, size) {
    const jimp = require("jimp");
    const image = await jimp.read(path);
    await image.resize(size, size);
    
    // Create circular mask
    const mask = await new jimp(size, size, 0x00000000);
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const distance = Math.sqrt(Math.pow(x - size/2, 2) + Math.pow(y - size/2, 2));
        if (distance <= size/2) {
          mask.setPixelColor(jimp.rgbaToInt(255, 255, 255, 255), x, y);
        }
      }
    }
    
    image.mask(mask, 0, 0);
    return await image.getBufferAsync("image/png");
  },

  drawGlassCard: function(ctx, x, y, width, height) {
    // Draw card with glass effect
    ctx.save();
    
    // Create clipping path
    ctx.beginPath();
    this.drawRoundedRect(ctx, x, y, width, height, 30);
    ctx.clip();
    
    // Draw glass background
    ctx.fillStyle = "rgba(0, 31, 63, 0.3)";
    ctx.fillRect(x, y, width, height);
    
    // Draw glass reflection
    const gradient = ctx.createLinearGradient(x, y, x, y + height/3);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.1)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0.01)");
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, width, height/3);
    
    // Draw border
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 3;
    this.drawRoundedRect(ctx, x, y, width, height, 30);
    ctx.stroke();
    
    // Draw atomic pattern overlay
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = "#00FFFF";
    for (let i = 0; i < 30; i++) {
      const radius = Math.random() * 15 + 5;
      const posX = x + Math.random() * width;
      const posY = y + Math.random() * height;
      ctx.beginPath();
      ctx.arc(posX, posY, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  },

  drawRoundedRect: function(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.arcTo(x + width, y, x + width, y + radius, radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
    ctx.lineTo(x + radius, y + height);
    ctx.arcTo(x, y + height, x, y + height - radius, radius);
    ctx.lineTo(x, y + radius);
    ctx.arcTo(x, y, x + radius, y, radius);
    ctx.closePath();
  },

  drawGlow: function(ctx, x, y, radius) {
    ctx.save();
    ctx.shadowColor = "#00FFFF";
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = "#FFFFFF";
    ctx.lineWidth = 5;
    ctx.stroke();
    ctx.restore();
  },

  drawDetail: function(ctx, label, value, x, y) {
    ctx.font = "32px Montserrat";
    ctx.fillStyle = "#00FFFF";
    ctx.fillText(label, x, y);
    
    ctx.font = "36px Montserrat";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText(value, x + 250, y);
    
    // Draw animated particles for value
    this.drawTextParticles(ctx, value, x + 250, y, 36);
  },

  drawAtomicElements: function(ctx, width, height) {
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 2;
    
    // Draw nucleus
    ctx.beginPath();
    ctx.arc(width * 0.8, height * 0.2, 30, 0, Math.PI * 2);
    ctx.stroke();
    
    // Draw electron orbits
    const orbits = [
      { radius: 100, electrons: 3 },
      { radius: 180, electrons: 6 },
      { radius: 260, electrons: 9 }
    ];
    
    orbits.forEach(orbit => {
      ctx.beginPath();
      ctx.arc(width * 0.8, height * 0.2, orbit.radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Draw electrons
      for (let i = 0; i < orbit.electrons; i++) {
        const angle = (i * (Math.PI * 2 / orbit.electrons)) + Date.now()/1000;
        const ex = width * 0.8 + Math.cos(angle) * orbit.radius;
        const ey = height * 0.2 + Math.sin(angle) * orbit.radius;
        
        ctx.beginPath();
        ctx.arc(ex, ey, 8, 0, Math.PI * 2);
        ctx.fillStyle = "#00FFFF";
        ctx.fill();
      }
    });
    
    ctx.restore();
  },

  drawTextParticles: function(ctx, text, x, y, fontSize) {
    ctx.save();
    ctx.globalAlpha = 0.6;
    
    // Measure text dimensions
    const textWidth = ctx.measureText(text).width;
    
    // Draw particles along text path
    for (let i = 0; i < 50; i++) {
      const offsetX = Math.random() * textWidth;
      const offsetY = Math.random() * fontSize - fontSize/2;
      
      if (offsetX < textWidth && offsetX >= 0) {
        ctx.beginPath();
        ctx.arc(x + offsetX, y + offsetY, Math.random() * 3 + 1, 0, Math.PI * 2);
        ctx.fillStyle = "#00FFFF";
        ctx.fill();
      }
    }
    
    ctx.restore();
  },

  drawQRCode: function(ctx, url, x, y, size) {
    // Simple QR code simulation
    ctx.save();
    
    // Draw QR border
    ctx.strokeStyle = "#00FFFF";
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y, size, size);
    
    // Draw QR pattern
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 10, y + 10, 30, 30);
    ctx.fillRect(x + size - 40, y + 10, 30, 30);
    ctx.fillRect(x + 10, y + size - 40, 30, 30);
    
    // Draw center logo
    ctx.fillStyle = "#00FFFF";
    ctx.beginPath();
    ctx.arc(x + size/2, y + size/2, 15, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw text
    ctx.font = "16px Montserrat";
    ctx.fillStyle = "#FFFFFF";
    ctx.fillText("Scan to Connect", x, y + size + 20);
    
    ctx.restore();
  }
};
