const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { createCanvas, loadImage } = require('canvas');

// 🌌 ATOMIC DESIGN SYSTEM
const ATOMIC = {
  COLORS: {
    PRIMARY: "#6A5ACD",   // SlateBlue
    SECONDARY: "#48D1CC", // MediumTurquoise
    ACCENT: "#FF6B6B",    // LightCoral
    DARK: "#2D2B55",      // DarkSlateBlue
    LIGHT: "#E6E6FA"      // Lavender
  },
  ELEMENTS: ["⚛️", "🔬", "🧪", "🌌", "🌀", "✨", "⚡"],
  FILE_ICONS: {
    IMAGE: "🖼️",
    VIDEO: "🎬",
    AUDIO: "🎵",
    DOCUMENT: "📄",
    ARCHIVE: "📦",
    DEFAULT: "📁"
  }
};

// 🌟 GENERATE ATOMIC BANNER
async function createAtomicBanner(title, fileType = "DEFAULT") {
  const canvas = createCanvas(800, 300);
  const ctx = canvas.getContext('2d');
  
  // Gradient Background
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, ATOMIC.COLORS.PRIMARY);
  gradient.addColorStop(1, ATOMIC.COLORS.SECONDARY);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 300);
  
  // Atomic Particles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
  for (let i = 0; i < 75; i++) {
    const size = Math.random() * 20 + 5;
    const x = Math.random() * 800;
    const y = Math.random() * 300;
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
  ctx.fillText(`${ATOMIC.FILE_ICONS[fileType]}  ${title}  ${ATOMIC.FILE_ICONS[fileType]}`, 400, 120);
  ctx.shadowBlur = 0;
  
  // Animated Particles
  ctx.fillStyle = ATOMIC.COLORS.ACCENT;
  for (let i = 0; i < 7; i++) {
    const element = ATOMIC.ELEMENTS[i];
    const size = 30 + i * 5;
    ctx.font = `${size}px Arial`;
    const x = 150 + i * 80;
    const y = 220 + Math.sin(Date.now()/1000 + i) * 10;
    ctx.fillText(element, x, y);
  }
  
  return canvas.toBuffer('image/png');
}

// 🧪 FILE TYPE DETECTION
function detectFileType(url) {
  const ext = path.extname(new URL(url).pathname).toLowerCase();
  
  const types = {
    IMAGE: ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.bmp', '.tiff', '.svg'],
    VIDEO: ['.mp4', '.mov', '.avi', '.mkv', '.webm', '.flv', '.wmv', '.mpeg'],
    AUDIO: ['.mp3', '.wav', '.flac', '.aac', '.ogg', '.m4a', '.wma'],
    DOCUMENT: ['.pdf', '.docx', '.txt', '.xlsx', '.pptx', '.csv', '.rtf', '.doc'],
    ARCHIVE: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2']
  };
  
  for (const [type, exts] of Object.entries(types)) {
    if (exts.includes(ext)) return type;
  }
  
  return 'DEFAULT';
}

module.exports = {
  config: {
    name: "convert",
    aliases: ["atomicdl", "quantumconvert"],
    version: "3.0",
    author: "Asif & Atomic Labs",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Atomic Media Converter",
    longDescription: "Convert media links to files with quantum precision and atomic design aesthetics",
    category: "⚡ Media",
    guide: "{pn} [media-url]"
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // 🌀 ATOMIC ANIMATION SEQUENCE
      const animate = async (text) => {
        const frames = [];
        for (let i = 0; i < 5; i++) {
          frames.push(await createAtomicBanner(text, "DEFAULT"));
        }
        return message.reply({
          body: "🌀 Preparing quantum converter...",
          attachment: frames
        });
      };

      // 🔍 VALIDATE INPUT
      const url = args[0];
      if (!url || !url.startsWith('http')) {
        const banner = await createAtomicBanner("INVALID INPUT", "DEFAULT");
        return message.reply({
          body: "❌ Invalid Quantum Signature\n" +
                "⚡ Please provide a valid media URL\n" +
                "🌐 Example: https://example.com/file.jpg",
          attachment: banner
        });
      }

      // ⚛️ DETECT FILE TYPE
      const fileType = detectFileType(url);
      const fileIcon = ATOMIC.FILE_ICONS[fileType];
      
      // ⚗️ PROCESSING ANIMATION
      const processingMsg = await animate("PROCESSING");
      api.setMessageReaction("⏳", event.messageID, () => {}, true);

      // ⏬ QUANTUM DOWNLOAD
      try {
        const response = await axios.get(url, {
          responseType: 'arraybuffer',
          timeout: 30000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
          }
        });

        if (response.status !== 200) {
          throw new Error('Quantum entanglement failed');
        }

        // 💾 SAVE TO TEMPORARY FILE
        const ext = path.extname(new URL(url).pathname) || '.bin';
        const filename = path.join(__dirname, `atomic_${Date.now()}${ext}`);
        await fs.writeFile(filename, Buffer.from(response.data, 'binary'));
        const fileSize = (response.data.length / (1024 * 1024)).toFixed(2);

        // ✅ SUCCESS BANNER
        const successBanner = await createAtomicBanner("CONVERSION COMPLETE", fileType);
        
        // 🚀 SEND RESULT
        await api.unsendMessage(processingMsg.messageID);
        message.reply({
          body: `${fileIcon} Atomic Conversion Successful ${fileIcon}\n\n` +
                `⚛️ File Type: ${fileType}\n` +
                `📏 Size: ${fileSize} MB\n` +
                `🔗 Source: ${url}\n` +
                `✨ Enjoy your quantum file!`,
          attachment: [successBanner, fs.createReadStream(filename)]
        }, () => fs.unlinkSync(filename));

        // ✅ REACTION
        api.setMessageReaction("✅", event.messageID, () => {}, true);

      } catch (error) {
        console.error("Quantum error:", error);
        await api.unsendMessage(processingMsg.messageID);
        
        // ❌ ERROR HANDLING
        const errorBanner = await createAtomicBanner("CONVERSION FAILED", "DEFAULT");
        message.reply({
          body: "❌ Quantum Fluctuation Detected\n\n" +
                `⚡ Error: ${error.message}\n` +
                "🔧 Possible causes:\n" +
                "- Temporal instability\n" +
                "- Invalid quantum signature\n" +
                "- Unstable connection\n" +
                "💫 Try again later",
          attachment: errorBanner
        });
        
        api.setMessageReaction("❌", event.messageID, () => {}, true);
      }
    } catch (error) {
      console.error("Atomic collapse:", error);
      message.reply("⚠️ Critical quantum instability detected! System reboot required.");
    }
  }
};
