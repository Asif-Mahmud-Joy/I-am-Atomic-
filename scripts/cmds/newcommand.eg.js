/**
 * Inspire Command - Sends a random inspirational quote
 * Author: ✨ Mr.Smokey [Asif Mahmud] ✨
 * Version: 1.0
 */

module.exports = {
  config: {
    name: "inspire",
    aliases: ["quote", "motivation"],
    version: "1.0",
    author: "✨ [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: {
      en: "Get inspired with a random quote",
      vi: "Nhận câu trích dẫn ngẫu nhiên truyền cảm hứng",
      bn: "একটি অনুপ্রেরণামূলক উক্তি পান"
    },
    longDescription: {
      en: "Sends a random inspirational quote to motivate you",
      vi: "Gửi một câu trích dẫn ngẫu nhiên truyền cảm hứng",
      bn: "আপনাকে অনুপ্রাণিত করতে একটি এলোমেলো অনুপ্রেরণামূলক উক্তি পাঠায়"
    },
    category: "education",
    guide: {
      en: "{pn}",
      vi: "{pn}",
      bn: "{pn}"
    }
  },

  langs: {
    en: {
      loading: "🌠 Fetching an inspirational quote for you...",
      error: "❌ Failed to get inspiration. Please try again later."
    },
    vi: {
      loading: "🌠 Đang tìm câu trích dẫn truyền cảm hứng cho bạn...",
      error: "❌ Không thể lấy cảm hứng. Vui lòng thử lại sau."
    },
    bn: {
      loading: "🌠 আপনার জন্য একটি অনুপ্রেরণামূলক উক্তি আনছি...",
      error: "❌ অনুপ্রেরণা আনতে ব্যর্থ হয়েছে। পরে আবার চেষ্টা করুন।"
    }
  },

  onStart: async function ({ message, getLang }) {
    try {
      // Show loading message
      message.reply(getLang("loading"));
      
      // Fetch random quote from API
      const quote = await this.getRandomQuote();
      
      // Send the inspirational quote
      message.reply(`✨ ${quote.text}\n\n- ${quote.author || "Unknown"}`);
    } catch (error) {
      console.error("Inspire Command Error:", error);
      message.reply(getLang("error"));
    }
  },

  getRandomQuote: async function () {
    const apiUrl = "https://type.fit/api/quotes";
    const response = await fetch(apiUrl);
    const quotes = await response.json();
    
    // Get a random quote
    const randomIndex = Math.floor(Math.random() * quotes.length);
    return quotes[randomIndex];
  }
};
