const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const API_TIMEOUT_MS = 10000; // 10 seconds timeout
const TYPING_INTERVAL = 100; // Smoother typing animation

// Simple in-memory cache: { username: { data, timestamp } }
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Delay helper
const delay = ms => new Promise(res => setTimeout(res, ms));

// Enhanced atomic typing effect
async function atomicTypingEffect(api, threadID, username) {
  const phases = [
    `⚛️ 𝐀𝐭𝐨𝐦𝐢𝐜 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐬𝐜𝐚𝐧𝐧𝐢𝐧𝐠: @${username}...`,
    "💖 𝐀𝐧𝐚𝐥𝐲𝐳𝐢𝐧𝐠 𝐓𝐢𝐤𝐓𝐨𝐤 𝐝𝐚𝐭𝐚 𝐩𝐚𝐭𝐭𝐞𝐫𝐧𝐬...",
    "✨ 𝐃𝐞𝐜𝐨𝐝𝐢𝐧𝐠 𝐮𝐬𝐞𝐫 𝐢𝐧𝐟𝐨𝐫𝐦𝐚𝐭𝐢𝐨𝐧...",
    "🔍 𝐕𝐞𝐫𝐢𝐟𝐲𝐢𝐧𝐠 𝐩𝐫𝐨𝐟𝐢𝐥𝐞 𝐝𝐞𝐭𝐚𝐢𝐥𝐬..."
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
    await delay(500);
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
function formatAtomicMessage(title, content, emoji = "📱") {
  return (
    `☢️ ════ 𝐀𝐓𝐎𝐌𝐈𝐂 ${title} ════ ☢️\n\n` +
    `${emoji} | ${content}\n\n` +
    `☣️ ────────────────────────────────\n` +
    `⚛️ | 𝐀𝐓𝐎𝐌𝐈𝐂 𝐓𝐈𝐊𝐓𝐎𝐊 𝐂𝐎𝐑𝐄 | ⏱️ ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}\n` +
    `💫 | 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐓𝐈𝐊𝐓𝐎𝐊-𝐈𝐃`
  );
}

// Fetch TikTok profile data with retries and caching
async function fetchTikTokProfile(username) {
  // Check cache first
  const cached = cache[username];
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`Cache hit for ${username}`);
    return cached.data;
  }

  const url = `https://aemt.me/tiktok-user?username=${encodeURIComponent(username)}`;
  let retries = 0;

  while (retries < MAX_RETRIES) {
    try {
      const response = await axios.get(url, { timeout: API_TIMEOUT_MS });
      if (response?.data?.data?.unique_id) {
        // Cache it
        cache[username] = { data: response.data.data, timestamp: Date.now() };
        console.log(`Cache set for ${username}`);
        return response.data.data;
      }
      throw new Error('No valid user data found');
    } catch (err) {
      retries++;
      if (retries >= MAX_RETRIES) throw err;
      console.warn(`Retry ${retries} for ${username} after error: ${err.message}`);
      await delay(RETRY_DELAY_MS);
    }
  }
}

// Download user avatar safely
async function downloadAvatar(url) {
  try {
    const res = await axios.get(url, { responseType: 'arraybuffer', timeout: API_TIMEOUT_MS });
    // Basic content-type check for jpg/png/gif
    const contentType = res.headers['content-type'] || '';
    if (!contentType.startsWith('image/')) {
      throw new Error('URL did not return an image');
    }
    const ext = contentType.split('/')[1].split(';')[0];
    const tempPath = path.join(__dirname, `cache-${uuidv4()}.${ext}`);
    await fs.writeFile(tempPath, res.data);
    return tempPath;
  } catch (e) {
    console.warn('Avatar download failed:', e.message);
    return null;
  }
}

