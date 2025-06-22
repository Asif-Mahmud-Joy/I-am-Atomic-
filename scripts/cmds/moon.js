const moment = require("moment-timezone");
const fs = require("fs-extra");
const axios = require("axios");
const cheerio = require("cheerio");
const Canvas = require("canvas");
const https = require("https");
const agent = new https.Agent({ rejectUnauthorized: false });
const { getStreamFromURL } = global.utils;

module.exports = {
  config: {
    name: "moon",
    version: "2.0",
    author: "Asif",
    countDown: 5,
    role: 0,
    description: {
      vi: "xem ảnh mặt trăng vào đêm bạn chọn (dd/mm/yyyy)",
      en: "view moon image on the night you choose (dd/mm/yyyy)"
    },
    category: "image",
    guide: {
      vi: "{pn} <ngày/tháng/năm>\n{pn} <ngày/tháng/năm> <caption>",
      en: "{pn} <day/month/year>\n{pn} <day/month/year> <caption>"
    }
  },

  langs: {
    vi: {
      invalidDateFormat: "Vui lòng nhập ngày/tháng/năm hợp lệ theo định dạng DD/MM/YYYY",
      error: "Đã xảy ra lỗi không thể lấy ảnh mặt trăng của ngày %1",
      caption: "🌕 Ảnh mặt trăng vào đêm %1"
    },
    en: {
      invalidDateFormat: "Please enter a valid date in DD/MM/YYYY format",
      error: "An error occurred while getting the moon image of %1",
      caption: "🌕 Moon image on %1"
    }
  },

  onStart: async function ({ args, message, getLang }) {
    try {
      // Create retro terminal interface
      const retroHeader = this.createRetroHeader();
      message.reply(retroHeader);

      const date = checkDate(args[0]);
      if (!date) {
        const errorBox = this.createRetroBox("📅 INVALID DATE FORMAT", getLang("invalidDateFormat"));
        return message.reply(errorBox);
      }

      const linkCrawl = `https://lunaf.com/lunar-calendar/${date}`;
      
      let html;
      try {
        html = await axios.get(linkCrawl, { httpsAgent: agent });
      } catch (err) {
        const errorBox = this.createRetroBox("🚀 CONNECTION FAILED", getLang("error", args[0]));
        return message.reply(errorBox);
      }

      const $ = cheerio.load(html.data);
      const href = $("figure img").attr("data-ezsrcset");
      
      if (!href) {
        const errorBox = this.createRetroBox("🔭 NO DATA FOUND", "Moon data not available for this date");
        return message.reply(errorBox);
      }

      const numberMatch = href.match(/phase-(\d+)\.png/);
      if (!numberMatch) {
        const errorBox = this.createRetroBox("🌑 PARSE ERROR", "Failed to detect moon phase");
        return message.reply(errorBox);
      }

      const number = numberMatch[1];
      const imgSrc = moonImages[Number(number)];
      
      const moonInfo = $($('h3').get()[0]).text();
      const phaseInfo = $("#phimg > small").text();
      
      // Retro-style message body
      const msg = this.createRetroBox(
        "🌙 MOON PHASE INFORMATION",
        `${getLang("caption", args[0])}\n` +
        `├─ Phase: ${phaseInfo}\n` +
        `├─ Details: ${moonInfo}\n` +
        `├─ Image URL: https://lunaf.com/img/moon/h-phase-${number}.png\n` +
        `└─ Source: ${linkCrawl}`
      );

      if (args[1]) {
        try {
          const { data: imgSrcBuffer } = await axios.get(imgSrc, { responseType: "arraybuffer" });
          const canvas = Canvas.createCanvas(800, 600);
          const ctx = canvas.getContext("2d");
          
          // Retro terminal background
          ctx.fillStyle = "#0a0e17";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          
          // Draw stars (retro terminal effect)
          this.drawStars(ctx, canvas.width, canvas.height, 150);
          
          // Draw moon
          const moon = await Canvas.loadImage(imgSrcBuffer);
          const moonSize = 400;
          ctx.drawImage(
            moon, 
            (canvas.width - moonSize) / 2, 
            50, 
            moonSize, 
            moonSize
          );
          
          // Draw caption in retro terminal style
          ctx.font = "24px 'Courier New', monospace";
          ctx.fillStyle = "#00ff00";
          ctx.textAlign = "center";
          
          const caption = args.slice(1).join(" ");
          ctx.fillText("> " + caption.toUpperCase(), canvas.width / 2, 500);
          
          // Draw border
          ctx.strokeStyle = "#00ff00";
          ctx.lineWidth = 2;
          ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);
          
          // Save and send
          const pathSave = __dirname + "/tmp/retroMoon.png";
          fs.writeFileSync(pathSave, canvas.toBuffer());
          
          message.reply({
            body: msg,
            attachment: fs.createReadStream(pathSave)
          }, () => fs.unlinkSync(pathSave));
          
        } catch (err) {
          const errorBox = this.createRetroBox("🖼️ RENDER ERROR", "Failed to create moon image");
          message.reply(errorBox);
        }
      } else {
        const streamImg = await getStreamFromURL(imgSrc);
        message.reply({
          body: msg,
          attachment: streamImg
        });
      }
    } catch (error) {
      const errorBox = this.createRetroBox("💥 SYSTEM FAILURE", "An unexpected error occurred");
      message.reply(errorBox);
    }
  },

  createRetroHeader: function() {
    return "╔══════════════════════════════╗\n" +
           "╟┼► MOON PHASE TERMINAL v2.0 ◄┼╢\n" +
           "╚══════════════════════════════╝";
  },

  createRetroBox: function(title, content) {
    const lines = content.split('\n');
    const maxLength = Math.max(title.length, ...lines.map(l => l.length));
    
    let box = `╔${'═'.repeat(maxLength + 2)}╗\n`;
    box += `║ ${title.padEnd(maxLength, ' ')} ║\n`;
    box += `╟${'─'.repeat(maxLength + 2)}╢\n`;
    
    for (const line of lines) {
      box += `║ ${line.padEnd(maxLength, ' ')} ║\n`;
    }
    
    box += `╚${'═'.repeat(maxLength + 2)}╝`;
    return box;
  },

  drawStars: function(ctx, width, height, count) {
    ctx.fillStyle = "#ffffff";
    for (let i = 0; i < count; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const radius = Math.random() * 1.5;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
  }
};

