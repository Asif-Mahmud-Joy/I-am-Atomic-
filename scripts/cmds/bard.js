const axios = require("axios");
const fs = require("fs-extra");
const gtts = require("gtts");
const path = require("path");
const { createCanvas, loadImage } = require("canvas");

module.exports = {
  config: {
    name: "quantumbard",
    aliases: ["qbard", "atomicai"],
    version: "5.0",
    author: "Asif X Atomic",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Quantum-powered AI with atomic precision",
    longDescription: "🌀 Multidimensional intelligence with holographic interfaces",
    category: "ai",
    guide: "{pn} [query] or reply to image"
  },

  onStart: async function ({ api, event, args }) {
    const { threadID, messageID, messageReply } = event;
    const cacheDir = path.join(__dirname, 'cache', 'quantum');
    await fs.ensureDir(cacheDir);

    try {
      // 1. TYPING ANIMATION
      const typingMsg = await api.sendMessage("▱▱▱▱▱", threadID);

      // Animation sequence
      const dots = ['▰▱▱▱▱', '▰▰▱▱▱', '▰▰▰▱▱', '▰▰▰▰▱', '▰▰▰▰▰'];
      for (const dot of dots) {
        await new Promise(resolve => setTimeout(resolve, 300));
        await api.editMessage(dot, typingMsg.messageID);
      }

      // 2. INPUT PROCESSING
      let query = "";
      if (messageReply?.attachments?.[0]?.type === "photo") {
        await api.editMessage("🔄 | DECRYPTING HOLOGRAM...", typingMsg.messageID);
        query = await this.imageToText(messageReply.attachments[0].url);
        if (!query) throw new Error("Hologram resolution failed");
      } else {
        query = args.join(" ");
        if (!query) throw new Error("Quantum field requires input");
      }

      // 3. AI PROCESSING WITH VISUAL FEEDBACK
      await api.editMessage("⚡ | IGNITING QUANTUM CORES...", typingMsg.messageID);
      const aiResponse = await this.getAIResponse(query);
      
      await api.editMessage("🌀 | COLLAPSING WAVEFUNCTION...", typingMsg.messageID);
      const [voicePath, imageAttachments] = await Promise.all([
        this.generateVoice(aiResponse, path.join(cacheDir, 'quantum_voice.mp3')),
        this.getVisuals(query, cacheDir)
      ]);

      // 4. CREATE HOLOGRAPHIC INTERFACE
      await api.editMessage("🌌 | RENDERING HOLOINTERFACE...", typingMsg.messageID);
      const holographicImage = await this.createHoloInterface(aiResponse, cacheDir);

      // 5. FINAL PRESENTATION
      await api.unsendMessage(typingMsg.messageID);
      await api.sendMessage({
        body: this.createResponseBody(aiResponse, query),
        attachment: [
          fs.createReadStream(holographicImage),
          fs.createReadStream(voicePath),
          ...imageAttachments
        ]
      }, threadID);

    } catch (error) {
      console.error('Quantum Error:', error);
      const errorArt = await this.generateErrorArt(error.message, cacheDir);
      api.sendMessage({
        body: "⚠️ QUANTUM ANOMALY DETECTED",
        attachment: fs.createReadStream(errorArt)
      }, threadID);
    } finally {
      await this.cleanCache(cacheDir);
    }
  },

  // ATOMIC CORE FUNCTIONS
  imageToText: async function (imgUrl) {
    try {
      const { data } = await axios.get(`https://api.ocr.space/parse/imageurl?apikey=K81699170688957&url=${encodeURIComponent(imgUrl)}`);
      return data.ParsedResults[0]?.ParsedText || null;
    } catch {
      return null;
    }
  },

  getAIResponse: async function (query) {
    const models = [
      { 
        name: "meta-llama/llama-3.3-8b-instruct:free",
        key: "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"
      },
      { 
        name: "deepseek/deepseek-r1-0528:free",
        key: "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"
      }
    ];

    for (const model of models) {
      try {
        const { data } = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: model.name,
            messages: [{ role: "user", content: query }]
          },
          { headers: { Authorization: `Bearer ${model.key}` } }
        );
        return data.choices[0].message.content;
      } catch (error) {
        console.error(`Model ${model.name} failed:`, error.message);
      }
    }
    throw new Error("All quantum channels collapsed");
  },

  generateVoice: function (text, outputPath) {
    return new Promise((resolve) => {
      const voice = new gtts(text, 'en');
      voice.save(outputPath, (err) => {
        if (err) console.error('Voice synthesis error:', err);
        resolve(outputPath);
      });
    });
  },

  getVisuals: async function (query, cacheDir) {
    try {
      const { data } = await axios.get(`https://api.pinterest.com/v3/pidgets/boards/pins/?query=${encodeURIComponent(query)}&limit=4`);
      const pins = data.data?.pins || [];
      
      return Promise.all(pins.map(async (pin, i) => {
        const imagePath = path.join(cacheDir, `visual_${i}.jpg`);
        const { data } = await axios.get(pin.images.orig.url, { responseType: 'arraybuffer' });
        await fs.writeFile(imagePath, data);
        return fs.createReadStream(imagePath);
      }));
    } catch {
      return [];
    }
  },

  createHoloInterface: async function (text, cacheDir) {
    const outputPath = path.join(cacheDir, 'holo_interface.png');
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');

    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#0f0c29');
    gradient.addColorStop(1, '#302b63');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);

    // Add quantum particles
    ctx.fillStyle = 'rgba(0, 255, 255, 0.3)';
    for (let i = 0; i < 50; i++) {
      const x = Math.random() * 800;
      const y = Math.random() * 400;
      const radius = Math.random() * 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    // Add text
    ctx.fillStyle = '#00ffea';
    ctx.font = 'bold 20px "Arial"';
    ctx.textAlign = 'center';
    const lines = this.wrapText(ctx, text.substring(0, 300), 700, 24);
    lines.forEach((line, i) => {
      ctx.fillText(line, 400, 150 + i * 30);
    });

    // Add border
    ctx.strokeStyle = '#00ffaa';
    ctx.lineWidth = 3;
    ctx.strokeRect(10, 10, 780, 380);

    // Save image
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
    return outputPath;
  },

  wrapText: function (ctx, text, maxWidth, fontSize) {
    ctx.font = `bold ${fontSize}px Arial`;
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines.slice(0, 5);
  },

  createResponseBody: function (response, query) {
    return `🌀 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐈𝐍𝐓𝐄𝐑𝐅𝐀𝐂𝐄
◆━━━━━━━━━━━━━━━━━━◆
    
▢ 𝗤𝗨𝗘𝗥𝗬: 「${this.stylizeText(query)}」
    
✨ 𝗥𝗘𝗦𝗣𝗢𝗡𝗦𝗘:
${this.stylizeText(response.substring(0, 1000))}

◆━━━━━━━━━━━━━━━━━━◆
🔮 𝐀𝐓𝐎𝐌𝐈𝐂 𝐂𝐎𝐑𝐄 𝐕𝟓 • 𝐁𝐘 𝐀𝐒𝐈𝐅`;
  },

  stylizeText: function (text) {
    const styles = [
      char => String.fromCharCode(char.charCodeAt(0) + 0x1d4f0 - 0x61, // Script
      char => String.fromCharCode(char.charCodeAt(0) + 0x1d56c - 0x61, // Bold Fraktur
      char => String.fromCharCode(char.charCodeAt(0) + 0x1d504 - 0x41  // Double-struck
    ];
    
    return text.split('').map(char => {
      if (/[a-z]/i.test(char)) {
        const style = styles[Math.floor(Math.random() * styles.length)];
        return style(char);
      }
      return char;
    }).join('');
  },

  generateErrorArt: async function (error, cacheDir) {
    const outputPath = path.join(cacheDir, 'quantum_error.png');
    const canvas = createCanvas(600, 300);
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#2a0a2a';
    ctx.fillRect(0, 0, 600, 300);
    
    // Error symbol
    ctx.fillStyle = '#ff0055';
    ctx.beginPath();
    ctx.arc(300, 120, 50, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#2a0a2a';
    ctx.font = 'bold 60px Arial';
    ctx.fillText('!', 285, 145);
    
    // Error message
    ctx.fillStyle = '#00ffff';
    ctx.font = 'bold 20px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('QUANTUM DECOHERENCE DETECTED', 300, 200);
    ctx.fillText(error.substring(0, 50), 300, 230);
    
    // Save image
    const buffer = canvas.toBuffer('image/png');
    await fs.writeFile(outputPath, buffer);
    return outputPath;
  },

  cleanCache: async function (cacheDir) {
    try {
      await fs.emptyDir(cacheDir);
    } catch {
      // Silent cleanup
    }
  }
};
