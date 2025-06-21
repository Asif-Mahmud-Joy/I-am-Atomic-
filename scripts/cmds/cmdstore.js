const axios = require("axios");
const availableCmdsUrl = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/availableCmds.json";
const cmdUrlsJson = "https://raw.githubusercontent.com/Mostakim0978/D1PT0/refs/heads/main/cmdUrls.json";
const ITEMS_PER_PAGE = 10;

// Atomic Design Elements
const ATOMIC_DESIGN = {
  colors: {
    primary: "#5E35B1",   // Deep Purple
    secondary: "#00BCD4", // Cyan
    accent: "#FF4081",    // Pink
    dark: "#1A237E",      // Indigo
    light: "#E3F2FD"      // Light Blue
  },
  icons: {
    command: "⚛️",
    author: "👤",
    update: "🔄",
    status: {
      active: "✅",
      beta: "🅱️",
      deprecated: "⛔"
    },
    navigation: {
      next: "⏭️",
      prev: "⏮️"
    }
  },
  elements: ["✦", "⧫", "⬥", "◈", "⬦", "⬪", "⟡"]
};

module.exports.config = {
  name: "cmdstore",
  aliases: ["cs", "cmds", "atomicstore"],
  author: "Dipto & Asif",
  role: 0,
  version: "7.0",
  description: {
    en: "⚡ Atomic Command Store with Enhanced UI",
  },
  countDown: 2,
  category: "atomic",
  guide: {
    en: "{pn} [command | character | page]",
  },
};

module.exports.onStart = async function ({ api, event, args }) {
  const query = args.join(" ").trim().toLowerCase();
  
  try {
    // Show loading animation
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    
    const response = await axios.get(availableCmdsUrl);
    let cmds = response.data.cmdName;
    let finalArray = cmds;
    let page = 1;
    let searchType = "all";

    if (query) {
      if (!isNaN(query)) {
        page = parseInt(query);
      } else if (query.length === 1) {
        finalArray = cmds.filter(cmd => cmd.cmd.startsWith(query));
        searchType = `starting with '${query}'`;
        if (finalArray.length === 0) {
          return api.sendMessage(
            `❌ | No commands found ${searchType}`,
            event.threadID,
            event.messageID
          );
        }
      } else {
        finalArray = cmds.filter(cmd => cmd.cmd.includes(query));
        searchType = `matching '${query}'`;
        if (finalArray.length === 0) {
          return api.sendMessage(
            `❌ | No commands found ${searchType}`,
            event.threadID,
            event.messageID
          );
        }
      }
    }

    const totalPages = Math.ceil(finalArray.length / ITEMS_PER_PAGE);
    if (page < 1 || page > totalPages) {
      return api.sendMessage(
        `❌ | Invalid page. Enter 1-${totalPages}`,
        event.threadID,
        event.messageID
      );
    }

    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, finalArray.length);
    const cmdsToShow = finalArray.slice(startIndex, endIndex);
    
    // Create atomic design header
    let msg = `╭─── 𝗔𝘁𝗼𝗺𝗶𝗰 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗦𝘁𝗼𝗿𝗲 ────✦\n`;
    msg += `│ 𝗣𝗮𝗴𝗲 ${page} of ${totalPages} | ${finalArray.length} commands ${searchType !== "all" ? `(${searchType})` : ''}\n`;
    msg += `├${'─'.repeat(35)}✦\n`;
    
    // Add commands with atomic styling
    cmdsToShow.forEach((cmd, index) => {
      const statusIcon = ATOMIC_DESIGN.icons.status[cmd.status?.toLowerCase()] || "🔹";
      const element = ATOMIC_DESIGN.elements[index % ATOMIC_DESIGN.elements.length];
      
      msg += `│ ${element} ${startIndex + index + 1}. ${cmd.cmd}\n`;
      msg += `│ ${ATOMIC_DESIGN.icons.author} ${cmd.author || 'Unknown'} `;
      msg += `${statusIcon} ${cmd.status || 'Active'}\n`;
      
      if (cmd.update) {
        msg += `│ ${ATOMIC_DESIGN.icons.update} ${cmd.update}\n`;
      }
      
      if (index < cmdsToShow.length - 1) {
        msg += `│${'─'.repeat(35)}✦\n`;
      }
    });
    
    // Create footer with navigation
    msg += `╰${'─'.repeat(35)}✦\n`;
    msg += `🔹 Navigation: `;
    
    if (page > 1) {
      msg += `${ATOMIC_DESIGN.icons.navigation.prev} ${page - 1} `;
    }
    
    if (page < totalPages) {
      msg += `${ATOMIC_DESIGN.icons.navigation.next} ${page + 1}`;
    }
    
    msg += `\n🔹 Reply with number to view command details`;

    // Send message with atomic design
    api.sendMessage(
      msg,
      event.threadID,
      (error, info) => {
        if (!error) {
          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            type: "reply",
            messageID: info.messageID,
            author: event.senderID,
            cmdName: finalArray,
            page: page,
            totalPages: totalPages
          });
        }
      },
      event.messageID
    );
    
    // Update reaction on success
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    
  } catch (error) {
    console.error(error);
    api.sendMessage(
      "⚡ | Quantum command retrieval failed. Try again later.",
      event.threadID,
      event.messageID
    );
    api.setMessageReaction("❌", event.messageID, () => {}, true);
  }
};

