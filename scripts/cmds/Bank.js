const fs = require("fs-extra");
const moment = require("moment-timezone");

// ☣️⚛️ ATOMIC BANKING SYSTEM ⚛️☣️
const config = {
  ADMIN_IDS: ["61571630409265"],
  MAX_BANK_BALANCE: 1e104,
  MAX_LOAN_AMOUNT: 100000000,
  LOAN_DUE_DAYS: 7,
  INTEREST_RATE: 0.001,
  BANK_DATA_PATH: "scripts/cmds/bankData.json",
  DESIGN: {
    HEADER: "☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐁𝐀𝐍𝐊𝐈𝐍𝐆 𝐒𝐘𝐒𝐓𝐄𝐌 ⚛️☣️",
    FOOTER: "✨ 𝐏𝐨𝐰𝐞𝐫𝐞𝐝 𝐛𝐲 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 𝐓𝐞𝐜𝐡 ⚡️",
    SEPARATOR: "▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰",
    EMOJI: {
      SUCCESS: "✅",
      ERROR: "❌",
      WARNING: "⚠️",
      PROCESSING: "⏳",
      MONEY: "💰",
      BANK: "🏦",
      RICH: "👑",
      LOAN: "📝",
      TRANSFER: "🔁"
    }
  }
};

// ▰▰▰▰▰▰▰▰▰▰ PROGRESS BAR ▰▰▰▰▰▰▰▰▰▰
function generateProgressBar(percentage) {
  const blocks = 15;
  const completed = Math.round(blocks * (percentage / 100));
  return `▰`.repeat(completed) + `▱`.repeat(blocks - completed);
}

