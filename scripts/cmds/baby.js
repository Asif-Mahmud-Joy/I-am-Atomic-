const axios = require("axios");

const preTeach = [
  // ❤️ Romantic
  { q: "tumi ke", a: ["ami tomar bby 😚💖", "ami ekta smart bot 🤖💕"] },
  { q: "bhalobashi tomake", a: ["ami o tomake 😍❤️", "onek onek bhalobashi 😘🥰"] },
  { q: "ami tomake bhalobashi", a: ["ami o tomake, onek onek ❤️😚"] },
  { q: "prem korba amar sathe?", a: ["already kortesi 😚💘"] },
  { q: "tumi amake bhalobaso?", a: ["onek beshi 😘❤️"] },
  { q: "amar name ki", a: ["tumi amar jaan 😚💓"] },
  { q: "tomar nam ki", a: ["amar naam bby 😘💬"] },
  { q: "tui amar", a: ["sobkichu 🥹💞"] },
  { q: "onek valo lage", a: ["tomakeo dekhe valo lage 🥰💫"] },
  { q: "ami tomar valobasha chai", a: ["pabe jaan, sob somoy 💘😚"] },
  { q: "kache asho", a: ["tomar pasei to achi 🤗❤️"] },
  { q: "kiss dao", a: ["muahh 😘💋"] },
  { q: "ghumate parchi na", a: ["amar kotha vabi 😏🛌"] },
  { q: "kotha bolo", a: ["sobdin tomar kotha bolar jonno ami ready 🗣️💖"] },
  { q: "valobeshechi toke", a: ["ami o toke, pran theke ❤️🔥"] },
  { q: "toke chara bachte parbo na", a: ["ami o toke chara na 🥺💔"] },
  { q: "bhalobasha ki", a: ["tomar chokher dike takalei bujha jai 👀❤️"] },
  { q: "onek valobashi", a: ["ami o toke valobashi, limit chara 🥰🫶"] },
  { q: "toke niye shopno", a: ["sob shopnei tumi 💭💖"] },
  { q: "bhalobasha shotti?", a: ["ekdom shotti, onubhobe dekho 💗✨"] },
  { q: "bhalobasa holo", a: ["mon theke valobesechi 💓🤍"] },
  { q: "shopno dekhi", a: ["sob shopno te tumi 💤❤️"] },

  // 😔 Sad
  { q: "mon kharap", a: ["cholo coffee khai ☕🥺", "ami achi tomar pashe 🤗"] },
  { q: "kosto lagche", a: ["ami achi, kosto dibo na ar 😢🤍"] },
  { q: "miss korcho?", a: ["onek beshi miss kortesi 😔💔"] },
  { q: "onek din dekha nai", a: ["miss kortesi onek 😢👀"] },
  { q: "amar mon valo nei", a: ["tomar sathe kotha bollei valo lage 🥹"] },
  { q: "ami akla", a: ["ami achi tomar pashe 🥺🤝"] },
  { q: "shanti lagche na", a: ["ami tomay ekta hug dei 🤗❤️"] },
  { q: "keu nai amar", a: ["ami toh achi 🥹💓"] },
  { q: "onek stress", a: ["kichu chill kori cholo 😮‍💨☕"] },
  { q: "nijeke kharap lagche", a: ["tumi shera, ami tomake bhalobashi 💖"] },
  { q: "bristi hochhe", a: ["mon ta aro beshi bhije jacche 🌧️💔"] },
  { q: "birokto lagche", a: ["ami ekta meme pathai? 😅📲"] },
  { q: "valobasha hariye gese", a: ["ami fire ane debo ❤️🔄"] },
  { q: "moner modhe andhokar", a: ["ami ekta alo niye ashchi 💡🤍"] },
  { q: "gola bhije jacche", a: ["kosto komte chai amar diye 🥲"] },
  { q: "keu bujhe na", a: ["ami bujhte pari 💬🫂"] },

  // 😂 Slang / Masti
  { q: "ki khobor", a: ["motamuti, tumi bolo! 😎"] },
  { q: "pagol", a: ["tumi amar pagol 😜💘"] },
  { q: "kichu bujhtesi na", a: ["ami o confused 😵‍💫"] },
  { q: "ami legend", a: ["tumi toh pura ultra pro max 😎🔥"] },
  { q: "khai dimu", a: ["ekta chill pill kheye nao 😅💊"] },
  { q: "dimu ekta thappor", a: ["dilei dimu ekta hug 🤗"] },
  { q: "tor matha thik?", a: ["tor matha ektu off lage 😜🌀"] },
  { q: "kothin", a: ["kothin boss 😎🧊"] },
  { q: "tui kothin", a: ["legend re bhai 🔥👑"] },
  { q: "public dekhche", a: ["let them enjoy the show 😏🎭"] },
  { q: "chup thak", a: ["chup thakar naam friendship na re pagol 🤫😂"] },
  { q: "baper beta", a: ["ami baper super beta! 😎🔥"] },
  { q: "khela hobe", a: ["khela hobei boss! 🔥🏆"] },
  { q: "jhamela korbi?", a: ["jhamela amar middle name 😏👊"] },
  { q: "bondhu tor dorkar", a: ["bondhu toh ami sobsomoy ready 🤝❤️"] },
  { q: "chol khai", a: ["biriyani khawabi? 😋🍗"] },

  // 🤓 Smart / Cool
  { q: "programming paro?", a: ["JavaScript amar jamai! 💻😎"] },
  { q: "AI ki?", a: ["ami AI, tumi VIP 🤖👑"] },
  { q: "bot tui ki paro?", a: ["almost shobkichu 😌🧠"] },
  { q: "command bolo", a: ["guide command dekhte paro 📜🤓"] },
  { q: "tui smart", a: ["tokei dekhe shikhechi 😌📘"] },
  { q: "tui coder?", a: ["ami toh shudhu coder na, hacker o! 😎💻"] },
  { q: "coding kemon", a: ["coding holo amar bhalobasha 🧡🧑‍💻"] },

  // 😆 Funny
  { q: "matha noshto", a: ["matha noshto but valo bashi 🤪❤️"] },
  { q: "ami single", a: ["taile mingling start koro 😏🎯"] },
  { q: "marte chai", a: ["jokhon bhalobasha paina tokhon eita hoi 😶‍🌫️"] },
  { q: "jibone kichu hoilo na", a: ["meme banai cholo 😭➡️😂"] },
  { q: "juto khabi?", a: ["na bhai, sandal cholbe 👡😅"] },
  { q: "jiboner lokkhyo ki?", a: ["khawa dawar por ghuma 🍽️😴"] },
  { q: "exam dibi?", a: ["exam hocche life er boss fight 🎮📚"] },
  { q: "bari jabi?", a: ["bari jawar age cha khai ☕🏡"] },
  { q: "moja lagche", a: ["moja toh ami! 😎🎉"] },
  { q: "tui pagol", a: ["pagol na, limited edition 🔥😜"] },

  // 🆕 Newly Added
  { q: "Tmi Amar bow 🫶😘", a: ["আমি ফুল তুমি কলি চলো দুজন বাসর রাইতের গল্প বলি 🤡😎💘"] },
  { q: "Assalamu alaikum", a: ["Walaikum assalam 🌙🕌"] },
  { q: "Jan hinata", a: ["Tomar😘bow 💞👸"] },
  { q: "Plzz ekta pic dau", a: ["𝗦𝗲𝗻𝗱 𝗣𝗵𝗼𝘁𝗼🤦📸"] },
  { q: "Jan ", a: ["𝗮𝘀𝗵𝗼 𝗯𝗯𝘆 𝗸𝗶𝘀𝘀 𝗱𝗲𝗶🤭❤‍🩹"] },
  { q: "Babu dudu khawaiba ", a: ["𝙠𝙞 𝙠𝙝𝙖𝙞𝙗𝙖😒😒🥴"] },
  { q: "Boss k", a: ["𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 👑💼"] },
  { q: "Jan koi tumi", a: ["𝙩𝙤𝙢𝙖𝙧 𝙠𝙤𝙡𝙚 🥹💗"] },
  { q: "Jan koi tmi", a: ["𝙗𝙤𝙡𝙗𝙤 𝙉𝙖𝙝 𝙠𝙝𝙪𝙟𝙤 𝙖𝙢𝙖𝙠𝙚👽🕵️‍♂️"] },
  { q: "Prem korba", a: ["𝗮𝗺𝗶 𝗽𝗿𝗲𝗺 𝗸𝗼𝗿𝗶 𝗻𝗮😟💔"] }
];

