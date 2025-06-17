const axios = require('axios');
const fs = require("fs-extra");
const path = require("path");
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "avatar",
    author: "🎩 𝐌𝐫.𝐒𝐦𝐨𝐤𝐞𝐲 • 𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝 🌠",
    version: "3.5",
    cooldowns: 5,
    role: 0,
    shortDescription: {
      en: "Anime avatar generator with fallback API"
    },
    longDescription: {
      en: "Generate anime-style avatars with fallback system if main API fails"
    },
    category: "image",
    guide: {
      en: `{pn} [ID or Name] | [Background Text] | [Signature] | [Color (optional)]\nExample: {pn} Nezuko | Mr. Smokey | Asif | red\n{pn} list - Dekhte parba character list.`
    }
  },

  fallbackCharacters: [
    { stt: 0, name: "Nezuko Kamado" },
    { stt: 1, name: "Tanjiro Kamado" },
    { stt: 2, name: "Sasuke Uchiha" },
    { stt: 3, name: "Naruto Uzumaki" },
    { stt: 4, name: "Gojo Satoru" },
    { stt: 5, name: "Luffy" },
    { stt: 6, name: "Levi Ackerman" },
    { stt: 7, name: "Itachi Uchiha" },
    { stt: 8, name: "Zero Two" },
    { stt: 9, name: "Mikasa Ackerman" }
  ],

  onStart: async function ({ args, message }) {
    const VALID_COLORS = ["red", "blue", "green", "purple", "black", "white", "yellow"];

    if (args[0] === "list") {
      const listText = this.fallbackCharacters.map(c => `${c.stt}. ${c.name}`).join("\n");
      return message.reply(`📋 Character List (Fallback):\n\n${listText}\n\nUse ID or Name in avatar command.`);
    }

    if (!args[0]) {
      return message.reply(`⚠️ Format thik moto dao bhai:\navatar [ID or Name] | [Background] | [Signature] | [Color (optional)]\nExample: avatar Nezuko | Mr. Smokey | Asif | red`);
    }

    const input = args.join(" ").split("|").map(i => i.trim());
    const [charInput, bgText, signText, colorBg] = input;

    if (!bgText || !signText) {
      return message.reply(`⚠️ Background ar Signature ditei hobe bhai!`);
    }

    if (colorBg && !VALID_COLORS.includes(colorBg.toLowerCase())) {
      return message.reply(`⚠️ Color thik nai! Use only: ${VALID_COLORS.join(", ")}`);
    }

    let charID = null;
    let charName = null;

    const foundChar = this.fallbackCharacters.find(
      c => c.name.toLowerCase() === charInput.toLowerCase() || c.stt === parseInt(charInput)
    );
    if (!foundChar) return message.reply(`❌ Character '${charInput}' list-e nai. Use: avatar list`);
    charID = foundChar.stt;
    charName = foundChar.name;

    // Working public API for avatar anime
    const API_URL = `https://imagegen-api.onrender.com/avatar-anime`;

    const params = {
      id: charID,
      chu_Nen: bgText,
      chu_Ky: signText,
      colorBg: colorBg || ""
    };

    try {
      const imgStream = await getStreamFromURL(API_URL, "avatar.png", { params });
      await message.reply({
        body: `✅ Done bhai! Avatar ready:\nCharacter: ${charName}\nBackground: ${bgText}\nSignature: ${signText}\nColor: ${colorBg || "default"}`,
        attachment: imgStream
      });
    } catch (err) {
      return message.reply("❌ Avatar generate kora gelo na! API down or connection error.");
    }
  }
};
