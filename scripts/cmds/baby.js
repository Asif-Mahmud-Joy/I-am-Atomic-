const axios = require('axios');

// Base API URL
const baseApiUrl = async () => {
  return "https://api.affiliateplus.xyz/api/chatbot"; // Confirm this base URL is correct
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "6.9.0",
  author: "Asif",
  countDown: 0,
  role: 0,
  description: "Better than all SimSimi",
  category: "chat",
  guide: {
    en: "{pn} [message] OR\nteach [YourMessage] - [Reply1], [Reply2]... OR\nteach react [YourMessage] - [react1], [react2]... OR\nremove [YourMessage] OR\nrm [YourMessage] - [indexNumber] OR\nmsg [YourMessage] OR\nlist OR list all OR\nedit [YourMessage] - [NewMessage]"
  }
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  const userInput = args.join(" ").toLowerCase();
  const uid = event.senderID;

  try {
    if (!args[0]) {
      const randomResponses = ["Bolo baby", "Hum?", "Type help baby", "Type !baby hi"];
      return api.sendMessage(randomResponses[Math.floor(Math.random() * randomResponses.length)], event.threadID, event.messageID);
    }

    // REMOVE COMMAND
    if (args[0] === 'remove') {
      const target = userInput.replace("remove ", "");
      const response = (await axios.get(`${link}?remove=${target}&senderID=${uid}`)).data.message;
      return api.sendMessage(response, event.threadID, event.messageID);
    }

    // RM COMMAND
    if (args[0] === 'rm' && userInput.includes('-')) {
      const [target, index] = userInput.replace("rm ", "").split(/\s*-\s*/);
      const response = (await axios.get(`${link}?remove=${target}&index=${index}`)).data.message;
      return api.sendMessage(response, event.threadID, event.messageID);
    }

    // LIST COMMAND
    if (args[0] === 'list') {
      if (args[1] === 'all') {
        const data = (await axios.get(`${link}?list=all`)).data;
        const limit = parseInt(args[2]) || 100;
        const limited = data?.teacher?.teacherList?.slice(0, limit) || [];
        const teachers = await Promise.all(limited.map(async (item) => {
          const uid = Object.keys(item)[0];
          const value = item[uid];
          const name = await usersData.getName(uid).catch(() => uid) || "Not found";
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i + 1}/ ${t.name}: ${t.value}`).join('\n');
        return api.sendMessage(`Total Teach = ${data.length}\n👑 Teachers:\n${output}`, event.threadID, event.messageID);
      } else {
        const data = (await axios.get(`${link}?list=all`)).data;
        return api.sendMessage(`❇️ Total Teach = ${data.length || "API off"}\n♻️ Total Response = ${data.responseLength || "API off"}`, event.threadID, event.messageID);
      }
    }

    // MSG COMMAND
    if (args[0] === 'msg') {
      const target = userInput.replace("msg ", "");
      const response = (await axios.get(`${link}?list=${target}`)).data.data;
      return api.sendMessage(`Message "${target}" = ${response}`, event.threadID, event.messageID);
    }

    // EDIT COMMAND
    if (args[0] === 'edit') {
      const parts = userInput.replace("edit ", "").split(/\s*-\s*/);
      if (parts.length < 2) return api.sendMessage('❌ Format: edit [YourMessage] - [NewReply]', event.threadID, event.messageID);
      const [oldMsg, newReply] = parts;
      const response = (await axios.get(`${link}?edit=${oldMsg}&replace=${newReply}&senderID=${uid}`)).data.message;
      return api.sendMessage(`✅ Changed: ${response}`, event.threadID, event.messageID);
    }

    // TEACH COMMAND
    if (args[0] === 'teach') {
      let parts;
      if (args[1] === 'react') {
        parts = userInput.replace("teach react ", "").split(/\s*-\s*/);
        if (parts.length < 2) return api.sendMessage('❌ Format: teach react [Message] - [Reacts]', event.threadID, event.messageID);
        const [message, react] = parts;
        const response = (await axios.get(`${link}?teach=${message}&react=${react}`)).data.message;
        return api.sendMessage(`✅ Reacts added: ${response}`, event.threadID, event.messageID);
      } else if (args[1] === 'amar') {
        parts = userInput.replace("teach ", "").split(/\s*-\s*/);
        if (parts.length < 2) return api.sendMessage('❌ Format: teach amar [Message] - [Replies]', event.threadID, event.messageID);
        const [message, reply] = parts;
        const response = (await axios.get(`${link}?teach=${message}&reply=${reply}&senderID=${uid}&key=intro`)).data.message;
        return api.sendMessage(`✅ Replies added: ${response}`, event.threadID, event.messageID);
      } else {
        parts = userInput.replace("teach ", "").split(/\s*-\s*/);
        if (parts.length < 2) return api.sendMessage('❌ Format: teach [Message] - [Replies]', event.threadID, event.messageID);
        const [message, reply] = parts;
        const response = await axios.get(`${link}?teach=${message}&reply=${reply}&senderID=${uid}&threadID=${event.threadID}`);
        const teacherName = await usersData.getName(response.data.teacher).catch(() => "Unknown");
        return api.sendMessage(`✅ Replies added: ${response.data.message}\nTeacher: ${teacherName}\nTotal Teachs: ${response.data.teachs}`, event.threadID, event.messageID);
      }
    }

    // NAME QUERY
    if (["amar name ki", "amr name ki", "amr nam ki", "amar nam ki", "whats my name"].includes(userInput)) {
      const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
      return api.sendMessage(data, event.threadID, event.messageID);
    }

    // DEFAULT: CHATBOT
    const response = (await axios.get(`${link}?text=${encodeURIComponent(userInput)}&senderID=${uid}&font=1`)).data.reply;
    api.sendMessage(response, event.threadID, (err, info) => {
      if (info) {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          response,
          apiUrl: link
        });
      }
    }, event.messageID);

  } catch (err) {
    console.error(err);
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

// HANDLE REPLIES
module.exports.onReply = async ({ api, event }) => {
  try {
    if (event.type === "message_reply") {
      const link = `${await baseApiUrl()}/baby`;
      const response = (await axios.get(`${link}?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
      api.sendMessage(response, event.threadID, (err, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }
      }, event.messageID);
    }
  } catch (err) {
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};

// HANDLE WAKE WORDS
module.exports.onChat = async ({ api, event }) => {
  try {
    const body = event.body?.toLowerCase() || "";
    const wakeWords = ["baby", "bby", "bot", "jan", "babu", "janu"];
    if (wakeWords.some(w => body.startsWith(w))) {
      const message = body.replace(/^\S+\s*/, "");
      if (!message) {
        const fallback = ["😚", "Yes 😀, I am here", "What's up?", "Bolo jaan ki korte parbo?"];
        return api.sendMessage(fallback[Math.floor(Math.random() * fallback.length)], event.threadID, event.messageID);
      }
      const link = `${await baseApiUrl()}/baby`;
      const response = (await axios.get(`${link}?text=${encodeURIComponent(message)}&senderID=${event.senderID}&font=1`)).data.reply;
      api.sendMessage(response, event.threadID, (err, info) => {
        if (info) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }
      }, event.messageID);
    }
  } catch (err) {
    api.sendMessage(`Error: ${err.message}`, event.threadID, event.messageID);
  }
};
