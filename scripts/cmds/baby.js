const axios = require('axios');

const baseApiUrl = async () => {
  return "https://noobs-api.top/dipto";
};

module.exports.config = {
  name: "bby",
  aliases: ["baby", "bbe", "babe", "sam"],
  version: "7.0.0",
  author: "dipto",
  countDown: 0,
  role: 0,
  description: "Better than all sim simi, now with pretty replies ✨",
  category: "chat",
  guide: {
    en: `{pn} [anyMessage] OR
teach [YourMessage] - [Reply1], [Reply2], [Reply3]...
teach [react] [YourMessage] - [react1], [react2], [react3]...
remove [YourMessage]
rm [YourMessage] - [indexNumber]
msg [YourMessage]
list OR list all [limit]
edit [YourMessage] - [NewMessage]`
  }
};

// Reusable pretty reply helper
const sendStyled = (api, threadID, message, messageID) => {
  const frame = `✨✨✨✨✨✨✨✨✨\n${message}\n✨✨✨✨✨✨✨✨✨`;
  return api.sendMessage(frame, threadID, messageID);
};

module.exports.onStart = async ({ api, event, args, usersData }) => {
  const link = `${await baseApiUrl()}/baby`;
  const dipto = args.join(" ").toLowerCase();
  const uid = event.senderID;

  try {
    if (!args[0]) {
      const ran = ["✨ Bolo baby!", "✨ Hum?", "✨ Type 'help baby'", "✨ Try '!baby hi'"];
      return sendStyled(api, event.threadID, ran[Math.floor(Math.random() * ran.length)], event.messageID);
    }

    if (args[0] === 'remove') {
      const fina = dipto.replace("remove ", "");
      const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
      return sendStyled(api, event.threadID, `✅ Removed: ${dat}`, event.messageID);
    }

    if (args[0] === 'rm' && dipto.includes('-')) {
      const [fi, f] = dipto.replace("rm ", "").split(/\s*-\s*/);
      const da = (await axios.get(`${link}?remove=${fi}&index=${f}`)).data.message;
      return sendStyled(api, event.threadID, `✅ Removed: ${da}`, event.messageID);
    }

    if (args[0] === 'list') {
      if (args[1] === 'all') {
        const data = (await axios.get(`${link}?list=all`)).data;
        const limit = parseInt(args[2]) || 100;
        const limited = data?.teacher?.teacherList?.slice(0, limit) || [];
        const teachers = await Promise.all(limited.map(async (item) => {
          const number = Object.keys(item)[0];
          const value = item[number];
          const name = await usersData.getName(number).catch(() => number) || "Unknown";
          return { name, value };
        }));
        teachers.sort((a, b) => b.value - a.value);
        const output = teachers.map((t, i) => `${i + 1}. ${t.name}: ${t.value}`).join('\n');
        return sendStyled(api, event.threadID, `📚 Total Teachers: ${data.length}\n\n${output}`, event.messageID);
      } else {
        const d = (await axios.get(`${link}?list=all`)).data;
        return sendStyled(api, event.threadID, `✨ Total Teaches: ${d.length || "N/A"}\n🔄 Total Responses: ${d.responseLength || "N/A"}`, event.messageID);
      }
    }

    if (args[0] === 'msg') {
      const fuk = dipto.replace("msg ", "");
      const d = (await axios.get(`${link}?list=${fuk}`)).data.data;
      return sendStyled(api, event.threadID, `📝 Message "${fuk}": ${d}`, event.messageID);
    }

    if (args[0] === 'edit') {
      const parts = dipto.split(/\s*-\s*/);
      const newMsg = parts[1];
      if (!newMsg) return sendStyled(api, event.threadID, '❌ Invalid format! Use: edit [YourMessage] - [NewReply]', event.messageID);
      const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${newMsg}&senderID=${uid}`)).data.message;
      return sendStyled(api, event.threadID, `✅ Changed: ${dA}`, event.messageID);
    }

    if (args[0] === 'teach' && args[1] !== 'amar' && args[1] !== 'react') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach ", "");
      if (!command) return sendStyled(api, event.threadID, '❌ Invalid format!', event.messageID);
      const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
      const tex = re.data.message;
      const teacher = (await usersData.get(re.data.teacher)).name;
      return sendStyled(api, event.threadID, `✅ Replies added: ${tex}\n👤 Teacher: ${teacher}\n📚 Total Teaches: ${re.data.teachs}`, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'amar') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach ", "");
      if (!command) return sendStyled(api, event.threadID, '❌ Invalid format!', event.messageID);
      const tex = (await axios.get(`${link}?teach=${final}&senderID=${uid}&reply=${command}&key=intro`)).data.message;
      return sendStyled(api, event.threadID, `✅ Replies added: ${tex}`, event.messageID);
    }

    if (args[0] === 'teach' && args[1] === 'react') {
      const [comd, command] = dipto.split(/\s*-\s*/);
      const final = comd.replace("teach react ", "");
      if (!command) return sendStyled(api, event.threadID, '❌ Invalid format!', event.messageID);
      const tex = (await axios.get(`${link}?teach=${final}&react=${command}`)).data.message;
      return sendStyled(api, event.threadID, `✅ Reaction replies added: ${tex}`, event.messageID);
    }

    if (/amar name ki|amr nam ki|amr name ki|amar nam ki|whats my name/.test(dipto)) {
      const data = (await axios.get(`${link}?text=amar name ki&senderID=${uid}&key=intro`)).data.reply;
      return sendStyled(api, event.threadID, data, event.messageID);
    }

    // Default chat
    const d = (await axios.get(`${link}?text=${dipto}&senderID=${uid}&font=1`)).data.reply;
    api.sendMessage(`✨ ${d}`, event.threadID, (error, info) => {
      global.GoatBot.onReply.set(info.messageID, {
        commandName: this.config.name,
        type: "reply",
        messageID: info.messageID,
        author: event.senderID,
        d,
        apiUrl: link
      });
    }, event.messageID);

  } catch (e) {
    console.log(e);
    sendStyled(api, event.threadID, `❌ Error: ${e.message}`, event.messageID);
  }
};

module.exports.onReply = async ({ api, event, Reply }) => {
  try {
    if (event.type === "message_reply") {
      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(event.body?.toLowerCase())}&senderID=${event.senderID}&font=1`)).data.reply;
      api.sendMessage(`✨ ${a}`, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          a
        });
      }, event.messageID);
    }
  } catch (err) {
    api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};

module.exports.onChat = async ({ api, event, message }) => {
  try {
    const body = event.body?.toLowerCase() || "";
    if (/^(baby|bby|bot|jan|babu|janu)\b/.test(body)) {
      const arr = body.replace(/^\S+\s*/, "");
      const randomReplies = ["😚", "Yes 😀, I am here!", "What's up?", "Bolo jaan, ki korte pari?"];
      if (!arr) {
        return api.sendMessage(randomReplies[Math.floor(Math.random() * randomReplies.length)], event.threadID, (error, info) => {
          if (!info) message.reply("Info object not found!");
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID
          });
        }, event.messageID);
      }
      const a = (await axios.get(`${await baseApiUrl()}/baby?text=${encodeURIComponent(arr)}&senderID=${event.senderID}&font=1`)).data.reply;
      api.sendMessage(`✨ ${a}`, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          type: "reply",
          messageID: info.messageID,
          author: event.senderID,
          a
        });
      }, event.messageID);
    }
  } catch (err) {
    api.sendMessage(`❌ Error: ${err.message}`, event.threadID, event.messageID);
  }
};
