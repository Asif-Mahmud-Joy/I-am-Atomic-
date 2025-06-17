const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const preTeach = [
  { q: "tumi ke", a: ["ami tomar bby 😚", "ami tomar"] },
  { q: "bhalobashi tomake", a: ["ami o tomake 😍", "onek onek bhalobashi"] },
  { q: "mon kharap", a: ["kiser jonno? bolo na bby", "ami achi tomar jonno"] },
  { q: "kisu bolo", a: ["toke na dekhle din shuru hoy na 😍", "bhalobasha hocche tomar moto cheharar upor ekta poem"] },
  { q: "ki korcho", a: ["tomar kotha vabi 😘", "toke niye shopno dekchi"] },
  { q: "good night", a: ["shuvo raatri bby 😴", "sweet dream jan"] },
  { q: "valo aso?", a: ["tumi jodi valo thako ami o valo 🥰"] },
  { q: "ami valo nai", a: ["mon kharap korish na jan 😞"] },
  { q: "tomar sathe kotha bolte ichche kore", a: ["ami o tomar sathe kotha bolte chai", "bolo jan ki niye kotha bolbo"] },
  { q: "tui valo na", a: ["ami kharap hoileo tomar jonnoi bby 😔"] },
  { q: "single naki taken", a: ["ami tomar jonno single 😌"] },
  { q: "toke miss kori", a: ["ami o toke miss kori 😢"] },
  { q: "toke niye shopno dekhi", a: ["shopno gulo sobi shotti hobe ekdin bby"] }
];

module.exports = {
  config: {
    name: "bby",
    version: "2.5",
    author: "Smokey x GPT",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Bby chatbot with image"
    },
    longDescription: {
      en: "Flirty, cute chatbot that replies with text & images"
    },
    category: "fun",
    guide: {
      en: "Just say anything like 'bby', 'baby', 'jan', 'kiss', etc."
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      const text = (event.body || "").toLowerCase();
      const triggerWords = ["bby", "baby", "jan", "babu", "bbe", "bow", "bot"];

      // Main API Call (text)
      if (triggerWords.some(word => text.includes(word))) {
        const res = await axios.get("https://api.affiliateplus.xyz/api/chatbot", {
          params: {
            message: text,
            botname: "bby",
            ownername: "Asif",
            user: event.senderID
          }
        });

        const nameRes = await api.getUserInfo(event.senderID);
        const senderName = nameRes[event.senderID]?.name || "Babu";
        const replyMsg = `💬 ${senderName}:\n${res.data.message}`;
        await api.sendMessage(replyMsg, event.threadID);

        // Auto image reply if text includes keyword
        if (text.includes("kiss") || text.includes("love") || text.includes("miss")) {
          const imgUrl = "https://i.imgur.com/L0vCwNt.jpg"; // Cute image
          const imgPath = path.join(__dirname, `bby_${event.senderID}.jpg`);
          const imgRes = await axios.get(imgUrl, { responseType: "arraybuffer" });
          fs.writeFileSync(imgPath, Buffer.from(imgRes.data, "binary"));
          await api.sendMessage({ attachment: fs.createReadStream(imgPath) }, event.threadID);
          fs.unlinkSync(imgPath);
        }
        return;
      }

      // preTeach fallback
      const matched = preTeach.find(item => text.includes(item.q));
      if (matched) {
        const reply = matched.a[Math.floor(Math.random() * matched.a.length)];
        return api.sendMessage(reply, event.threadID);
      }

    } catch (err) {
      return api.sendMessage("❌ Bby error: " + err.message, event.threadID);
    }
  }
};
