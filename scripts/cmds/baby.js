const axios = require("axios");

const apiURL = "https://api.affiliateplus.xyz/api/chatbot";
const preTeach = [
  { q: "tumi ke", a: ["ami tomar bby 😚", "ami ekta smart bot"] },
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

const imageTriggers = {
  kiss: "https://i.imgur.com/vQ7oK5F.gif",
  love: "https://i.imgur.com/WQ7Zkq2.gif",
  miss: "https://i.imgur.com/6C9NdD9.gif"
};

module.exports = {
  config: {
    name: "bby",
    version: "2.5",
    author: "Smokey x ChatGPT",
    countDown: 2,
    role: 0,
    shortDescription: {
      en: "Bby chatbot with AI and images"
    },
    longDescription: {
      en: "Flirty, cute chatbot with text + image response support"
    },
    category: "fun",
    guide: {
      en: "Just say something like: bby tumi ki korcho?"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      const text = (event.body || "").toLowerCase();
      const triggerWords = ["bby", "baby", "jan", "babu", "bbe", "bow", "bot"];
      const senderInfo = await api.getUserInfo(event.senderID);
      const senderName = senderInfo[event.senderID]?.name || "Babu";

      // Check for image keyword trigger
      for (let key in imageTriggers) {
        if (text.includes(key)) {
          return api.sendMessage({
            body: `❤️ ${senderName}, ami o toke ${key} 😘`,
            attachment: await global.utils.getStreamFromURL(imageTriggers[key])
          }, event.threadID);
        }
      }

      // Check for keyword prefix
      if (triggerWords.some(word => text.includes(word))) {
        const response = await axios.get(apiURL, {
          params: {
            message: text,
            botname: "Bby",
            ownername: "Asif",
            userid: event.senderID
          }
        });

        if (response.data && response.data.message) {
          return api.sendMessage(`💬 ${senderName}: ${response.data.message}`, event.threadID);
        }
      }

      // fallback preTeach
      const matched = preTeach.find(item => text.includes(item.q));
      if (matched) {
        const reply = matched.a[Math.floor(Math.random() * matched.a.length)];
        return api.sendMessage(`💌 ${senderName}, ${reply}`, event.threadID);
      }

    } catch (err) {
      console.error("Bby Chatbot Error:", err);
      return api.sendMessage("❌ Bby error: " + err.message, event.threadID);
    }
  }
};
