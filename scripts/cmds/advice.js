const axios = require('axios');

module.exports = {
  config: {
    name: 'advice',
    version: '2.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    countDown: 5,
    role: 0,
    shortDescription: 'Random advice with Bangla translate',
    longDescription: {
      en: 'Get a random advice in English and Bangla.',
    },
    category: 'study',
    guide: {
      en: '{pn}'
    },
  },

  onStart: async function ({ api, event }) {
    try {
      // ✅ New API directly without srod-v2
      const res = await axios.get("https://api.adviceslip.com/advice");
      const advice = res.data.slip.advice;

      // 🔁 Translate to Bangla
      const translated = await translateToBangla(advice);

      const msg = `🌐 English Advice: ${advice}\n🇧🇩 Bangla Advice: ${translated}`;

      return api.sendMessage(msg, event.threadID, event.messageID);
    } catch (error) {
      console.error("❌ Error:", error);
      return api.sendMessage("❌ Advice nite giye somossa hoise. Try again poroborti te.", event.threadID);
    }
  },
};

// 📘 Translation using Google API (free unofficial)
async function translateToBangla(text) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=bn&dt=t&q=${encodeURIComponent(text)}`;
    const res = await axios.get(url);
    return res.data[0].map(t => t[0]).join('');
  } catch (err) {
    console.error("Translation Error:", err);
    return "অনুবাদে সমস্যা হয়েছে।";
  }
}
