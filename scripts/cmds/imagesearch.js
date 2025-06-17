const axios = require("axios");
const fs = require("fs");
const path = require("path");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "imgsearch",
    aliases: ["is"],
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: "Image khuja paw",
    longDescription: "Text diye image search kore result dey.",
    category: "image",
    guide: "{pn} cat"
  },

  onStart: async function ({ event, api, args }) {
    if (args.length === 0) {
      return api.sendMessage("📸 Image khujte hole kono keyword dao!", event.threadID, event.messageID);
    }

    const query = args.join(" ");
    api.sendMessage(`🔍 '${query}' er image khoj hocche...`, event.threadID, event.messageID);

    try {
      const res = await axios.get(`https://api.akuari.my.id/search/img?query=${encodeURIComponent(query)}`);
      const result = res.data.hasil;

      if (!result || result.length === 0) {
        return api.sendMessage(`❌ '${query}' er kono image pawa jay nai.`, event.threadID, event.messageID);
      }

      const limit = 10;
      const images = result.slice(0, limit);
      const attachments = await Promise.all(images.map(url => getStreamFromURL(url)));

      api.sendMessage({
        body: `✅ '${query}' er jonno ${images.length} ta image pawa gese:`,
        attachment: attachments
      }, event.threadID, event.messageID);

    } catch (err) {
      console.error("[imgsearch error]", err);
      api.sendMessage("❌ Image search e vul hoise. Try again porer ekto pore.", event.threadID, event.messageID);
    }
  }
};
