const moment = require("moment-timezone");
const { createCanvas, loadImage } = require('canvas');

module.exports = {
  config: {
    name: "daily",
    aliases: ["reward", "streak"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & Atomic Design",
    countDown: 5,
    role: 0,
    shortDescription: "⚡ Claim daily atomic rewards",
    longDescription: "Collect daily rewards with streak bonuses in an atomic-themed system",
    category: "⚡ Atomic",
    guide: {
      en: "{pn} - Claim daily reward\n{pn} info - View reward schedule"
    },
    envConfig: {
      rewardFirstDay: {
        coin: 100,
        exp: 10
      }
    }
  },

  langs: {
    en: {
      days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      alreadyReceived: "⏳ You've already claimed your atomic reward today!",
      received: "⚡ Atomic Reward Claimed!\n\n" +
                "💎 You received: %1 coins 🪙\n" +
                "✨ Experience: %2 XP ⭐\n" +
                "🔥 Streak Bonus: %3x multiplier\n" +
                "📅 Next reward in: %4",
      streakBonus: "🔥 Consecutive Days: %1 (Bonus: %2x)",
      infoTitle: "⚛️ ATOMIC REWARD SCHEDULE ⚛️",
      infoSubtitle: "Daily rewards with streak bonuses",
      nextClaim: "⏰ Next Claim: %1"
    }
  },

  onStart: async function ({ args, message, event, envCommands, usersData, commandName, getLang }) {
    const reward = envCommands[commandName].rewardFirstDay;
    const userTz = "Asia/Dhaka"; // Default timezone
    const now = moment().tz(userTz);
    const dateTime = now.format("DD/MM/YYYY");
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    
    // Create atomic streak system
    let streak = userData.data.streak || 0;
    const lastClaimDate = userData.data.lastClaimDate;
    const isConsecutive = lastClaimDate === now.clone().subtract(1, 'days').format("DD/MM/YYYY");
    
    // Handle info command
    if (args[0] === "info") {
      return this.showRewardInfo(message, reward, getLang);
    }

    // Check if already claimed
    if (userData.data.lastClaimDate === dateTime) {
      const nextClaimTime = moment().tz(userTz).endOf('day').fromNow();
      return message.reply(`${getLang("alreadyReceived")}\n${getLang("nextClaim", nextClaimTime)}`);
    }

    // Update streak
    if (lastClaimDate && !isConsecutive) {
      streak = 0; // Reset streak if not consecutive
    }
    streak++;
    
    // Calculate rewards with streak bonus
    const currentDay = now.day(); // 0 = Sunday
    const streakBonus = 1 + (streak * 0.1); // 10% bonus per day
    const baseCoin = Math.floor(reward.coin * (1 + 0.2) ** (currentDay === 0 ? 6 : currentDay - 1));
    const baseExp = Math.floor(reward.exp * (1 + 0.2) ** (currentDay === 0 ? 6 : currentDay - 1));
    const finalCoin = Math.floor(baseCoin * streakBonus);
    const finalExp = Math.floor(baseExp * streakBonus);
    
    // Update user data
    await usersData.set(senderID, {
      money: userData.money + finalCoin,
      exp: userData.exp + finalExp,
      data: {
        ...userData.data,
        lastClaimDate: dateTime,
        streak: streak
      }
    });

    // Generate atomic reward card
    const cardBuffer = await this.generateRewardCard({
      coin: finalCoin,
      exp: finalExp,
      streak,
      day: now.format("dddd"),
      username: await global.utils.getUserName(api, senderID)
    });

    // Calculate time until next claim
    const nextClaimTime = now.clone().add(1, 'days').startOf('day').fromNow();

    message.reply({
      body: getLang("received", finalCoin, finalExp, streakBonus.toFixed(1), nextClaimTime),
      attachment: cardBuffer
    });
  },

  showRewardInfo: async function (message, reward, getLang) {
    let infoMsg = `✨ ${getLang("infoTitle")} ✨\n`;
    infoMsg += `🔹 ${getLang("infoSubtitle")}\n\n`;
    
    const days = getLang("days");
    for (let i = 0; i < 7; i++) {
      const dayName = days[i];
      const dayIndex = i === 0 ? 6 : i - 1; // Adjust for Sunday
      const baseCoin = Math.floor(reward.coin * (1 + 0.2) ** dayIndex);
      const baseExp = Math.floor(reward.exp * (1 + 0.2) ** dayIndex);
      
      infoMsg += `📅 ${dayName}:\n`;
      infoMsg += `  🪙 ${baseCoin} coins`;
      infoMsg += `  ⭐ ${baseExp} XP\n`;
      
      // Show streak bonuses
      for (let streak = 1; streak <= 3; streak++) {
        const bonus = 1 + (streak * 0.1);
        infoMsg += `  🔥 ${streak} day streak: ${Math.floor(baseCoin * bonus)} coins\n`;
      }
      infoMsg += "\n";
    }
    
    infoMsg += "\n⚡ Bonus: +10% reward per consecutive day (max 30%)";
    message.reply(infoMsg);
  },

  generateRewardCard: async function (data) {
    const { coin, exp, streak, day, username } = data;
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    
    // Atomic background gradient
    const gradient = ctx.createLinearGradient(0, 0, 800, 400);
    gradient.addColorStop(0, '#6A5ACD'); // SlateBlue
    gradient.addColorStop(1, '#48D1CC'); // MediumTurquoise
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);
    
    // Atomic particles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    for (let i = 0; i < 50; i++) {
      const size = Math.random() * 20 + 5;
      const x = Math.random() * 800;
      const y = Math.random() * 400;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
    }
    
    // Title
    ctx.font = 'bold 48px "Segoe UI"';
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.fillText('⚡ ATOMIC REWARD', 400, 60);
    
    // User info
    ctx.font = '28px "Segoe UI"';
    ctx.fillText(`👤 ${username}`, 400, 110);
    
    // Day of week
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillText(`📅 ${day}`, 400, 160);
    
    // Reward box
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(150, 180, 500, 120);
    
    // Rewards
    ctx.font = 'bold 36px "Segoe UI"';
    ctx.fillStyle = '#FFD700';
    ctx.textAlign = 'left';
    ctx.fillText(`🪙 ${coin} Coins`, 180, 230);
    
    ctx.fillStyle = '#69F0AE';
    ctx.fillText(`⭐ ${exp} XP`, 180, 280);
    
    // Streak info
    ctx.font = 'bold 32px "Segoe UI"';
    ctx.fillStyle = '#FF6B6B';
    ctx.textAlign = 'center';
    ctx.fillText(`🔥 ${streak} Day Streak!`, 400, 340);
    
    // Atomic elements
    ctx.font = '40px Arial';
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('⚛️', 100, 350);
    ctx.fillText('🔬', 700, 350);
    
    return canvas.toBuffer('image/png');
  }
};
