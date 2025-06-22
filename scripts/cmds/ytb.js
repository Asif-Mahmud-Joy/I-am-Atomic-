const axios = require("axios");
const fs = require("fs-extra");
const ytdl = require("@distube/ytdl-core");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "yt",
    aliases: ["youtube", "ytb"],
    version: "2.0.0",
    author: "Dipto modify by Asif",
    countDown: 5,
    role: 0,
    description: {
      en: "🎬 Download YouTube videos/audio or get video info with style"
    },
    category: "media",
    guide: {
      en: "━━━━━━━━━━━━━━━━━━━\n🎬 𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿\n━━━━━━━━━━━━━━━━━━━\n"
        + "» {pn} video <query/url> - Download video\n"
        + "» {pn} audio <query/url> - Download audio\n"
        + "» {pn} info <query/url> - Get video info\n"
        + "━━━━━━━━━━━━━━━━━━━\n"
        + "✨ 𝗘𝘅𝗮𝗺𝗽𝗹𝗲𝘀:\n"
        + "▸ {pn} video baby shark\n"
        + "▸ {pn} audio https://youtu.be/XqZsoesa55w\n"
        + "▸ {pn} info never gonna give you up\n"
        + "━━━━━━━━━━━━━━━━━━━"
    }
  },

  onStart: async function ({ api, args, event, message, getLang }) {
    try {
      const [action, ...queryParts] = args;
      const query = queryParts.join(" ");

      if (!action || !query) {
        return message.reply("⚠️ Please specify an action and search query/URL");
      }

      // Check if input is URL
      const isUrl = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/.test(query);
      let videoId;

      if (isUrl) {
        videoId = ytdl.getURLVideoID(query);
        const info = await ytdl.getInfo(videoId);
        return handleRequest({ api, event, message, action, info });
      }

      // Search for videos
      const searchResults = await searchYouTube(query);
      if (!searchResults.length) {
        return message.reply("🔍 No results found for your search");
      }

      let replyMsg = "━━━━━━━━━━━━━━━━━━━\n🎬 𝗦𝗲𝗮𝗿𝗰𝗵 𝗥𝗲𝘀𝘂𝗹𝘁𝘀\n━━━━━━━━━━━━━━━━━━━\n";
      searchResults.forEach((item, index) => {
        replyMsg += `▸ ${index + 1}. ${item.title}\n⏱️ ${item.duration}\n👤 ${item.channel}\n━━━━━━━━━━━━━━━━━━━\n`;
      });
      replyMsg += "Reply with the number to select";

      const thumbnails = await Promise.all(
        searchResults.map(item => getStreamFromURL(item.thumbnail))
      );

      await message.reply({
        body: replyMsg,
        attachment: thumbnails
      }, (err, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          results: searchResults,
          action
        });
      });

    } catch (error) {
      console.error(error);
      message.reply("❌ An error occurred: " + error.message);
    }
  },

  onReply: async ({ event, api, Reply, message }) => {
    const { results, action } = Reply;
    const choice = parseInt(event.body);

    if (isNaN(choice) {
      api.unsendMessage(Reply.messageID);
      return;
    }

    const selected = results[choice - 1];
    if (!selected) {
      return message.reply("⚠️ Invalid selection");
    }

    try {
      const info = await ytdl.getInfo(selected.id);
      api.unsendMessage(Reply.messageID);
      await handleRequest({ api, event, message, action, info });
    } catch (error) {
      console.error(error);
      message.reply("❌ Failed to process your request");
    }
  }
};

async function handleRequest({ api, event, message, action, info }) {
  const { videoDetails } = info;
  const title = videoDetails.title;
  const duration = formatDuration(videoDetails.lengthSeconds);

  switch (action.toLowerCase()) {
    case "video":
      await downloadVideo(api, event, message, info);
      break;
    case "audio":
      await downloadAudio(api, event, message, info);
      break;
    case "info":
      await showVideoInfo(api, event, message, info);
      break;
    default:
      message.reply("⚠️ Invalid action. Use video/audio/info");
  }
}

