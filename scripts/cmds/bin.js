const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ============================== 👑 ATOMIC ROYAL DESIGN SYSTEM 👑 ============================== //
const design = {
  header: "♚ 𝗘𝗫𝗕𝗜𝗡 𝗥𝗢𝗬𝗔𝗟 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 ♚",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  separator: "▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰▱▰",
  emoji: {
    success: "⚜️✅",
    error: "🛑❌",
    warning: "⚠️🔸",
    upload: "🚀📤",
    file: "🗃️📁",
    lock: "🔐🔒",
    link: "🔗⛓️",
    loading: "⏳🌀",
    crown: "👑♚",
    forbidden: "🚫⛔",
    atomic: "⚛️☢️",
    tech: "💻⚙️"
  },
  colors: {
    header: "\x1b[1;35m", // Bright purple
    success: "\x1b[1;32m", // Green
    error: "\x1b[1;31m",   // Red
    warning: "\x1b[1;33m", // Yellow
    reset: "\x1b[0m"       // Reset
  }
};

const formatMessage = (content, type = "default") => {
  const color = design.colors[type] || "";
  return `${design.emoji.crown} ${design.colors.header}${design.header}${design.colors.reset} ${design.emoji.crown}\n${design.separator}\n${color}${content}${design.colors.reset}\n${design.separator}\n${design.emoji.tech} ${design.footer} ${design.emoji.atomic}`;
};

const simulateTyping = (api, event, duration = 1500) => {
  api.sendTyping(event.threadID);
  return new Promise(resolve => setTimeout(resolve, duration));
};
// ============================================================================================ //

// Configuration
const ALLOWED_UID = "61571630409265"; 
const API_SOURCE = "https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json";

module.exports = {
  config: {
    name: "exbin",
    aliases: ["royalbin"],
    version: "5.0",
    author: "Asif Mahmud",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "♚ Atomic Royal File Uploader [Owner Only]"
    },
    longDescription: {
      en: "♚ Upload files with atomic royal interface (Owner restricted)"
    },
    category: "owner",
    guide: {
      en: "{pn} <filename> or reply to a file"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // Start typing simulation
      await simulateTyping(api, event);
      
      // UID authorization check
      if (event.senderID !== ALLOWED_UID) {
        const authMsg = formatMessage(`${design.emoji.forbidden} 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n\n${design.emoji.lock} This royal command is strictly reserved for the system owner`, "error");
        return message.reply(authMsg);
      }

      const baseApiUrl = await getApiBinUrl();
      if (!baseApiUrl) {
        const errorMsg = formatMessage(`${design.emoji.error} 𝗔𝗣𝗜 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n${design.emoji.warning} Failed to fetch royal API gateway`, "error");
        return message.reply(errorMsg);
      }

      if (event.type === "message_reply" && event.messageReply.attachments) {
        return this.uploadAttachment(api, event, baseApiUrl);
      }

      const fileName = args[0];
      if (!fileName) {
        const helpMsg = formatMessage(`${design.emoji.file} 𝗙𝗜𝗟𝗘 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n${design.emoji.warning} Please provide a royal filename or reply to a file`, "warning");
        return message.reply(helpMsg);
      }

      await this.uploadFile(api, event, fileName, baseApiUrl);
    } catch (error) {
      console.error(error);
      const errorMsg = formatMessage(`${design.emoji.error} 𝗥𝗢𝗬𝗔𝗟 𝗦𝗬𝗦𝗧𝗘𝗠 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n${design.emoji.warning} ${error.message || "Royal process interrupted"}`, "error");
      message.reply(errorMsg);
    }
  },

  uploadFile: async function (api, event, fileName, baseApiUrl) {
    const filePath = this.findFilePath(fileName);
    if (!filePath.exists) {
      const notFoundMsg = formatMessage(`${design.emoji.warning} 𝗙𝗜𝗟𝗘 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗\n\n${design.emoji.file} "${fileName}" not found in royal command vault`, "warning");
      return api.sendMessage(notFoundMsg, event.threadID, event.messageID);
    }

    await simulateTyping(api, event, 2000);  // Typing simulation
    
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath.fullPath));

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    const successMsg = formatMessage(
      `${design.emoji.success} 𝗥𝗢𝗬𝗔𝗟 𝗙𝗜𝗟𝗘 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗\n\n` +
      `${design.emoji.file} 𝗡𝗮𝗺𝗲: ${fileName}\n` +
      `${design.emoji.link} 𝗥𝗮𝘄: ${data.raw}\n` +
      `${design.emoji.atomic} 𝗗𝗶𝗿𝗲𝗰𝘁 𝗟𝗶𝗻𝗸:\n${data.raw}`,
      "success"
    );

    api.sendMessage(successMsg, event.threadID, event.messageID);
  },

  uploadAttachment: async function (api, event, baseApiUrl) {
    await simulateTyping(api, event, 2500);  // Extended typing simulation
    
    const attachment = event.messageReply.attachments[0];
    const response = await axios.get(attachment.url, { responseType: 'stream' });

    const form = new FormData();
    form.append('file', response.data, attachment.name || 'royal_file.bin');

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    const successMsg = formatMessage(
      `${design.emoji.success} 𝗥𝗢𝗬𝗔𝗟 𝗔𝗧𝗧𝗔𝗖𝗛𝗠𝗘𝗡𝗧 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗\n\n` +
      `${design.emoji.file} 𝗡𝗮𝗺𝗲: ${attachment.name || "Royal Attachment"}\n` +
      `${design.emoji.tech} 𝗦𝗶𝘇𝗲: ${formatBytes(attachment.size)}\n` +
      `${design.emoji.link} 𝗥𝗮𝘄: ${data.raw}\n` +
      `${design.emoji.atomic} 𝗗𝗶𝗿𝗲𝗰𝘁 𝗟𝗶𝗻𝗸:\n${data.raw}`,
      "success"
    );

    api.sendMessage(successMsg, event.threadID, event.messageID);
  },

  findFilePath: function (fileName) {
    const dir = path.join(__dirname, '..', 'cmds');
    const extensions = ['', '.js', '.ts', '.txt'];

    for (const ext of extensions) {
      const filePath = path.join(dir, fileName + ext);
      if (fs.existsSync(filePath)) {
        return { exists: true, fullPath: filePath };
      }
    }
    return { exists: false };
  }
};

async function getApiBinUrl() {
  try {
    const { data } = await axios.get(API_SOURCE);
    return data.uploadApi;
  } catch (err) {
    console.error("Royal API Error:", err.message);
    return null;
  }
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}
