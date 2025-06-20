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
    version: '2.4',
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
          return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
❌ *Invalid Command Usage*
📌 Please reply to a video/audio with:
   hot22 add
━━━━━━━━━━━━━━━━━━
💡 Example: Reply to a media file and type:
   hot22 add
          `.trim());
        }

        const mediaAttachment = event.messageReply.attachments.find(a => a.type === 'video' || a.type === 'audio');
        if (!mediaAttachment) return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *Unsupported Media Type*
📌 Only video/audio files are accepted
🚫 Images, documents, etc. cannot be added
━━━━━━━━━━━━━━━━━━
        `.trim());

        const ext = mediaAttachment.type === 'video' ? 'mp4' : 'mp3';
        const fileName = `hot_${Date.now()}.${ext}`;
        
        // Show processing message
        await message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⏳ *Processing Media...*
🔍 Type: ${mediaAttachment.type.toUpperCase()}
📏 Size: ${(mediaAttachment.size / 1024 / 1024).toFixed(2)}MB
🔄 Uploading to secure storage...
━━━━━━━━━━━━━━━━━━
        `.trim());

        try {
          const file = await drive.uploadFile(
            fileName,
            'application/octet-stream',
            await getStreamFromURL(mediaAttachment.url)
          );

          hotData.media.push(file.id);
          await writeHotData(hotData);
          return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
✅ *Media Added Successfully!*
🔥 New hot media added to collection
📥 Total Media: ${hotData.media.length}
━━━━━━━━━━━━━━━━━━
💾 Saved as: ${fileName}
🔒 Securely stored in encrypted drive
━━━━━━━━━━━━━━━━━━
          `.trim());
        } catch (err) {
          console.error(err);
          return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *Upload Failed!*
❌ Error: ${err.message || 'Unknown error'}
━━━━━━━━━━━━━━━━━━
💡 Possible solutions:
• Check your internet connection
• Try a smaller media file
• Contact admin if problem persists
━━━━━━━━━━━━━━━━━━
          `.trim());
        }
      }

      case 'send': {
        const { media, sent } = hotData;
        if (!media.length) return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
📭 *Collection Empty*
🚫 No media available in hot collection
━━━━━━━━━━━━━━━━━━
💡 Add media first using:
   hot22 add [reply to media]
━━━━━━━━━━━━━━━━━━
        `.trim());

        const remaining = media.filter(id => !sent.includes(id));
        if (!remaining.length) {
          hotData.sent = [];
          await writeHotData(hotData);
          return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🔄 *Collection Refreshed*
✅ All media has been reset
🔥 Ready to send again
━━━━━━━━━━━━━━━━━━
📊 Total Media: ${media.length}
💾 Resetting sent history...
━━━━━━━━━━━━━━━━━━
        `.trim());
        }

        // Show processing message
        await message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🔥 *Preparing Hot Media...*
🎲 Selecting from ${remaining.length} unsent items
⏳ Please wait while we fetch content...
━━━━━━━━━━━━━━━━━━
        `.trim());

        const chosen = remaining[Math.floor(Math.random() * remaining.length)];

        try {
          const stream = await drive.getFile(chosen, 'stream', true);
          await message.reply({
            body: `
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
🎁 *Hot Media Incoming!*
🔥 Enjoy this exclusive content
💾 Collection: ${media.length} items
📊 Remaining: ${remaining.length - 1}
━━━━━━━━━━━━━━━━━━
            `.trim(),
            attachment: [stream]
          });

          hotData.sent.push(chosen);
          await writeHotData(hotData);
        } catch (err) {
          console.error(err);
          return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
⚠️ *Delivery Failed!*
❌ Error retrieving media
🔧 Technical: ${err.message || 'Unknown error'}
━━━━━━━━━━━━━━━━━━
💡 Possible solutions:
• Try again later
• Contact admin support
━━━━━━━━━━━━━━━━━━
          `.trim());
        }

        break;
      }

      default:
        return message.reply(`
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐇𝐎𝐓𝟐𝟐* ⚛️☣️
━━━━━━━━━━━━━━━━━━
ℹ️ *Command Menu*
━━━━━━━━━━━━━━━━━━
🔹 hot22 add
   - Reply to media to add to collection
   
🔹 hot22 send
   - Send random unsent media
━━━━━━━━━━━━━━━━━━
📊 Current Stats:
   • Total Media: ${hotData.media.length}
   • Unsent Media: ${hotData.media.filter(id => !hotData.sent.includes(id)).length}
━━━━━━━━━━━━━━━━━━
💾 Storage: Secure Encrypted Drive
🔧 Version: v2.4
        `.trim());
    }
  }
};
