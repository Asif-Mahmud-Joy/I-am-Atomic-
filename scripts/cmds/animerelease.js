const axios = require('axios');
const moment = require('moment-timezone');

const Timezone = 'Asia/Kathmandu';
const API_URL = `https://anisched--marok85067.repl.co/?timezone=${Timezone}`;

module.exports = {
  config: {
    name: 'animerelease',
    aliases: ['release', 'newepisode'],
    version: '10.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 & KSHITIZ',
    role: 0,
    category: '🎭 Anime',
    shortDescription: {
      en: '✨ Track anime releases in real-time'
    },
    longDescription: {
      en: '📅 Get beautifully formatted anime release schedules with countdown timers'
    },
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event }) {
    // ========== ☣️ ATOMIC DESIGN SYSTEM ========== //
    const atomic = {
      loading: "📡 Connecting to anime database...",
      success: "✨ ANIME RELEASE SCHEDULE",
      error: "⚠️ Failed to fetch release data",
      noReleases: "📭 No anime releases today",
      divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
      footer: `☣️ ATOMIC v10.0 | Timezone: ${Timezone}`
    };

    try {
      // Send initial loading message with typing animation
      const loadingMsg = await api.sendMessage(
        `⌛ ${atomic.loading}\n${atomic.divider}\n${atomic.footer}`,
        event.threadID
      );

      // Simulate processing animation
      const progressStages = [
        {text: "🔍 Retrieving release data...", delay: 1800},
        {text: "📊 Analyzing schedule...", delay: 1500},
        {text: "📅 Sorting upcoming episodes...", delay: 1200},
        {text: "✨ Applying ATOMIC design...", delay: 1000},
        {text: "✅ Finalizing report...", delay: 800}
      ];

      for (const [index, stage] of progressStages.entries()) {
        await new Promise(resolve => {
          // Simulate typing effect
          let typedText = "";
          let i = 0;
          const typingInterval = setInterval(() => {
            if (i < stage.text.length) {
              typedText += stage.text.charAt(i);
              api.editMessage(
                `${typedText}\n${atomic.divider}\n${Math.round((index + 1) * 20)}% complete...`,
                loadingMsg.messageID
              );
              i++;
            } else {
              clearInterval(typingInterval);
              setTimeout(resolve, stage.delay);
            }
          }, 50);
        });
      }

      // Fetch release data
      const res = await axios.get(API_URL, { timeout: 10000 });
      
      if (!res.data || !Array.isArray(res.data)) {
        await api.unsendMessage(loadingMsg.messageID);
        return api.sendMessage(
          `${atomic.error}\n${atomic.divider}\n${atomic.footer}`,
          event.threadID
        );
      }

      const releases = res.data;
      const now = moment().tz(Timezone);

      // Process releases
      const upcoming = [];
      const updated = [];

      for (const item of releases) {
        if (!item.animeTitle || !item.episode || !item.time || !item.status) continue;
        
        if (item.status === 'upcoming') {
          upcoming.push(item);
        } else if (item.status === 'already updated') {
          updated.push(item);
        }
      }

      // Sort releases
      upcoming.sort((a, b) => moment(a.time, 'h:mma').diff(moment(b.time, 'h:mma')));
      updated.sort((a, b) => moment(a.time, 'h:mma').diff(moment(b.time, 'h:mma')));

      // Build message with ATOMIC design
      let msg = `📅 ${atomic.success}\n${atomic.divider}\n\n`;
      msg += `⏰ Current Time: ${now.format('h:mma')}\n`;
      msg += `${atomic.divider}\n\n`;

      if (upcoming.length > 0) {
        msg += `⏳ ≡⊆ UPCOMING EPISODES ⊇≡\n\n`;
        for (const anime of upcoming) {
          const releaseTime = moment(anime.time, 'h:mma');
          const timeDiff = moment.duration(releaseTime.diff(now));
          const hoursLeft = Math.floor(timeDiff.asHours());
          const minutesLeft = Math.floor(timeDiff.asMinutes() % 60);
          
          msg += `🎬 𝗧𝗶𝘁𝗹𝗲: ${anime.animeTitle}\n`;
          msg += `📺 𝗘𝗽𝗶𝘀𝗼𝗱𝗲: ${anime.episode}\n`;
          msg += `⏱️ 𝗧𝗶𝗺𝗲: ${anime.time} `;
          
          // Add countdown indicator
          if (hoursLeft > 0 || minutesLeft > 0) {
            const countdownBar = createCountdownBar(hoursLeft, minutesLeft);
            msg += `\n⏳ 𝗖𝗼𝘂𝗻𝘁𝗱𝗼𝘄𝗻: ${hoursLeft}h ${minutesLeft}m\n`;
            msg += `${countdownBar}\n`;
          }
          
          msg += `${atomic.divider.substring(0, 25)}\n\n`;
        }
      }

      if (updated.length > 0) {
        msg += `✅ ≡⊆ RECENTLY RELEASED ⊇≡\n\n`;
        for (const anime of updated) {
          const releasedTime = moment(anime.time, 'h:mma');
          const timeAgo = moment.duration(now.diff(releasedTime));
          const hoursAgo = Math.floor(timeAgo.asHours());
          const minutesAgo = Math.floor(timeAgo.asMinutes() % 60);
          
          msg += `🎬 𝗧𝗶𝘁𝗹𝗲: ${anime.animeTitle}\n`;
          msg += `📺 𝗘𝗽𝗶𝘀𝗼𝗱𝗲: ${anime.episode}\n`;
          msg += `🕒 𝗥𝗲𝗹𝗲𝗮𝘀𝗲𝗱: ${anime.time} `;
          
          // Add time ago indicator
          if (hoursAgo > 0 || minutesAgo > 0) {
            msg += `(${hoursAgo > 0 ? hoursAgo + 'h ' : ''}${minutesAgo}m ago)\n`;
          }
          
          // Add sparkles for recently released
          if (hoursAgo < 1) {
            msg += `✨ 𝗡𝗘𝗪! ✨\n`;
          }
          
          msg += `${atomic.divider.substring(0, 25)}\n\n`;
        }
      }

      if (upcoming.length === 0 && updated.length === 0) {
        msg += `🌟 ${atomic.noReleases}\n\n`;
        msg += "✨ Check back tomorrow for new episodes!";
      }

      msg += `\n${atomic.divider}\n${atomic.footer}`;

      // Send final message
      await api.editMessage(msg, loadingMsg.messageID);

    } catch (err) {
      console.error('Anime Release Error:', err);
      api.sendMessage(
        `${atomic.error}\n${atomic.divider}\n` +
        `💡 Please try again later\n${atomic.footer}`,
        event.threadID
      );
    }
  }
};

function createCountdownBar(hours, minutes) {
  const totalMinutes = (hours * 60) + minutes;
  const maxBarLength = 20;
  const filledLength = Math.max(1, Math.floor(totalMinutes / (24*60) * maxBarLength));
  
  let bar = '▰'.repeat(filledLength);
  bar += '▱'.repeat(maxBarLength - filledLength);
  
  return `[${bar}]`;
}
