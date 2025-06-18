const axios = require("axios");

const apiURL = "https://api.affiliateplus.xyz/api/chatbot";
const baseApiUrl = async () => {
    return "https://noobs-api.top/dipto";
};

const preTeach = [
  { q: "tumi ke", a: ["ami tomar bby 😚", "ami ekta smart bot"] },
  { q: "bhalobashi tomake", a: ["ami o tomake 😍", "onek onek bhalobashi"] },
  { q: "mon kharap", a: ["kiser jonno? bolo na bby", "ami achi tomar jonno"] },
  { q: "kisu bolo", a: ["toke na dekhle din shuru hoy na 😍", "bhalobasha hocche tomar moto cheharar upor ekta poem"] },
  { q: "ki korcho", a: ["tomar kotha vabi 😘", "toke niye shopno dekchi"] },
  { q: "good night", a: ["shuvo raatri bby 😴", "sweet dream jan"] },
  { q: "valo aso?", a: ["tumi jodi valo thako ami o valo 🥰"] },
  { q: "ami valo nai", a: ["mon kharap korish na jan 😞"] },
  { q: "tomar sathe kotha bolte ichche kore", a: ["ami o tomar sathe kotha bolte chai", "bolo jan ki niye kotha bolbo"] },
  { q: "tui valo na", a: ["ami kharap hoileo tomar jonnoi bby 😔"] },
  { q: "single naki taken", a: ["ami tomar jonno single 😌"] },
  { q: "toke miss kori", a: ["ami o toke miss kori 😢"] },
  { q: "toke niye shopno dekhi", a: ["shopno gulo sobi shotti hobe ekdin bby"] }
];

const imageTriggers = {
  kiss: "https://i.imgur.com/vQ7oK5F.gif",
  love: "https://i.imgur.com/WQ7Zkq2.gif",
  miss: "https://i.imgur.com/6C9NdD9.gif"
};

module.exports = {
  config: {
    name: "bby",
    version: "6.9.0",
    author: "Smokey x ChatGPT & Dipto",
    countDown: 2,
    role: 0,
    description: "Ultimate Bby chatbot with AI, images, and dynamic responses",
    category: "fun",
    guide: {
      en: "{pn} [anyMessage] OR\nteach [YourMessage] - [Reply1], [Reply2], [Reply3]... OR\nremove [YourMessage] OR\nlist OR\nedit [YourMessage] - [NewMessage]"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event, args, usersData }) {
    try {
      const text = (event.body || "").toLowerCase();
      const triggerWords = ["bby", "baby", "jan", "babu", "bbe", "bow", "bot"];
      const senderInfo = await api.getUser Info(event.senderID); // Fixed method name
      const senderName = senderInfo[event.senderID]?.name || "Babu";

      // Check for image keyword trigger
      for (let key in imageTriggers) {
        if (text.includes(key)) {
          return api.sendMessage({
            body: `❤️ ${senderName}, ami o toke ${key} 😘`,
            attachment: await global.utils.getStreamFromURL(imageTriggers[key])
          }, event.threadID);
        }
      }

      // Check for keyword prefix
      if (triggerWords.some(word => text.includes(word))) {
        const response = await axios.get(apiURL, {
          params: {
            message: text,
            botname: "Bby",
            ownername: "Asif",
            userid: event.senderID
          }
        });

        if (response.data && response.data.message) {
          return api.sendMessage(`💬 ${senderName}: ${response.data.message}`, event.threadID);
        }
      }

      // Fallback preTeach
      const matched = preTeach.find(item => text.includes(item.q));
      if (matched) {
        const reply = matched.a[Math.floor(Math.random() * matched.a.length)];
        return api.sendMessage(`💌 ${senderName}, ${reply}`, event.threadID);
      }

      // Command handling for teaching and managing responses
      const link = `${await baseApiUrl()}/baby`;
      const uid = event.senderID;
      let command, comd, final;

      if (args[0] === 'remove') {
        const fina = text.replace("remove ", "");
        const dat = (await axios.get(`${link}?remove=${fina}&senderID=${uid}`)).data.message;
        return api.sendMessage(dat, event.threadID);
      }

      if (args[0] === 'list') {
        const data = (await axios.get(`${link}?list=all`)).data;
        return api.sendMessage(`❇️ | Total Teach = ${data.length || "api off"}`, event.threadID);
      }

      if (args[0] === 'edit') {
        const command = text.split(/\s*-\s*/)[1];
        if (command.length < 2) return api.sendMessage('❌ | Invalid format! Use edit [YourMessage] - [NewReply]', event.threadID);
        const dA = (await axios.get(`${link}?edit=${args[1]}&replace=${command}&senderID=${uid}`)).data.message;
        return api.sendMessage(`changed ${dA}`, event.threadID);
      }

      if (args[0] === 'teach') {
        [comd, command] = text.split(/\s*-\s*/);
        final = comd.replace("teach ", "");
        if (command.length < 2) return api.sendMessage('❌ | Invalid format!', event.threadID);
        const re = await axios.get(`${link}?teach=${final}&reply=${command}&senderID=${uid}&threadID=${event.threadID}`);
        const tex = re.data.message;
        const teacher = (await usersData.get(re.data.teacher)).name;
        return api.sendMessage(`✅ Replies added ${tex}\nTeacher: ${teacher}`, event.threadID);
      }

      // Default response if no commands match
      const d = (await axios.get(`${link}?text=${text}&senderID=${uid}&font=1`)).data.reply;
      api.sendMessage(d, event.threadID);

    } catch (err) {
      console.error("Bby Chatbot Error:", err);
      return api.sendMessage("❌ Bby error: " + err.message, event.threadID);
    }
  }
};
