const axios = require('axios');

module.exports = {
  config: {
    name: "besh24",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    version: "3.2",
    cooldowns: 0,
    role: 0,
    shortDescription: {
      en: "Talk with besh",
      bn: "Besh er shathe kotha bolo"
    },
    longDescription: {
      en: "Chat with your gossip-loving bestie Besh!",
      bn: "Tomar gossip friend Besh er shathe moja moja kotha bolo!"
    },
    category: "ai",
    guide: {
      en: "{p}besh <your text>",
      bn: "{p}besh <tomar text>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const input = args.join(" ");

    if (!input || input.length < 2) {
      const responses = [
        "Uy bes, keno abar miss korcho amake? 😏",
        "Ami ekhanei asi bes, tomar jonno 😌",
        "Kemon aso bes? 😊",
        "Kono gossip ase naki bes? Bolo bolo! 😆",
        "Bes, cholo chaa khete khete chismis kori 😜"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      return api.sendMessage(randomResponse, event.threadID, event.messageID);
    }

    try {
      const apiUrl = `https://aemt.me/besh?q=${encodeURIComponent(input)}`;
      const response = await axios.get(apiUrl);

      if (response.data && response.data.message) {
        api.sendMessage(response.data.message, event.threadID, event.messageID);
      } else {
        api.sendMessage("❌ Besh akhon kichu bolte parchhe na. Ektu pore try koro!\n\n🔄 Besh confused mone hochhe. Pore abar dekha kor!", event.threadID, event.messageID);
      }
    } catch (err) {
      console.error("Besh API error:", err.message);
      api.sendMessage("❌ Error hoise Besh er response pawar somoy.\n\n🚫 Network ba API problem hoite pare. Ektu por abar try koro!", event.threadID, event.messageID);
    }
  }
};
