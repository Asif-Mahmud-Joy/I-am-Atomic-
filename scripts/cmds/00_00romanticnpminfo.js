const axios = require('axios');

function isValidPackageName(name) {
  return /^[a-z0-9\-_]+$/i.test(name);
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

// Enhanced atomic typing effect
async function atomicTypingEffect(api, threadID) {
  const phases = [
    "⚛️ 𝐀𝐭𝐨𝐦𝐢𝐜 𝐩𝐚𝐜𝐤𝐚𝐠𝐞 𝐝𝐚𝐭𝐚 𝐬𝐜𝐚𝐧𝐧𝐢𝐧𝐠...",
    "💖 𝐒𝐞𝐚𝐫𝐜𝐡𝐢𝐧𝐠 𝐍𝐏𝐌 𝐫𝐞𝐠𝐢𝐬𝐭𝐫𝐲...",
    "✨ 𝐂𝐨𝐥𝐥𝐞𝐜𝐭𝐢𝐧𝐠 𝐩𝐚𝐜𝐤𝐚𝐠𝐞 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧...",
    "📦 𝐅𝐨𝐫𝐦𝐚𝐭𝐭𝐢𝐧𝐠 𝐰𝐢𝐭𝐡 𝐚𝐭𝐨𝐦𝐢𝐜 𝐝𝐞𝐬𝐢𝐠𝐧..."
  ];
  
  const symbols = ["💫", "📊", "🔍", "💌", "💝", "💟"];
  let sentMsg = null;
  
  try {
    sentMsg = await api.sendMessage(
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[0]} ${symbols[0]}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`,
      threadID
    );
  } catch (error) {}
  
  for (let i = 0; i < 8; i++) {
    await sleep(500);
    const phaseIndex = Math.floor(i / 2) % phases.length;
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    
    const newContent = 
      `☢️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☢️\n` +
      `⚛️ | ${phases[phaseIndex]} ${symbol}\n` +
      `☣️ ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ ☣️`;
    
    try {
      if (sentMsg) await api.unsendMessage(sentMsg.messageID);
      sentMsg = await api.sendMessage(newContent, threadID);
    } catch {}
  }
  
  try { 
    if (sentMsg) await api.unsendMessage(sentMsg.messageID); 
  } catch {}
}

// Atomic design message formatter
function formatAtomicMessage(title, content, emoji = "📦") {
  return (
    `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 ${title} ════ ☢️\n\n` +
    `${emoji} | ${content}\n\n` +
    `☣️ ────────────────────────────────\n` +
    `⚛️ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐍𝐏𝐌 𝐂𝐎𝐑𝐄 | ⏱️ ${new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}\n` +
    `💫 | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐍𝐏𝐌-𝐑𝐎𝐌𝐀𝐍𝐓𝐈𝐂`
  );
}

module.exports = {
  config: {
    name: "romanticnpminfo",
    version: "5.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "tools",
    shortDescription: {
      en: "📦 npm package info with atomic romance"
    },
    longDescription: {
      en: "Search npm packages with atomic-themed UI and romantic flair"
    },
    guide: {
      en: "{pn} <package-name>"
    }
  },

  onStart: async function({ api, event, args }) {
    const { threadID, messageID } = event;
    let input = args.join(" ").trim();

    // Show atomic menu if no input
    if (!input) {
      const atomicMenu = formatAtomicMessage(
        "𝐍𝐏𝐌 𝐌𝐄𝐍𝐔", 
        "💔 দোস্ত, প্যাকেজ নাম দিতে ভুল করো না!\n\nউদাহরণ:\nromanticnpminfo axios\nromanticnpminfo express\nromanticnpminfo mongoose",
        "📦"
      );
      return api.sendMessage(atomicMenu, threadID, messageID);
    }

    // Validate package name
    if (!isValidPackageName(input)) {
      return api.sendMessage(
        formatAtomicMessage(
          "𝐕𝐀𝐋𝐈𝐃𝐀𝐓𝐈𝐎𝐍 𝐄𝐑𝐑𝐎𝐑", 
          "❌ ভাই, প্যাকেজ নাম শুধু ইংরেজি অক্ষর, সংখ্যা, - অথবা _ থাকতে পারে।\n\n💌 উদাহরণ: romanticnpminfo axios",
          "⚠️"
        ),
        threadID,
        messageID
      );
    }

    try {
      // Show atomic typing animation
      await atomicTypingEffect(api, threadID);

      // Create processing message
      const processingMsg = await api.sendMessage(
        formatAtomicMessage(
          "𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆", 
          `🔍 "${input}" - এই প্যাকেজের তথ্য খোঁজা হচ্ছে...`,
          "⏳"
        ), 
        threadID
      );

      const query = encodeURIComponent(input);
      const res = await axios.get(`https://registry.npmjs.org/${query}`, {
        timeout: 10000
      });

      if (!res.data) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          formatAtomicMessage(
            "𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃", 
            "😔 ওহো! প্যাকেজের তথ্য পাওয়া যায়নি। নামটি সঠিক কিনা নিশ্চিত করো\n\n📦 আবার চেষ্টা করো: romanticnpminfo express",
            "💔"
          ),
          threadID,
          messageID
        );
      }

      const data = res.data;
      const latestVersion = data["dist-tags"]?.latest || "নাই";
      const info = data.versions?.[latestVersion] || {};
      const author = info.author || {};
      const maintainers = data.maintainers || [];
      const time = data.time ? new Date(data.time[latestVersion]).toLocaleString('bn-BD') : "অজানা";

      // Format package info with atomic design
      const packageInfo = 
        `💖 *প্যাকেজের নাম:* ${data.name || "নাই"}\n` +
        `✨ *বর্ণনা:* ${info.description || "কোনো বর্ণনা নেই"}\n` +
        `👤 *লেখক:* ${author.name || "অজানা"} ${author.email ? `(${author.email})` : ""}\n` +
        `👥 *মেইন্টেইনার:* ${maintainers.map(m => m.name).join(", ") || "নাই"}\n` +
        `📦 *সর্বশেষ ভার্সন:* ${latestVersion}\n` +
        `📅 *প্রকাশের সময়:* ${time}\n` +
        `🔗 *লিঙ্ক:* https://www.npmjs.com/package/${data.name}\n` +
        `⭐ *স্টার:* ${data.starCount || "নাই"}\n` +
        `📉 *সাপ্তাহিক ডাউনলোড:* ${data.downloads?.lastWeek || "নাই"}`;

      const finalMessage = formatAtomicMessage(
        "𝐏𝐀𝐂𝐊𝐀𝐆𝐄 𝐈𝐍𝐅𝐎", 
        packageInfo,
        "💝"
      );

      await api.unsendMessage(processingMsg.messageID);
      return api.sendMessage(finalMessage, threadID, messageID);
    } catch (err) {
      console.error("☢️ Atomic NPM Error:", err);
      return api.sendMessage(
        formatAtomicMessage(
          "𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄", 
          `❌ সমস্যা হয়েছে: ${err.message || 'API সংযোগ বিচ্ছিন্ন'}\n\n💔 আবার চেষ্টা করো: romanticnpminfo express`,
          "⚠️"
        ),
        threadID,
        messageID
      );
    }
  }
};
