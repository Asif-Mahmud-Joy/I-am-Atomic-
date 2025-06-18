const axios = require('axios');

const baseApiUrl = async () => {
  return "https://noobs-api.top/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "7.3.0",
  author: "Asif",
  countdown: 0,
  role: 0,
  description: "Chatbot with personalized sparkly replies ✨",
  category: "chat",
  guide: {
    en: `Usage:
• {pn} [message]
• teach [message] - [reply1],[reply2],...
• teach react [message] - [emoji1],[emoji2],...
• remove [message]
• list [all] [limit]
• msg [message]
• edit [message] - [newReply]`
  }
};

// Standard API client
const apiClient = axios.create({ baseURL: "https://noobs-api.top/dipto", timeout: 5000 });

/**
 * Wraps a user’s name and message into two-line sparkly format.
 * @param {string} name – display name of the user
 * @param {string} text – the bot’s message body
 * @returns {string}
 */
function beautifyWithName(name, text) {
  const header = `✨ ${name} ✨`;
  const body   = `${text}`;
  return `${header}\n${body}`;
}

async function fetchBaby(params) {
  const { data } = await apiClient.get("/baby", { params });
  return data;
}

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const input = args.join(" ").trim().toLowerCase();
  const uid   = event.senderID;
  const link  = `${await baseApiUrl()}/baby`;

  // If no args → random prompt
  if (!input) {
    const choices = ["✨ Bolo baby!", "✨ Hum?", "✨ Type 'help baby'", "✨ Try '!baby hi'"];
    return api.sendMessage(choices.random(), event.threadID, event.messageID);
  }

  try {
    const [cmd, ...restArgs] = input.split(/\s+/);
    const rest = restArgs.join(" ");

    switch (cmd) {
      case "remove": {
        const res = await fetchBaby({ remove: rest, senderID: uid });
        return api.sendMessage(`✨ Removed: ${res.message} ✨`, event.threadID, event.messageID);
      }
      case "rm": {
        const [key, idx] = rest.split(/\s*-\s*/);
        const res = await fetchBaby({ remove: key, index: idx, senderID: uid });
        return api.sendMessage(`✨ Removed: ${res.message} ✨`, event.threadID, event.messageID);
      }
      case "list": {
        if (rest === "all") {
          const { teacher } = await fetchBaby({ list: "all" });
          const limit = parseInt(args[2], 10) || 50;
          const slice = teacher.teacherList.slice(0, limit);
          let text = "✨ Top Teachers:\n";
          for (let i = 0; i < slice.length; i++) {
            const id    = Object.keys(slice[i])[0];
            const count = slice[i][id];
            const name  = await usersData.getName(id).catch(() => id);
            text += `${i+1}. ${name} — ${count}\n`;
          }
          return api.sendMessage(text.trim(), event.threadID, event.messageID);
        } else {
          const stats = await fetchBaby({ list: "all" });
          const text  = `✨ Total Teach: ${stats.length}\n✨ Total Responses: ${stats.responseLength}`;
          return api.sendMessage(text, event.threadID, event.messageID);
        }
      }
      case "msg": {
        const key = rest;
        const res = await fetchBaby({ list: key });
        return api.sendMessage(`✨ Message "${key}": ${res.data} ✨`, event.threadID, event.messageID);
      }
      case "edit": {
        const [key, newReply] = rest.split(/\s*-\s*/);
        if (!newReply) {
          return api.sendMessage("❌ Invalid format! edit [msg] - [newReply]", event.threadID, event.messageID);
        }
        const res = await fetchBaby({ edit: key, replace: newReply, senderID: uid });
        return api.sendMessage(`✨ Edited: ${res.message} ✨`, event.threadID, event.messageID);
      }
      case "teach": {
        const mode = restArgs[0];
        let payload = rest;
        if (mode === "react") payload = rest.replace(/^react\s+/, "");
        const [msgKey, replies] = payload.split(/\s*-\s*/);
        if (!replies) {
          return api.sendMessage("❌ Invalid teach format! teach [msg] - [reply1],[reply2]...", event.threadID, event.messageID);
        }
        const params = { teach: msgKey, reply: replies, senderID: uid, threadID: event.threadID };
        if (mode === "react") params.react = replies;
        const res = await fetchBaby(params);
        const teacherName = (await usersData.get(res.teacher)).name;
        const summary     = `Added ${replies.split(",").length} replies for "${msgKey}"\nTeacher: ${teacherName}`;
        return api.sendMessage(`✨ ${summary} ✨`, event.threadID, event.messageID);
      }
      default: {
        const res = await fetchBaby({ text: input, senderID: uid, font: 1 });
        return api.sendMessage(`✨ ${res.reply} ✨`, event.threadID, event.messageID);
      }
    }
  } catch (err) {
    console.error(err);
    return api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, usersData }) => {
  if (event.type !== "message_reply") return;
  // Get sender name
  const userName = (await usersData.get(event.senderID)).name || "Friend";
  // Your custom Bengali text
  const message  = "বলো জান তোমাকে সাথে প্রেম করবো নাকি..!";
  // Compose sparkly reply with name
  const payload  = beautifyWithName(userName, message);
  await api.sendMessage(payload, event.threadID, event.messageID);
};

module.exports.onChat = async ({ api, event, usersData }) => {
  const body = event.body?.trim().toLowerCase() || "";
  if (!/^(baby|bby|bot|jan|babu|janu)\b/.test(body)) return;
  const userName = (await usersData.get(event.senderID)).name || "Friend";
  const message  = "বলো জান তোমাকে সাথে প্রেম করবো নাকি..!";
  const payload  = beautifyWithName(userName, message);
  await api.sendMessage(payload, event.threadID, event.messageID);
};

// Utility: pick a random element
Array.prototype.random = function() {
  return this[Math.floor(Math.random() * this.length)];
};
