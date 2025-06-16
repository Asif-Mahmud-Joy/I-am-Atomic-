module.exports = {
  config: {
    name: "slot",
    version: "2.0",
    author: "Mr.Smokey [Asif Mahmud]",
    shortDescription: {
      en: "Slot game",
      bn: "স্লট গেম",
    },
    longDescription: {
      en: "Fun and fair slot game.",
      bn: "মজার ও ফেয়ার স্লট গেম।",
    },
    category: "Game",
  },

  langs: {
    en: {
      invalid_amount: "Enter a valid and positive amount to have a chance to win double.",
      not_enough_money: "Check your balance to ensure you have enough money.",
      spin_message: "Spinning...",
      win_message: "You won $%1, buddy!",
      lose_message: "You lost $%1, buddy.",
      jackpot_message: "Jackpot! You won $%1 with three %2 symbols, buddy!",
    },
    bn: {
      invalid_amount: "ভাই, সঠিক ও পজিটিভ এমাউন্ট দে জিততে চাইলে!",
      not_enough_money: "তোর কাছে এত টাকা নাই ভাই, আগে ব্যালেন্স চেক কর!",
      spin_message: "ঘুরতেছে রে...",
      win_message: "তুই জিতছোস $%1 ভাই!",
      lose_message: "তুই হেরেছিস $%1 ভাই...",
      jackpot_message: "জ্যাকপট লাগছে ভাই! $%1 জিতছোস তিনটা %2 আইকনে!",
    }
  },

  onStart: async function ({ args, message, event, usersData, getLang, language }) {
    const { senderID } = event;
    const userData = await usersData.get(senderID);
    const amount = parseInt(args[0]);
    const lang = language === "bn" ? "bn" : "en";

    if (isNaN(amount) || amount <= 0) {
      return message.reply(getLang(lang, "invalid_amount"));
    }

    if (amount > userData.money) {
      return message.reply(getLang(lang, "not_enough_money"));
    }

    message.reply(getLang(lang, "spin_message"));

    const slots = ["💚", "💛", "💙"];
    const slot1 = slots[Math.floor(Math.random() * slots.length)];
    const slot2 = slots[Math.floor(Math.random() * slots.length)];
    const slot3 = slots[Math.floor(Math.random() * slots.length)];

    const winnings = calculateWinnings(slot1, slot2, slot3, amount);

    await usersData.set(senderID, {
      money: userData.money + winnings,
      data: userData.data,
    });

    const messageText = getSpinResultMessage(slot1, slot2, slot3, winnings, (key, ...args) => getLang(lang, key, ...args));
    return message.reply(messageText);
  }
};

function calculateWinnings(slot1, slot2, slot3, betAmount) {
  if (slot1 === slot2 && slot2 === slot3) {
    if (slot1 === "💙") {
      return betAmount * 10; // Jackpot
    } else if (slot1 === "💛") {
      return betAmount * 5;
    } else {
      return betAmount * 3;
    }
  } else if (slot1 === slot2 || slot1 === slot3 || slot2 === slot3) {
    return betAmount * 2;
  } else {
    return -betAmount;
  }
}

function getSpinResultMessage(slot1, slot2, slot3, winnings, getLang) {
  const slotsDisplay = `[ ${slot1} | ${slot2} | ${slot3} ]`;
  if (winnings > 0) {
    if (slot1 === "💙" && slot2 === "💙" && slot3 === "💙") {
      return getLang("jackpot_message", winnings, "💙") + `\n${slotsDisplay}`;
    } else {
      return getLang("win_message", winnings) + `\n${slotsDisplay}`;
    }
  } else {
    return getLang("lose_message", -winnings) + `\n${slotsDisplay}`;
  }
}
