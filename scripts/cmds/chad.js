const jimp = require("jimp");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "chad",
    aliases: ["atomicchad", "gigachad"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Create Atomic Chad Transformation"
    },
    longDescription: {
      en: "⚛️ Generate premium Giga Chad images with quantum enhancements"
    },
    category: "💎 Premium Fun",
    guide: {
      en: "{pn} @user1 @user2"
    }
  },

  onStart: async function ({ message, event, api }) {
    const mentions = Object.keys(event.mentions);
    if (mentions.length < 1) {
      return message.reply({
        body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Target acquisition failed\n🔸 | Please tag at least one person"
      });
    }

    // Send processing message
    const processingMsg = await message.reply({
      body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Initiating quantum transformation\n▰▱▱▱▱▱▱▱ 15%"
    });

    try {
      // Determine user IDs
      const id1 = mentions.length === 1 ? event.senderID : mentions[0];
      const id2 = mentions.length === 1 ? mentions[0] : mentions[1];

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Colliding alpha particles\n▰▰▰▱▱▱▱▱ 45%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Generate image
      const imgPath = await this.generateAtomicChad(id1, id2);
      
      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n✅ | Chad transformation complete\n▰▰▰▰▰▰▰▰ 100%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Send final result
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.reply({
        body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n💪 | Quantum Chad Transformation Complete!\n✨ | Embrace your inner alpha",
        attachment: fs.createReadStream(imgPath)
      });

      // Cleanup
      fs.unlinkSync(imgPath);
      api.unsend(processingMsg.messageID);

    } catch (err) {
      console.error("☢️ ATOMIC CHAD ERROR:", err);
      await message.reply({
        body: "☣️ ATOMIC CHAD SYSTEM\n━━━━━━━━━━━━━━\n❌ | Particle collision failed\n🔸 | " + (err.message || "Try again later")
      });
    }
  },

  generateAtomicChad: async function(id1, id2) {
    // Create temporary directory
    const tempDir = path.join(__dirname, 'tmp');
    await fs.ensureDir(tempDir);
    const outputPath = path.join(tempDir, `atomic_chad_${Date.now()}.png`);

    try {
      // Load profile pictures
      const [avatar1, avatar2] = await Promise.all([
        jimp.read(`https://graph.facebook.com/${id1}/picture?width=512&height=512`),
        jimp.read(`https://graph.facebook.com/${id2}/picture?width=512&height=512`)
      ]);

      // Process avatars
      avatar1.circle();
      avatar2.circle();

      // Load background (using the same URL but with atomic branding)
      const bg = await jimp.read("https://i.ibb.co/k5MfQhG/atomic-chad-bg.jpg");
      
      // Resize and prepare background
      bg.resize(1080, 1350);
      
      // Draw atomic effects
      this.drawAtomicEffects(bg);

      // Composite avatars with precise positioning
      bg.composite(avatar1.resize(320, 320), 120, 150);  // Left position
      bg.composite(avatar2.resize(320, 320), 650, 170);  // Right position

      // Add atomic branding
      const font = await jimp.loadFont(jimp.FONT_SANS_64_WHITE);
      bg.print(font, 100, 50, "☢️ ATOMIC CHAD");

      // Save image
      await bg.writeAsync(outputPath);
      return outputPath;

    } catch (err) {
      console.error("☢️ IMAGE GENERATION ERROR:", err);
      throw new Error("Quantum imaging failure");
    }
  },

  drawAtomicEffects: function(image) {
    // Draw quantum particle effects
    const particleColor = 0x00FFFFFF; // Cyan with full opacity
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * image.bitmap.width);
      const y = Math.floor(Math.random() * image.bitmap.height);
      const radius = Math.floor(Math.random() * 10) + 5;
      this.drawParticle(image, x, y, radius, particleColor);
    }
  },

  drawParticle: function(image, x, y, radius, color) {
    // Draw a glowing particle
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx*dx + dy*dy <= radius*radius) {
          const alpha = Math.round(255 * (1 - Math.sqrt(dx*dx + dy*dy) / radius);
          const finalColor = jimp.rgbaToInt(
            (color >> 24) & 0xFF,
            (color >> 16) & 0xFF,
            (color >> 8) & 0xFF,
            alpha
          );
          image.setPixelColor(finalColor, x + dx, y + dy);
        }
      }
    }
  }
};
