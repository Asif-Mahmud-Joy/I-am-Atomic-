const axios = require("axios");
const tabs = require("ultimate-guitar");

module.exports = {
  config: {
    name: "chords",
    aliases: ["atomicchords", "guitarchords"],
    version: "3.0",
    author: "Asif Mahmud | ☣️ ATOMIC",
    shortDescription: {
      en: "☢️ Quantum Guitar Chords"
    },
    longDescription: {
      en: "⚛️ Find guitar chords with atomic precision"
    },
    category: "💎 Premium Media",
    guide: {
      en: "{pn} <song title>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const songName = args.join(" ");
    if (!songName) {
      return api.sendMessage({
        body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n⚠️ | Quantum signature missing\n🔸 | Usage: chords <song title>"
      }, event.threadID);
    }

    // Send processing message
    const processingMsg = await api.sendMessage({
      body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n⚙️ | Scanning quantum database\n▰▱▱▱▱▱▱▱ 20%"
    }, event.threadID);

    try {
      // Stage 1: Try PopCat API
      await api.sendMessage({
        body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n⚡ | Accessing primary chord matrix\n▰▰▰▱▱▱▱▱ 40%",
        messageID: processingMsg.messageID
      }, event.threadID);

      let result = null;
      
      try {
        const popcatRes = await axios.get(`https://api.popcat.xyz/chords?song=${encodeURIComponent(songName)}`, {
          timeout: 5000
        });

        if (popcatRes.data && popcatRes.data.chords) {
          result = {
            source: "🎸 PopCat API",
            artist: popcatRes.data.artist || "Unknown Artist",
            title: popcatRes.data.title || songName,
            chords: popcatRes.data.chords
          };
        }
      } catch (popcatErr) {
        // Proceed to next source
      }

      // Stage 2: Try Ultimate Guitar if first source failed
      if (!result) {
        await api.sendMessage({
          body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n🌀 | Accessing secondary chord repository\n▰▰▰▰▰▱▱▱ 70%",
          messageID: processingMsg.messageID
        }, event.threadID);

        try {
          const ugRes = await tabs.firstData(songName);
          if (ugRes) {
            result = {
              source: "🎸 Ultimate Guitar",
              artist: ugRes.artist || "Unknown Artist",
              title: ugRes.title || songName,
              chords: ugRes.chords,
              type: ugRes.type,
              key: ugRes.key
            };
          }
        } catch (ugErr) {
          // Proceed to error
        }
      }

      // Final stage
      await api.sendMessage({
        body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n✅ | Quantum analysis complete\n▰▰▰▰▰▰▰▰ 100%",
        messageID: processingMsg.messageID
      }, event.threadID);

      if (!result) {
        return api.sendMessage({
          body: `☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum signature not found\n🔸 | No chords found for "${songName}"`
        }, event.threadID);
      }

      // Format the result
      const formattedResult = this.formatChordResult(result);

      // Send final result
      await new Promise(resolve => setTimeout(resolve, 1000));
      await api.sendMessage(formattedResult, event.threadID);

      // Cleanup
      api.unsend(processingMsg.messageID);

    } catch (err) {
      console.error("☢️ ATOMIC CHORDS ERROR:", err);
      await api.sendMessage({
        body: "☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━\n❌ | Quantum disturbance detected\n🔸 | " + (err.message || "Try again later")
      }, event.threadID);
    }
  },

  formatChordResult: function(data) {
    const base = `☣️ ATOMIC CHORDS SYSTEM\n━━━━━━━━━━━━━━
🎤 Artist: ${data.artist}
🎵 Title: ${data.title}
🔧 Source: ${data.source}`;

    let details = "";
    if (data.type) details += `\n📝 Type: ${data.type}`;
    if (data.key) details += `\n🎹 Key: ${data.key}`;

    const chordsSection = `\n\n🎸 Chords:
┌───────────────────────
${this.formatChords(data.chords)}
└───────────────────────
⚛️ Quantum Chord System • Perfect Harmony`;

    return {
      body: base + details + chordsSection,
      mentions: []
    };
  },

  formatChords: function(chords) {
    // Format chords for better readability
    const maxLineLength = 50;
    const lines = [];
    let currentLine = "";
    
    chords.split(/\s+/).forEach(word => {
      if ((currentLine + word).length > maxLineLength) {
        lines.push(currentLine.trim());
        currentLine = "";
      }
      currentLine += word + " ";
    });
    
    if (currentLine.trim() !== "") {
      lines.push(currentLine.trim());
    }
    
    return lines.map(line => `│ ${line}`).join("\n");
  }
};
