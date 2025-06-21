const moment = require('moment-timezone');
const { config } = global.GoatBot;

// ============================== ☣ 𝐀𝐓𝐎𝐌𝐈𝐂⚛ DESIGN SYSTEM ============================== //
const ATOMIC = {
  HEADER: "☣ 𝐀𝐓𝐎𝐌𝐈𝐂 𝗪𝗘𝗔𝗟𝗧𝗛 𝗦𝗬𝗦𝗧𝗘𝗠 ⚛",
  FOOTER: "⚡ 𝗔𝗦𝗜𝗙 𝗠𝗔𝗛𝗠𝗨𝗗 𝗧𝗘𝗖𝗛 💥",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    BALANCE: "💎",
    TRANSFER: "🔁",
    REQUEST: "📥",
    ADMIN: "👑",
    HELP: "📘",
    PROCESSING: "⚡",
    COIN: "🪙",
    BANK: "🏦",
    SECURITY: "🔒",
    ATOM: "⚛️",
    CREDIT: "💳",
    DEBIT: "📉",
    LOCK: "🔐"
  },
  COLORS: {
    SUCCESS: "#00FF7F",
    ERROR: "#FF4500",
    WARNING: "#FFD700",
    INFO: "#1E90FF",
    PURPLE: "#9370DB"
  }
};

const ADMIN_IDS = ["100049220893428", "61571630409265"];
const NOTIFY_THREADS = ["9191391594224159", "7272501799469344"];

const formatAtomicMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
┃  ${ATOMIC.EMOJI.ATOM} ${ATOMIC.HEADER} ${ATOMIC.EMOJI.ATOM} ┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

${ATOMIC.EMOJI[type.toUpperCase()]} ${content}

