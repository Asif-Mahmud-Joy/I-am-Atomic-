const { loadImage, createCanvas } = require("canvas");
const fs = require("fs-extra");
const axios = require("axios");
const moment = require("moment-timezone");

// ☣️⚛️ ATOMIC HACKING SYSTEM ⚛️☣️
const config = {
  ADMIN_IDS: ["61571630409265"],
  TMP_DIR: __dirname + "/cache",
  FB_TOKEN: process.env.FB_ACCESS_TOKEN || "6628568379|c1e620fa708a1d5696fb991c1bde5662",
  BACKGROUND_URLS: [
    "https://i.imgur.com/VQXViKI.png",
    "https://i.imgur.com/3z3x1f4.png",
    "https://i.imgur.com/7y7x2g5.png"
  ],
  DESIGN: {
    HEADER: "☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐀𝐂𝐊𝐈𝐍𝐆 𝐒𝐘𝐒𝐓𝐄𝐌 ⚛️☣️",
    FOOTER: "✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡 ⚡️",
    SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
    EMOJI: {
      SUCCESS: "✅",
      ERROR: "❌",
      WARNING: "⚠️",
      PROCESSING: "⏳",
      HACKING: "💻",
      SECURITY: "🔒"
    }
  }
};

// ▰▰▰▰▰▰▰▰▰▰ PROGRESS BAR ▰▰▰▰▰▰▰▰▰▰
function generateProgressBar(percentage) {
  const blocks = 15;
  const completed = Math.round(blocks * (percentage / 100));
  return `▰`.repeat(completed) + `▱`.repeat(blocks - completed);
}

