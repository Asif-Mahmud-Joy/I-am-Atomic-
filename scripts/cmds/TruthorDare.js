const fs = require('fs');
const axios = require('axios');

module.exports = {
  config: {
    name: "truthordare",
    aliases: ["td", "atomictd"],
    version: "3.0",
    author: "Asif Mahmud",
    countDown: 3,
    role: 0,
    shortDescription: "Atomic Truth or Dare",
    longDescription: "Play Truth or Dare with quantum-inspired questions and atomic design",
    category: "⚡ Science Games",
    guide: {
      en: "{pn} [truth/dare]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: type => `⚛️ ${type === 'truth' ? '𝐀𝐓𝐎𝐌𝐈𝐂 𝐓𝐑𝐔𝐓𝐇' : '𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐀𝐑𝐄'} ⚛️`,
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: {
        truth: ["🟢", "🔍", "🧪", "⚗️", "🔬"],
        dare: ["🔴", "💥", "⚡", "🌪️", "💣"]
      }
    };
    // ================================================================================== //

    const { threadID, messageID } = event;
    const [choice] = args;

    if (!choice || !['truth', 'dare'].includes(choice.toLowerCase())) {
      return message.reply(`⚡ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 ⚡\n» Use "${global.GoatBot.config.prefix}td truth" for atomic truth\n» Use "${global.GoatBot.config.prefix}td dare" for quantum dare`);
    }

    const type = choice.toLowerCase();
    const typingEmojis = design.emojis[type];
    let currentEmojiIndex = 0;

    // Show atomic reaction sequence
    const reactionInterval = setInterval(() => {
      api.setMessageReaction(typingEmojis[currentEmojiIndex], messageID, () => {});
      currentEmojiIndex = (currentEmojiIndex + 1) % typingEmojis.length;
    }, 800);

    try {
      let question;
      
      // Try API first (with Bangla support)
      try {
        const apiUrl = `https://api.truthordarebot.xyz/v1/${type}?lang=bn`;
        const response = await axios.get(apiUrl, { timeout: 10000 });
        question = response.data.question;
      } 
      // Fallback to local database
      catch (apiError) {
        const filePath = `${__dirname}/assist_json/${type === 'truth' ? 'TRUTHQN' : 'DAREQN'}.json`;
        const questions = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        question = questions[Math.floor(Math.random() * questions.length)];
      }

      // Build atomic response
      const formattedResponse = [
        design.header(type),
        design.separator,
        `${type === 'truth' ? '🟢' : '🔴'} ${question}`,
        design.separator,
        design.footer
      ].join("\n");

      // Send response
      message.reply(formattedResponse);
    } catch (error) {
      console.error("Atomic Error:", error);
      message.reply(`☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄 ☢️\nReality collapsed while generating your ${type} question!`);
    } finally {
      clearInterval(reactionInterval);
      api.setMessageReaction("⚛️", messageID, () => {}, true);
    }
  }
};
