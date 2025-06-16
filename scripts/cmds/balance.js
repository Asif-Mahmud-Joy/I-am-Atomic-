const { config } = global.GoatBot;

module.exports = {
  config: {
    name: "balance",
    aliases: ["bal", "money"],
    version: "2.0.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 1,
    role: 0,
    description: "Check balance, transfer/request/add/delete money",
    category: "economy",
    guide: {
      en: `
🔰 Commands:
• {pn} → View your balance
• {pn} <@tag|reply|uid> → View other user balance
• {pn} transfer <@tag|uid|reply> <amount> → Send money
• {pn} request <amount> → Ask admin for money
• {pn} add/delete <@tag|uid|reply> <amount> → Admin only`
    }
  },

  onStart: async function ({ message, usersData, event, args, api }) {
    const senderID = event.senderID;
    const adminIDs = [config.adminBot, ...config.adminBot, "61571630409265"];
    const notifyThreads = ["9191391594224159", "7272501799469344"];

    const formatMoney = (num) => {
      const units = ["", "K", "M", "B", "T", "Q", "Qi", "Sx", "Sp", "Oc", "N", "D"];
      let unit = 0;
      let number = Number(num);
      while (number >= 1000 && unit < units.length - 1) {
        number /= 1000;
        unit++;
      }
      return `${number.toFixed(2)}${units[unit]}`;
    };

    const isValidAmount = (val) => !isNaN(val) && Number(val) > 0;

    const getTargetUID = () => {
      if (event.messageReply) return event.messageReply.senderID;
      if (Object.keys(event.mentions).length > 0) return Object.keys(event.mentions)[0];
      if (!isNaN(args[1])) return args[1];
      return null;
    };

    const getAmount = () => args[args.length - 1];

    const sendHelp = () => message.reply(
      `📘 Balance Command Help:

{prefix}balance
→ Show your balance

{prefix}balance @user / reply / uid
→ Show other's balance

{prefix}balance transfer @user 100
→ Send 100$ to user

{prefix}balance request 500
→ Ask admin for 500$

{prefix}balance add/delete @user 300
→ Admins only`
    );

    const handleBalanceCheck = async (uid, sender = false) => {
      const userData = await usersData.get(uid) || { money: "0", name: "Unknown" };
      const replyName = userData.name || "Unknown";
      return message.reply(`${sender ? '💸' : '💰'} ${replyName} (UID: ${uid}) has ${formatMoney(userData.money)}$ (${userData.money}$).`);
    };

    const handleTransfer = async () => {
      const targetUID = getTargetUID();
      const amount = Number(getAmount());
      if (!targetUID || targetUID === senderID) return message.reply("❌ Invalid recipient.");
      if (!isValidAmount(amount)) return message.reply("❌ Invalid amount.");

      const senderData = await usersData.get(senderID) || { money: "0" };
      const recipientData = await usersData.get(targetUID) || { money: "0" };

      if (Number(senderData.money) < amount) return message.reply("❌ Not enough money.");

      await usersData.set(senderID, { money: (Number(senderData.money) - amount).toString() });
      await usersData.set(targetUID, { money: (Number(recipientData.money) + amount).toString() });

      const name = recipientData.name || "Unknown";
      return message.reply(`✅ ${formatMoney(amount)}$ sent to ${name} (UID: ${targetUID}).`);
    };

    const handleAdminAction = async (action) => {
      if (!adminIDs.includes(senderID)) return message.reply("❌ No permission.");

      const targetUID = getTargetUID();
      const amount = Number(getAmount());
      if (!targetUID || !isValidAmount(amount)) return message.reply("❌ Invalid target or amount.");

      const userData = await usersData.get(targetUID) || { money: "0" };
      const balance = Number(userData.money);
      const name = userData.name || "Unknown";

      if (action === "delete" && balance < amount) return message.reply("❌ Target doesn't have enough money.");

      const newBalance = action === "add" ? balance + amount : balance - amount;
      await usersData.set(targetUID, { money: newBalance.toString() });

      return message.reply(`✅ ${action === 'add' ? 'Added' : 'Deleted'} ${formatMoney(amount)}$ ${action === 'add' ? 'to' : 'from'} ${name} (UID: ${targetUID}).`);
    };

    const handleRequest = async () => {
      const amount = Number(args[1]);
      if (!isValidAmount(amount)) return message.reply("❌ Invalid amount.");

      const data = await usersData.get(senderID);
      const name = data.name || "Darling";
      const reqMsg = `📥 ${name} (${senderID}) requested ${formatMoney(amount)}$`;

      adminIDs.forEach(id => api.sendMessage(reqMsg, id));
      notifyThreads.forEach(id => api.sendMessage(reqMsg, id));

      return message.reply(`✅ Request sent to admins for ${formatMoney(amount)}$.`);
    };

    // Command Routing
    const command = args[0]?.toLowerCase();

    if (!command) return handleBalanceCheck(senderID, true);
    if (command === "help") return sendHelp();
    if (command === "transfer") return handleTransfer();
    if (command === "add" || command === "delete") return handleAdminAction(command);
    if (command === "request") return handleRequest();
    if (Object.keys(event.mentions).length > 0 || event.messageReply || !isNaN(command)) return handleBalanceCheck(getTargetUID());

    return message.reply("❌ Invalid command. Try {pn} help");
  }
};
