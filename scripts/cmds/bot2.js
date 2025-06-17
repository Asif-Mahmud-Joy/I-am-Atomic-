const axios = require("axios");
const fs = require("fs-extra");
const gtts = require("gtts");
const path = require("path");

module.exports = {
  config: {
    name: "bot2",
    version: "2.0",
    usePrefix: true,
    hasPermission: 0,
    credits: "🌫 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 🎩 | 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    description: "Updated script with fixed media reply and working Bard AI integration",
    commandCategory: "ai",
    usages: "{pn} <text | reply image>",
    cooldowns: 5
  },

  onStart: async function ({ api, event }) {
    const { threadID, messageID, type, messageReply, body } = event;
    let question = "";
    const voicePath = path.join(__dirname, "cache", `bard_voice_${Date.now()}.mp3`);

    if (type === "message_reply" && messageReply.attachments[0]?.type === "photo") {
      const imageURL = messageReply.attachments[0].url;
      try {
        const imgToText = await axios.get(`https://bard-ai.arjhilbard.repl.co/api/other/img2text?input=${encodeURIComponent(imageURL)}`);
        question = imgToText.data.extractedText;
        if (!question) return api.sendMessage("❌ Image theke text paowa jai nai.", threadID, messageID);
      } catch (err) {
        console.error("Image OCR error:", err);
        return api.sendMessage("❌ Image OCR error hoise.", threadID, messageID);
      }
    } else {
      question = body.replace(/^.*?\s/, "").trim();
      if (!question) return api.sendMessage("📌 Text dao ba image reply dao. Bot reply dibe.", threadID, messageID);
    }

    api.sendMessage("🧠 Thinking... wait kortesi...", threadID);

    try {
      const res = await axios.get(`https://bard-ai.arjhilbard.repl.co/bard?ask=${encodeURIComponent(question)}`);
      const reply = res.data.message;
      const gttsVoice = new gtts(reply, 'en');
      gttsVoice.save(voicePath, function (err) {
        if (err) {
          console.error("Voice gen error:", err);
          return api.sendMessage("❌ Voice banaite error hoise.", threadID, messageID);
        }
        api.sendMessage({
          body: `🤖 Bard AI reply:

${reply}`,
          attachment: fs.createReadStream(voicePath)
        }, threadID, () => fs.unlinkSync(voicePath), messageID);
      });
    } catch (err) {
      console.error("Bard API error:", err);
      return api.sendMessage("❌ Bard API theke data ana jai nai.", threadID, messageID);
    }
  }
};
