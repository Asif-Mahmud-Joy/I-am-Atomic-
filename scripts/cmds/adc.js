const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const { resolve } = require("path");

module.exports = {
  config: {
    name: "adc",
    aliases: ["atomicdev", "quantumcode"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 2,
    shortDescription: "⚛️ Quantum Code Management",
    longDescription: "Atomic-level code deployment and retrieval with quantum encryption",
    category: "⚡ Developer Tools",
    guide: {
      en: "Reply to link or use: {pn} [filename]"
    }
  },

  onStart: async function ({ api, event, args }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑 𝐂𝐎𝐌𝐌𝐀𝐍𝐃 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🔭", "💻", "🔒"]
    };
    // ================================================================================== //

    const formatResponse = (content) => {
      return [
        design.header,
        design.separator,
        content,
        design.separator,
        design.footer
      ].join("\n");
    };

    const { messageReply, threadID, messageID, type } = event;
    const senderID = event.senderID;
    const authorizedUsers = ["61571630409265"]; // Replace with your ID

    // Show atomic loading animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      // Quantum authorization
      if (!authorizedUsers.includes(senderID)) {
        return api.sendMessage(
          formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐀𝐂𝐂𝐄𝐒𝐒 𝐃𝐄𝐍𝐈𝐄𝐃\nOnly authorized developers can manipulate quantum code"),
          threadID
        );
      }

      // Handle file upload to Pastebin
      if (!messageReply && args[0]) {
        const fileName = args[0].replace(/\.js$/, '');
        const filePath = resolve(__dirname, `${fileName}.js`);
        
        if (!fs.existsSync(filePath)) {
          return api.sendMessage(
            formatResponse(`☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐅𝐈𝐋𝐄 𝐍𝐎𝐓 𝐅𝐎𝐔𝐍𝐃\nCommand ${fileName} does not exist in the quantum repository`),
            threadID
          );
        }

        const code = fs.readFileSync(filePath, "utf-8");
        const pasteData = new URLSearchParams();
        pasteData.append('api_dev_key', 'N5NL5MiwHU6EbQxsGtqy7iaodOcHithV');
        pasteData.append('api_option', 'paste');
        pasteData.append('api_paste_code', code);
        pasteData.append('api_paste_name', fileName);
        pasteData.append('api_paste_format', 'javascript');
        pasteData.append('api_paste_private', '1');

        const response = await axios.post('https://pastebin.com/api/api_post.php', pasteData);
        const pasteUrl = response.data.includes('http') ? 
                         response.data.replace('pastebin.com', 'pastebin.com/raw') : 
                         `https://pastebin.com/raw/${response.data.split('/').pop()}`;

        return api.sendMessage(
          formatResponse(`💾 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐃𝐄 𝐔𝐏𝐋𝐎𝐀𝐃𝐄𝐃\n${pasteUrl}`),
          threadID
        );
      }

      // Handle code deployment
      if (messageReply) {
        const text = messageReply.body;
        const urlMatch = text.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) {
          return api.sendMessage(
            formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐋𝐈𝐍𝐊 𝐈𝐍𝐕𝐀𝐋𝐈𝐃\nNo valid quantum link detected"),
            threadID
          );
        }

        const url = urlMatch[0];
        const fileName = args[0]?.replace(/\.js$/, '') || 'quantumscript';
        const filePath = resolve(__dirname, `${fileName}.js`);

        // Pastebin deployment
        if (url.includes("pastebin.com")) {
          try {
            const { data } = await axios.get(url.includes('/raw/') ? url : url.replace('pastebin.com', 'pastebin.com/raw'));
            fs.writeFileSync(filePath, data, "utf-8");
            return api.sendMessage(
              formatResponse(`✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐏𝐋𝐎𝐘𝐄𝐃\n${fileName}.js ready for quantum execution`),
              threadID
            );
          } catch (e) {
            return api.sendMessage(
              formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐏𝐋𝐎𝐘𝐌𝐄𝐍𝐓 𝐅𝐀𝐈𝐋𝐄𝐃\nPastebin energy field disrupted"),
              threadID
            );
          }
        }

        // Buildtool/TinyURL deployment
        if (url.includes("buildtool") || url.includes("tinyurl")) {
          try {
            const { data } = await axios.get(url);
            const $ = cheerio.load(data);
            const code = $('pre.language-js, .language-js').first().text() || 
                         $('script[type="text/javascript"]').first().html() ||
                         $('body').text();
            
            if (!code) throw new Error();
            
            fs.writeFileSync(filePath, code, "utf-8");
            return api.sendMessage(
              formatResponse(`✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐏𝐋𝐎𝐘𝐄𝐃\n${fileName}.js compiled successfully`),
              threadID
            );
          } catch (e) {
            return api.sendMessage(
              formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐂𝐎𝐃𝐈𝐍𝐆 𝐅𝐀𝐈𝐋𝐔𝐑𝐄\nCould not extract quantum script"),
              threadID
            );
          }
        }

        // Google Drive deployment
        if (url.includes("drive.google")) {
          try {
            const fileId = url.match(/[-\w]{25,}/)?.[0];
            const downloadUrl = `https://drive.google.com/uc?id=${fileId}&export=download`;
            const { data } = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            fs.writeFileSync(filePath, Buffer.from(data), "utf-8");
            return api.sendMessage(
              formatResponse(`✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐏𝐋𝐎𝐘𝐄𝐃\n${fileName}.js downloaded from quantum drive`),
              threadID
            );
          } catch (e) {
            return api.sendMessage(
              formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐑𝐈𝐕𝐄 𝐄𝐑𝐑𝐎𝐑\nFailed to access quantum storage"),
              threadID
            );
          }
        }

        return api.sendMessage(
          formatResponse("☢️ 𝐔𝐍𝐊𝐍𝐎𝐖𝐍 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐒𝐎𝐔𝐑𝐂𝐄\nSupported sources: Pastebin, Buildtool, Google Drive"),
          threadID
        );
      }

      return api.sendMessage(
        formatResponse("⚡ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐒𝐓𝐀𝐓𝐄\nReply to a link or provide filename"),
        threadID
      );

    } catch (error) {
      console.error("Quantum Developer Error:", error);
      return api.sendMessage(
        formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"),
        threadID
      );
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", messageID, () => {}, true);
    }
  }
};
