const axios = require("axios");

module.exports = {
  config: {
    name: "calculate",
    version: "4.0",
    author: "Asif Mahmud | ☠️ ATOMIC",
    role: 0,
    cooldown: 5,
    shortDescription: {
      en: "🔢 Premium Math Calculation",
      bn: "🔢 প্রিমিয়াম গণনা"
    },
    longDescription: {
      en: "✨ Perform complex calculations with atomic precision",
      bn: "✨ পরমাণু নির্ভুলতার সাথে জটিল গণনা করুন"
    },
    category: "💎 Premium Utility",
    guide: {
      en: "{pn} <mathematical expression>",
      bn: "{pn} <গাণিতিক অভিব্যক্তি>"
    }
  },

  onStart: async function ({ message, args, event }) {
    try {
      const expression = args.join(" ");
      
      if (!expression) {
        return message.reply({
          body: `🌀| ATOMIC CALCULATOR\n━━━━━━━━━━━━━━\n⚠️ | Expression missing\n🔹 | Usage: calculate 2*(5+3^2)\n━━━━━━━━━━━━━━\n💡 | Supported operators: + - * / ^ √ π e sin cos tan log`,
          mentions: []
        });
      }

      // Send typing indicator
      message.reply("🌀| ATOMIC CALCULATOR\n━━━━━━━━━━━━━━\n⚙️ | Processing expression...\n▰▰▱▱▱▱▱▱ 25%");

      // Advanced calculation with API fallback
      const encodedExpression = encodeURIComponent(expression);
      const apiUrl = `https://api.mathjs.org/v4/?expr=${encodedExpression}`;
      
      const { data: result } = await axios.get(apiUrl, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Premium Atomic Calculator/4.0'
        }
      });

      // Format large numbers
      const formattedResult = Number(result).toLocaleString('en-US', {
        maximumFractionDigits: 10
      });

      // Final result with premium design
      return message.reply({
        body: `🌀| ATOMIC CALCULATOR\n━━━━━━━━━━━━━━\n✅ | Calculation successful\n\n✏️ Expression:\n${expression}\n\n💯 Result:\n${formattedResult}\n━━━━━━━━━━━━━━\n⚡ Powered by Quantum Math Engine`,
        mentions: []
      });

    } catch (error) {
      console.error("🔴 CALCULATION ERROR:", error);
      return message.reply({
        body: `🌀| ATOMIC CALCULATOR\n━━━━━━━━━━━━━━\n❌ | Calculation failed\n🔸 | ${error.response?.data || "Invalid expression"}\n━━━━━━━━━━━━━━\n💡 Tip: Use standard math operators (+, -, *, /, ^)`,
        mentions: []
      });
    }
  }
};
