const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp",
    aliases: ["couple"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Generate Atomic Couple DP"
    },
    longDescription: {
      en: "⚛️ Create premium couple display pictures with quantum styling"
    },
    category: "💎 Premium Love",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ api, event }) {
    const tempDir = path.join(__dirname, "tmp");
    await fs.ensureDir(tempDir);

    try {
      // Send processing message with typing animation
      const processingMsg = await api.sendMessage({
        body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Quantum entanglement initiated\n▰▱▱▱▱▱▱▱ 15%"
      }, event.threadID);

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Generating particle pairs\n▰▰▰▱▱▱▱▱ 40%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Fetch couple images
      const { data } = await axios.get("https://api.akyuu.xyz/api/coupledpp?apikey=akuu");
      
      if (!data?.male || !data?.female) {
        return api.sendMessage({
          body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum entanglement failed\n🔸 | Try again later"
        }, event.threadID, processingMsg.messageID);
      }

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n🌀 | Stabilizing love particles\n▰▰▰▰▰▱▱▱ 70%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Download images
      const [maleImg, femaleImg] = await Promise.all([
        axios.get(data.male, { responseType: "arraybuffer" }),
        axios.get(data.female, { responseType: "arraybuffer" })
      ]);

      const malePath = path.join(tempDir, `male_${Date.now()}.png`);
      const femalePath = path.join(tempDir, `female_${Date.now()}.png`);

      fs.writeFileSync(malePath, Buffer.from(maleImg.data));
      fs.writeFileSync(femalePath, Buffer.from(femaleImg.data));

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.sendMessage({
        body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n✅ | Bond formation complete\n▰▰▰▰▰▰▰▰ 100%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Prepare final message
      const msg = `☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n💖 | Quantum Love Pair Generated\n✨ | Perfect match found!\n\n⚛️ Enjoy your atomic couple display pictures`;

      // Send final result
      await new Promise(resolve => setTimeout(resolve, 1000));
      return api.sendMessage({
        body: msg,
        attachment: [
          fs.createReadStream(malePath),
          fs.createReadStream(femalePath)
        ]
      }, event.threadID, () => {
        // Cleanup
        fs.unlinkSync(malePath);
        fs.unlinkSync(femalePath);
        api.unsend(processingMsg.messageID);
      });

    } catch (err) {
      console.error("☢️ ATOMIC COUPLE ERROR:", err);
      return api.sendMessage({
        body: "☣️ ATOMIC COUPLE SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum entanglement failed\n🔸 | " + (err.message || "Try again later")
      }, event.threadID);
    }
  }
};
