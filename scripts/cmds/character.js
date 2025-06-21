const axios = require('axios');

module.exports = {
  config: {
    name: "character",
    aliases: ["atomiccharacter", "ac"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "☢️ Get Atomic Character Data"
    },
    longDescription: {
      en: "⚛️ Search and get premium anime character information with quantum precision"
    },
    category: "💎 Premium Anime",
    guide: {
      en: "{pn} <character name>"
    }
  },

  onStart: async function ({ message, args, api, event }) {
    const name = args.join(" ");
    if (!name) {
      return message.reply({
        body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Quantum signature missing\n🔸 | Please enter character name"
      });
    }

    // Send processing message with typing animation
    const processingMsg = await message.reply({
      body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Scanning quantum database\n▰▱▱▱▱▱▱▱ 20%"
    });

    try {
      const BASE_URL = `https://api.jikan.moe/v4/characters?q=${encodeURIComponent(name)}&limit=1&fields=about,name,nicknames,images,mal_id,url,anime,voices`;
      
      // Simulate scanning process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await api.sendMessage({
        body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Analyzing character particles\n▰▰▰▱▱▱▱▱ 50%",
        messageID: processingMsg.messageID
      }, event.threadID);

      const response = await axios.get(BASE_URL);
      const data = response.data.data[0];

      if (!data) {
        return api.sendMessage({
          body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum signature not found\n🔸 | Character not in database",
          messageID: processingMsg.messageID
        }, event.threadID);
      }

      // Prepare data
      const characterName = data.name || "Unknown";
      const nativeName = data.name_kanji || "N/A";
      const nicknames = data.nicknames?.join(", ") || "None";
      const description = data.about ? this.truncateText(data.about.replace(/\n/g, " "), 800) : "No bio available.";
      const image = data.images?.jpg?.image_url;
      const malUrl = data.url;
      
      // Get anime appearances
      const animeAppearances = data.anime?.slice(0, 3).map(a => 
        `• ${a.anime.title} (${a.role})`
      ).join("\n") || "None";

      // Get voice actors
      const voiceActors = data.voices?.slice(0, 3).map(v => 
        `• ${v.person.name} (${v.language})`
      ).join("\n") || "None";

      // Update progress
      await new Promise(resolve => setTimeout(resolve, 1500));
      await api.sendMessage({
        body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n✅ | Quantum analysis complete\n▰▰▰▰▰▰▰▰ 100%",
        messageID: processingMsg.messageID
      }, event.threadID);

      // Prepare final message
      const msg = {
        body: `☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━
🎌 𝗖𝗵𝗮𝗿𝗮𝗰𝘁𝗲𝗿 𝗜𝗻𝗳𝗼
━━━━━━━━━━━━━━
🧬 Name: ${characterName}
🗾 Native: ${nativeName}
🎭 Nicknames: ${nicknames}

📺 Appearances:
${animeAppearances}

🎙️ Voice Actors:
${voiceActors}

📖 Description:
${description}

🔗 More Info: ${malUrl}
━━━━━━━━━━━━━━
⚛️ Atomic Character System • Quantum Precision`
      };

      if (image) {
        msg.attachment = await global.utils.getStreamFromURL(image);
      }

      // Send final result
      await new Promise(resolve => setTimeout(resolve, 1000));
      await message.reply(msg);
      
      // Cleanup
      api.unsend(processingMsg.messageID);

    } catch (err) {
      console.error("☢️ ATOMIC CHARACTER ERROR:", err);
      await message.reply({
        body: "☣️ ATOMIC CHARACTER SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum disturbance detected\n🔸 | " + (err.message || "Try again later")
      });
    }
  },

  truncateText: function(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }
};
