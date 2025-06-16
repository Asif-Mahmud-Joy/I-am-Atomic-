const axios = require('axios');

module.exports = {
  config: {
    name: "llma",
    version: "2.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "member",
    shortDescription: {
      en: "AI generated response based on prompt"
    },
    longDescription: {
      en: "Uses LLaMA model to answer questions or generate responses from a prompt."
    },
    guide: {
      en: "{pn} your question or message\nExample: {pn} What is kardashev scale?"
    }
  },

  onStart: async function ({ api, event, args }) {
    try {
      const { messageID, messageReply, threadID } = event;
      let prompt = args.join(' ');

      if (messageReply?.body) {
        prompt = `${messageReply.body} ${prompt}`;
      }

      if (!prompt.trim()) {
        return api.sendMessage(
          '⚠️ Please provide a prompt to generate a response.\n\nUsage: llama {prompt}\nExample: llama What is kardashev scale?',
          threadID,
          messageID
        );
      }

      const llama_api = `https://aura-ai.vercel.app/llama?prompt=${encodeURIComponent(prompt)}`;
      const response = await axios.get(llama_api);

      if (response.data?.response) {
        api.sendMessage({ body: response.data.response }, threadID, messageID);
      } else {
        console.error('Unexpected response format:', response.data);
        api.sendMessage('❌ Sorry, could not generate a response. Please try again later.', threadID, messageID);
      }
    } catch (error) {
      console.error('LLaMA API error:', error);
      api.sendMessage(`❌ An error occurred: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
