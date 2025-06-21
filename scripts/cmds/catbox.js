const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");
const { createCanvas, loadImage } = require('canvas');

// 🌌 Atomic Design Elements
const ATOMIC_DESIGN = {
  colors: {
    primary: "#6A5ACD",   // SlateBlue
    secondary: "#48D1CC", // MediumTurquoise
    accent: "#FF6B6B",    // LightCoral
    background: "#2D2B55" // DarkSlateBlue
  },
  icons: {
    upload: "📤",
    success: "✅",
    error: "❌",
    loading: "🌀",
    media: "🎬"
  }
};

// 🌟 Generate Atomic Design Banner
async function generateBanner(text) {
  const canvas = createCanvas(800, 200);
  const ctx = canvas.getContext('2d');
  
  // Gradient background
  const gradient = ctx.createLinearGradient(0, 0, 800, 0);
  gradient.addColorStop(0, ATOMIC_DESIGN.colors.primary);
  gradient.addColorStop(1, ATOMIC_DESIGN.colors.secondary);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 800, 200);
  
  // Atomic pattern
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  for (let i = 0; i < 50; i++) {
    const size = Math.random() * 30 + 10;
    const x = Math.random() * 800;
    const y = Math.random() * 200;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  
  // Text
  ctx.font = 'bold 42px "Segoe UI"';
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`✨ ${text} ✨`, 400, 100);
  
  // Add glow
  ctx.shadowColor = ATOMIC_DESIGN.colors.accent;
  ctx.shadowBlur = 20;
  ctx.fillText(`✨ ${text} ✨`, 400, 100);
  ctx.shadowBlur = 0;
  
  return canvas.toBuffer('image/png');
}

async function getUploadApiUrl() {
  try {
    const res = await axios.get("https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json", {
      timeout: 5000
    });
    return res.data.catbox || "https://catbox.moe/user/api.php";
  } catch {
    return "https://catbox.moe/user/api.php";
  }
}

async function handleCatboxUpload({ event, api, message }) {
  const { messageReply, messageID, threadID } = event;
  
  // 🎨 Atomic Design Banner
  const banner = await generateBanner("CATBOX UPLOAD");
  
  if (!messageReply || !messageReply.attachments || messageReply.attachments.length === 0) {
    return message.reply({
      body: "🚫 | Please reply to an image or video to upload.",
      attachment: banner
    });
  }

  const attachment = messageReply.attachments[0];
  const fileType = attachment.type;
  const ext = fileType === "photo" ? ".jpg" : ".mp4";
  const filePath = path.join(__dirname, `atomic_upload${Date.now()}${ext}`);

  // ⚛️ Atomic Status Reactions
  api.setMessageReaction(ATOMIC_DESIGN.icons.loading, messageID, () => {}, true);
  
  // ✨ Animated Typing Indicator
  let dots = 0;
  const typingInterval = setInterval(() => {
    dots = (dots + 1) % 4;
    api.sendTypingIndicator(threadID, (err) => {
      if (err) console.error("Typing indicator error:", err);
    });
  }, 500);

  try {
    // 🌈 Visual Feedback Message
    const mediaType = fileType === "photo" ? "image" : "video";
    const loadingMsg = await message.reply({
      body: `🌌 | Initializing atomic upload sequence...\n` +
            `⚡ | Media Type: ${mediaType.toUpperCase()}\n` +
            `🌀 | Establishing quantum connection to Catbox...`,
      attachment: banner
    });

    // ⏬ Download Media
    const response = await axios.get(attachment.url, { 
      responseType: "stream",
      timeout: 60000
    });
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    // ⏫ Upload to Catbox
    const uploadApiUrl = await getUploadApiUrl();
    const form = new FormData();
    form.append("reqtype", "fileupload");
    form.append("fileToUpload", fs.createReadStream(filePath));

    const upload = await axios.post(uploadApiUrl, form, {
      headers: form.getHeaders(),
      timeout: 120000
    });

    fs.unlinkSync(filePath);
    clearInterval(typingInterval);

    // ✅ Success Sequence
    api.setMessageReaction(ATOMIC_DESIGN.icons.success, messageID, () => {}, true);
    api.unsendMessage(loadingMsg.messageID);

    // ✨ Success Banner
    const successBanner = await generateBanner("UPLOAD COMPLETE");
    
    return message.reply({
      body: `✨ Atomic Upload Successful! ✨\n\n` +
            `⚛️ Media Type: ${mediaType.toUpperCase()}\n` +
            `⏱️ Upload Time: ${new Date().toLocaleTimeString()}\n\n` +
            `🔗 Your Catbox Link:\n${upload.data}\n\n` +
            `💫 Share with the quantum realm!`,
      attachment: successBanner
    });
  } catch (err) {
    // 🛑 Error Handling
    clearInterval(typingInterval);
    api.setMessageReaction(ATOMIC_DESIGN.icons.error, messageID, () => {}, true);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 🎨 Error Banner
    const errorBanner = await generateBanner("UPLOAD FAILED");
    
    return message.reply({
      body: `❌ Quantum Upload Failure!\n\n` +
            `⚡ Error: ${err.message || "Unknown error"}\n` +
            `🚨 Possible causes:\n` +
            `- Catbox server overload\n` +
            `- Quantum flux disturbance\n` +
            `- Exceeded temporal limits\n\n` +
            `🔄 Please try again later`,
      attachment: errorBanner
    });
  }
}

module.exports = {
  config: {
    name: "catbox",
    aliases: ["atomicupload", "quantumshare"],
    version: "2.0",
    author: "MaHU & Asif",
    countDown: 5,
    role: 0,
    shortDescription: "⚛️ Atomic Media Upload",
    longDescription: "Upload media to catbox.moe with quantum encryption and atomic design aesthetics",
    category: "🔧 Tools",
    guide: {
      en: "{pn} [reply to media]"
    }
  },

  onStart: async function ({ event, api, message }) {
    return handleCatboxUpload({ event, api, message });
  }
};
