const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require("qs");
const { getStreamFromURL, shortenURL, randomString } = global.utils;

function loadAutoLinkStates() {
  try {
    return JSON.parse(fs.readFileSync("autolink.json", "utf8"));
  } catch (err) {
    return {};
  }
}

function saveAutoLinkStates(states) {
  fs.writeFileSync("autolink.json", JSON.stringify(states, null, 2));
}

let autoLinkStates = loadAutoLinkStates();

module.exports = {
  config: {
    name: 'autolink',
    version: '4.0',
    author: '🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠',
    countDown: 5,
    role: 0,
    shortDescription: 'Auto download video from popular platforms',
    longDescription: 'Instagram, Facebook, TikTok, Twitter, Pinterest, YouTube auto video downloader',
    category: 'media',
    guide: { en: '{pn} (on/off)' }
  },

  onStart: async function ({ api, event }) {
    const threadID = event.threadID;
    const body = event.body.toLowerCase();

    if (body.includes('autolink off')) {
      autoLinkStates[threadID] = 'off';
      saveAutoLinkStates(autoLinkStates);
      return api.sendMessage("✅ AutoLink off kore deya holo.", threadID, event.messageID);
    }

    if (body.includes('autolink on')) {
      autoLinkStates[threadID] = 'on';
      saveAutoLinkStates(autoLinkStates);
      return api.sendMessage("✅ AutoLink on kore deya holo.", threadID, event.messageID);
    }
  },

  onChat: async function ({ api, event }) {
    const threadID = event.threadID;
    const link = this.extractLink(event.body);

    if (!link) return;

    if (autoLinkStates[threadID] !== 'off') {
      api.setMessageReaction("⬇️", event.messageID, () => {}, true);
      this.download(link, api, event);
    }
  },

  extractLink: function (text) {
    const regex = /(https?:\/\/[\w./?=&%-]+)/gi;
    const match = text.match(regex);
    if (!match) return null;

    const url = match.find(url =>
      /(instagram|facebook|fb\.watch|tiktok|x\.com|pin\.it|youtu)/.test(url)
    );
    return url || null;
  },

  download: async function (url, api, event) {
    let site = 'unknown';
    if (url.includes('instagram')) site = 'instagram';
    else if (url.includes('facebook') || url.includes('fb.watch')) site = 'facebook';
    else if (url.includes('tiktok')) site = 'tiktok';
    else if (url.includes('x.com')) site = 'twitter';
    else if (url.includes('pin.it')) site = 'pinterest';
    else if (url.includes('youtu')) site = 'youtube';

    try {
      const response = await axios.get(`https://allinonedownloader-ayan.onrender.com/download?url=${encodeURIComponent(url)}`);
      if (!response.data || !response.data.url) return api.sendMessage("❌ Download link pawa jaini.", event.threadID, event.messageID);

      const videoURL = response.data.url;
      const short = await shortenURL(videoURL);
      const msg = `🔗 Video Link: ${short}`;

      const filePath = `${__dirname}/cache/${Date.now()}.mp4`;
      const stream = await axios({ url: videoURL, method: 'GET', responseType: 'stream' });

      const totalSize = parseInt(stream.headers['content-length']);
      if (totalSize > 25 * 1024 * 1024) return api.sendMessage("⚠️ File boro bole pathano jabe na.", event.threadID, event.messageID);

      const writer = fs.createWriteStream(filePath);
      stream.data.pipe(writer);
      writer.on('finish', () => {
        api.sendMessage({ body: msg, attachment: fs.createReadStream(filePath) }, event.threadID, () => fs.unlinkSync(filePath), event.messageID);
      });
    } catch (err) {
      console.error("Download error:", err);
      api.sendMessage("❌ Somossa hoise video download e.", event.threadID, event.messageID);
    }
  }
};
