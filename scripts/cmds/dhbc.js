const axios = require("axios");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "dhbc",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    description: {
      en: "Catch the word (duoihinhbatchu) game"
    },
    category: "game",
    guide: {
      en: "{pn}"
    },
    envConfig: {
      reward: 1000
    }
  },

  langs: {
    en: {
      reply: `🧠 Guess the word:\n%1`,
      isSong: "🎵 Hint: This is the name of a song by %1",
      notPlayer: "⚠️ You are not the player of this question!",
      correct: "✅ Correct! You earned %1$ 💸",
      wrong: "❌ Wrong answer, try again!"
    }
  },

  onStart: async function ({ message, event, commandName, getLang }) {
    try {
      const res = await axios.get("https://api.jastin.xyz/game/dhbc");
      const { wordcomplete, singer, image1, image2 } = res.data.result;

      const maskedWord = wordcomplete.replace(/\S/g, "█ ");
      const msg = getLang("reply", maskedWord) + (singer ? `\n\n${getLang("isSong", singer)}` : "");

      message.reply({
        body: msg,
        attachment: [
          await getStreamFromURL(image1),
          await getStreamFromURL(image2)
        ]
      }, (err, info) => {
        if (err) return;
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          wordcomplete
        });
      });
    } catch (err) {
      console.error(err);
      return message.reply("❌ Game start failed. API error or connection issue.");
    }
  },

  onReply: async ({ message, Reply, event, getLang, usersData, envCommands, commandName }) => {
    const { author, wordcomplete, messageID } = Reply;

    if (event.senderID !== author)
      return message.reply(getLang("notPlayer"));

    if (formatText(event.body) === formatText(wordcomplete)) {
      global.GoatBot.onReply.delete(messageID);
      await usersData.addMoney(event.senderID, envCommands[commandName].reward);
      return message.reply(getLang("correct", envCommands[commandName].reward));
    } else {
      return message.reply(getLang("wrong"));
    }
  }
};

function formatText(text) {
  return text
    .normalize("NFD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[đĐ]/g, m => (m === "đ" ? "d" : "D"))
    .trim();
}
