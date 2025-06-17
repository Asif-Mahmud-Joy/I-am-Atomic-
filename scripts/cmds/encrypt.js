// Banglish: Ei command diye text ke online API diye encrypt/decrypt kora jabe

const axios = require("axios");

module.exports = {
  config: {
    name: "encrypt",
    aliases: ["enc", "dec"],
    version: "2.0",
    author: "🔥 Asif Mahmud + ChatGPT Fix",
    countDown: 3,
    role: 0,
    shortDescription: "Text encrypt/decrypt with API",
    longDescription: "Simple text encryption/decryption using online API",
    category: "utility",
    guide: {
      en: "{pn} enc <text> - encrypt\n{pn} dec <text> - decrypt"
    }
  },

  onStart: async function ({ message, args }) {
    const action = args[0];
    const input = args.slice(1).join(" ");

    if (!["enc", "dec"].includes(action) || !input)
      return message.reply("⚠️ Use: `{pn} enc <text>` or `{pn} dec <encrypted text>`");

    try {
      // API call for encryption/decryption
      const url = `https://codebeautify.org/encrypt-decrypt-text-json`;

      const payload = {
        type: action === "enc" ? "encrypt" : "decrypt",
        key: "GoatUltraSecure🔥", // Banglish: API-r password, mone moto change korte paro
        input: input
      };

      const res = await axios.post("https://api.codetabs.com/v1/proxy", {
        url,
        payload: JSON.stringify(payload)
      });

      if (!res.data || !res.data.output) {
        return message.reply("❌ API response e kichu nai, try abar.");
      }

      const result = res.data.output;

      message.reply(
        action === "enc"
          ? `🔐 Encrypted text:\n${result}`
          : `🔓 Decrypted text:\n${result}`
      );
    } catch (err) {
      console.error(err);
      message.reply("❌ API error hoyeche. Server down ba connection fail.");
    }
  }
};
