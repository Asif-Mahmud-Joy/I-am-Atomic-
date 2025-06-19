const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// ============================== 👑 ROYAL DESIGN SYSTEM 👑 ============================== //
const design = {
  header: "🔥┃ 𝗘𝗫𝗕𝗜𝗡 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗥 🔥",
  footer: "✨ 𝗣𝗼𝘄𝗲𝗿𝗲𝗱 𝗯𝘆 𝗔𝘀𝗶𝗳 𝗠𝗮𝗵𝗺𝘂𝗱 𝗧𝗲𝗰𝗵 ✨",
  separator: "━".repeat(40),
  emoji: {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    upload: "📤",
    file: "📁",
    lock: "🔒",
    link: "🔗",
    loading: "⏳",
    crown: "👑"
  }
};

const formatMessage = (content) => {
  return `${design.header}\n${design.separator}\n${content}\n${design.separator}\n${design.footer}`;
};
// ====================================================================================== //

// Configuration
const ALLOWED_UID = "61571630409265"; // Only this UID can use the command
const API_SOURCE = "https://raw.githubusercontent.com/Ayan-alt-deep/xyc/main/baseApiurl.json";

module.exports = {
  config: {
    name: "exbin",
    aliases: ["bin"],
    version: "4.0",
    author: "Eren moddify by Asif",
    countDown: 5,
    role: 2,
    shortDescription: {
      en: "👑 Royal File Uploader [Owner Only]"
    },
    longDescription: {
      en: "👑 Upload files to apibin with royal interface (Owner restricted)"
    },
    category: "utility",
    guide: {
      en: "{pn} <filename> or reply to a file"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    try {
      // Add processing indicator
      api.setMessageReaction(design.emoji.loading, event.messageID, () => {}, true);

      // UID authorization check
      if (event.senderID !== ALLOWED_UID) {
        const authMsg = formatMessage(`${design.emoji.lock} 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n\n⛔ You are not authorized to use this royal command.`);
        return message.reply(authMsg);
      }

      const baseApiUrl = await getApiBinUrl();
      if (!baseApiUrl) {
        const errorMsg = formatMessage(`${design.emoji.error} 𝗔𝗣𝗜 𝗙𝗔𝗜𝗟𝗨𝗥𝗘\n\n❌ Failed to fetch API base URL. Please try again later.`);
        return message.reply(errorMsg);
      }

      if (event.type === "message_reply" && event.messageReply.attachments) {
        return this.uploadAttachment(api, event, baseApiUrl);
      }

      const fileName = args[0];
      if (!fileName) {
        const helpMsg = formatMessage(`${design.emoji.file} 𝗙𝗜𝗟𝗘 𝗥𝗘𝗤𝗨𝗜𝗥𝗘𝗗\n\n📝 Please provide a filename or reply to a file attachment`);
        return message.reply(helpMsg);
      }

      await this.uploadFile(api, event, fileName, baseApiUrl);
    } catch (error) {
      console.error(error);
      const errorMsg = formatMessage(`${design.emoji.error} 𝗘𝗥𝗥𝗢𝗥 𝗢𝗖𝗖𝗨𝗥𝗘𝗗\n\n❌ ${error.message || "An unexpected error occurred"}`);
      message.reply(errorMsg);
    } finally {
      // Remove processing indicator
      api.setMessageReaction("", event.messageID, () => {}, true);
    }
  },

  uploadFile: async function (api, event, fileName, baseApiUrl) {
    const filePath = this.findFilePath(fileName);
    if (!filePath.exists) {
      const notFoundMsg = formatMessage(`${design.emoji.warning} 𝗙𝗜𝗟𝗘 𝗡𝗢𝗧 𝗙𝗢𝗨𝗡𝗗\n\n🔍 File "${fileName}" not found in commands directory!`);
      return api.sendMessage(notFoundMsg, event.threadID, event.messageID);
    }

    const form = new FormData();
    form.append('file', fs.createReadStream(filePath.fullPath));

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    const successMsg = formatMessage(
      `${design.emoji.success} 𝗙𝗜𝗟𝗘 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗\n\n` +
      `📁 File: ${fileName}\n` +
      `${design.emoji.link} Raw: ${data.raw}\n\n` +
      `⚡ File accessible at: ${data.raw}`
    );

    api.sendMessage(successMsg, event.threadID, event.messageID);
  },

  uploadAttachment: async function (api, event, baseApiUrl) {
    const attachment = event.messageReply.attachments[0];
    const response = await axios.get(attachment.url, { responseType: 'stream' });

    const form = new FormData();
    form.append('file', response.data, attachment.name || 'file.bin');

    const { data } = await axios.post(`${baseApiUrl}/upload`, form, {
      headers: form.getHeaders()
    });

    const successMsg = formatMessage(
      `${design.emoji.success} 𝗔𝗧𝗧𝗔𝗖𝗛𝗠𝗘𝗡𝗧 𝗨𝗣𝗟𝗢𝗔𝗗𝗘𝗗\n\n` +
      `📁 Filename: ${attachment.name || "Unnamed"}\n` +
      `📦 Size: ${formatBytes(attachment.size)}\n` +
      `${design.emoji.link} Raw: ${data.raw}\n\n` +
      `⚡ File accessible at: ${data.raw}`
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

// Helper: Get upload API base URL from JSON
async function getApiBinUrl() {
  try {
    const { data } = await axios.get(API_SOURCE);
    return data.uploadApi;
  } catch (err) {
    console.error("Failed to fetch base API URL:", err.message);
    return null;
  }
}

// Helper: Format bytes to human-readable size
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm) + ' ' + sizes[i];
}
