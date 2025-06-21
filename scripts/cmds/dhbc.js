const axios = require("axios");
const { getStreamFromURL } = global.utils;
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "dhbc",
    aliases: ["catchword", "wordhunt"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Atomic Word Hunt Game",
    longDescription: "Play the Catch the Word game with atomic design elements and rewards",
    category: "⚡ Atomic",
    guide: {
      en: "{pn}"
    },
    envConfig: {
      reward: 1000
    }
  },

  langs: {
    en: {
      gameTitle: "⚡ ATOMIC WORD HUNT ⚡",
      instructions: "🔤 Guess the hidden word from the images",
      maskedWord: "Hidden Word: %1",
      hint: "🎵 Hint: This is a song by %1",
      notPlayer: "⚠️ Only the original player can answer!",
      correct: "🎉 CORRECT! The word was '%1'\n💰 You earned %2$",
      wrong: "❌ WRONG! Try again",
      streakBonus: "🔥 Streak Bonus: +%1% reward!",
      timeUp: "⏰ TIME'S UP! The word was '%1'",
      giveUp: "🏳️ You gave up! The word was '%1'"
    }
  },

  onStart: async function ({ message, event, commandName, getLang, usersData }) {
    try {
      // Get player's current streak
      const userData = await usersData.get(event.senderID);
      const streak = userData.data.dhbcStreak || 0;
      const streakBonus = Math.min(streak * 0.1, 0.5); // Max 50% bonus
      
      // Fetch game data
      const res = await axios.get("https://api.jastin.xyz/game/dhbc");
      const { wordcomplete, singer, image1, image2 } = res.data.result;

      // Create masked word with atomic design
      const maskedWord = wordcomplete
        .split('')
        .map(char => char.match(/[a-z0-9]/i) ? '█' : char)
        .join(' ');

      // Generate game card
      const cardBuffer = await this.generateGameCard({
        word: maskedWord,
        singer,
        streak,
        image1,
        image2
      });

      // Prepare game message
      let msg = `✨ ${getLang("gameTitle")} ✨\n`;
      msg += `🔹 ${getLang("instructions")}\n\n`;
      msg += getLang("maskedWord", maskedWord) + "\n";
      if (singer) msg += getLang("hint", singer) + "\n\n";
      msg += `💎 Streak: ${streak} consecutive wins\n`;
      if (streak > 0) msg += getLang("streakBonus", Math.floor(streakBonus * 100)) + "\n";
      msg += `⏱️ You have 60 seconds to answer!`;

      // Send game with timer
      message.reply({
        body: msg,
        attachment: cardBuffer
      }, (err, info) => {
        if (err) return;
        
        // Set game state
        global.GoatBot.onReply.set(info.messageID, {
          commandName,
          messageID: info.messageID,
          author: event.senderID,
          wordcomplete,
          startTime: Date.now(),
          timer: setTimeout(() => {
            this.endGame(message, info.messageID, wordcomplete, false, getLang);
          }, 60000) // 60 seconds
        });
      });
    } catch (err) {
      console.error("Atomic Word Hunt Error:", err);
      return message.reply("❌ Quantum connection failed. Try again later!");
    }
  },

  onReply: async ({ message, Reply, event, getLang, usersData, envCommands, commandName }) => {
    const { author, wordcomplete, messageID, timer } = Reply;

    // Clear timer when answer is received
    clearTimeout(timer);

    if (event.senderID !== author) {
      return message.reply(getLang("notPlayer"));
    }

    if (this.formatText(event.body) === this.formatText(wordcomplete)) {
      // Correct answer
      const userData = await usersData.get(event.senderID);
      const currentStreak = (userData.data.dhbcStreak || 0) + 1;
      const streakBonus = Math.min(currentStreak * 0.1, 0.5); // Max 50% bonus
      const reward = Math.floor(envCommands[commandName].reward * (1 + streakBonus));
      
      // Update user data
      await usersData.set(event.senderID, {
        money: userData.money + reward,
        data: {
          ...userData.data,
          dhbcStreak: currentStreak
        }
      });

      // Send success card
      const successCard = await this.generateSuccessCard(wordcomplete, reward, currentStreak);
      message.reply({
        body: getLang("correct", wordcomplete, reward),
        attachment: successCard
      });
    } else {
      // Wrong answer
      const userData = await usersData.get(event.senderID);
      await usersData.set(event.senderID, {
        data: {
          ...userData.data,
          dhbcStreak: 0 // Reset streak
        }
      });
      
      message.reply(getLang("wrong"));
    }

    // Clean up
    global.GoatBot.onReply.delete(messageID);
  },

  endGame: async function (message, messageID, wordcomplete, isGiveUp, getLang) {
    const gameState = global.GoatBot.onReply.get(messageID);
    if (!gameState) return;
    
    // Clear game state
    global.GoatBot.onReply.delete(messageID);
    
    // Reset streak for player
    const userData = await usersData.get(gameState.author);
    await usersData.set(gameState.author, {
      data: {
        ...userData.data,
        dhbcStreak: 0
      }
    });

    // Send game over message
    const cardBuffer = await this.generateGameOverCard(wordcomplete);
    message.reply({
      body: isGiveUp ? getLang("giveUp", wordcomplete) : getLang("timeUp", wordcomplete),
      attachment: cardBuffer
    });
  },

  formatText: function (text) {
    return text
      .normalize("NFD")
      .toLowerCase()
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, m => (m === "đ" ? "d" : "D"))
      .replace(/[^a-z0-9]/g, '')
      .trim();
  },

  generateGameCard: async function (data) {
    const { word, singer, streak, image1, image2 } = data;
    const canvas = createCanvas(800, 500);
    const ctx = canvas.getContext('2d');
    
    // Atomic background
    const gradient = ctx.createLinearGradient(0, 0, 800, 500);
    gradient.addColorStop(0, '#5E35B1'); // Deep Purple
    gradient.addColorStop(1, '#00BCD4'); // Cyan
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 500);
    
    // Atomic particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 20 + 5;
      const x = Math.random() * 800;
      const y = Math.random() * 500;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Title
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ATOMIC WORD HUNT ⚡', 400, 40);
    
    // Images
    const img1 = await loadImage(await getStreamFromURL(image1));
    const img2 = await loadImage(await getStreamFromURL(image2));
    
    ctx.drawImage(img1, 100, 60, 300, 300);
    ctx.drawImage(img2, 400, 60, 300, 300);
    
    // Word display
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(word, 400, 400);
    
    // Streak info
    ctx.font = 'bold 24px "Segoe UI"';
    ctx.fillStyle = '#69F0AE';
    ctx.fillText(`🔥 Streak: ${streak}`, 400, 450);
    
    // Atomic elements
    ctx.font = '40px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('⚛️', 50, 450);
    ctx.fillText('🔍', 750, 450);
    
    return canvas.toBuffer('image/png');
  },

  generateSuccessCard: async function (word, reward, streak) {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Success gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#4CAF50'); // Green
    gradient.addColorStop(1, '#8BC34A'); // Light Green
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
      const size = Math.random() * 15 + 5;
      const x = Math.random() * 600;
      const y = Math.random() * 400;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Title
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('🎉 CORRECT ANSWER!', 300, 50);
    
    // Word revealed
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(word.toUpperCase(), 300, 150);
    
    // Reward info
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(`💰 Reward: ${reward}$`, 300, 230);
    
    // Streak info
    ctx.fillText(`🔥 Streak: ${streak}`, 300, 290);
    
    // Atomic elements
    ctx.font = '40px Arial';
    ctx.fillText('⚡', 100, 350);
    ctx.fillText('💎', 500, 350);
    
    return canvas.toBuffer('image/png');
  },

  generateGameOverCard: async function (word) {
    const canvas = createCanvas(600, 400);
    const ctx = canvas.getContext('2d');
    
    // Game over gradient
    const gradient = ctx.createLinearGradient(0, 0, 600, 400);
    gradient.addColorStop(0, '#F44336'); // Red
    gradient.addColorStop(1, '#FF9800'); // Orange
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 600, 400);
    
    // Particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
    for (let i = 0; i < 30; i++) {
      const size = Math.random() * 15 + 5;
      const x = Math.random() * 600;
      const y = Math.random() * 400;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Title
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('⏰ GAME OVER!', 300, 50);
    
    // Correct word
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.fillText('The word was:', 300, 120);
    
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.fillStyle = '#FFD700';
    ctx.fillText(word.toUpperCase(), 300, 190);
    
    // Streak reset
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('🔥 Streak has been reset', 300, 270);
    
    // Atomic elements
    ctx.font = '40px Arial';
    ctx.fillText('💥', 100, 350);
    ctx.fillText('🔄', 500, 350);
    
    return canvas.toBuffer('image/png');
  }
};
