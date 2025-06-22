const axios = require('axios');
const yts = require("yt-search");

// 𝗔𝗧𝗢𝗠𝗜𝗖 𝗗𝗘𝗦𝗜𝗚𝗡 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧𝗦
const API_CACHE = {
  diptoApi: null,
  lastFetched: 0
};

async function getApiEndpoint() {
  const CACHE_DURATION = 3600000; // 1 hour cache
  const now = Date.now();
  
  if (!API_CACHE.diptoApi || now - API_CACHE.lastFetched > CACHE_DURATION) {
    try {
      const response = await axios.get(
        "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/baseApiUrl.json",
        { timeout: 5000 }
      );
      API_CACHE.diptoApi = response.data.api;
      API_CACHE.lastFetched = now;
    } catch (error) {
      console.error("🌐 API Cache Error:", error);
      throw new Error("Failed to refresh API endpoint");
    }
  }
  return API_CACHE.diptoApi;
}

// 𝗦𝗧𝗥𝗘𝗔𝗠 𝗠𝗔𝗡𝗔𝗚𝗘𝗠𝗘𝗡𝗧 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧
async function fetchVideoStream(url, fileName) {
  try {
    const response = await axios({
      method: 'get',
      url: url,
      responseType: 'stream',
      timeout: 30000
    });
    
    response.data.path = `${fileName}.mp4`;
    return response.data;
  } catch (error) {
    console.error("🌊 Stream Error:", error);
    throw new Error("Video stream unavailable");
  }
}

// 𝗨𝗧𝗜𝗟𝗜𝗧𝗬 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧𝗦
function extractVideoID(url) {
  const YT_REGEX = 
    /^(?:https?:\/\/)?(?:m\.|www\.)?(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))((\w|-){11})(?:\S+)?$/;
  const match = url.match(YT_REGEX);
  return match?.[1] || null;
}

async function shortenURL(longUrl) {
  try {
    const response = await axios.get(
      `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`,
      { timeout: 5000 }
    );
    return response.data;
  } catch {
    return longUrl; // Fallback to original URL
  }
}

// 𝗔𝗧𝗢𝗠𝗜𝗖 𝗜𝗡𝗧𝗘𝗥𝗙𝗔𝗖𝗘 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧𝗦
const config = {
  name: "video",
  author: "Mesbah Saxx upgrade by Asif",
  version: "3.0.0",
  role: 0,
  description: "⚡ Atomic YouTube Video Downloader",
  usePrefix: true,
  category: "𝗠𝗘𝗗𝗜𝗔",
  cooldowns: 15,
  shortDescription: {
    en: "⚡ Download high-quality YouTube videos"
  },
  guide: {
    en: "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗨𝘀𝗮𝗴𝗲:\n\n» {pn} <YouTube URL>\n» {pn} <search query>\n▬▬▬▬▬▬▬▬▬▬▬▬"
  }
};

// 𝗠𝗔𝗜𝗡 𝗖𝗢𝗠𝗠𝗔𝗡𝗗 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧
async function onStart({ api, args, event }) {
  try {
    // 𝗨𝗜 𝗖𝗢𝗠𝗣𝗢𝗡𝗘𝗡𝗧: 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗠𝗲𝘀𝘀𝗮𝗴𝗲
    let processingUI = await api.sendMessage(
      "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n🌀 Initializing system...",
      event.threadID
    );

    // 𝗜𝗻𝗽𝘂𝘁 𝗣𝗿𝗼𝗰𝗲𝘀𝘀𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁
    const userInput = args.join(' ');
    let videoID;

    if (extractVideoID(userInput)) {
      videoID = extractVideoID(userInput);
      await api.editMessage(
        "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n🔗 URL detected\n⚙ Processing video metadata...",
        processingUI.messageID
      );
    } else {
      await api.editMessage(
        `▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n🔍 Searching: "${userInput}"\n⚙ Filtering best results...`,
        processingUI.messageID
      );

      const searchResults = await yts(userInput);
      const videos = searchResults.videos.slice(0, 10);
      
      if (videos.length === 0) {
        throw new Error("No videos found");
      }

      // Select from top 3 results
      videoID = videos[Math.floor(Math.random() * Math.min(3, videos.length))].videoId;
    }

    // 𝗗𝗮𝘁𝗮 𝗙𝗲𝘁𝗰𝗵𝗶𝗻𝗴 𝗖𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁
    const apiUrl = await getApiEndpoint();
    const { data: videoData } = await axios.get(`${apiUrl}/ytDl3?link=${videoID}&format=mp4`, {
      timeout: 20000
    });

    if (!videoData?.downloadLink) {
      throw new Error("Invalid video data");
    }

    // 𝗨𝗜 𝗖𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁: 𝗥𝗲𝘀𝘂𝗹𝘁𝘀 𝗗𝗶𝘀𝗽𝗹𝗮𝘆
    const shortenedLink = await shortenURL(videoData.downloadLink);
    const fileTitle = videoData.title.replace(/[^\w\s]/gi, '').slice(0, 50);

    await api.editMessage(
      "▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n✅ Preparing your video...\n⚡ Finalizing download package...",
      processingUI.messageID
    );

    // 𝗦𝘁𝗿𝗲𝗮𝗺 𝗖𝗼𝗺𝗽𝗼𝗻𝗲𝗻𝘁
    const videoStream = await fetchVideoStream(videoData.downloadLink, fileTitle);

    await api.unsendMessage(processingUI.messageID);
    await api.sendMessage({
      body: `▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n🎬 𝗧𝗜𝗧𝗟𝗘: ${videoData.title}\n\n⚡ 𝗤𝗨𝗔𝗟𝗜𝗧𝗬: ${videoData.quality || "HD"}\n\n📥 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗: ${shortenedLink}\n\n💡 The video is attached below`,
      attachment: videoStream
    }, event.threadID);

  } catch (error) {
    console.error("☢️ Atomic Error:", error);
    try {
      await api.sendMessage(
        `▬▬▬▬▬▬▬▬▬▬▬▬\n⚡ 𝗔𝗧𝗢𝗠𝗜𝗖 𝗬𝗧 𝗗𝗢𝗪𝗡𝗟𝗢𝗔𝗗𝗘𝗥\n▬▬▬▬▬▬▬▬▬▬▬▬\n\n☢️ 𝗘𝗥𝗥𝗢𝗥:\n\n${error.message || "System malfunction"}\n\n⚠️ Please try again later`,
        event.threadID
      );
    } catch (fallbackError) {
      api.sendMessage("☢️ Critical system error", event.threadID);
    }
  }
}

module.exports = {
  config,
  onStart,
  run: onStart
};
