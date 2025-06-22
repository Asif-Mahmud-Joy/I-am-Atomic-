const moment = require('moment-timezone');
const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

module.exports = {
  config: {
    name: "info",
    aliases: ["atomic-info", "botstats", "about"],
    version: "3.1.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Get Atomic bot's premium information"
    },
    longDescription: {
      en: "⚡ Displays detailed technical specifications and creator information about Atomic bot"
    },
    category: "Information",
    guide: {
      en: "{pn}"
    }
  },

  onStart: async function ({ message }) {
    await this.sendAtomicInfo(message);
  },

  onChat: async function ({ event, message }) {
    const triggers = ["info", "atomic", "bot info", "about bot"].map(t => t.toLowerCase());
    if (event.body && triggers.includes(event.body.toLowerCase())) {
      await this.sendAtomicInfo(message);
    }
  },

  sendAtomicInfo: async function (message) {
    try {
      // ⚛️ Atomic Bot Information
      const botInfo = {
        name: "☢️ 𝗔𝘁𝗼𝗺𝗶𝗰 𝗕𝗼𝘁",
        version: "3.1.0",
        status: "🟢 𝗢𝗻𝗹𝗶𝗻𝗲 | 𝟮𝟰/𝟳",
        features: [
          "𝟭𝟬𝟬+ 𝗔𝗱𝘃𝗮𝗻𝗰𝗲𝗱 𝗖𝗼𝗺𝗺𝗮𝗻𝗱𝘀",
          "𝗔𝗜-𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲𝘀",
          "𝗠𝘂𝗹𝘁𝗶-𝗣𝘂𝗿𝗽𝗼𝘀𝗲 𝗙𝘂𝗻𝗰𝘁𝗶𝗼𝗻𝗮𝗹𝗶𝘁𝘆",
          "𝗣𝗿𝗲𝗺𝗶𝘂𝗺 𝗦𝗲𝗰𝘂𝗿𝗶𝘁𝘆"
        ],
        specs: {
          responseTime: "<500ms",
          uptimeAccuracy: "99.98%",
          compatibility: "All Platforms"
        }
      };

      // 🎩 Creator Information
      const creatorInfo = {
        name: "𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱",
        social: {
          facebook: "https://www.facebook.com/share/1HPjorq8ce/",
          instagram: "https://instagram.com/asifmahamud2023",
          github: "https://github.com/AsifMahamud"
        },
        status: "💻 𝗦𝗲𝗻𝗶𝗼𝗿 𝗗𝗲𝘃𝗲𝗹𝗼𝗽𝗲𝗿",
        quote: "𝗖𝗼𝗱𝗲 𝗶𝘀 𝗽𝗼𝗲𝘁𝗿𝘆 𝗶𝗻 𝗺𝗼𝘁𝗶𝗼𝗻"
      };

      // ⏱️ System Information
      const now = moment().tz('Asia/Dhaka');
      const systemInfo = {
        time: now.format('h:mm:ss A'),
        date: now.format('MMMM Do YYYY'),
        uptime: this.formatUptime(process.uptime()),
        performance: `🚀 ${Math.floor(Math.random() * 100) + 80}% Efficiency`
      };

      // 🖼️ Generate the information display
      const infoDisplay = this.generateAtomicDisplay(botInfo, creatorInfo, systemInfo);

      // 🎥 Get media (video or fallback image)
      const mediaAttachment = await this.getAtomicMedia();

      await message.reply({
        body: infoDisplay,
        attachment: mediaAttachment
      });

    } catch (err) {
      console.error("[ATOMIC INFO ERROR]", err);
      message.reply("⚠️ Quantum fluctuation detected! Try again later.");
    }
  },

  formatUptime: function (seconds) {
    const days = Math.floor(seconds / (60 * 60 * 24));
    const hours = Math.floor((seconds % (60 * 60 * 24)) / (60 * 60));
    const minutes = Math.floor((seconds % (60 * 60)) / 60);
    const secs = Math.floor(seconds % 60);
    return `⏳ ${days}d ${hours}h ${minutes}m ${secs}s`;
  },

  generateAtomicDisplay: function (bot, creator, system) {
    return `
☢️・。・゜✭・.・✫・゜・。・☢️・。・゜✭・.・✫・゜・。・☢️

                𝗔𝗧𝗢𝗠𝗜𝗖 𝗕𝗢𝗧 𝗩${bot.version}

☢️・。・゜✭・.・✫・゜・。・☢️・。・゜✭・.・✫・゜・。・☢️

⚛️ 𝗕𝗢𝗧 𝗦𝗣𝗘𝗖𝗜𝗙𝗜𝗖𝗔𝗧𝗜𝗢𝗡𝗦:
▸ 𝗡𝗮𝗺𝗲: ${bot.name}
▸ 𝗦𝘁𝗮𝘁𝘂𝘀: ${bot.status}
▸ 𝗥𝗲𝘀𝗽𝗼𝗻𝘀𝗲 𝗧𝗶𝗺𝗲: ${bot.specs.responseTime}
▸ 𝗨𝗽𝘁𝗶𝗺𝗲 𝗔𝗰𝗰𝘂𝗿𝗮𝗰𝘆: ${bot.specs.uptimeAccuracy}

✨ 𝗙𝗘𝗔𝗧𝗨𝗥𝗘𝗦:
${bot.features.map(f => `▸ ${f}`).join('\n')}

⏱️ 𝗦𝗬𝗦𝗧𝗘𝗠 𝗦𝗧𝗔𝗧𝗨𝗦:
▸ 𝗖𝘂𝗿𝗿𝗲𝗻𝘁 𝗧𝗶𝗺𝗲: ${system.time}
▸ 𝗗𝗮𝘁𝗲: ${system.date}
▸ 𝗕𝗼𝘁 𝗨𝗽𝘁𝗶𝗺𝗲: ${system.uptime}
▸ 𝗣𝗲𝗿𝗳𝗼𝗿𝗺𝗮𝗻𝗰𝗲: ${system.performance}

👨‍💻 𝗖𝗥𝗘𝗔𝗧𝗢𝗥 𝗜𝗡𝗙𝗢:
▸ 𝗡𝗮𝗺𝗲: ${creator.name}
▸ 𝗦𝘁𝗮𝘁𝘂𝘀: ${creator.status}
▸ 𝗙𝗮𝗰𝗲𝗯𝗼𝗼𝗸: ${creator.social.facebook}
▸ 𝗜𝗻𝘀𝘁𝗮𝗴𝗿𝗮𝗺: ${creator.social.instagram}
▸ 𝗚𝗶𝘁𝗛𝘂𝗯: ${creator.social.github}

"${creator.quote}"

☢️・。・゜✭・.・✫・゜・。・☢️・。・゜✭・.・✫・゜・。・☢️
    `;
  },

  getAtomicMedia: async function () {
    const mediaOptions = [
      {
        type: "video",
        urls: [
          "https://files.catbox.moe/op5iay.mp4"
        ]
      },
      {
        type: "image",
        urls: [
          "https://files.catbox.moe/e7bozl.jpg"
        ]
      }
    ];

    for (const mediaType of mediaOptions) {
      for (const url of mediaType.urls) {
        try {
          const response = await axios.get(url, { responseType: 'stream' });
          const ext = path.extname(url) || (mediaType.type === 'video' ? '.mp4' : '.jpg');
          const tempPath = path.join(__dirname, 'cache', `atomic_media${ext}`);
          
          await new Promise((resolve, reject) => {
            const writer = fs.createWriteStream(tempPath);
            response.data.pipe(writer);
            writer.on('finish', resolve);
            writer.on('error', reject);
          });

          return fs.createReadStream(tempPath);
        } catch (err) {
          continue;
        }
      }
    }

    return null;
  }
};
