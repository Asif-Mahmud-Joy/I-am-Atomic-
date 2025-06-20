const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");
const { createReadStream } = require("fs");

// ⚛️ Atomic Constants
const ATOMIC_CACHE = path.join(__dirname, "atomic_audio_cache");

// 🔊 Atomic Audio Library
const ATOMIC_AUDIO = {
  women: {
    message: "☕「 Women 」",
    file: "women.mp3",
    url: "https://files.catbox.moe/3ifzpn.mp3",
    emoji: "👩‍🦰"
  },
  yamate: {
    message: "🥵「 Yamate 」",
    file: "yamate.mp3",
    url: "https://files.catbox.moe/07hmj9.mp3",
    emoji: "🇯🇵"
  },
  dazai: {
    message: "😌「 ahhh~ 」",
    file: "Dazai.mp3",
    url: "https://files.catbox.moe/q83azf.mp3",
    emoji: "🎎"
  },
  ara: {
    message: "😉「 ara ara 」",
    file: "ara.mp3",
    url: "https://files.catbox.moe/kl3pbc.mp3",
    emoji: "😏"
  },
  "good night": {
    message: "🌉「 Good Night 」",
    file: "night.mp3",
    url: "https://files.catbox.moe/15vs8u.mp3",
    emoji: "🌙"
  },
  sus: {
    message: "🦎「 sus 」",
    file: "sus.mp3",
    url: "https://files.catbox.moe/0xpi2z.mp3",
    emoji: "🕵️"
  },
  "good morning": {
    message: "🌄「 Good Morning 」",
    file: "gm.mp3",
    url: "https://files.catbox.moe/d79j8g.mp3",
    emoji: "☀️"
  },
  yourmom: {
    message: "😏「 Bujis ki nai? 」",
    file: "yourmom.mp3",
    url: "https://files.catbox.moe/hpc70p.mp3",
    emoji: "👩‍👦"
  },
  machikney: {
    message: "🔥「 Machikney 」",
    file: "machikney.mp3",
    url: "https://files.catbox.moe/c1grxy.mp3",
    emoji: "💥"
  },
  randi: {
    message: "😡「 Randi ko Chora 」",
    file: "randi.mp3",
    url: "https://files.catbox.moe/czk9ij.mp3",
    emoji: "⚠️"
  },
  sachiin: {
    message: "🌈「 GAYY 」",
    file: "sachiin.mp3",
    url: "https://files.catbox.moe/4n7jzq.mp3",
    emoji: "🏳️‍🌈"
  },
  omg: {
    message: "😳「 OMG WoW 」",
    file: "omg.mp3",
    url: "https://files.catbox.moe/0q5jru.mp3",
    emoji: "✨"
  },
  help: {
    message: "🎧 Available Audio Commands:",
    emoji: "📜"
  }
};

// ✨ UI Components
const AtomicUI = {
  header: "╔══════════════════════════════╗\n║   🔊 ATOMIC AUDIO SYSTEM    ║\n╚══════════════════════════════╝",
  divider: "▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬",
  
  formatAudioList() {
    let list = "🎧 Available Audio Triggers:\n\n";
    Object.entries(ATOMIC_AUDIO).forEach(([trigger, { emoji }]) => {
      if (trigger !== "help") {
        list += `▸ ${emoji} ${trigger}\n`;
      }
    });
    return `${this.header}\n${list}\n${this.divider}\n✨ Type any trigger to play audio!`;
  }
};

// 🔧 Audio Manager
class AtomicAudioManager {
  static async ensureCache() {
    try {
      await fs.ensureDir(ATOMIC_CACHE);
      return true;
    } catch (err) {
      console.error("☢️ [ATOMIC CACHE ERROR]", err);
      return false;
    }
  }

  static async downloadAudio(url, filePath) {
    try {
      const response = await axios.get(url, { responseType: "arraybuffer" });
      await fs.writeFile(filePath, Buffer.from(response.data));
      return true;
    } catch (err) {
      console.error("☢️ [ATOMIC DOWNLOAD ERROR]", err);
      return false;
    }
  }

  static async getAudio(keyword) {
    if (!ATOMIC_AUDIO[keyword]) return null;

    const audio = ATOMIC_AUDIO[keyword];
    const filePath = path.join(ATOMIC_CACHE, audio.file);

    try {
      if (!(await fs.pathExists(filePath))) {
        if (!(await this.downloadAudio(audio.url, filePath))) {
          return null;
        }
      }
      return { ...audio, filePath };
    } catch (err) {
      console.error("☢️ [ATOMIC AUDIO ERROR]", err);
      return null;
    }
  }
}

module.exports = {
  config: {
    name: "audio_new",
    version: "3.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 1,
    role: 0,
    shortDescription: "🔊 Play atomic audio on trigger",
    longDescription: "⚛️ Play specific sounds when triggers are typed - atomic audio system",
    category: "atomic",
    guide: {
      en: "Just type any audio trigger to play sound"
    }
  },

  onStart: async () => {
    await AtomicAudioManager.ensureCache();
  },

  onChat: async function ({ event, message, getLang }) {
    try {
      if (!event.body) return;

      // ⏳ Always show typing indicator
      await message.replyTyping();

      const input = event.body.toLowerCase().trim();
      
      // Handle help command
      if (input === "audiohelp") {
        return message.reply(AtomicUI.formatAudioList());
      }

      // Handle audio triggers
      const audio = await AtomicAudioManager.getAudio(input);
      if (!audio) return;

      return message.reply({
        body: `⚛️ ${audio.message}`,
        attachment: createReadStream(audio.filePath)
      });
    } catch (error) {
      console.error("☢️ [ATOMIC CHAT ERROR]", error);
      return message.reply({
        body: "⚠️ Audio system error! Please try again later."
      });
    }
  },
};
