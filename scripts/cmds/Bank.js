const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bank",
    version: "2.0",
    description: "💰 Bank command with deposit, withdraw, interest, transfer, loan, etc.",
    guide: {
      en: `{pn} deposit <amount>\n{pn} withdraw <amount>\n{pn} balance\n{pn} interest\n{pn} transfer <amount> <userID>\n{pn} richest\n{pn} loan <amount>\n{pn} payloan <amount>`
    },
    category: "💰 Economy",
    countDown: 10,
    role: 0,
    author: "Loufi | UltraPro Max AI Upgrade by ChatGPT"
  },

  onStart: async function ({ args, message, event, api, usersData }) {
    const prefix = global.utils.getPrefix(event.threadID);
    const userID = event.senderID.toString();
    const file = path.join(__dirname, "bankData.json");

    let bankData = {};
    if (!fs.existsSync(file)) fs.writeJsonSync(file, {});
    try { bankData = fs.readJsonSync(file); } catch { bankData = {}; }

    if (!bankData[userID]) {
      bankData[userID] = { bank: 0, lastInterest: 0, loan: 0, loanPaid: true };
    }

    const save = () => fs.writeJsonSync(file, bankData, { spaces: 2 });
    const format = (n) => {
      const units = ["", "K", "M", "B", "T", "Q", "Qa", "Sx", "Sp", "Oc", "No", "Dc"];
      let i = 0; while (n >= 1000 && i < units.length - 1) { n /= 1000; i++; }
      return `${n.toFixed(2)}${units[i]}`;
    };

    const money = await usersData.get(userID, "money") || 0;
    const cmd = args[0]?.toLowerCase();
    const val = parseInt(args[1]);
    const toID = args[2]?.toString();

    switch (cmd) {
      case "deposit": {
        if (isNaN(val) || val <= 0) return message.reply("⛔ Valid deposit amount den");
        if (money < val) return message.reply("⛔ Eto taka nai tomar wallet e");
        bankData[userID].bank += val;
        await usersData.set(userID, { money: money - val });
        save();
        return message.reply(`✅ ${val}$ deposit kora hoise bank e.`);
      }

      case "withdraw": {
        if (isNaN(val) || val <= 0) return message.reply("⛔ Valid withdraw amount den");
        if (bankData[userID].bank < val) return message.reply("⛔ Eto taka nai tomar bank e");
        bankData[userID].bank -= val;
        await usersData.set(userID, { money: money + val });
        save();
        return message.reply(`✅ ${val}$ withdraw kora hoise.`);
      }

      case "balance": {
        return message.reply(`🏦 Bank balance: ${format(bankData[userID].bank)}$
💵 Wallet: ${format(money)}$`);
      }

      case "interest": {
        const now = Date.now();
        const diff = (now - bankData[userID].lastInterest) / 1000;
        if (diff < 86400) {
          const h = Math.floor((86400 - diff) / 3600);
          return message.reply(`⏳ Next interest claim after ${h}h.`);
        }
        const gain = bankData[userID].bank * 0.001;
        bankData[userID].bank += gain;
        bankData[userID].lastInterest = now;
        save();
        return message.reply(`💸 Interest earned: ${gain.toFixed(2)}$`);
      }

      case "transfer": {
        if (!toID || isNaN(val) || val <= 0) return message.reply("⛔ Transfer er jonno valid amount ar user ID den");
        if (!bankData[toID]) return message.reply("⛔ User bank data nai");
        if (bankData[userID].bank < val) return message.reply("⛔ Eto taka nai tomar bank e");
        if (userID === toID) return message.reply("⛔ Nijer kase taka pathano jabe na");
        bankData[userID].bank -= val;
        bankData[toID].bank += val;
        save();
        return message.reply(`✅ ${val}$ pathano hoise user ${toID} ke.`);
      }

      case "richest": {
        const top = Object.entries(bankData)
          .sort(([, a], [, b]) => b.bank - a.bank)
          .slice(0, 10);
        let msg = "👑 Top 10 Richest Users:\n";
        for (let i = 0; i < top.length; i++) {
          const [id, data] = top[i];
          const name = await usersData.getName(id).catch(() => id);
          msg += `${i + 1}. ${name}: ${format(data.bank)}$\n`;
        }
        return message.reply(msg);
      }

      case "loan": {
        if (!bankData[userID].loanPaid) return message.reply("❌ Age loan porishodh korun");
        if (isNaN(val) || val <= 0 || val > 1000000) return message.reply("❌ Valid loan amount den (max 1M)");
        bankData[userID].loan = val;
        bankData[userID].loanPaid = false;
        bankData[userID].bank += val;
        save();
        return message.reply(`✅ ${val}$ loan neya hoise. Porer bar age eta porishodh korte hobe.`);
      }

      case "payloan": {
        const loan = bankData[userID].loan;
        if (loan <= 0) return message.reply("✅ Loan already porishodh");
        if (isNaN(val) || val <= 0 || val > loan) return message.reply(`❌ Valid amount den (max ${loan}$)`);
        if (money < val) return message.reply("❌ Eto taka nai tomar wallet e");
        bankData[userID].loan -= val;
        if (bankData[userID].loan <= 0) {
          bankData[userID].loan = 0;
          bankData[userID].loanPaid = true;
        }
        await usersData.set(userID, { money: money - val });
        save();
        return message.reply(`✅ ${val}$ loan porishodh kora hoise. Rest: ${bankData[userID].loan}$`);
      }

      default: {
        return message.reply(`❓ Invalid command. Use:\n${prefix}bank deposit <amount>\n${prefix}bank withdraw <amount>\n${prefix}bank balance\n${prefix}bank interest\n${prefix}bank transfer <amount> <userID>\n${prefix}bank richest\n${prefix}bank loan <amount>\n${prefix}bank payloan <amount>`);
      }
    }
  }
};