// Font registration
Canvas.registerFont(__dirname + "/assets/font/Kanit-SemiBoldItalic.ttf", {
  family: "Kanit SemiBold"
});

function checkDate(date) {
  const [day0, month0, year0] = (date || "").split('/');
  const day = (day0 || "").length == 1 ? "0" + day0 : day0;
  const month = (month0 || "").length == 1 ? "0" + month0 : month0;
  const year = year0 || "";
  const newDateFormat = year + "/" + month + "/" + day;
  return moment(newDateFormat, 'YYYY/MM/DD', true).isValid() ? newDateFormat : false;
}

const moonImages = [
  'https://i.ibb.co/9shyYH1/moon-0.png',
  'https://i.ibb.co/vBXLL37/moon-1.png',
  'https://i.ibb.co/0QCKK9D/moon-2.png',
  'https://i.ibb.co/Dp62X2j/moon-3.png',
  'https://i.ibb.co/xFKCtfd/moon-4.png',
  'https://i.ibb.co/m4L533L/moon-5.png',
  'https://i.ibb.co/VmshdMN/moon-6.png',
  'https://i.ibb.co/4N7R2B2/moon-7.png',
  'https://i.ibb.co/C2k4YB8/moon-8.png',
  'https://i.ibb.co/F62wHxP/moon-9.png',
  'https://i.ibb.co/Gv6R1mk/moon-10.png',
  'https://i.ibb.co/0ZYY7Kk/moon-11.png',
  'https://i.ibb.co/KqXC5F5/moon-12.png',
  'https://i.ibb.co/BGtLpRJ/moon-13.png',
  'https://i.ibb.co/jDn7pPx/moon-14.png',
  'https://i.ibb.co/kykn60t/moon-15.png',
  'https://i.ibb.co/qD4LFLs/moon-16.png',
  'https://i.ibb.co/qJm9gcQ/moon-17.png',
  'https://i.ibb.co/yYFYZx9/moon-18.png',
  'https://i.ibb.co/8bc7vpZ/moon-19.png',
  'https://i.ibb.co/jHG7DKs/moon-20.png',
  'https://i.ibb.co/5WD18Rn/moon-21.png',
  'https://i.ibb.co/3Y06yHM/moon-22.png',
  'https://i.ibb.co/4T8Zdfy/moon-23.png',
  'https://i.ibb.co/n1CJyP4/moon-24.png',
  'https://i.ibb.co/zFwJRqz/moon-25.png',
  'https://i.ibb.co/gVBmMCW/moon-26.png',
  'https://i.ibb.co/hRY89Hn/moon-27.png',
  'https://i.ibb.co/7C13s7Z/moon-28.png',
  'https://i.ibb.co/2hDTwB4/moon-29.png',
  'https://i.ibb.co/Rgj9vpj/moon-30.png',
  'https://i.ibb.co/s5z0w9R/moon-31.png'
];
