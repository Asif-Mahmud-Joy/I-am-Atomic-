const DIG = require("discord-image-generation");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "ads",
    aliases: ["atomicad", "quantumad"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 0,
    shortDescription: "⚛️ Quantum Advertisement Generator",
    longDescription: "Create atomic-grade advertisements with quantum technology",
    category: "⚡ Image Generation",
    guide: {
      en: "{pn} [@mention | reply | leave blank]"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐃𝐕𝐄𝐑𝐓𝐈𝐒𝐄𝐌𝐄𝐍𝐓 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🔄", "🖼️", "✨"]
    };
    // ================================================================================== //

    const formatResponse = (content) => {
      return [
        design.header,
        design.separator,
        content,
        design.separator,
        design.footer
      ].join("\n");
    };

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      // 🆔 Determine quantum subject
      const mention = Object.keys(event.mentions);
      let uid = event.senderID;
      let targetName = "You";

      if (event.type === "message_reply") {
        uid = event.messageReply.senderID;
        targetName = await usersData.getName(uid);
      } else if (mention.length > 0) {
        uid = mention[0];
        targetName = await usersData.getName(uid);
      } else {
        targetName = await usersData.getName(uid);
      }

      // ⚡ Generate quantum advertisement
      const avatarURL = await usersData.getAvatarUrl(uid);
      const quantumAd = await new DIG.Ad().getImage(avatarURL);

      // 🗂️ Quantum file management
      const tmpPath = path.join(__dirname, "tmp");
      if (!fs.existsSync(tmpPath)) fs.mkdirSync(tmpPath);
      
      const savePath = path.join(tmpPath, `quantum_ad_${Date.now()}.png`);
      fs.writeFileSync(savePath, Buffer.from(quantumAd));

      // ✨ Atomic promotion message
      const adMessages = [
        `✨ Introducing Quantum-Ready Technology for ${targetName}! ✨`,
        `⚡ ${targetName}'s Atomic-Grade Innovation Now Available!`,
        `🔬 Breakthrough Research by ${targetName} Revolutionizes Industry!`,
        `🚀 ${targetName}'s Quantum Leap in Technology Development!`,
        `🌟 Experience the Future with ${targetName}'s Atomic Solutions!`
      ];
      
      const randomMessage = adMessages[Math.floor(Math.random() * adMessages.length)];

      // 📤 Send quantum advertisement
      message.reply({
        body: formatResponse(randomMessage),
        attachment: fs.createReadStream(savePath)
      }, () => fs.unlinkSync(savePath));

    } catch (error) {
      console.error("Quantum Ad Error:", error);
      message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐃 𝐅𝐀𝐈𝐋𝐔𝐑𝐄\nFailed to generate atomic advertisement"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