module.exports.onReply = async function ({ api, event, Reply }) {
  if (Reply.author != event.senderID) {
    return api.sendMessage("🔒 | Unauthorized access detected!", event.threadID, event.messageID);
  }
  
  const reply = parseInt(event.body);
  const startIndex = (Reply.page - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const validRange = Array.from({length: endIndex - startIndex}, (_, i) => startIndex + i + 1);

  if (isNaN(reply) || !validRange.includes(reply)) {
    const pageInfo = `Page ${Reply.page}/${Reply.totalPages} (Commands ${startIndex + 1}-${endIndex})`;
    return api.sendMessage(
      `❌ | Invalid selection. Reply with:\n` +
      `🔸 Number between ${startIndex + 1}-${endIndex} for command details\n` +
      `🔸 "b" to go back to command list\n` +
      `🔸 Page number to navigate\n\n` +
      `Current: ${pageInfo}`,
      event.threadID,
      event.messageID
    );
  }
  
  try {
    const cmdIndex = reply - 1;
    const cmdData = Reply.cmdName[cmdIndex];
    const cmdName = cmdData.cmd;
    
    // Show processing reaction
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    
    const response = await axios.get(cmdUrlsJson);
    const selectedCmdUrl = response.data[cmdName];
    
    if (!selectedCmdUrl) {
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      return api.sendMessage(
        "⚡ | Command URL not found in quantum database",
        event.threadID,
        event.messageID
      );
    }
    
    // Create atomic design command details
    const statusIcon = ATOMIC_DESIGN.icons.status[cmdData.status?.toLowerCase()] || "🔹";
    const element = ATOMIC_DESIGN.elements[cmdIndex % ATOMIC_DESIGN.elements.length];
    
    let detailMsg = `╭─── 𝗖𝗼𝗺𝗺𝗮𝗻𝗱 𝗗𝗲𝘁𝗮𝗶𝗹𝘀 ───✦\n`;
    detailMsg += `│ ${element} 𝗡𝗮𝗺𝗲: ${cmdName}\n`;
    detailMsg += `│ ${ATOMIC_DESIGN.icons.author} 𝗔𝘂𝘁𝗵𝗼𝗿: ${cmdData.author || 'Unknown'}\n`;
    detailMsg += `│ ${statusIcon} 𝗦𝘁𝗮𝘁𝘂𝘀: ${cmdData.status || 'Active'}\n`;
    
    if (cmdData.update) {
      detailMsg += `│ ${ATOMIC_DESIGN.icons.update} 𝗨𝗽𝗱𝗮𝘁𝗲𝗱: ${cmdData.update}\n`;
    }
    
    detailMsg += `│ 🔗 𝗨𝗥𝗟: ${selectedCmdUrl}\n`;
    detailMsg += `╰${'─'.repeat(35)}✦\n`;
    detailMsg += `🔹 Type "${this.config.name} b" to go back`;
    
    // Unsend original message and send details
    api.unsendMessage(Reply.messageID);
    api.sendMessage(detailMsg, event.threadID);
    api.setMessageReaction("✅", event.messageID, () => {}, true);
    
  } catch (error) {
    console.error(error);
    api.sendMessage(
      "⚡ | Quantum command retrieval failed",
      event.threadID,
      event.messageID
    );
    api.setMessageReaction("❌", event.messageID, () => {}, true);
  }
};
