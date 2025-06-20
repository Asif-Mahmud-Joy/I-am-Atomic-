const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "ownerinfo",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    role: 0,
    shortDescription: "☣𝐀𝐓𝐎𝐌𝐈𝐂⚛ Owner Information",
    longDescription: "Exclusive owner details with premium animation",
    category: "admin",
    guide: "{pn}"
  },

  onStart: async function ({ api, event }) {
    try {
      // Typing animation simulation
      await api.sendMessageTyping(event.threadID);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Owner information
      const owner = {
        name: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
        gender: 'Male ♂️',
        age: '18±',
        height: '5+ft 📏',
        choice: 'Islam ☪️',
        nick: '𝐉𝐚𝐦𝐚𝐢',
        fb: 'https://www.facebook.com/share/1HPjorq8ce/',
        bot: '☣𝐀𝐓𝐎𝐌𝐈𝐂⚛',
        uid: '61571630409265',
        skills: 'JavaScript, AI Development, System Architecture',
        status: 'Premium Developer ⚡'
      };

      // Download video
      const videoUrl = 'https://files.catbox.moe/pm6rfq.mp4';
      const tmpFolder = path.join(__dirname, 'tmp');
      if (!fs.existsSync(tmpFolder)) fs.mkdirSync(tmpFolder);
      
      await api.sendMessage("☣️⚛️ Downloading premium content...", event.threadID);
      
      const videoBuffer = await axios.get(videoUrl, { 
        responseType: 'arraybuffer',
        onDownloadProgress: progressEvent => {
          const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          console.log(`Download progress: ${percent}%`);
        }
      });
      
      const videoPath = path.join(tmpFolder, 'owner_video.mp4');
      fs.writeFileSync(videoPath, Buffer.from(videoBuffer.data, 'binary'));

      // Current time
      const now = new Date();
      const options = {
        timeZone: 'Asia/Dhaka',
        hour12: true,
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      };
      const timestamp = now.toLocaleString('en-BD', options);

      // Atomic-styled message
      const message = `
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐎𝐖𝐍𝐄𝐑 𝐈𝐍𝐅𝐎* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━━━━━

⚡ *𝐏𝐄𝐑𝐒𝐎𝐍𝐀𝐋 𝐃𝐄𝐓𝐀𝐈𝐋𝐒*
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
📛 𝗡𝗮𝗺𝗲 » ${owner.name}
🚹 𝗚𝗲𝗻𝗱𝗲𝗿 » ${owner.gender}
🎂 𝗔𝗴𝗲 » ${owner.age}
📏 𝗛𝗲𝗶𝗴𝗵𝘁 » ${owner.height}
🐾 𝗡𝗶𝗰𝗸 » ${owner.nick}
💫 𝗖𝗵𝗼𝗶𝗰𝗲 » ${owner.choice}
💻 𝗦𝗸𝗶𝗹𝗹𝘀 » ${owner.skills}
🏆 𝗦𝘁𝗮𝘁𝘂𝘀 » ${owner.status}

⚡ *𝐒𝐎𝐂𝐈𝐀𝐋 & 𝐒𝐘𝐒𝐓𝐄𝐌*
▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰▰
🤖 𝗕𝗼𝘁 » ${owner.bot}
🔗 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸 » ${owner.fb}
🆔 𝗨𝗜𝗗 » ${owner.uid}
🕓 𝗧𝗶𝗺𝗲𝘀𝘁𝗮𝗺𝗽 » ${timestamp}

━━━━━━━━━━━━━━━━━━━━━━━━━
✨ "Stay Smoke-tastic! Bot powered by your jamai 😎"
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐒𝐘𝐒𝐓𝐄𝐌𝐒* ⚛️☣️
      `;

      await api.sendMessage({
        body: message,
        attachment: fs.createReadStream(videoPath)
      }, event.threadID, event.messageID);

    } catch (e) {
      console.log('☣️⚛️ Owner info error:', e.message);
      
      const errorMessage = `
☣️⚛️ *𝐀𝐓𝐎𝐌𝐈𝐂 𝐄𝐑𝐑𝐎𝐑* ⚛️☣️
━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ System encountered an issue!
🔧 Error: ${e.message || 'Unknown error'}

💡 Solutions:
• Check your internet connection
• Try again later
• Contact system administrator
━━━━━━━━━━━━━━━━━━━━━━━━━
⚙️ Status: Service disruption
      `.trim();
      
      return api.sendMessage(errorMessage, event.threadID);
    }
  }
};