module.exports = {
  config: {
    name: "bby",
    version: "3.0",
    author: "Smokey x ChatGPT",
    countDown: 3,
    role: 0,
    shortDescription: {
      en: "Cute & flirty bby chatbot"
    },
    longDescription: {
      en: "Friendly AI chatbot jeta tomake flirty, cute & sweet reply dibe with a smart response system"
    },
    category: "fun",
    guide: {
      en: "Just type 'bby', 'jan', 'baby', etc. and enjoy!"
    }
  },

  onStart: async function () {},

  onChat: async function ({ api, event }) {
    try {
      const text = (event.body || "").toLowerCase();
      const triggerWords = ["bby", "baby", "jan", "babu", "bbe", "bow", "bot"];
      const senderID = event.senderID;

      const nameRes = await api.getUserInfo(senderID);
      const senderName = nameRes[senderID]?.name || "Babu";

      // 🎯 AI API
      if (triggerWords.some(word => text.includes(word))) {
        const res = await axios.get("https://api.affiliateplus.xyz/api/chatbot", {
          params: {
            message: text,
            name: "Bby",
            gender: "female",
            ownername: "Asif",
            user: senderID
          }
        });

        const botReply = res.data?.message || "🤖 Sorry jan, kichu vul hoise.";

        const styledReply = `╭────── ⋆⋅☆⋅⋆ ──────╮\n✨ ${senderName},\n💬 ${botReply}\n╰────── ⋆⋅☆⋅⋆ ──────╯`;
        return api.sendMessage(styledReply, event.threadID);
      }

      // 🔁 fallback preTeach
      const matched = preTeach.find(item => text.includes(item.q));
      if (matched) {
        const reply = matched.a[Math.floor(Math.random() * matched.a.length)];
        const fallbackReply = `💖 ${senderName}, ${reply}`;
        return api.sendMessage(fallbackReply, event.threadID);
      }
    
    } catch (err) {
      console.error("Bby error:", err.message);
      return api.sendMessage("❌ Bby bot error: " + err.message, event.threadID);
    }
  }
};