async function downloadVideo(api, event, message, info) {
  const { videoDetails } = info;
  const formats = ytdl.filterFormats(info.formats, "videoandaudio");
  const bestFormat = ytdl.chooseFormat(formats, { quality: "highest" });

  if (!bestFormat) {
    return message.reply("❌ No suitable video format found");
  }

  const loadingMsg = await message.reply(`⬇️ Downloading: ${videoDetails.title}\n🔃 Please wait...`);

  try {
    const stream = ytdl.downloadFromInfo(info, { format: bestFormat });
    const fileName = `${videoDetails.videoId}.mp4`;
    const filePath = `${__dirname}/tmp/${fileName}`;
    const writer = fs.createWriteStream(filePath);

    stream.pipe(writer);

    writer.on("finish", async () => {
      await api.sendMessage({
        body: `🎬 ${videoDetails.title}\n⏱️ ${formatDuration(videoDetails.lengthSeconds)}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);
      
      fs.unlinkSync(filePath);
      api.unsendMessage(loadingMsg.messageID);
    });

  } catch (error) {
    console.error(error);
    message.reply("❌ Failed to download video");
  }
}

async function downloadAudio(api, event, message, info) {
  const { videoDetails } = info;
  const formats = ytdl.filterFormats(info.formats, "audioonly");
  const bestFormat = ytdl.chooseFormat(formats, { quality: "highestaudio" });

  if (!bestFormat) {
    return message.reply("❌ No suitable audio format found");
  }

  const loadingMsg = await message.reply(`⬇️ Downloading audio: ${videoDetails.title}\n🔃 Please wait...`);

  try {
    const stream = ytdl.downloadFromInfo(info, { format: bestFormat });
    const fileName = `${videoDetails.videoId}.mp3`;
    const filePath = `${__dirname}/tmp/${fileName}`;
    const writer = fs.createWriteStream(filePath);

    stream.pipe(writer);

    writer.on("finish", async () => {
      await api.sendMessage({
        body: `🎵 ${videoDetails.title}\n⏱️ ${formatDuration(videoDetails.lengthSeconds)}`,
        attachment: fs.createReadStream(filePath)
      }, event.threadID);
      
      fs.unlinkSync(filePath);
      api.unsendMessage(loadingMsg.messageID);
    });

  } catch (error) {
    console.error(error);
    message.reply("❌ Failed to download audio");
  }
}

async function showVideoInfo(api, event, message, info) {
  const { videoDetails } = info;
  const uploadDate = new Date(videoDetails.uploadDate).toLocaleDateString();
  const viewCount = parseInt(videoDetails.viewCount).toLocaleString();
  
  const infoMsg = `━━━━━━━━━━━━━━━━━━━\n🎬 𝗩𝗶𝗱𝗲𝗼 𝗜𝗻𝗳𝗼\n━━━━━━━━━━━━━━━━━━━\n`
    + `▸ 𝗧𝗶𝘁𝗹𝗲: ${videoDetails.title}\n`
    + `▸ 𝗖𝗵𝗮𝗻𝗻𝗲𝗹: ${videoDetails.author.name}\n`
    + `▸ 𝗩𝗶𝗲𝘄𝘀: ${viewCount}\n`
    + `▸ 𝗗𝘂𝗿𝗮𝘁𝗶𝗼𝗻: ${formatDuration(videoDetails.lengthSeconds)}\n`
    + `▸ 𝗨𝗽𝗹𝗼𝗮𝗱𝗲𝗱: ${uploadDate}\n`
    + `▸ 𝗟𝗶𝗻𝗸: https://youtu.be/${videoDetails.videoId}\n`
    + `━━━━━━━━━━━━━━━━━━━`;

  const thumbnail = await getStreamFromURL(videoDetails.thumbnails.pop().url);
  
  await message.reply({
    body: infoMsg,
    attachment: thumbnail
  });
}

async function searchYouTube(query) {
  const response = await axios.get(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
  const html = response.data;
  
  // Extract video data from YouTube search results
  // Note: YouTube may change their HTML structure, so this may need updates
  const pattern = /"videoRenderer":\{"videoId":"(.+?)".+?"title":\{"runs":\[\{"text":"(.+?)"\}\].+?"lengthText":\{"simpleText":"(.+?)"\}.+?"ownerText":\{"runs":\[\{"text":"(.+?)"/g;
  
  const results = [];
  let match;
  
  while ((match = pattern.exec(html)) !== null && results.length < 6) {
    results.push({
      id: match[1],
      title: match[2].replace(/\\u0026/g, "&"),
      duration: match[3],
      channel: match[4],
      thumbnail: `https://i.ytimg.com/vi/${match[1]}/hqdefault.jpg`
    });
  }
  
  return results;
}

function formatDuration(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor(seconds % 3600 / 60);
  const s = Math.floor(seconds % 3600 % 60);
  
  return [h, m > 9 ? m : h ? '0' + m : m || '0', s > 9 ? s : '0' + s]
    .filter(a => a)
    .join(':');
}
