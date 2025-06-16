const axios = require('axios');
const fs = require('fs');
const path = require('path');

const baseApiUrl = async () => {
  const base = await axios.get(
    "https://raw.githubusercontent.com/nazrul4x/Noobs/main/Apis.json"
  );
  return base.data.api;
};

module.exports = {
  config: {
    name: "sing",
    aliases: ["music", "searchsong"],
    version: "2.0.0",
    author: "Nazrul + Upgrade by ChatGPT",
    countDown: 20,
    role: 0,
    description: "Search or Download YouTube Songs",
    category: "Media",
    guide: {
      en: "{pn} <song name or YouTube URL>",
      bn: "{pn} গান এর নাম বা ইউটিউব লিংক"
    }
  },

  onStart: async function ({ api, event, args }) {
    const songQuery = args.join(" ").trim();
    const isUrl = songQuery.startsWith('https://') || songQuery.startsWith('http://');

    if (!songQuery) return api.sendMessage("🎵 দয়া করে গান এর নাম বা ইউটিউব লিংক দিন!", event.threadID, event.messageID);

    return isUrl
      ? await this.downloadSong(api, event, songQuery)
      : await this.searchSong(api, event, songQuery);
  },

  downloadSong: async function (api, event, songUrl, songTitle = "Unknown", songDuration = "Unknown") {
    try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/nazrul/ytMp3?url=${encodeURIComponent(songUrl)}`);
      const songData = res.data;

      if (!songData.d_url) throw new Error('🎧 ডাউনলোড লিংক পাওয়া যায়নি!');

      const songPath = path.resolve(__dirname, 'tmp', `song_${Date.now()}.mp3`);
      if (!fs.existsSync(path.dirname(songPath))) fs.mkdirSync(path.dirname(songPath));

      const writer = fs.createWriteStream(songPath);
      const stream = (await axios.get(songData.d_url, { responseType: 'stream' })).data;
      stream.pipe(writer);

      writer.on('finish', async () => {
        await api.sendMessage({
          body: `🎶 আপনার গান:

♡ শিরোনাম: ${songData.title}
♡ সময়কাল: ${songDuration}`,
          attachment: fs.createReadStream(songPath)
        }, event.threadID, () => fs.unlinkSync(songPath), event.messageID);
      });

      writer.on('error', (err) => {
        console.error('Error writing song:', err);
        api.sendMessage(`❌ সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
      });
    } catch (err) {
      console.error('Download error:', err.message);
      api.sendMessage(`❌ সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
    }
  },

  searchSong: async function (api, event, query) {
    try {
      const apiUrl = await baseApiUrl();
      const res = await axios.get(`${apiUrl}/nazrul/ytSearch?query=${encodeURIComponent(query)}`);
      const results = res.data;

      if (!results || results.length === 0) throw new Error('😓 কোন ফলাফল পাওয়া যায়নি!');

      const topResults = results.slice(0, 10);
      let msg = `🔍 Top 10 ফলাফল:

`;
      const attachments = [];
      const paths = [];

      for (let i = 0; i < topResults.length; i++) {
        const s = topResults[i];
        msg += `#${i + 1}:
🎵 ${s.title}
🕒 সময়কাল: ${s.timestamp}\n\n`;

        const thumbPath = path.resolve(__dirname, 'tmp', `thumb_${i + 1}_${Date.now()}.jpg`);
        if (!fs.existsSync(path.dirname(thumbPath))) fs.mkdirSync(path.dirname(thumbPath));

        const writer = fs.createWriteStream(thumbPath);
        const stream = (await axios.get(s.thumbnail, { responseType: 'stream' })).data;
        stream.pipe(writer);
        await new Promise(resolve => writer.on('finish', resolve));

        attachments.push(fs.createReadStream(thumbPath));
        paths.push(thumbPath);
      }

      api.sendMessage({
        body: msg,
        attachment: attachments
      }, event.threadID, (err, info) => {
        if (!err) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            searchData: topResults,
            attachmentPaths: paths
          });
        }
      }, event.messageID);

    } catch (err) {
      console.error('Search error:', err.message);
      api.sendMessage(`❌ সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
    }
  },

  onReply: async function ({ api, event, Reply }) {
    try {
      const { searchData, attachmentPaths } = Reply;
      const choice = parseInt(event.body.trim()) - 1;

      if (isNaN(choice) || choice < 0 || choice >= searchData.length) {
        return api.sendMessage("⚠️ সঠিক সংখ্যা দিন!", event.threadID, event.messageID);
      }

      const selected = searchData[choice];
      api.unsendMessage(Reply.messageID);

      if (attachmentPaths) {
        attachmentPaths.forEach(file => fs.existsSync(file) && fs.unlinkSync(file));
      }

      await this.downloadSong(api, event, selected.url, selected.title, selected.timestamp);
    } catch (err) {
      console.error('Reply error:', err.message);
      api.sendMessage(`❌ সমস্যা হয়েছে: ${err.message}`, event.threadID, event.messageID);
    }
  }
};
