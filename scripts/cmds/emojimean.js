const axios = require("axios");
const cheerio = require("cheerio");

const langsSupported = [
  'sq','ar','az','bn','bs','bg','my','zh-hans','zh-hant','hr','cs','da','nl','en','et','fil','fi','fr','ka','de','el','he',
  'hi','hu','id','it','ja','kk','ko','lv','lt','ms','nb','fa','pl','pt','ro','ru','sr','sk','sl','es','sv','th','tr','uk','vi'
];

module.exports = {
  config: {
    name: "emojimean",
    aliases: ["em", "emojimeaning", "emojimean"],
    version: "3.0-UltraProMax",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Find emoji meanings", bn: "ইমোজির মানে খুঁজুন" },
    longDescription: { en: "Get emoji meaning", bn: "ইমোজির বিস্তারিত মানে পান" },
    category: "wiki",
    guide: { en: "{pn} 😍", bn: "{pn} 😍" }
  },

  langs: {
    en: {
      missingEmoji: "⚠️ You have not entered an emoji.",
      notFound: "❌ Emoji meaning not found.",
      failed: "❌ Failed to fetch data. Try later.",
      meaningHeader: "📌 Meaning of %1",
      meaning1: "📄 Meaning: %1",
      shortcode: "📄 Shortcode: %1",
      source: "🔗 Source: %1"
    },
    bn: {
      missingEmoji: "⚠️ আপনি কোন ইমোজি দেননি।",
      notFound: "❌ ইমোজির মানে পাওয়া যায়নি।",
      failed: "❌ তথ্য আনা যায়নি, পরে আবার চেষ্টা করুন।",
      meaningHeader: "📌 %1 ইমোজির মানে",
      meaning1: "📄 মানে: %1",
      shortcode: "📄 শর্টকোড: %1",
      source: "🔗 উৎস: %1"
    }
  },

  onStart: async function({ args, message, event, threadsData, getLang }) {
    const emoji = args[0];
    if (!emoji) return message.reply(getLang("missingEmoji"));

    const thread = await threadsData.get(event.threadID);
    let myLang = (thread.data.lang || global.GoatBot.config.language || "en");
    if (!langsSupported.includes(myLang)) myLang = "en";

    try {
      const info = await fetchEmojiMeaning(emoji, myLang);
      if (!info.meaning) return message.reply(getLang("notFound"));

      const replyText =
        `${getLang("meaningHeader", emoji)}\n\n` +
        `${getLang("meaning1", info.meaning)}\n\n` +
        `${getLang("shortcode", info.shortcode || "❌")}` +
        `\n\n${getLang("source", info.source)}`;

      return message.reply(replyText);
    } catch (err) {
      console.error("Emoji API error:", err);
      return message.reply(getLang("failed"));
    }
  }
};

async function fetchEmojiMeaning(emoji, lang) {
  const url = `https://emojipedia.org/search/?q=${encodeURIComponent(emoji)}`;
  const res = await axios.get(url);
  const $ = cheerio.load(res.data);
  const firstLink = $('ul.search-results li a').first().attr('href');
  if (!firstLink) return {};

  const emojiPage = await axios.get(`https://emojipedia.org${firstLink}`);
  const _$ = cheerio.load(emojiPage.data);

  const meaning = _$("section.description p").first().text().trim();
  const shortcode = _$("code").first().text().trim();
  const source = `https://emojipedia.org${firstLink}`;

  return { meaning, shortcode, source };
}
