const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1500;
const API_TIMEOUT_MS = 7000; // 7 seconds timeout

// Simple in-memory cache: { username: { data, timestamp } }
const cache = {};
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// Delay helper
const delay = ms => new Promise(res => setTimeout(res, ms));

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

// Build message body text
function buildProfileMessage(user, username) {
  return `
💖 𝗧𝗶𝗸𝗧𝗼𝗸 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗟𝗼𝗼𝗸𝘂𝗽 💖
━━━━━━━━━━━━━━━━━━━━━━
👤 Username: @${user.unique_id}
📛 Nickname: ${user.nickname || 'Not set'}
🌍 Region: ${user.region || 'N/A'}
🎥 Videos: ${user.aweme_count}
👫 Followers: ${user.follower_count.toLocaleString()}
🧡 Likes: ${user.total_favorited.toLocaleString()}

🔗 Link: https://www.tiktok.com/@${user.unique_id}
━━━━━━━━━━━━━━━━━━━━━━
💌 Search by: ${username}`;
}

module.exports = {
  config: {
    name: "tiktokid",
    version: "4.5.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    category: "media",
    shortDescription: "🔍 Search TikTok by username",
    longDescription: "Get TikTok user profile info by username with romantic tone, emoji flair & smooth typing animation.",
    guide: {
      en: "{pn} <username>"
    }
  },

  onStart: async function ({ api, event, args }) {
    const threadID = event.threadID;
    const username = args.join(" ").trim();

    // Input validation
    if (!username || /[^a-zA-Z0-9_.]/.test(username)) {
      return api.sendMessage("🚫 Please enter a valid TikTok username without special characters.\nExample: tiktokid charlidamelio", threadID);
    }

    api.sendTypingIndicator(threadID, true); // Typing ON

    const tempFiles = [];

    try {
      const user = await fetchTikTokProfile(username);

      if (!user) {
        return api.sendMessage(`❌ No TikTok user found with username: ${username}`, threadID);
      }

      let attachment = null;
      if (user.avatar_medium) {
        const tempPath = await downloadAvatar(user.avatar_medium);
        if (tempPath) {
          tempFiles.push(tempPath);
          attachment = fs.createReadStream(tempPath);
        }
      }

      const profileMsg = {
        body: buildProfileMessage(user, username),
      };

      if (attachment) {
        profileMsg.attachment = attachment;
      }

      await api.sendMessage(profileMsg, threadID);

    } catch (err) {
      console.error("TikTok API Error:", err.message);
      await api.sendMessage("❌ Network error or API unavailable right now. Try again later jaan 🥺", threadID);
    } finally {
      api.sendTypingIndicator(threadID, false); // Typing OFF

      // Clean up temp files
      for (const file of tempFiles) {
        try {
          await fs.unlink(file);
        } catch (e) {
          console.warn("⚠️ Failed to delete temp file:", file, "=>", e.message);
        }
      }
    }
  }
};
