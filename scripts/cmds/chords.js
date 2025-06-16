const axios = require("axios");

module.exports = {
  config: {
    name: "chords",
    aliases: [],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    shortDescription: "Guitar chords khuja ber koro 🎸",
    longDescription: "Guitar er jonne song chords khuja pawar jonne ai command use koro",
    category: "media",
    guide: "{pn} song name"
  },

  onStart: async function ({ api, event, args }) {
    const songName = args.join(" ");

    if (!songName) {
      return api.sendMessage("🎸 Please ekta song name dao. Example: chords Perfect - Ed Sheeran", event.threadID, event.messageID);
    }

    try {
      const res = await axios.get(`https://api.popcat.xyz/chords?song=${encodeURIComponent(songName)}`);

      if (!res.data || !res.data.chords) {
        return api.sendMessage(`❌ Chords paowa jay nai for: ${songName}`, event.threadID, event.messageID);
      }

      const { artist, title, chords } = res.data;

      api.sendMessage(
        `🎶 Artist: ${artist}\n🎵 Title: ${title}\n\n🎸 Chords:\n${chords}\n\n🔚 End of chords. Enjoy playing!`,
        event.threadID,
        event.messageID
      );
    } catch (err) {
      console.error("[ERROR]", err);
      return api.sendMessage("❌ Error hoise chords anate. Try again pore.", event.threadID, event.messageID);
    }
  }
};
