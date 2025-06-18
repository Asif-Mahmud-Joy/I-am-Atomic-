const axios = require('axios');

function isValidPackageName(name) {
  return /^[a-z0-9\-_]+$/i.test(name);
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

async function smoothTyping(api, threadID, baseText, duration = 2500, interval = 600) {
  const dots = ["", ".", "..", "..."];
  let sent = await api.sendMessage(baseText, threadID);
  let elapsed = 0, i = 0;
  while (elapsed < duration) {
    await sleep(interval);
    i = (i + 1) % dots.length;
    try {
      await api.unsendMessage(sent.messageID);
      sent = await api.sendMessage(baseText + dots[i], threadID);
    } catch {}
    elapsed += interval;
  }
  try { await api.unsendMessage(sent.messageID); } catch {}
}

module.exports = {
  config: {
    name: "romanticnpminfo",
    version: "3.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: "🔍 npm package info with romantic flair 💌",
    longDescription: "Search npm package info with romantic UI and typing animation.",
    guide: { en: "{pn} <package-name>" }
  },

  onStart: async function({ api, event, args }) {
    let input = args.join(" ").trim();

    if (!input) {
      return api.sendMessage(
        "💔 দোস্ত, প্যাকেজ নাম দিতে ভুল করো না! যেমন: romanticnpminfo axios 📦",
        event.threadID
      );
    }

    if (!isValidPackageName(input)) {
      return api.sendMessage(
        "❌ ভাই, প্যাকেজ নাম শুধু ইংরেজি অক্ষর, সংখ্যা, - অথবা _ থাকতে পারে। আরেকবার ভালো করে লিখো! ❤️",
        event.threadID
      );
    }

    try {
      await smoothTyping(api, event.threadID, "💌 তোমার জন্য প্যাকেজের তথ্য খুঁজছি... একটু ধৈর্য ধরো ✨");

      const query = encodeURIComponent(input);
      const res = await axios.get(`https://registry.npmjs.org/${query}`);

      if (!res.data) {
        return api.sendMessage(
          "😔 ওহো! প্যাকেজের তথ্য পাওয়া যায়নি। নাম ঠিক আছে তো? আবার চেষ্টা করো 📦💔",
          event.threadID
        );
      }

      const data = res.data;
      const latestVersion = data["dist-tags"]?.latest || "নাই";
      const info = data.versions?.[latestVersion] || {};

      const message =
        `💖 *প্যাকেজের নাম:* ${data.name}\n` +
        `✨ *বর্ণনা:* ${info.description || "কোনো বর্ণনা নেই"}\n` +
        `👤 *লেখক:* ${(info.author && info.author.name) || "অজানা"}\n` +
        `📦 *সর্বশেষ ভার্সন:* ${latestVersion}\n` +
        `🕒 *প্রকাশের সময়:* ${data.time ? new Date(data.time[latestVersion]).toLocaleString('bn-BD') : "অজানা"}\n` +
        `🔗 *লিঙ্ক:* https://www.npmjs.com/package/${data.name}\n\n` +
        `💌 তোমার জন্য ভালোবাসা ও তথ্য সরবরাহ করলাম! আরো জানতে পারো ❤️✨`;

      return api.sendMessage(message, event.threadID);
    } catch (err) {
      console.error("🔥 npm info error:", err);
      return api.sendMessage(
        `❌ দুঃখিত, কিছু ভুল হয়েছে।\n💔 বিস্তারিত: ${err.message}\n📦 আবার চেষ্টা করো, আমি আছি তোমার পাশে! ❤️`,
        event.threadID
      );
    }
  }
};