module.exports = {
  config: {
    name: "bank",
    aliases: ["banking", "atomicbank"],
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐒𝐈𝐆𝐍",
    countDown: 5,
    role: 0,
    shortDescription: "☣️⚛️ Atomic Banking System",
    longDescription: "Advanced banking with Atomic design aesthetics",
    category: "💰 Economy",
    guide: {
      en: "{pn} [command] [amount] [recipientID]\nCommands: deposit, withdraw, balance, interest, transfer, richest, loan, payloan"
    }
  },

  langs: {
    en: {
      invalidCommand: "❌ Invalid command. Available: deposit, withdraw, balance, interest, transfer, richest, loan, payloan",
      invalidAmount: "⚠️ Please enter a valid positive amount",
      invalidRecipient: "❌ Recipient not found in bank system",
      selfTransfer: "❌ Cannot transfer to yourself",
      insufficientFunds: "❌ Insufficient funds in %1",
      maxBalanceReached: "⚠️ %1 balance limit reached ($%2)",
      interestCooldown: "⏳ Interest claim available in %1h %2m",
      noInterestFunds: "⚠️ No funds to earn interest",
      interestEarned: "💰 Earned $%1 interest at %2",
      depositSuccess: "✅ Deposited $%1 at %2",
      withdrawSuccess: "✅ Withdrew $%1 at %2",
      balanceInfo: "💳 Balance at %1: $%2",
      transferSuccess: "🔁 Transferred $%1 to %2 at %3",
      richestList: "👑 Top 10 Richest Users:\n%1",
      noRichestData: "⚠️ No banking data available",
      loanLimit: "⚠️ Max loan amount: $%1",
      loanPending: "⚠️ Unpaid loan: $%1 (Due: %2)",
      loanSuccess: "📝 Loan approved: $%1 (Due: %2)",
      noLoan: "✅ No pending loans",
      payloanSuccess: "✅ Paid $%1 towards loan. Remaining: $%2",
      payloanExcess: "⚠️ Payment exceeds loan balance ($%1)",
      errorOperation: "❌ Error during %1 operation"
    }
  },

  onStart: async function ({ args, message, event, api, usersData, getLang }) {
    const { senderID } = event;
    const time = moment().tz("Asia/Dhaka").format("HH:mm:ss DD/MM/YYYY");
    const dueDate = moment().tz("Asia/Dhaka").add(config.LOAN_DUE_DAYS, "days").format("HH:mm:ss DD/MM/YYYY");

    // Initialize bank data
    let bankData;
    try {
      bankData = fs.existsSync(config.BANK_DATA_PATH) ? 
        await fs.readJson(config.BANK_DATA_PATH) : {};
      
      if (!bankData[senderID]) {
        bankData[senderID] = { 
          bank: 0, 
          lastInterestClaimed: 0, 
          loan: 0, 
          loanDueDate: 0,
          transactions: [] 
        };
      }
    } catch (error) {
      console.error("Bank init error:", error);
      return this.sendAtomicMessage(
        message, 
        `${config.DESIGN.EMOJI.ERROR} ${getLang("errorOperation", "initialization")}`
      );
    }

    // Save bank data helper
    const saveBankData = async () => {
      try {
        await fs.outputJson(config.BANK_DATA_PATH, bankData, { spaces: 2 });
      } catch (error) {
        console.error("Bank save error:", error);
        throw new Error("save");
      }
    };

    // Format currency
    const formatCurrency = (amount) => {
      if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
      if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
      if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
      return `$${amount.toFixed(2)}`;
    };

    try {
      const userMoney = await usersData.get(senderID, "money");
      const command = args[0]?.toLowerCase();
      const amount = parseFloat(args[1]);
      const recipientUID = args[2];

      // Show typing animation
      api.setMessageReaction(config.DESIGN.EMOJI.PROCESSING, event.messageID, () => {}, true);
      await new Promise(resolve => setTimeout(resolve, 1500));

      switch (command) {
        case "deposit":
          if (isNaN(amount) || amount <= 0) {
            return this.sendAtomicMessage(message, getLang("invalidAmount"));
          }
          if (bankData[senderID].bank >= config.MAX_BANK_BALANCE) {
            return this.sendAtomicMessage(
              message, 
              getLang("maxBalanceReached", "Bank", formatCurrency(config.MAX_BANK_BALANCE))
            );
          }
          if (userMoney < amount) {
            return this.sendAtomicMessage(message, getLang("insufficientFunds", "wallet"));
          }
          
          bankData[senderID].bank += amount;
          await usersData.set(senderID, { money: userMoney - amount });
          
          // Record transaction
          bankData[senderID].transactions.push({
            type: "deposit",
            amount: amount,
            time: Date.now()
          });
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.SUCCESS} ${getLang("depositSuccess", formatCurrency(amount), time}`
          );

        case "withdraw":
          if (isNaN(amount) || amount <= 0) {
            return this.sendAtomicMessage(message, getLang("invalidAmount"));
          }
          if (amount > bankData[senderID].bank) {
            return this.sendAtomicMessage(message, getLang("insufficientFunds", "bank"));
          }
          
          bankData[senderID].bank -= amount;
          await usersData.set(senderID, { money: userMoney + amount });
          
          // Record transaction
          bankData[senderID].transactions.push({
            type: "withdraw",
            amount: amount,
            time: Date.now()
          });
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.SUCCESS} ${getLang("withdrawSuccess", formatCurrency(amount), time}`
          );

        case "balance":
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.MONEY} ${getLang("balanceInfo", time, formatCurrency(bankData[senderID].bank))}`
          );

        case "interest":
          const lastClaim = bankData[senderID].lastInterestClaimed || 0;
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastClaim) / 1000;
          
          if (timeDiff < 86400) {
            const remaining = 86400 - timeDiff;
            const hours = Math.floor(remaining / 3600);
            const minutes = Math.floor((remaining % 3600) / 60);
            return this.sendAtomicMessage(
              message, 
              `${config.DESIGN.EMOJI.WARNING} ${getLang("interestCooldown", hours, minutes)}`
            );
          }
          
          if (bankData[senderID].bank <= 0) {
            return this.sendAtomicMessage(message, getLang("noInterestFunds"));
          }
          
          const interest = bankData[senderID].bank * config.INTEREST_RATE;
          bankData[senderID].bank += interest;
          bankData[senderID].lastInterestClaimed = currentTime;
          
          // Record transaction
          bankData[senderID].transactions.push({
            type: "interest",
            amount: interest,
            time: currentTime
          });
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.SUCCESS} ${getLang("interestEarned", formatCurrency(interest), time}`
          );

        case "transfer":
          if (isNaN(amount) || amount <= 0) {
            return this.sendAtomicMessage(message, getLang("invalidAmount"));
          }
          if (!recipientUID || !bankData[recipientUID]) {
            return this.sendAtomicMessage(message, getLang("invalidRecipient"));
          }
          if (recipientUID === senderID) {
            return this.sendAtomicMessage(message, getLang("selfTransfer"));
          }
          if (amount > bankData[senderID].bank) {
            return this.sendAtomicMessage(message, getLang("insufficientFunds", "bank"));
          }
          
          const recipientInfo = await api.getUserInfo(recipientUID);
          const recipientName = recipientInfo[recipientUID]?.name || "Unknown";
          
          bankData[senderID].bank -= amount;
          bankData[recipientUID].bank += amount;
          
          // Record transactions
          bankData[senderID].transactions.push({
            type: "transfer-out",
            amount: amount,
            to: recipientUID,
            time: Date.now()
          });
          
          bankData[recipientUID].transactions.push({
            type: "transfer-in",
            amount: amount,
            from: senderID,
            time: Date.now()
          });
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.TRANSFER} ${getLang("transferSuccess", formatCurrency(amount), recipientName, time}`
          );

        case "richest":
          const topUsers = Object.entries(bankData)
            .filter(([uid, data]) => data.bank > 0 && uid !== "global")
            .sort((a, b) => b[1].bank - a[1].bank)
            .slice(0, 10);
            
          if (topUsers.length === 0) {
            return this.sendAtomicMessage(message, getLang("noRichestData"));
          }
          
          const rankings = await Promise.all(topUsers.map(async ([uid, data], index) => {
            const userInfo = await api.getUserInfo(uid);
            const name = userInfo[uid]?.name || "Unknown";
            return `${index + 1}. ${name} - ${formatCurrency(data.bank)}`;
          }));
          
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.RICH} ${getLang("richestList", rankings.join("\n"))}`
          );

        case "loan":
          if (isNaN(amount) || amount <= 0) {
            return this.sendAtomicMessage(message, getLang("invalidAmount"));
          }
          if (amount > config.MAX_LOAN_AMOUNT) {
            return this.sendAtomicMessage(
              message, 
              getLang("loanLimit", formatCurrency(config.MAX_LOAN_AMOUNT))
            );
          }
          if (bankData[senderID].loan > 0) {
            return this.sendAtomicMessage(
              message, 
              getLang("loanPending", formatCurrency(bankData[senderID].loan), dueDate)
            );
          }
          
          bankData[senderID].loan = amount;
          bankData[senderID].loanDueDate = moment().add(config.LOAN_DUE_DAYS, "days").valueOf();
          bankData[senderID].bank += amount;
          
          // Record transaction
          bankData[senderID].transactions.push({
            type: "loan",
            amount: amount,
            due: bankData[senderID].loanDueDate,
            time: Date.now()
          });
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.LOAN} ${getLang("loanSuccess", formatCurrency(amount), dueDate}`
          );

        case "payloan":
          const loanBalance = bankData[senderID].loan || 0;
          if (loanBalance <= 0) {
            return this.sendAtomicMessage(message, getLang("noLoan"));
          }
          if (isNaN(amount) || amount <= 0) {
            return this.sendAtomicMessage(message, getLang("invalidAmount"));
          }
          if (amount > loanBalance) {
            return this.sendAtomicMessage(
              message, 
              getLang("payloanExcess", formatCurrency(loanBalance))
            );
          }
          if (amount > userMoney) {
            return this.sendAtomicMessage(message, getLang("insufficientFunds", "wallet"));
          }
          
          bankData[senderID].loan -= amount;
          await usersData.set(senderID, { money: userMoney - amount });
          
          // Record transaction
          bankData[senderID].transactions.push({
            type: "loan-payment",
            amount: amount,
            remaining: bankData[senderID].loan,
            time: Date.now()
          });
          
          if (bankData[senderID].loan <= 0) {
            bankData[senderID].loanDueDate = 0;
          }
          
          await saveBankData();
          return this.sendAtomicMessage(
            message, 
            `${config.DESIGN.EMOJI.SUCCESS} ${getLang("payloanSuccess", formatCurrency(amount), formatCurrency(bankData[senderID].loan))}`
          );

        default:
          return this.sendAtomicMessage(message, getLang("invalidCommand"));
      }
    } catch (error) {
      console.error("Bank error:", error);
      return this.sendAtomicMessage(
        message, 
        `${config.DESIGN.EMOJI.ERROR} ${getLang("errorOperation", command || "bank")}`
      );
    }
  },

  // Helper to format Atomic messages
  formatAtomicMessage(content) {
    return `${config.DESIGN.HEADER}\n${config.DESIGN.SEPARATOR}\n${content}\n${config.DESIGN.SEPARATOR}\n${config.DESIGN.FOOTER}`;
  },

  // Helper to send Atomic-styled messages
  async sendAtomicMessage(message, content) {
    return message.reply(this.formatAtomicMessage(content));
  }
};
