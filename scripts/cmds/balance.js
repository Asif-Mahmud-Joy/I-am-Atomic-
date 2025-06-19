// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const DESIGN = {
  HEADER: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗦𝗬𝗦𝗧𝗘𝗠 👑",
  FOOTER: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
  EMOJI: {
    SUCCESS: "✅",
    ERROR: "❌",
    WARNING: "⚠️",
    INFO: "📜",
    BALANCE: "💰",
    TRANSFER: "📤",
    REQUEST: "📥",
    ADMIN: "👑",
    HELP: "📘",
    PROCESSING: "⏳",
    COIN: "🪙"
  },
  COLORS: {
    SUCCESS: "#00FF00",
    ERROR: "#FF0000",
    WARNING: "#FFFF00",
    INFO: "#00BFFF",
    PURPLE: "#800080"
  }
};

const ADMIN_IDS = ["61571630409265"]; // Replace with actual admin IDs
const NOTIFY_THREADS = ["9191391594224159", "7272501799469344"]; // Replace with notify thread IDs

const formatMessage = (content, type = "info") => {
  return `┏━━━━━━━━━━━━━━━━━━┓
┃  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ${DESIGN.HEADER}  ${DESIGN.EMOJI[type.toUpperCase()] || DESIGN.EMOJI.INFO} ┃
┗━━━━━━━━━━━━━━━━━━┛
${content}
${DESIGN.SEPARATOR}
${DESIGN.FOOTER}`;
};

// Simulate typing effect
const simulateTyping = async (api, threadID, duration = 1500) => {
  api.sendTypingIndicator(threadID);
  await new Promise(resolve => setTimeout(resolve, duration));
};

