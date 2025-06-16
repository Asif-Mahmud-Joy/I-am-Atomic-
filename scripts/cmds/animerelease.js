const axios = require('axios');
const moment = require('moment-timezone');

const Timezone = 'Asia/Kathmandu';
const API_URL = `https://anisched--marok85067.repl.co/?timezone=${Timezone}`;

module.exports = {
  config: {
    name: 'animerelease',
    aliases: ['release', 'newepisode'],
    version: '8.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    role: 0,
    category: 'anime',
    shortDescription: {
      en: 'Latest anime episode release times (real working API)'
    },
    longDescription: {
      en: 'Fetches anime release info using real-time working API with proper fallback and formatting.'
    },
    guide: {
      en: '{pn}'
    }
  },

  onStart: async function ({ api, event }) {
    try {
      const res = await axios.get(API_URL);

      if (!res.data || !Array.isArray(res.data)) {
        throw new Error('Invalid data format from API.');
      }

      const releases = res.data;
      const now = moment().tz(Timezone);

      const upcoming = [];
      const updated = [];

      for (const item of releases) {
        const { animeTitle, episode, time, status } = item;
        if (!animeTitle || !episode || !time || !status) continue;

        const formattedTime = moment(time, 'h:mma');
        if (status === 'upcoming') upcoming.push(item);
        else if (status === 'already updated') updated.push(item);
      }

      let msg = `🕒 Current Time (${Timezone}): ${now.format('h:mma')}

`;

      if (upcoming.length > 0) {
        msg += '📅 ⤵️ *Upcoming Anime Episodes:*
';
        for (const a of upcoming.sort((a, b) => moment(a.time, 'h:mma') - moment(b.time, 'h:mma'))) {
          msg += `🎬 ${a.animeTitle} Ep${a.episode} at ${a.time}
`;
        }
        msg += '\n';
      }

      if (updated.length > 0) {
        msg += '✅ ⤵️ *Recently Updated Episodes:*
';
        for (const a of updated.sort((a, b) => moment(a.time, 'h:mma') - moment(b.time, 'h:mma'))) {
          msg += `🎞️ ${a.animeTitle} Ep${a.episode} at ${a.time}
`;
        }
      }

      if (upcoming.length === 0 && updated.length === 0) {
        msg += '😔 Ajke kono release nai.';
      }

      await api.sendMessage(msg.trim(), event.threadID);

    } catch (err) {
      console.error('❌ Anime release fetch error:', err.message);
      return api.sendMessage('❌ Problem hoise anime release data nite giye. Please try again porer somoy.', event.threadID);
    }
  }
};
