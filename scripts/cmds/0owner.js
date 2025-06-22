const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "ownerinfo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "☣️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎 ⚛️",
    longDescription: "Exclusive owner profile with premium animation and atomic-themed design",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      // Typing indicator for premium feel
      await api.sendMessageTyping(event.threadID);
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Owner information (enhanced)
      const owner = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        title: '⚡ Premium Developer',
        gender: '♂️ Male',
        age: '18±',
        height: '5\'8" (173cm)',
        lifestyle: '🕋 Islamic Values',
        hobbies: '🎧 Music | 🎮 Gaming | 📚 AI Research',
        nickname: '🔥 Jamai 🔥',
        contact: '🌐 https://www.facebook.com/share/1HPjorq8ce/',
        skills: 'JavaScript | Python | AI Architecture',
        philosophy: '"Code with purpose, build with passion"'
      };

      // Download premium video
      const videoUrl = 'https://files.catbox.moe/pm6rfq.mp4';
      const tmpFolder = path.join(__dirname, 'tmp');
      await fs.ensureDir(tmpFolder);
      
      const videoPath = path.join(tmpFolder, 'atomic_owner.mp4');
      const videoResponse = await axios.get(videoUrl, {
        responseType: 'arraybuffer',
        onDownloadProgress: progress => {
          const percent = Math.floor((progress.loaded / progress.total) * 100);
          console.log(`⬇️ Downloading: ${percent}%`);
        }
      });
      await fs.writeFile(videoPath, Buffer.from(videoResponse.data));

      // Current timestamp
      const now = new Date();
      const timestamp = now.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      // Atomic-styled message template
      const message = `
☣️⚛️ ━━━━━━━━━━━━━━━━━━━━━━━ ⚛️☣️
          𝐀𝐓𝐎𝐌𝐈𝐂 𝐎𝐖𝐍𝐄𝐑 𝐏𝐑𝐎𝐅𝐈𝐋𝐄
☣️⚛️ ━━━━━━━━━━━━━━━━━━━━━━━ ⚛️☣️

⚡ 𝐂𝐎𝐑𝐄 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
⌬ 𝗡𝗮𝗺𝗲 » ${owner.name}
⌬ 𝗧𝗶𝘁𝗹𝗲 » ${owner.title}
⌬ 𝗔𝗴𝗲 » ${owner.age}
⌬ 𝗚𝗲𝗻𝗱𝗲𝗿 » ${owner.gender}
⌬ 𝗛𝗲𝗶𝗴𝗵𝘁 » ${owner.height}
⌬ 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲 » ${owner.nickname}

🌌 𝐋𝐈𝐅𝐄𝐒𝐓𝐘𝐋𝐄 & 𝐒𝐊𝐈𝐋𝐋𝐒
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
⌬ 𝗟𝗶𝗳𝗲𝘀𝘁𝘆𝗹𝗲 » ${owner.lifestyle}
⌬ 𝗛𝗼𝗯𝗯𝗶𝗲𝘀 » ${owner.hobbies}
⌬ 𝗦𝗸𝗶𝗹𝗹𝘀 » ${owner.skills}
⌬ 𝗣𝗵𝗶𝗹𝗼𝘀𝗼𝗽𝗵𝘆 » ${owner.philosophy}

🔗 𝐂𝐎𝐍𝐓𝐈𝐑𝐀𝐂𝐓
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
⌬ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 » ${owner.contact}
⌬ 𝗧𝗶𝗺𝗲𝘀𝘁𝗮𝗺𝗽 » ${timestamp}

☣️⚛️ ━━━━━━━━━━━━━━━━━━━━━━━ ⚛️☣️
   "𝐈𝐧𝐧𝐨𝐯𝐚𝐭𝐢𝐨𝐧 𝐌𝐞𝐞𝐭𝐬 𝐄𝐥𝐞𝐠𝐚𝐧𝐜𝐞"
☣️⚛️ ━━━━━━━━━━━━━━━━━━━━━━━ ⚛️☣️
      `;

      // Send with video attachment
      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, () => fs.unlink(videoPath));

      // Premium reaction
      api.setMessageReaction('⚛️', event.messageID, (err) => {}, true);

    } catch (error) {
      console.error('☣️ Atomic System Error:', error);
      
      const errorTemplate = `
☣️⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌 𝐀𝐋𝐄𝐑𝐓 ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ Error Code: ATOMIC_OWNER_404
🔧 Details: ${error.message}

🛠️ Recommended Actions:
• Refresh and try again
• Check network connection
• Contact system admin
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Timestamp: ${new Date().toISOString()}
      `;
      
      return api.sendMessage(errorTemplate, event.threadID);
    }
  }
};
