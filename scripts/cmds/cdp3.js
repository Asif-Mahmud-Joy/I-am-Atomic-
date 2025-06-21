const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "cdp3",
    aliases: ["atomiccouple"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Generate Quantum Love Pair"
    },
    longDescription: {
      en: "⚛️ Create premium couple display pictures with atomic bonding effects"
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
        body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Initializing particle entanglement\n▰▱▱▱▱▱▱▱ 20%"
      }, event.threadID);

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Colliding love particles\n▰▰▰▱▱▱▱▱ 45%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Fetch couple images
      const { data } = await axios.get("https://api.akyuu.xyz/api/coupledpp?apikey=akuu", {
        timeout: 10000
      });
      
      if (!data?.male || !data?.female) {
        return api.sendMessage({
          body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n❌ | Particle entanglement failed\n🔸 | Try again later"
        }, event.threadID, processingMsg.messageID);
      }

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n🌀 | Stabilizing atomic bonds\n▰▰▰▰▰▱▱▱ 75%",
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
        body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n✅ | Atomic bond formation complete\n▰▰▰▰▰▰▰▰ 100%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Prepare final message
      const msg = `☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n💞 | Perfect Atomic Match Found!\n✨ | Enjoy your quantum couple display pictures`;

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
      console.error("☢️ QUANTUM LOVE ERROR:", err);
      return api.sendMessage({
        body: "☣️ QUANTUM LOVE SYSTEM\n━━━━━━━━━━━━━━\n❌ | Particle collision failed\n🔸 | " + (err.message || "Try again later")
      }, event.threadID);
    }
  }
};