// Build message body text with atomic design
function buildProfileMessage(user, username) {
  return formatAtomicMessage(
    "𝐓𝐈𝐊𝐓𝐎𝐊 𝐏𝐑𝐎𝐅𝐈𝐋𝐄",
    `👤 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${user.unique_id}\n` +
    `📛 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${user.nickname || 'Not set'}\n` +
    `🌍 𝗥𝗲𝗴𝗶𝗼𝗻: ${user.region || 'N/A'}\n\n` +
    
    `📊 𝗦𝘁𝗮𝘁𝘀:\n` +
    `   🎥 𝗩𝗶𝗱𝗲𝗼𝘀: ${user.aweme_count}\n` +
    `   👫 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${user.follower_count.toLocaleString()}\n` +
    `   🧡 𝗟𝗶𝗸𝗲𝘀: ${user.total_favorited.toLocaleString()}\n\n` +
    
    `🔗 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗟𝗶𝗻𝗸: https://www.tiktok.com/@${user.unique_id}\n` +
    `💌 𝗦𝗲𝗮𝗿𝗰𝗵 𝗯𝘆: ${username}`,
    "💖"
  );
}

module.exports = {
  config: {
    name: "tiktokid",
    version: "5.0.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "media",
    shortDescription: {
      en: "🔍 Search TikTok with atomic design"
    },
    longDescription: {
      en: "Get TikTok user profile info with atomic-themed UI and animations"
    },
    guide: {
      en: "{pn} <username>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const messageID = event.messageID;
    const username = args.join(" ").trim();

    // Input validation
    if (!username || /[^a-zA-Z0-9_.]/.test(username)) {
      const errorMsg = formatAtomicMessage(
        "𝐕𝐀𝐋𝐈𝐃𝐀𝐓𝐈𝐎𝐍 𝐄𝐑𝐑𝐎𝐑",
        "🚫 Please enter a valid TikTok username without special characters.\n\n💌 Example: tiktokid charlidamelio",
        "⚠️"
      );
      return api.sendMessage(errorMsg, threadID, messageID);
    }

    try {
      // Show atomic typing animation
      await atomicTypingEffect(api, threadID, username);

      // Create processing message
      const processingMsg = await api.sendMessage(
        formatAtomicMessage(
          "𝐏𝐑𝐎𝐂𝐄𝐒𝐒𝐈𝐍𝐆", 
          `🔍 Scanning TikTok for @${username}...\n\n⚛️ Please wait while we decode the user profile`,
          "⏳"
        ), 
        threadID
      );

      const user = await fetchTikTokProfile(username);

      if (!user) {
        await api.unsendMessage(processingMsg.messageID);
        return api.sendMessage(
          formatAtomicMessage(
            "𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃", 
            `❌ No TikTok user found with username: @${username}\n\n💔 Please verify the username and try again`,
            "🔍"
          ),
          threadID,
          messageID
        );
      }

      let attachment = null;
      let tempFiles = [];
      if (user.avatar_medium) {
        const tempPath = await downloadAvatar(user.avatar_medium);
        if (tempPath) {
          tempFiles.push(tempPath);
          attachment = fs.createReadStream(tempPath);
        }
      }

      const profileMsg = buildProfileMessage(user, username);

      // Unsend processing message and send final result
      await api.unsendMessage(processingMsg.messageID);
      
      if (attachment) {
        await api.sendMessage({
          body: profileMsg,
          attachment: attachment
        }, threadID, messageID);
      } else {
        await api.sendMessage(profileMsg, threadID, messageID);
      }

      // Clean up temp files
      for (const file of tempFiles) {
        try {
          await fs.unlink(file);
        } catch (e) {
          console.warn("⚠️ Failed to delete temp file:", file, "=>", e.message);
        }
      }

    } catch (err) {
      console.error("☢️ Atomic TikTok Error:", err);
      await api.sendMessage(
        formatAtomicMessage(
          "𝐒𝐘𝐒𝐓𝐄𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄", 
          `❌ Network error or API unavailable:\n${err.message || 'Connection timeout'}\n\n💔 Please try again later`,
          "⚠️"
        ),
        threadID,
        messageID
      );
    }
  }
};
