const fs = require('fs-extra');
const path = require('path');
const { drive, getStreamFromURL } = global.utils;

const hotDataFilePath = path.join(__dirname, 'vdo.json');

async function readHotData() {
  try {
    return await fs.readJson(hotDataFilePath);
  } catch {
    return { media: [], sent: [] };
  }
}

async function writeHotData(data) {
  await fs.outputJson(hotDataFilePath, data, { spaces: 2 });
}

module.exports = {
  config: {
    name: 'hot22',
    version: '2.3',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    role: 0,
    shortDescription: { en: '🔥 Manage and send hot media' },
    longDescription: { en: 'Add videos/audios to hot collection and send unsent random media' },
    category: 'custom',
    guide: {
      en: '{pn} add: Reply to a video or audio to save it\n{pn} send: Send unsent random media'
    }
  },

  onStart: async function ({ args, message, event }) {
    const hotData = await readHotData();

    switch ((args[0] || '').toLowerCase()) {
      case 'add': {
        if (!event.messageReply || !event.messageReply.attachments.length) {
          return message.reply('📥 মিডিয়া যোগ করতে হলে, ভিডিও/অডিওর রিপ্লাই দিয়ে কমান্ড দিন।');
        }

        const mediaAttachment = event.messageReply.attachments.find(a => a.type === 'video' || a.type === 'audio');
        if (!mediaAttachment) return message.reply('❌ শুধু ভিডিও বা অডিও ফাইলই গ্রহণযোগ্য।');

        const ext = mediaAttachment.type === 'video' ? 'mp4' : 'mp3';
        const fileName = `hot_${Date.now()}.${ext}`;

        try {
          const file = await drive.uploadFile(
            fileName,
            'application/octet-stream',
            await getStreamFromURL(mediaAttachment.url)
          );

          hotData.media.push(file.id);
          await writeHotData(hotData);
          return message.reply(`✅ ${mediaAttachment.type.toUpperCase()} কালেকশনে যোগ হয়েছে।`);
        } catch (err) {
          console.error(err);
          return message.reply('❌ মিডিয়া আপলোড ব্যর্থ হয়েছে।');
        }
      }

      case 'send': {
        const { media, sent } = hotData;
        if (!media.length) return message.reply('📭 কোনো মিডিয়া মজুদে নেই।');

        const remaining = media.filter(id => !sent.includes(id));
        if (!remaining.length) {
          hotData.sent = [];
          await writeHotData(hotData);
          return message.reply('🔄 সব মিডিয়া পাঠানো হয়েছে। এখন আবার চেষ্টা করুন।');
        }

        const chosen = remaining[Math.floor(Math.random() * remaining.length)];

        try {
          const stream = await drive.getFile(chosen, 'stream', true);
          await message.reply({
            body: '🔥 আপনার জন্য একটি হট মিডিয়া! 🔥',
            attachment: [stream]
          });

          hotData.sent.push(chosen);
          await writeHotData(hotData);
        } catch (err) {
          console.error(err);
          return message.reply('❌ মিডিয়া পাওয়া যায়নি।');
        }

        break;
      }

      default:
        return message.reply(
          '❓ কমান্ড বুঝিনি।\n📝 ব্যবহার করুন: hot22 add (মিডিয়া রিপ্লাই দিন) অথবা hot22 send (একটি মিডিয়া নিন)।'
        );
    }
  }
};
