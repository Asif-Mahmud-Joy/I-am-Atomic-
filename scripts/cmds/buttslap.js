const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "buttslap",
    version: "3.2",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: "🔥 Premium Slap Experience",
    longDescription: "✨ Generate high-quality slap memes with atomic-level precision",
    category: "💎 Premium",
    guide: {
      en: "{pn} @mention [custom message]"
    }
  },

  langs: {
    en: {
      noTag: "🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Target acquisition failed\n🔹 | Please tag recipient",
      processing: "🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Initializing particle collision\n▰▰▰▱▱▱▱▱ 45%",
      success: "🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n✅ | Slap delivered at quantum level\n💥 | Target successfully impacted",
      failed: "🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum fluctuation detected\n🔸 | Matter recombination failed"
    }
  },

  onStart: async function ({ event, message, usersData, args, getLang }) {
    try {
      const { senderID, mentions } = event;
      const targetID = Object.keys(mentions)[0];
      
      if (!targetID) {
        return message.reply(getLang("noTag"));
      }

      // Send processing message with animated typing
      const procMsg = await message.reply(getLang("processing"));
      
      // Update progress indicator
      await new Promise(resolve => setTimeout(resolve, 2000));
      await message.reply({
        body: "🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Calibrating trajectory\n▰▰▰▰▰▰▱▱ 75%",
        messageID: procMsg.messageID
      });

      // Get avatars with enhanced error handling
      const [slapperAvatar, victimAvatar] = await Promise.all([
        usersData.getAvatarUrl(senderID).catch(() => null),
        usersData.getAvatarUrl(targetID).catch(() => null)
      ]);

      if (!slapperAvatar || !victimAvatar) {
        throw new Error("Avatar retrieval failed");
      }

      // Generate premium quality image
      const imgURL = `https://api.atomicgame.dev/v1/slap?from=${encodeURIComponent(slapperAvatar)}&to=${encodeURIComponent(victimAvatar)}&effect=quantum`;
      const { data } = await axios.get(imgURL, {
        responseType: "arraybuffer",
        headers: {
          "Authorization": `Bearer ${process.env.ATOMIC_API_KEY}`,
          "Content-Type": "image/png"
        },
        timeout: 15000
      });

      // Save with premium filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const imagePath = path.join(__dirname, "tmp", `slap_${timestamp}_${senderID}_${targetID}.png`);
      await fs.outputFile(imagePath, Buffer.from(data));

      // Prepare custom text
      const customText = args
        .filter(arg => !arg.startsWith('@') && !arg.includes(targetID))
        .join(' ')
        .trim() || "💫 Atomic impact achieved | 0.0001s reaction time";

      // Final delivery with premium design
      await new Promise(resolve => setTimeout(resolve, 1500));
      await message.reply({
        body: `🌀| ATOMIC COMMAND SYSTEM\n━━━━━━━━━━━━━━\n${getLang("success")}\n\n💬 | "${customText}"\n\n🔹 Slapper: @${senderID}\n🔸 Target: @${targetID}\n━━━━━━━━━━━━━━\n💎 Premium Atomic Experience`,
        attachment: fs.createReadStream(imagePath),
        mentions: [
          { id: senderID, tag: usersData.getName(senderID) },
          { id: targetID, tag: mentions[targetID] }
        ]
      });

      // Cleanup
      fs.unlink(imagePath);
      message.unsend(procMsg.messageID);

    } catch (error) {
      console.error("🔴 ATOMIC ERROR:", error);
      await message.reply({
        body: `${getLang("failed")}\n💻 | ${error.message || "Unknown quantum error"}`,
        mentions: []
      });
    }
  }
};
