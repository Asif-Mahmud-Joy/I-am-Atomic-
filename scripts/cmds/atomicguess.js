const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

const cacheDir = path.join(__dirname, 'cache');
const STAR_CHARS = ['✦', '✧', '✬', '✭', '✮', '✯', '✰', '⭐', '🌟', '💫', '✨'];
const ATOMIC_SYMBOLS = ['☢️', '⚛️', '🔬', '🧪', '🔭', '☄️', '🌌', '🌠', '🌀'];

module.exports = {
  config: {
    name: "atomicguess",
    aliases: ["animeguess", "starguess"],
    version: "3.0",
    author: "☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐒𝐈𝐅 ⚛️",
    role: 0,
    shortDescription: "⚛️ Atomic Anime Guessing Game",
    longDescription: "🌠 Guess the anime character with stellar rewards",
    category: "game",
    guide: {
      en: "{p}atomicguess"
    }
  },

  onStart: async function ({ event, message, usersData, api }) {
    try {
      // Create starry effect
      const starField = Array(15).fill().map(() => 
        STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)]
      ).join('');

      // Fetch a random anime character
      const response = await axios.get('https://global-prime-mahis-apis.vercel.app');
      const characters = response.data.data;
      const charactersArray = Array.isArray(characters) ? characters : [characters];
      const randomIndex = Math.floor(Math.random() * charactersArray.length);
      const { image, traits, tags, fullName, firstName } = charactersArray[randomIndex];

      // Download character image
      const imagePath = path.join(cacheDir, "character.jpg");
      const imageRes = await axios.get(image, { responseType: 'arraybuffer' });
      await fs.ensureDir(cacheDir);
      await fs.writeFile(imagePath, imageRes.data);
      const imageStream = fs.createReadStream(imagePath);

      // Create flashy game message
      const atomicSymbol = ATOMIC_SYMBOLS[Math.floor(Math.random() * ATOMIC_SYMBOLS.length)];
      const gameMsg = 
        `🌌 ${starField}\n` +
        `⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗔𝗡𝗜𝗠𝗘 𝗖𝗛𝗔𝗟𝗟𝗘𝗡𝗚𝗘 ${atomicSymbol}\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `✨ 𝗧𝗿𝗮𝗶𝘁𝘀: ${traits}\n` +
        `🏷️ 𝗧𝗮𝗴𝘀: ${tags}\n\n` +
        `⏱️ 𝗧𝗶𝗺𝗲 𝗹𝗶𝗺𝗶𝘁: 𝟯𝟬 𝘀𝗲𝗰𝗼𝗻𝗱𝘀\n` +
        `💎 𝗥𝗲𝘄𝗮𝗿𝗱: 𝟭,𝟬𝟬𝟬$\n` +
        `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
        `🌟 𝗚𝘂𝗲𝘀𝘀 𝘁𝗵𝗶𝘀 𝗰𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿!`;

      const sentMsg = await message.reply({ 
        body: gameMsg, 
        attachment: imageStream 
      });

      // Set game state
      global.GoatBot.onReply.set(sentMsg.messageID, {
        commandName: this.config.name,
        messageID: sentMsg.messageID,
        correctAnswer: [fullName, firstName],
        senderID: event.senderID,
        imagePath: imagePath
      });

      // Set timeout with special effect
      setTimeout(async () => {
        if (global.GoatBot.onReply.has(sentMsg.messageID)) {
          const stars = Array(5).fill().map(() => 
            STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)]
          ).join('');
          
          await message.reply(
            `⏰ 𝗧𝗜𝗠𝗘 𝗨𝗣! ${stars}\n` +
            `💥 𝗧𝗵𝗲 𝗮𝗻𝘀𝘄𝗲𝗿 𝘄𝗮𝘀: ${fullName}\n` +
            `🍀 𝗕𝗲𝘁𝘁𝗲𝗿 𝗹𝘂𝗰𝗸 𝗻𝗲𝘅𝘁 𝘁𝗶𝗺𝗲!`
          );
          await api.unsendMessage(sentMsg.messageID);
          fs.unlink(imagePath).catch(console.error);
          global.GoatBot.onReply.delete(sentMsg.messageID);
        }
      }, 30000);

    } catch (err) {
      console.error("Quantum Fluctuation:", err);
      message.reply("⚠️ 𝗤𝘂𝗮𝗻𝘁𝘂𝗺 𝗳𝗹𝘂𝗰𝘁𝘂𝗮𝘁𝗶𝗼𝗻 𝗱𝗲𝘁𝗲𝗰𝘁𝗲𝗱! 𝗣𝗹𝗲𝗮𝘀𝗲 𝘁𝗿𝘆 𝗮𝗴𝗮𝗶𝗻.");
    }
  },

  onReply: async function ({ message, event, Reply, api, usersData }) {
    try {
      if (event.senderID !== Reply.senderID) return;

      const userAnswer = event.body.trim().toLowerCase();
      const correctAnswers = Reply.correctAnswer.map(ans => ans.toLowerCase());
      const stars = Array(7).fill().map(() => 
        STAR_CHARS[Math.floor(Math.random() * STAR_CHARS.length)]
      ).join('');

      if (correctAnswers.includes(userAnswer)) {
        const reward = 1000;
        const current = await usersData.get(event.senderID, "money") || 0;
        const newBalance = current + reward;

        await usersData.set(event.senderID, { money: newBalance });
        
        await message.reply(
          `🎉 ${stars} 𝗖𝗢𝗥𝗥𝗘𝗖𝗧! ${stars}\n\n` +
          `👑 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿: ${Reply.correctAnswer[0]}\n` +
          `💰 𝗥𝗲𝘄𝗮𝗿𝗱: +${reward}$\n` +
          `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
          `💳 𝗪𝗮𝗹𝗹𝗲𝘁 𝗯𝗮𝗹𝗮𝗻𝗰𝗲: ${newBalance}$\n` +
          `▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰\n` +
          `⚡ 𝗖𝗼𝗻𝘁𝗶𝗻𝘂𝗲 𝗽𝗹𝗮𝘆𝗶𝗻𝗴 𝘄𝗶𝘁𝗵 /𝗮𝘁𝗼𝗺𝗶𝗰𝗴𝘂𝗲𝘀𝘀!`
        );
      } else {
        await message.reply(
          `💥 𝗪𝗥𝗢𝗡𝗚! ${stars}\n\n` +
          `💡 𝗧𝗵𝗲 𝗰𝗼𝗿𝗿𝗲𝗰𝘁 𝗮𝗻𝘀𝘄𝗲𝗿 𝘄𝗮𝘀: ${Reply.correctAnswer[0]}\n` +
          `🍀 𝗧𝗿𝘆 𝗮𝗴𝗮𝗶𝗻 𝘄𝗶𝘁𝗵 𝗮 𝗻𝗲𝘄 𝗰𝗵𝗮𝗹𝗹𝗲𝗻𝗴𝗲!`
        );
      }

      // Cleanup
      await api.unsendMessage(Reply.messageID);
      await api.unsendMessage(event.messageID);
      fs.unlink(Reply.imagePath).catch(console.error);
      global.GoatBot.onReply.delete(Reply.messageID);

    } catch (err) {
      console.error("Quantum Decay:", err);
    }
  }
};
