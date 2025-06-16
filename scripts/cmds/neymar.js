const axios = require("axios");

module.exports = {
  config: {
    name: "neymar",
    aliases: ["njr"],
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Neymar er pic pathay",
    longDescription: {
      en: "Send a random Neymar picture from a curated list.",
      bn: "Neymar er randomly ekta pic pathano hoy."
    },
    category: "football",
    guide: {
      en: "{pn} - Get random Neymar pic",
      bn: "{pn} - Neymar er pic pawar jonno"
    }
  },

  onStart: async function ({ message }) {
    try {
      const link = [
        "https://i.imgur.com/arWjsNg.jpg",
        "https://i.imgur.com/uJYvMR0.jpg",
        "https://i.imgur.com/A3MktQ4.jpg",
        "https://i.imgur.com/wV8YHHp.jpg",
        "https://i.imgur.com/14sAFjM.jpg",
        "https://i.imgur.com/EeAi2G6.jpg",
        "https://i.imgur.com/fUZbzhJ.jpg",
        "https://i.imgur.com/bUjGSCX.jpg",
        "https://i.imgur.com/4KZvLbO.jpg",
        "https://i.imgur.com/gBEAsYZ.jpg",
        "https://i.imgur.com/baKOat0.jpg",
        "https://i.imgur.com/4Z0ERpD.jpg",
        "https://i.imgur.com/h2ReDUe.jpg",
        "https://i.imgur.com/KQPalvi.jpg",
        "https://i.imgur.com/VRALDic.jpg",
        "https://i.imgur.com/Z3qGkZa.jpg",
        "https://i.imgur.com/etyPi7B.jpg",
        "https://i.imgur.com/tMxLEwl.jpg",
        "https://i.imgur.com/OwEdlZo.jpg",
        "https://i.imgur.com/UHAo39t.jpg",
        "https://i.imgur.com/aV4EVT9.jpg",
        "https://i.imgur.com/zdC8yiG.jpg",
        "https://i.imgur.com/JI7tjsr.jpg",
        "https://i.imgur.com/fFuPCrM.jpg",
        "https://i.imgur.com/XIaAXju.jpg",
        "https://i.imgur.com/yyIJwPH.jpg",
        "https://i.imgur.com/MyGcsJM.jpg",
        "https://i.imgur.com/UXjh4R1.jpg",
        "https://i.imgur.com/QGrvMZL.jpg"
      ];

      const randomImg = link[Math.floor(Math.random() * link.length)];
      const attachment = await global.utils.getStreamFromURL(randomImg);

      return message.reply({
        body: "📸 Neymar Pic Time!\n\n⚽️ 𝐇𝐞𝐫𝐞 𝐂𝐨𝐦𝐞𝐬 𝐌𝐚𝐠𝐢𝐜𝐢𝐚𝐧 🐐",
        attachment
      });
    } catch (err) {
      console.error("[Neymar CMD Error]", err);
      return message.reply("😓 Neymar er pic pathate somossa hocche. Try again porer bar.");
    }
  }
};
