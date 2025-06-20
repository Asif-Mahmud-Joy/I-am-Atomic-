const axios = require('axios');

module.exports = {
  config: {
    name: 'bes2',
    version: '3.0',
    author: '𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝',
    role: 0,
    category: 'Ai-Chat',
    shortDescription: {
      en: 'Talk with besh',
      bn: 'বেশ এর সাথে গল্প করো'
    },
    longDescription: {
      en: 'Chat with besh your friendly gossip bot',
      bn: 'তোমার আড্ডাবাজ বন্ধুবেশ এর সাথে চ্যাট করো!'
    },
    guide: {
      en: '{pn}bes <your text>',
      bn: '{pn}bes <তোমার লেখা>'
    },
  },

  onStart: async function ({ api, event, args, usersData }) {
    try {
      const query = args.join(" ") || "hello";
      const { name } = (await usersData.get(event.senderID));

      if (query) {
        // Atomic processing reaction
        api.setMessageReaction("☢️", event.messageID, (err) => console.log(err), true);
        
        // Atomic processing message
        const processingMessage = await api.sendMessage(
          `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n\n⚛️ ATOMIC CORE PROCESSING...\n💠 QUERY: ${query}\n\n☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`,
          event.threadID
        );

        // OpenRouter API integration
        const response = await axios.post(
          "https://openrouter.ai/api/v1/chat/completions",
          {
            model: "meta-llama/llama-3.3-8b-instruct:free",
            messages: [{ role: "user", content: query }]
          },
          {
            headers: {
              "Authorization": "Bearer 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",
              "Content-Type": "application/json"
            }
          }
        );

        if (response.data?.choices?.[0]?.message?.content) {
          const trimmedMessage = response.data.choices[0].message.content.trim();
          api.setMessageReaction("⚛️", event.messageID, (err) => console.log(err), true);
          
          // Atomic formatted response
          await api.sendMessage(
            { 
              body: `☢️ ════ ATOMIC RESPONSE ════ ☢️\n\n⚛️ ${trimmedMessage}\n\n☣️ ────────────────\n💠 SYSTEM: v3.0 | ATOMIC CORE`
            }, 
            event.threadID, 
            event.messageID
          );
        } else {
          throw new Error(`ATOMIC PROCESSING FAILURE | INVALID RESPONSE STRUCTURE`);
        }

        await api.unsendMessage(processingMessage.messageID);
      }
    } catch (error) {
      console.error(`☣️ | ATOMIC ERROR: ${error.message}`);
      // Atomic error message
      const errorMessage = `☢️ ════ ATOMIC SYSTEM FAILURE ════ ☢️\n\n☣️ ERROR CODE: BESH-404\n⚛️ REASON: ${error.message || 'Core response failure'}\n💠 SOLUTION: Retry operation\n\n☣️ ────────────────\n⚡ POWERED BY ATOMIC CORE v3.0`;
      api.sendMessage(errorMessage, event.threadID);
    }
  },
};
