module.exports = {
  config: {
    name: "choose",
    aliases: ["atomicdecide", "quantumchoice"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Quantum Decision System"
    },
    longDescription: {
      en: "⚛️ Make atomic-level decisions with quantum precision"
    },
    category: "💎 Premium Tools",
    guide: {
      en: "{pn} option1 | option2 | option3"
    }
  },

  langs: {
    en: {
      many: "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Quantum input insufficient\n🔸 | Please provide at least two options separated by '|'"
    }
  },

  onStart: async function ({ message, args, api, event, getLang }) {
    const input = args.join(" ");
    if (!input) {
      return message.reply({
        body: "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Quantum signature missing\n🔸 | Usage: choose pizza | burger | pasta"
      });
    }

    const options = input.split("|").map(opt => opt.trim()).filter(opt => opt);
    if (options.length < 2) return message.reply(getLang("many"));

    try {
      // Send initial processing message
      const processingMsg = await message.reply({
        body: "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Initializing quantum analysis\n▰▱▱▱▱▱▱▱ 15%"
      });

      // Simulate quantum decision process
      const stages = [
        "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Collapsing probability waves\n▰▰▰▱▱▱▱▱ 40%",
        "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n🌀 | Stabilizing quantum states\n▰▰▰▰▰▱▱▱ 70%",
        "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n✅ | Quantum superposition resolved\n▰▰▰▰▰▰▰▰ 100%"
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        await api.sendMessage({
          body: stage,
          messageID: processingMsg.messageID
        }, event.threadID);
      }

      // Make the selection with quantum randomness
      const chosenIndex = Math.floor(Math.random() * options.length);
      const chosen = options[chosenIndex];
      
      // Format the result
      const result = `☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━
🔮 | Quantum Choice: 
┌───────────────────────
│ ${chosen}
└───────────────────────
⚛️ Decision finalized at quantum level!`;

      // Send final result
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.reply({
        body: result,
        mentions: []
      });

      // Cleanup
      api.unsend(processingMsg.messageID);

    } catch (err) {
      console.error("☢️ ATOMIC DECISION ERROR:", err);
      await message.reply({
        body: "☣️ ATOMIC DECISION SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum disturbance detected\n🔸 | " + (err.message || "Try again later")
      });
    }
  }
};
