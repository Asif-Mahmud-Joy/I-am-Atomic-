const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: 'song',
    author: 'Asif',
    version: '2.0',
    usePrefix: true,
    category: 'music',
    description: {
      en: 'Download high quality YouTube music'
    },
    guide: {
      en: '{pn} <song name> - Downloads the best matching song'
    }
  },

  onStart: async ({ event, api, args, message, getLang }) => {
    try {
      // Validate input
      const query = args.join(' ').trim();
      if (!query) {
        return message.reply('🔍 Please enter a song name to search!');
      }

      // Show searching indicator
      api.setMessageReaction("🔍", event.messageID, () => {}, true);
      const searchMsg = await message.reply(`🔎 Searching for "${query}"...`);

      // Search for videos
      const searchResponse = await axios.get(
        `https://mostakim.onrender.com/mostakim/ytSearch?search=${encodeURIComponent(query)}`,
        { timeout: 10000 }
      );

      if (!searchResponse.data || searchResponse.data.length === 0) {
        await message.edit('❌ No results found for your search.', searchMsg.messageID);
        return;
      }

      // Filter videos under 10 minutes
      const filteredVideos = searchResponse.data.filter(video => {
        try {
          return this.parseDuration(video.timestamp) < 600; // 10 minutes in seconds
        } catch {
          return false;
        }
      });

      if (filteredVideos.length === 0) {
        await message.edit('⏱️ No songs under 10 minutes found.', searchMsg.messageID);
        return;
      }

      // Select best match (first result)
      const selectedVideo = filteredVideos[0];
      await message.edit(`🎧 Found: ${selectedVideo.title} (${selectedVideo.timestamp})`, searchMsg.messageID);

      // Download audio
      api.setMessageReaction("⬇️", event.messageID, () => {}, true);
      const tempFilePath = path.join(__dirname, `${Date.now()}_${selectedVideo.id}.m4a`);

      try {
        const apiResponse = await axios.get(
          `https://mostakim.onrender.com/m/sing?url=${selectedVideo.url}`,
          { timeout: 15000 }
        );

        if (!apiResponse.data?.url) {
          throw new Error('No audio URL received from server');
        }

        // Download the audio file
        const writer = fs.createWriteStream(tempFilePath);
        const audioResponse = await axios({
          url: apiResponse.data.url,
          method: 'GET',
          responseType: 'stream',
          timeout: 30000
        });

        audioResponse.data.pipe(writer);

        await new Promise((resolve, reject) => {
          writer.on('finish', resolve);
          writer.on('error', reject);
        });

        // Send the audio file
        api.setMessageReaction("✅", event.messageID, () => {}, true);
        await message.reply({
          body: `🎵 Now Playing: ${selectedVideo.title}\n⏱ Duration: ${selectedVideo.timestamp}`,
          attachment: fs.createReadStream(tempFilePath)
        });

      } finally {
        // Clean up temp file
        if (fs.existsSync(tempFilePath)) {
          fs.unlink(tempFilePath, (err) => {
            if (err) console.error('Error deleting temp file:', err);
          });
        }
      }

    } catch (error) {
      console.error('Song Download Error:', error);
      message.reply(`❌ Error: ${error.message || 'Failed to download song'}`);
    }
  },

  parseDuration: (timestamp) => {
    try {
      const parts = timestamp.split(':').map(part => parseInt(part));
      if (parts.some(isNaN)) return Infinity; // Invalid duration

      if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      }
      return Infinity; // Unknown format
    } catch {
      return Infinity; // If any error occurs
    }
  }
};
