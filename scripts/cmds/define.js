const axios = require("axios");

module.exports = {
  config: {
    name: "define",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Retrieve meaning of a word",
    longDescription: "Banglish & English – word definition, pronunciation, origin",
    category: "info",
    guide: "{pn}define <word>"
  },

  onStart: async function({ api, event, args }) {
    if (args.length < 1)
      return api.sendMessage("📌 Banglish: Ekta word dao! Example: define happy", event.threadID, event.messageID);

    const word = args[0].toLowerCase();

    try {
      const res = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en_US/${word}`);
      const data = res.data;

      if (!Array.isArray(data) || data.length < 1)
        return api.sendMessage(`❌ Word pawa jai nai: "${word}"`, event.threadID, event.messageID);

      const entry = data[0];
      let msg = `📘 *WORD:* ${entry.word}`;

      // Banglish pronunciation & audio
      if (entry.phonetics && entry.phonetics.length > 0) {
        const ph = entry.phonetics.find(p => p.text) || {};
        msg += `\n🔉 *PHONETIC:* ${ph.text || "N/A"}`;
        if (ph.audio) msg += `\n🎧 *AUDIO:* ${ph.audio}`;
      }

      if (entry.origin) msg += `\n🧬 *ORIGIN:* ${entry.origin}`;

      // Meanings
      const meanings = entry.meanings.map(m => {
        const defs = m.definitions.map((d, i) => `    • ${d.definition}`).join("\n");
        return `\n➡️ *${m.partOfSpeech}*\n${defs}`;
      }).join("");

      msg += `\n\n📖 *MEANINGS:*${meanings}`;

      api.sendMessage(msg, event.threadID, event.messageID);

    } catch (err) {
      console.error("Define command error:", err.message);
      api.sendMessage("❌ Kichu problem hoise – abar try koro pore.", event.threadID, event.messageID);
    }
  }
};
