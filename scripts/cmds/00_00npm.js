const axios = require('axios');

module.exports = {
  config: {
    name: "npm",
    version: "3.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: "Search npm package info",
    longDescription: {
      en: "Search and display npm package info like version, author, description, etc."
    },
    category: "tools",
    guide: {
      en: "{pn} <package name>"
    }
  },

  onStart: async function ({ api, event, args }) {
    if (!args[0]) return api.sendMessage("📦 Please provide a package name.", event.threadID);

    const query = encodeURIComponent(args.join(" "));

    try {
      const res = await axios.get(`https://registry.npmjs.org/${query}`);
      const data = res.data;
      const latestVersion = data["dist-tags"].latest;
      const info = data.versions[latestVersion];

      const message =
        `📦 NPM Package Info:
` +
        `━━━━━━━━━━━━━━━━━━━
` +
        `🔹 Name: ${data.name}
` +
        `📝 Description: ${info.description || 'No description'}
` +
        `🧑 Author: ${(info.author && info.author.name) || 'Unknown'}
` +
        `🆚 Version: ${latestVersion}
` +
        `📅 Last Published: ${new Date(data.time[latestVersion]).toLocaleString('en-GB')}
` +
        `🔗 Link: https://www.npmjs.com/package/${data.name}`;

      api.sendMessage(message, event.threadID);
    } catch (e) {
      console.error(e);
      return api.sendMessage("❌ NPM package not found or an error occurred.", event.threadID);
    }
  }
};
