const fs = require('fs');
const path = require('path');
const { drive, getStreamFromURL } = global.utils;

const hotDataFilePath = path.join(__dirname, 'vdo.json');

function readHotData() {
  try {
    const data = fs.readFileSync(hotDataFilePath, 'utf8');
    return JSON.parse(data) || { videos: [], sent: [] };
  } catch (error) {
    return { videos: [], sent: [] };
  }
}

function writeHotData(data) {
  fs.writeFileSync(hotDataFilePath, JSON.stringify(data, null, 2), 'utf8');
}

module.exports = {
  config: {
    name: 'hot',
    version: '2.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    role: 0,
    shortDescription: {
      en: '🔥 Manage and send hot videos'
    },
    longDescription: {
      en: 'Add videos to hot collection and send random unsent videos'
    },
    category: 'custom',
    guide: {
      en: '{pn} add: Reply to a video to save it\n{pn} send: Send unsent random video'
    }
  },

  onStart: async function ({ args, message, event }) {
    const hotData = readHotData();

    switch (args[0]) {
      case 'add': {
        if (!event.messageReply || !event.messageReply.attachments.length) {
          return message.reply('📥 Video reply dao to add to collection.');
        }

        const videoAttachment = event.messageReply.attachments.find(a => a.type === 'video');
        if (!videoAttachment) return message.reply('❌ Only video supported.');

        const fileName = `hot_${Date.now()}.mp4`;
        const file = await drive.uploadFile(fileName, 'application/octet-stream', await getStreamFromURL(videoAttachment.url));

        hotData.videos.push(file.id);
        writeHotData(hotData);
        return message.reply('✅ Video added to hot collection.');
      }

      case 'send': {
        const { videos, sent } = hotData;
        if (!videos.length) return message.reply('📭 No videos in collection.');

        const remaining = videos.filter(id => !sent.includes(id));
        if (!remaining.length) {
          hotData.sent = []; // reset sent history
          writeHotData(hotData);
          return message.reply('🔄 All videos sent. Try again now.');
        }

        const chosen = remaining[Math.floor(Math.random() * remaining.length)];
        const stream = await drive.getFile(chosen, 'stream', true);

        message.reply({ attachment: [stream] });
        hotData.sent.push(chosen);
        writeHotData(hotData);
        break;
      }

      default:
        return message.reply('❓Command bujhi nai.
📥 Use `{pn} add` or `{pn} send`');
    }
  }
};
