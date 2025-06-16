const axios = require('axios');

module.exports = {
  config: {
    name: "td",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Truth or Dare game",
    longDescription: "Play Truth or Dare game with auto Bangla support.",
    category: "games",
    guide: {
      en: "{pn} truth | dare"
    }
  },

  onStart: async function ({ api, args, message }) {
    const [type] = args;
    if (!type || !['truth', 'dare'].includes(type.toLowerCase())) {
      return message.reply("📌 Use like: /td truth or /td dare");
    }

    const lang = "bn"; // Bangla
    const endpoint = `https://api.truthordarebot.xyz/v1/${type.toLowerCase()}?lang=${lang}`;

    try {
      const res = await axios.get(endpoint);
      const question = res.data.question;

      const prefix = type.toLowerCase() === 'truth' ? '🟢 সত্য প্রশ্ন:' : '🔴 সাহস চ্যালেঞ্জ:';

      return message.reply(`${prefix}\n${question}`);
    } catch (err) {
      console.error(err);
      return message.reply("❌ প্রশ্ন আনতে সমস্যা হয়েছে। একটু পরে চেষ্টা করুন।");
    }
  }
};
