const axios = require("axios");

module.exports = {
  config: {
    name: "waifu",
    aliases: ["wife"],
    version: "1.1",
    author: "Mr.Smokey[Asif Mahmud]",
    countDown: 6,
    role: 0,
    shortDescription: {
      en: "Get random waifu image",
      bn: "একটি র‍্যান্ডম ওয়াইফু ইমেজ পান"
    },
    longDescription: {
      en: "Get waifu images from various categories like waifu, neko, hug, etc.",
      bn: "waifu, neko, hug ইত্যাদি ক্যাটাগরি থেকে ওয়াইফু ইমেজ পান"
    },
    category: "anime",
    guide: {
      en: "{pn} <category>",
      bn: "{pn} <ক্যাটাগরির নাম>"
    }
  },

  langs: {
    en: {
      defaultTitle: "Here is your waifu 💖",
      notFound: "Category not found. Try: waifu, neko, hug, etc."
    },
    bn: {
      defaultTitle: "তোমার ওয়াইফু এখানে 💖",
      notFound: "ক্যাটাগরি খুঁজে পাওয়া যায়নি। চেষ্টা করুন: waifu, neko, hug ইত্যাদি"
    }
  },

  onStart: async function ({ message, args, getLang }) {
    const category = args.join(" ") || "waifu";

    try {
      const res = await axios.get(`https://api.waifu.pics/sfw/${category}`);
      const imageUrl = res.data.url;

      const form = {
        body: getLang("defaultTitle"),
        attachment: await global.utils.getStreamFromURL(imageUrl)
      };

      message.reply(form);
    } catch (e) {
      console.error(e);
      message.reply(getLang("notFound"));
    }
  }
};
