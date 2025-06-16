module.exports = {
  config: {
    name: "spam",
    author: "Mr.Smokey [Asif Mahmud]",
    role: 2,
    shortDescription: "Ekoi message repeat kore send korbe",
    longDescription: "Ekoi message bar bar send korar jonno command. Warning: abuse korben na!",
    category: "sophia",
    guide: "{pn} [amount] [message]"
  },

  onStart: async function ({ api, event, args }) {
    const amount = parseInt(args[0]);
    const msg = args.slice(1).join(" ");

    // 🔍 Validation check
    if (isNaN(amount) || amount <= 0 || !msg) {
      return api.sendMessage(
        "⚠️ | Use er format thik na bhai!
📌 Format: /spam [amount] [message]\n🔁 Example: /spam 5 Hello!",
        event.threadID
      );
    }

    if (amount > 20) {
      return api.sendMessage(
        "🚫 | Ekbar e beshi spam kora jabe na. Max limit: 20.",
        event.threadID
      );
    }

    // ✅ Safe spam loop with delay
    for (let i = 0; i < amount; i++) {
      setTimeout(() => {
        api.sendMessage(msg, event.threadID);
      }, i * 1000); // 1 second delay per message
    }
  },
};
