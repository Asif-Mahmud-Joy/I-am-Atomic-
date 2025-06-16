const axios = require("axios");
const fs = require("fs-extra");

module.exports = {
  config: {
    name: "ronaldo",
    aliases: ["cr7"],
    version: "1.1",
    author: "✨ Mr.Smokey [Asif Mahmud] ✨",
    countDown: 5,
    role: 0,
    shortDescription: "Send you a pic of Ronaldo",
    longDescription: "Sends a random picture of Cristiano Ronaldo 🐐",
    category: "football",
    guide: "{pn}"
  },

  onStart: async function ({ message }) {
    const images = [
      "https://i.imgur.com/gwAuLMT.jpg", "https://i.imgur.com/MuuhaJ4.jpg",
      "https://i.imgur.com/6t0R8fs.jpg", "https://i.imgur.com/7RTC4W5.jpg",
      "https://i.imgur.com/VTi2dTP.jpg", "https://i.imgur.com/gdXJaK9.jpg",
      "https://i.imgur.com/VqZp7IU.jpg", "https://i.imgur.com/9pio8Lb.jpg",
      "https://i.imgur.com/iw714Ym.jpg", "https://i.imgur.com/zFbcrjs.jpg",
      "https://i.imgur.com/e0td0K9.jpg", "https://i.imgur.com/gsJWOmA.jpg",
      "https://i.imgur.com/lU8CaT0.jpg", "https://i.imgur.com/mmZXEYl.jpg",
      "https://i.imgur.com/d2Ot9pW.jpg", "https://i.imgur.com/iJ1ZGwZ.jpg",
      "https://i.imgur.com/isqQhNQ.jpg", "https://i.imgur.com/GoKEy4g.jpg",
      "https://i.imgur.com/TjxTUsl.jpg", "https://i.imgur.com/VwPPL03.jpg",
      "https://i.imgur.com/45zAhI7.jpg", "https://i.imgur.com/n3agkNi.jpg",
      "https://i.imgur.com/F2mynhI.jpg", "https://i.imgur.com/XekHaDO.jpg"
    ];

    const randomImg = images[Math.floor(Math.random() * images.length)];

    try {
      const res = await axios.get(randomImg, { responseType: "stream" });
      message.send({
        body: "「 Here Comes The GOAT 🐐 Ronaldo! 」",
        attachment: res.data
      });
    } catch (err) {
      console.error("Failed to fetch image:", err);
      message.send("⚠️ Sorry, couldn't fetch Ronaldo's photo. Try again later.");
    }
  }
};
