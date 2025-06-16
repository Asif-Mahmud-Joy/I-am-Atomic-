const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
  config: {
    name: "convert",
    version: "2.0",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Convert any media link to file (image, audio, video, document)",
      bn: "যেকোনো মিডিয়া লিংককে ফাইলে কনভার্ট করুন"
    },
    longDescription: {
      en: "Download and send media from a given link (supports jpeg, jpg, png, mp4, mp3, pdf, raw, docx, txt, gif, wav)",
      bn: "প্রদত্ত লিংক থেকে মিডিয়া ডাউনলোড ও পাঠানোর কমান্ড (ছবি, অডিও, ভিডিও, ডকুমেন্ট)"
    },
    category: "media",
    guide: {
      en: "{pn} [link]",
      bn: "{pn} [লিংক]"
    }
  },

  onStart: async function ({ api, event, args }) {
    const url = args[0];

    if (!url || !url.startsWith('http')) {
      return api.sendMessage('❌ দয়া করে একটি সঠিক মিডিয়া লিংক দিন।', event.threadID, event.messageID);
    }

    const validExtensions = ['.jpeg', '.jpg', '.png', '.mp4', '.mp3', '.pdf', '.raw', '.docx', '.txt', '.gif', '.wav'];
    const extension = path.extname(new URL(url).pathname);

    if (!validExtensions.includes(extension.toLowerCase())) {
      return api.sendMessage('❌ এই ফরম্যাটটি সাপোর্টেড না। সাপোর্টেড ফরম্যাট: jpeg, jpg, png, mp4, mp3, pdf, raw, docx, txt, gif, wav.', event.threadID, event.messageID);
    }

    try {
      const response = await axios.get(url, { responseType: 'arraybuffer' });
      if (response.status !== 200 || !response.data) {
        return api.sendMessage('⚠️ মিডিয়া লোড করতে ব্যর্থ হয়েছে।', event.threadID, event.messageID);
      }

      const filename = path.join(__dirname, `temp_${Date.now()}${extension}`);
      fs.writeFileSync(filename, Buffer.from(response.data, 'binary'));

      api.sendMessage({
        body: `✅ মিডিয়া রূপান্তর সফল: ${url}`,
        attachment: fs.createReadStream(filename)
      }, event.threadID, () => {
        fs.unlinkSync(filename);
      }, event.messageID);

    } catch (error) {
      console.error("Media conversion error:", error);
      api.sendMessage('❌ কনভার্ট করার সময় একটি সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।', event.threadID, event.messageID);
    }
  }
};