${ATOMIC.SEPARATOR}
${ATOMIC.FOOTER}`;
};

// Simulate typing effect with random durations
const simulateTyping = async (api, threadID, min = 800, max = 1500) => {
  api.sendTypingIndicator(threadID);
  const duration = Math.floor(Math.random() * (max - min + 1)) + min;
  await new Promise(resolve => setTimeout(resolve, duration));
};

// Format money with atomic units
const formatAtomicMoney = (amount) => {
  const units = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  let unitIndex = 0;
  let value = Number(amount);
  
  while (value >= 1000 && unitIndex < units.length - 1) {
    value /= 1000;
    unitIndex++;
  }
  
  return `${value.toFixed(2)}${units[unitIndex]} ${ATOMIC.EMOJI.COIN}`;
};

// Create atomic progress visualization
const atomicProgressBar = (percentage) => {
  const filled = Math.floor(percentage / 5);
  return `[${'█'.repeat(filled)}${'░'.repeat(20 - filled)}] ${percentage}%`;
};

// Generate atomic transaction ID
const generateAtomicID = () => {
  return `ATOM-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}-${Date.now().toString().slice(-6)}`;
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "atomicwealth",
    aliases: ["abal", "atommoney", "atomcoins", "awealth"],
    version: "6.0",
    author: "Asif Mahmud | Atomic Systems",
    countDown: 3,
    role: 0,
    shortDescription: "Atomic wealth management system",
    longDescription: "Manage atomic currency with quantum-level security and precision",
    category: "economy",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓
        ┃  ${ATOMIC.EMOJI.ATOM} 𝗔𝗧𝗢𝗠𝗜𝗖 𝗪𝗘𝗔𝗟𝗧𝗛 𝗚𝗨𝗜𝗗𝗘 ${ATOMIC.EMOJI.ATOM} ┃
        ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛

        ${ATOMIC.EMOJI.BALANCE} {pn} - View your atomic balance
        ${ATOMIC.EMOJI.BALANCE} @user - View another user's balance
        ${ATOMIC.EMOJI.TRANSFER} {pn} transfer @user <amount> - Transfer atomic coins
        ${ATOMIC.EMOJI.REQUEST} {pn} request <amount> - Request coins from admins
        ${ATOMIC.EMOJI.ADMIN} {pn} add @user <amount> - Admin: Add coins
        ${ATOMIC.EMOJI.ADMIN} {pn} remove @user <amount> - Admin: Remove coins
        ${ATOMIC.EMOJI.HELP} {pn} help - Show this guide

        ${ATOMIC.EMOJI.INFO} Examples:
          ${ATOMIC.EMOJI.ATOM} !atomicwealth
          ${ATOMIC.EMOJI.ATOM} !atomicwealth @Asif
          ${ATOMIC.EMOJI.ATOM} !atomicwealth transfer @Asif 500
          ${ATOMIC.EMOJI.ATOM} !atomicwealth request 1000
          ${ATOMIC.EMOJI.ATOM} !atomicwealth add @Asif 2000

        ${ATOMIC.SEPARATOR}
        ${ATOMIC.FOOTER}`
    }
  },

  langs: {
    en: {
      yourBalance: "⚛️ 𝗬𝗢𝗨𝗥 𝗔𝗧𝗢𝗠𝗜𝗖 𝗪𝗘𝗔𝗟𝗧𝗛\n${ATOMIC.EMOJI.BANK} 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %1\n🔐 𝗔𝗰𝗰𝗼𝘂𝗻𝘁 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆: 𝗟𝗲𝘃𝗲𝗹 𝟱 𝗤𝘂𝗮𝗻𝘁𝘂𝗺 𝗘𝗻𝗰𝗿𝘆𝗽𝘁𝗶𝗼𝗻",
      userBalance: "⚛️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗪𝗘𝗔𝗟𝗧𝗛 𝗢𝗙 %1\n${ATOMIC.EMOJI.BANK} 𝗕𝗮𝗹𝗮𝗻𝗰𝗲: %2",
      invalidRecipient: "⚠️ Invalid recipient! Tag user or provide UID",
      invalidAmount: "⚠️ Amount must be a positive atomic number!",
      notEnoughMoney: "❌ Insufficient atomic funds!",
      transferSuccess: "🔁 𝗔𝗧𝗢𝗠𝗜𝗖 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\nSent %1 to %2\n${ATOMIC.EMOJI.LOCK} Transaction ID: %3",
      requestSuccess: "📥 𝗔𝗧𝗢𝗠𝗜𝗖 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗦𝗘𝗡𝗧!\nRequested %1 from atomic admins",
      adminAddSuccess: "👑 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗢𝗜𝗡𝗦 𝗔𝗗𝗗𝗘𝗗!\nAdded %1 to %2's balance\n${ATOMIC.EMOJI.CREDIT} Transaction ID: %3",
      adminRemoveSuccess: "👑 𝗔𝗧𝗢𝗠𝗜𝗖 𝗖𝗢𝗜𝗡𝗦 𝗥𝗘𝗠𝗢𝗩𝗘𝗗!\nRemoved %1 from %2's balance\n${ATOMIC.EMOJI.DEBIT} Transaction ID: %3",
      noPermission: "⛔ Atomic command requires quantum clearance!",
      userNotFound: "⚠️ User not found in atomic database!",
      helpMessage: "☣️ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗪𝗘𝗔𝗟𝗧𝗛 𝗖𝗢𝗠𝗠𝗔𝗡𝗗𝗦:\n\n" + 
        `${ATOMIC.EMOJI.BALANCE} View atomic balance\n` +
        `${ATOMIC.EMOJI.TRANSFER} Transfer atomic coins\n` +
        `${ATOMIC.EMOJI.REQUEST} Request coins from admins\n` +
        `${ATOMIC.EMOJI.ADMIN} Admin: Manage atomic wealth`,
      invalidCommand: "⚠️ Invalid atomic command! Use '!atomicwealth help'",
      requestNotification: "⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡\n\n👤 User: %1\n🆔 UID: %2\n💰 Amount: %3\n⏱️ Time: %4",
      transferSelf: "❌ Quantum entanglement prevents self-transfers!",
      securityCheck: "🔒 Initiating quantum security protocol...",
      processing: "⚙️ Processing atomic transaction...",
      transactionProgress: "⏳ Transaction progress: %1"
    }
  },

  onStart: async function ({ message, usersData, event, args, api, getLang, prefix }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    
    // Initial security animation
    await simulateTyping(api, threadID);
    await message.reply(
      formatAtomicMessage(getLang("securityCheck"), "info")
    );
    await simulateTyping(api, threadID, 1000, 1500);
    
    const sendAtomicResponse = async (content, type = "info") => {
      await simulateTyping(api, threadID);
      return message.reply(formatAtomicMessage(content, type));
    };

    // Get target UID from mentions, reply, or argument
    const getTargetUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      const mentions = Object.keys(event.mentions);
      if (mentions.length > 0) return mentions[0];
      if (args[1] && !isNaN(args[1])) return args[1];
      return null;
    };

    // Validate amount
    const isValidAmount = (val) => !isNaN(val) && Number(val) > 0;

    // Get amount from arguments
    const getAmount = () => {
      const amountArg = args.find(arg => isValidAmount(arg));
      return amountArg ? Number(amountArg) : null;
    };

    // Handle balance check
    const handleBalanceCheck = async (uid, isSender = false) => {
      const userData = await usersData.get(uid);
      if (!userData) return sendAtomicResponse(getLang("userNotFound"), "error");
      
      const name = userData.name || "Atomic User";
      const balance = formatAtomicMoney(userData.money || 0);
      
      return sendAtomicResponse(
        isSender 
          ? getLang("yourBalance", balance)
          : getLang("userBalance", name, balance),
        "info"
      );
    };

    // Handle money transfer
    const handleTransfer = async () => {
      // Show processing animation
      await message.reply(
        formatAtomicMessage(getLang("processing"), "processing")
      );
      await simulateTyping(api, threadID, 800, 1200);
      
      // Show progress animation
      await message.reply(
        formatAtomicMessage(getLang("transactionProgress", atomicProgressBar(30)), "processing")
      );
      await simulateTyping(api, threadID, 800, 1200);
      
      const targetUID = getTargetUID();
      const amount = getAmount();
      
      if (!targetUID) {
        return sendAtomicResponse(getLang("invalidRecipient"), "error");
      }
      if (targetUID === senderID) {
        return sendAtomicResponse(getLang("transferSelf"), "error");
      }
      if (!amount || !isValidAmount(amount)) {
        return sendAtomicResponse(getLang("invalidAmount"), "error");
      }

      const [senderData, targetData] = await Promise.all([
        usersData.get(senderID),
        usersData.get(targetUID)
      ]);
      
      if (!senderData || !targetData) {
        return sendAtomicResponse(getLang("userNotFound"), "error");
      }
      
      if (senderData.money < amount) {
        return sendAtomicResponse(getLang("notEnoughMoney"), "error");
      }

      // Update progress
      await message.reply(
        formatAtomicMessage(getLang("transactionProgress", atomicProgressBar(70)), "processing")
      );
      await simulateTyping(api, threadID, 800, 1200);
      
      await Promise.all([
        usersData.set(senderID, { money: senderData.money - amount }),
        usersData.set(targetUID, { money: (targetData.money || 0) + amount })
      ]);
      
      const targetName = targetData.name || "Atomic User";
      const transactionID = generateAtomicID();
      
      return sendAtomicResponse(
        getLang("transferSuccess", formatAtomicMoney(amount), targetName, transactionID),
        "success"
      );
    };

    // Handle money request
    const handleRequest = async () => {
      const amount = getAmount();
      
      if (!amount || !isValidAmount(amount)) {
        return sendAtomicResponse(getLang("invalidAmount"), "error");
      }

      const senderData = await usersData.get(senderID);
      const senderName = senderData?.name || "Atomic User";
      const timestamp = moment().tz('Asia/Dhaka').format('YYYY-MM-DD HH:mm:ss');
      
      const notification = formatAtomicMessage(
        getLang("requestNotification", senderName, senderID, formatAtomicMoney(amount), timestamp),
        "warning"
      );

      // Notify admins and threads
      const notifyTargets = [...ADMIN_IDS, ...NOTIFY_THREADS];
      for (const id of notifyTargets) {
        api.sendMessage(notification, id);
      }

      return sendAtomicResponse(
        getLang("requestSuccess", formatAtomicMoney(amount)),
        "success"
      );
    };

    // Handle admin actions
    const handleAdminAction = async (action) => {
      if (!ADMIN_IDS.includes(senderID)) {
        return sendAtomicResponse(getLang("noPermission"), "error");
      }
      
      const targetUID = getTargetUID();
      const amount = getAmount();
      
      if (!targetUID || !amount || !isValidAmount(amount)) {
        return sendAtomicResponse(getLang("invalidRecipient") + " " + getLang("invalidAmount"), "error");
      }

      const userData = await usersData.get(targetUID);
      if (!userData) {
        return sendAtomicResponse(getLang("userNotFound"), "error");
      }
      
      const currentBalance = userData.money || 0;
      const userName = userData.name || "Atomic User";
      let newBalance = currentBalance;
      
      if (action === "add") {
        newBalance = currentBalance + amount;
      } else if (action === "remove") {
        if (currentBalance < amount) {
          return sendAtomicResponse(getLang("notEnoughMoney"), "error");
        }
        newBalance = currentBalance - amount;
      }
      
      await usersData.set(targetUID, { money: newBalance });
      
      const transactionID = generateAtomicID();
      
      return sendAtomicResponse(
        action === "add"
          ? getLang("adminAddSuccess", formatAtomicMoney(amount), userName, transactionID)
          : getLang("adminRemoveSuccess", formatAtomicMoney(amount), userName, transactionID),
        "success"
      );
    };

    // Handle help command
    const handleHelp = () => {
      return sendAtomicResponse(
        getLang("helpMessage"),
        "info"
      );
    };

    // Command routing
    const command = args[0]?.toLowerCase();
    switch (command) {
      case undefined:
      case "bal":
      case "money":
        return handleBalanceCheck(senderID, true);
        
      case "transfer":
        return handleTransfer();
        
      case "request":
        return handleRequest();
        
      case "add":
        return handleAdminAction("add");
        
      case "remove":
      case "delete":
        return handleAdminAction("remove");
        
      case "help":
        return handleHelp();
        
      default:
        if (getTargetUID()) {
          return handleBalanceCheck(getTargetUID());
        }
        return sendAtomicResponse(getLang("invalidCommand"), "error");
    }
  }
};