module.exports = {
  config: {
    name: "hack",
    aliases: ["hacking", "atomic-hack"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "☣️⚛️ Simulated Hacking System",
    longDescription: "Create hacking simulation images with Atomic design",
    category: "fun",
    guide: {
      en: "{p}hack [mention|UID]"
    }
  },

  langs: {
    en: {
      processing: "🔓 Initiating hacking sequence...",
      success: "✅ Successfully accessed %1's system",
      selfHack: "⚠️ Self-test completed. System secure",
      noPermission: "❌ Authorization required for external targets",
      userNotFound: "⚠️ Target not found in database",
      apiError: "❌ Network security breach detected",
      fileError: "⚠️ Data processing failure",
      canvasError: "⚠️ Visual interface corrupted"
    }
  },

  onStart: async function ({ args, api, event, getLang, usersData }) {
    const { senderID, threadID, messageID, mentions } = event;
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const pathImg = `${config.TMP_DIR}/atomic_hack_${Date.now()}.png`;
    const pathAvt = `${config.TMP_DIR}/avatar_${Date.now()}.png`;

    // Format Atomic message
    const formatAtomicMessage = (content) => {
      return `${config.DESIGN.HEADER}\n${config.DESIGN.SEPARATOR}\n${content}\n${config.DESIGN.SEPARATOR}\n${config.DESIGN.FOOTER}`;
    };

    // Send Atomic-styled message
    const sendAtomicMessage = async (content, attachment = null) => {
      return api.sendMessage({
        body: formatAtomicMessage(content),
        attachment
      }, threadID);
    };

    // Show processing animation
    api.setMessageReaction(config.DESIGN.EMOJI.PROCESSING, messageID, () => {}, true);
    const processingMsg = await sendAtomicMessage(
      `${config.DESIGN.EMOJI.PROCESSING} ${getLang("processing")}\n` +
      `${generateProgressBar(25)} 25%`
    );

    try {
      // Create temp directory
      await fs.ensureDir(config.TMP_DIR);

      // Update progress
      await api.sendMessage(
        formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} Bypassing security...\n` +
          `${generateProgressBar(50)} 50%`
        ),
        threadID
      );

      // Determine target
      let uid = senderID;
      let name;
      const mentionedUID = Object.keys(mentions)[0];
      const isSelfHack = !mentionedUID || mentionedUID === senderID;

      if (!isSelfHack) {
        if (!config.ADMIN_IDS.includes(senderID) {
          await api.unsendMessage(processingMsg.messageID);
          return sendAtomicMessage(
            `${config.DESIGN.EMOJI.ERROR} ${getLang("noPermission")}`
          );
        }
        uid = mentionedUID;
      }

      // Fetch user info
      const userInfo = await api.getUserInfo(uid);
      if (!userInfo[uid]) {
        await api.unsendMessage(processingMsg.messageID);
        return sendAtomicMessage(
          `${config.DESIGN.EMOJI.WARNING} ${getLang("userNotFound")}`
        );
      }
      name = userInfo[uid].name;

      // Update progress
      await api.sendMessage(
        formatAtomicMessage(
          `${config.DESIGN.EMOJI.PROCESSING} Accessing target systems...\n` +
          `${generateProgressBar(75)} 75%`
        ),
        threadID
      );

      // Fetch avatar
      const avatarUrl = `https://graph.facebook.com/${uid}/picture?width=720&height=720&access_token=${encodeURIComponent(config.FB_TOKEN)}`;
      const avatarBuffer = (await axios.get(avatarUrl, { responseType: "arraybuffer" })).data;
      await fs.writeFile(pathAvt, avatarBuffer);

      // Get random background
      const bgUrl = config.BACKGROUND_URLS[Math.floor(Math.random() * config.BACKGROUND_URLS.length)];
      const backgroundBuffer = (await axios.get(bgUrl, { responseType: "arraybuffer" })).data;

      // Process images
      const baseImage = await loadImage(backgroundBuffer);
      const avatarImage = await loadImage(pathAvt);

      // Create canvas
      const canvas = createCanvas(baseImage.width, baseImage.height);
      const ctx = canvas.getContext("2d");
      ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
      ctx.drawImage(avatarImage, 83, 437, 100, 101);

      // Add target name
      ctx.font = "bold 24px 'Segoe UI', Arial";
      ctx.fillStyle = "#00ff00";
      ctx.textAlign = "left";
      ctx.fillText(name, 200, 497);

      // Add hacking info
      ctx.font = "16px 'Courier New', monospace";
      ctx.fillStyle = "#00ffff";
      ctx.fillText(`> TARGET: ${name}`, 200, 530);
      ctx.fillText(`> SYSTEM: FACEBOOK`, 200, 555);
      ctx.fillText(`> TIME: ${time}`, 200, 580);
      ctx.fillText(`> STATUS: COMPROMISED`, 200, 605);

      // Save image
      const finalBuffer = canvas.toBuffer();
      await fs.writeFile(pathImg, finalBuffer);
      await fs.remove(pathAvt);

      // Send result
      await api.unsendMessage(processingMsg.messageID);
      const message = isSelfHack ? 
        getLang("selfHack") : 
        getLang("success", name);
      
      return sendAtomicMessage(
        `${config.DESIGN.EMOJI.SUCCESS} ${message}\n` +
        `⏱️ ${time} | 🔓 Security level: Breached\n` +
        `${config.DESIGN.SEPARATOR}\n` +
        `💻 System vulnerabilities detected: 4\n` +
        `📁 Data accessed: Profile, Messages, Contacts`,
        fs.createReadStream(pathImg)
      );

    } catch (error) {
      console.error("Atomic hack error:", error);
      await api.unsendMessage(processingMsg.messageID);
      
      let errorMsg;
      if (error.message.includes("Request failed")) {
        errorMsg = getLang("apiError");
      } else if (error.message.includes("ENOENT")) {
        errorMsg = getLang("fileError");
      } else {
        errorMsg = getLang("canvasError");
      }
      
      return sendAtomicMessage(
        `${config.DESIGN.EMOJI.ERROR} ${errorMsg}\n` +
        `🔧 Error code: ${error.code || 'UNKNOWN'}\n` +
        `${config.DESIGN.SEPARATOR}\n` +
        `💡 Solutions:\n` +
        `• Verify network connection\n` +
        `• Try again later\n` +
        `• Contact system administrator`
      );
    }
  }
};