// Format money with royal units
const formatMoney = (amount) => {
  const units = ["", "K", "M", "B", "T", "Qa", "Qi", "Sx", "Sp", "Oc", "No", "Dc"];
  let unitIndex = 0;
  
  while (amount >= 1000 && unitIndex < units.length - 1) {
    amount /= 1000;
    unitIndex++;
  }
  
  return `${amount.toFixed(2)}${units[unitIndex]} ${DESIGN.EMOJI.COIN}`;
};
// ====================================================================================== //

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money", "coins"],
    version: "3.0",
    author: "Mr.Smokey & Asif Mahmud | Enhanced by Royal AI",
    countDown: 5,
    role: 0,
    shortDescription: "Royal currency management system",
    longDescription: "Manage royal currency with balance checks, transfers, requests, and admin controls",
    category: "economy",
    guide: {
      en: `
        ┏━━━━━━━━━━━━━━━━━━┓
        ┃  👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗚𝗨𝗜𝗗𝗘 👑 ┃
        ┗━━━━━━━━━━━━━━━━━━┛
        
        {pn} - Show your royal balance
        {pn} @user - Show another user's balance
        {pn} transfer @user <amount> - Send royal coins
        {pn} request <amount> - Request royal coins from admins
        {pn} add @user <amount> - Admin: Add royal coins
        {pn} remove @user <amount> - Admin: Remove royal coins
        {pn} help - Show royal guide
        
        ▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
        ✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:
        !balance
        !balance @Asif
        !balance transfer @Asif 500
        !balance request 1000
        !balance add @Asif 2000
      `
    }
  },

  langs: {
    en: {
      yourBalance: "👑 𝗬𝗢𝗨𝗥 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗟𝗔𝗡𝗖𝗘:\n💰 %1",
      userBalance: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗢𝗙 %1:\n💰 %2",
      invalidRecipient: "⚠️ Invalid royal recipient! Tag user or provide UID",
      invalidAmount: "⚠️ Invalid royal amount! Must be a positive number",
      notEnoughMoney: "❌ Insufficient royal funds!",
      transferSuccess: "📤 𝗥𝗢𝗬𝗔𝗟 𝗧𝗥𝗔𝗡𝗦𝗙𝗘𝗥 𝗦𝗨𝗖𝗖𝗘𝗦𝗦!\nSent %1 to %2",
      requestSuccess: "📥 𝗥𝗢𝗬𝗔𝗟 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗦𝗘𝗡𝗧!\nRequested %1 from royal admins",
      adminAddSuccess: "👑 𝗥𝗢𝗬𝗔𝗟 𝗖𝗢𝗜𝗡𝗦 𝗔𝗗𝗗𝗘𝗗!\nAdded %1 to %2's balance",
      adminRemoveSuccess: "👑 𝗥𝗢𝗬𝗔𝗟 𝗖𝗢𝗜𝗡𝗦 𝗥𝗘𝗠𝗢𝗩𝗘𝗗!\nRemoved %1 from %2's balance",
      noPermission: "⛔ Royal command restricted to admins only!",
      userNotFound: "⚠️ Royal user not found in the kingdom!",
      helpMessage: "👑 𝗥𝗢𝗬𝗔𝗟 𝗕𝗔𝗟𝗔𝗡𝗖𝗘 𝗚𝗨𝗜𝗗𝗘:\n\n" + 
        "• {pn} - Show your royal balance\n" +
        "• {pn} @user - Show another user's balance\n" +
        "• {pn} transfer @user <amount> - Send royal coins\n" +
        "• {pn} request <amount> - Request royal coins\n" +
        "• {pn} add @user <amount> - Admin: Add coins\n" +
        "• {pn} remove @user <amount> - Admin: Remove coins",
      invalidCommand: "⚠️ Invalid royal command! Use '!balance help' for guidance",
      requestNotification: "👑 𝗥𝗢𝗬𝗔𝗟 𝗥𝗘𝗤𝗨𝗘𝗦𝗧 𝗡𝗢𝗧𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡\n\nUser: %1\nUID: %2\nAmount: %3"
    }
  },

  onStart: async function ({ message, usersData, event, args, api, getLang, prefix }) {
    const threadID = event.threadID;
    const senderID = event.senderID;
    
    await simulateTyping(api, threadID);
    
    const sendRoyalResponse = async (content, type = "info") => {
      await simulateTyping(api, threadID);
      message.reply(formatMessage(content, type));
    };

    // Get target UID from mentions, reply, or argument
    const getTargetUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
      if (!isNaN(args[1])) return args[1];
      return null;
    };

    // Validate amount
    const isValidAmount = (val) => !isNaN(val) && Number(val) > 0;

    // Get amount from arguments
    const getAmount = () => {
      const amountArg = args.find(arg => !isNaN(arg) && Number(arg) > 0);
      return amountArg ? Number(amountArg) : null;
    };

    // Handle balance check
    const handleBalanceCheck = async (uid, isSender = false) => {
      const userData = await usersData.get(uid);
      if (!userData) return sendRoyalResponse(getLang("userNotFound"), "error");
      
      const name = userData.name || "Royal User";
      const balance = formatMoney(userData.money || 0);
      
      return sendRoyalResponse(
        isSender 
          ? getLang("yourBalance", balance)
          : getLang("userBalance", name, balance),
        "info"
      );
    };

    // Handle money transfer
    const handleTransfer = async () => {
      const targetUID = getTargetUID();
      const amount = getAmount();
      
      if (!targetUID || targetUID === senderID) {
        return sendRoyalResponse(getLang("invalidRecipient"), "error");
      }
      
      if (!amount || !isValidAmount(amount)) {
        return sendRoyalResponse(getLang("invalidAmount"), "error");
      }

      const [senderData, targetData] = await Promise.all([
        usersData.get(senderID),
        usersData.get(targetUID)
      ]);
      
      if (!senderData || !targetData) {
        return sendRoyalResponse(getLang("userNotFound"), "error");
      }
      
      if (senderData.money < amount) {
        return sendRoyalResponse(getLang("notEnoughMoney"), "error");
      }

      await Promise.all([
        usersData.set(senderID, { money: senderData.money - amount }),
        usersData.set(targetUID, { money: (targetData.money || 0) + amount })
      ]);
      
      const targetName = targetData.name || "Royal User";
      return sendRoyalResponse(
        getLang("transferSuccess", formatMoney(amount), targetName),
        "success"
      );
    };

    // Handle money request
    const handleRequest = async () => {
      const amount = getAmount();
      
      if (!amount || !isValidAmount(amount)) {
        return sendRoyalResponse(getLang("invalidAmount"), "error");
      }

      const senderData = await usersData.get(senderID);
      const senderName = senderData?.name || "Royal User";
      
      const notification = formatMessage(
        getLang("requestNotification", senderName, senderID, formatMoney(amount)),
        "warning"
      );

      // Notify admins and threads
      const notifyTargets = [...ADMIN_IDS, ...NOTIFY_THREADS];
      for (const id of notifyTargets) {
        api.sendMessage(notification, id);
      }

      return sendRoyalResponse(
        getLang("requestSuccess", formatMoney(amount)),
        "success"
      );
    };

    // Handle admin actions
    const handleAdminAction = async (action) => {
      if (!ADMIN_IDS.includes(senderID)) {
        return sendRoyalResponse(getLang("noPermission"), "error");
      }
      
      const targetUID = getTargetUID();
      const amount = getAmount();
      
      if (!targetUID || !amount || !isValidAmount(amount)) {
        return sendRoyalResponse(getLang("invalidRecipient") + " " + getLang("invalidAmount"), "error");
      }

      const userData = await usersData.get(targetUID);
      if (!userData) {
        return sendRoyalResponse(getLang("userNotFound"), "error");
      }
      
      const currentBalance = userData.money || 0;
      const userName = userData.name || "Royal User";
      let newBalance = currentBalance;
      
      if (action === "add") {
        newBalance = currentBalance + amount;
      } else if (action === "remove") {
        if (currentBalance < amount) {
          return sendRoyalResponse(getLang("notEnoughMoney"), "error");
        }
        newBalance = currentBalance - amount;
      }
      
      await usersData.set(targetUID, { money: newBalance });
      
      return sendRoyalResponse(
        action === "add"
          ? getLang("adminAddSuccess", formatMoney(amount), userName)
          : getLang("adminRemoveSuccess", formatMoney(amount), userName),
        "success"
      );
    };

    // Handle help command
    const handleHelp = () => {
      return sendRoyalResponse(
        getLang("helpMessage").replace(/\{pn\}/g, prefix + "balance"),
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
        return sendRoyalResponse(getLang("invalidCommand"), "error");
    }
  }
};
