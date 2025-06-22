const axios = require('axios');
const fs = require('fs-extra');

const { getStreamFromURL } = global.utils;

const pathDir = __dirname + '/assets/hubble';
const pathData = pathDir + '/nasa.json';

if (!fs.existsSync(pathDir)) fs.mkdirSync(pathDir);

let hubbleData;

module.exports = {
  config: {
    name: "hubble",
    version: "2.0",
    author: "𝐀𝐬𝐢𝐟 𝐌𝐚𝐡𝐦𝐮𝐝",
    countDown: 5,
    role: 0,
    description: {
      vi: "Xem ảnh từ Hubble",
      en: "View Hubble images"
    },
    category: "owner",
    guide: {
      en: "{pn} <date (mm-dd)>"
    }
  },

  langs: {
    vi: {
      invalidDate: "Ngày tháng bạn nhập vào không hợp lệ, vui lòng nhập lại theo định dạng mm-dd",
      noImage: "Không có ảnh nào được tìm thấy trong ngày này"
    },
    en: {
      invalidDate: "The date you entered is invalid, please enter again in the mm-dd format",
      noImage: "No images were found on this day"
    },
    bn: {
      invalidDate: "Date ta thik na. mm-dd format e abar dao.",
      noImage: "Oi date e kono image pai nai."
    }
  },

  onLoad: async function () {
    try {
      if (!fs.existsSync(pathData)) {
        const res = await axios.get('https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/scripts/cmds/assets/hubble/nasa.json');
        fs.writeFileSync(pathData, JSON.stringify(res.data, null, 2));
      }
      hubbleData = JSON.parse(fs.readFileSync(pathData));
    } catch (err) {
      console.error("[hubble command load error]", err);
    }
  },

  onStart: async function ({ message, args, getLang }) {
    try {
      const date = args[0] || "";
      const dateText = checkValidDate(date);
      if (!date || !dateText)
        return message.reply(getLang('invalidDate'));

      const data = hubbleData.find(e => e.date.startsWith(dateText));
      if (!data)
        return message.reply(getLang('noImage'));

      const { image, name, caption, url } = data;
      const imgUrl = 'https://imagine.gsfc.nasa.gov/hst_bday/images/' + image;
      const getImage = await getStreamFromURL(imgUrl);

      const msg = `\uD83D\uDCC5 Date: ${dateText}\n\uD83C\uDF00 Name: ${name}\n\uD83D\uDCD6 Caption: ${caption}\n\uD83D\uDD17 Source: ${url}`;
      message.reply({
        body: msg,
        attachment: getImage
      });
    } catch (err) {
      console.error("[hubble command error]", err);
      message.reply("\uD83D\uDE1E Sorry, image download e somossa hoise.");
    }
  }
};

const monthText = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
function checkValidDate(date) {
  const dateArr = date.split(/[-/]/);
  if (dateArr.length !== 2) return false;

  let [a, b] = dateArr.map(x => parseInt(x));
  let month = a <= 12 ? a : b;
  let day = a <= 12 ? b : a;

  if (isNaN(month) || isNaN(day)) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  if (month === 2 && day > 29) return false;
  if ([4, 6, 9, 11].includes(month) && day > 30) return false;

  return monthText[month - 1] + ' ' + day;
}
