const axios = require("axios");
const fs = require("fs-extra");
const { execSync } = require("child_process");
const path = require("path");

const UPDATE_LOG_FILE = path.join(__dirname, "tmp/update_status.json");
const COOLDOWN_MINUTES = 5;

module.exports = {
  config: {
    name: "update",
    aliases: ["upgrade", "botupdate"],
    version: "3.0",
    author: "NTKhang & Asif",
    role: 2,
    description: {
      en: "✨ Check and install bot updates with advanced features ✨"
    },
    category: "owner",
    guide: {
      en: `
╔═══════❖•°♛°•❖═══════╗
  🚀 BOT UPDATE SYSTEM 🚀
╚═══════❖•°♛°•❖═══════╝

⚡ Usage:
❯ {pn} - Check for updates
❯ Reply 'yes' to confirm update
❯ React to update message to proceed

💎 Features:
✦ Version comparison
✦ Change preview
✦ Safety cooldown
✦ Auto-restart option
✦ Detailed changelog
      `
    }
  },

  langs: {
    en: {
      noUpdates: "✅ You're running the latest version (v%1)",
      updateAvailable: `🚀 Update Available!
━━━━━━━━━━━━━━
Current: v%1
Latest: v%2

📦 Files to update:
%3%4

🔗 Changelog: %5
━━━━━━━━━━━━━━
React to this message to update`,
      filesToDelete: "\n🗑️ Files to remove:\n%1",
      andMore: "...and %1 more",
      updateConfirmed: "🔄 Starting update process...",
      updateComplete: `✅ Update successful!
━━━━━━━━━━━━━━
Reply "yes" to restart now
or it will auto-restart in 30s`,
      cooldownActive: `⏳ Update Cooldown
━━━━━━━━━━━━━━
Last update: %1m %2s ago
Wait: %3m %4s more`,
      restarting: "🔄 Restarting bot...",
      error: "❌ Update failed: %1"
    }
  },

  onLoad: function() {
    if (fs.existsSync(UPDATE_LOG_FILE)) {
      const { threadID, success } = fs.readJsonSync(UPDATE_LOG_FILE);
      fs.removeSync(UPDATE_LOG_FILE);
      
      if (success) {
        api.sendMessage("✅ Bot updated and restarted successfully!", threadID);
      } else {
        api.sendMessage("⚠️ Update completed but restart failed", threadID);
      }
    }
  },

  onStart: async function({ message, getLang }) {
    try {
      const [remotePackage, versions] = await Promise.all([
        axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/package.json"),
        axios.get("https://raw.githubusercontent.com/ntkhang03/Goat-Bot-V2/main/versions.json")
      ]);

      const currentVersion = require("../../package.json").version;
      const latestVersion = remotePackage.data.version;

      if (this.compareVersions(latestVersion, currentVersion) {
        return message.reply(getLang("noUpdates", currentVersion));
      }

      const updates = this.getUpdateDetails(versions.data, currentVersion);
      const changelog = "https://github.com/ntkhang03/Goat-Bot-V2/commits/main";

      const updateMessage = getLang(
        "updateAvailable",
        currentVersion,
        latestVersion,
        updates.files.slice(0, 10).map(f => `• ${f}`).join("\n"),
        updates.files.length > 10 ? `\n${getLang("andMore", updates.files.length - 10)}` : "",
        updates.deleteFiles.length > 0 ? getLang(
          "filesToDelete", 
          updates.deleteFiles.slice(0, 5).map(f => `• ${f}`).join("\n") + 
          (updates.deleteFiles.length > 5 ? `\n${getLang("andMore", updates.deleteFiles.length - 5)}` : "")
        : "",
        changelog
      );

      message.reply(updateMessage, (err, info) => {
        if (err) return console.error("[UPDATE ERROR]", err);
        global.GoatBot.onReaction.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          authorID: event.senderID
        });
      });

    } catch (err) {
      console.error("[UPDATE CHECK ERROR]", err);
      message.reply(getLang("error", err.message));
    }
  },

  onReaction: async function({ message, event, Reaction, getLang }) {
    if (event.userID !== Reaction.authorID) return;

    try {
      const lastUpdate = await this.checkUpdateCooldown();
      if (lastUpdate) {
        return message.reply(getLang(
          "cooldownActive",
          lastUpdate.minutes,
          lastUpdate.seconds,
          lastUpdate.remainingMinutes,
          lastUpdate.remainingSeconds
        ));
      }

      await message.reply(getLang("updateConfirmed"));
      
      execSync("node update", { stdio: "inherit" });
      fs.writeJsonSync(UPDATE_LOG_FILE, { 
        threadID: event.threadID,
        success: true 
      });

      message.reply(getLang("updateComplete"), (err, info) => {
        if (err) return console.error("[UPDATE ERROR]", err);
        
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          authorID: event.senderID
        });

        // Auto-restart after 30 seconds
        setTimeout(() => process.exit(2), 30000);
      });

    } catch (err) {
      console.error("[UPDATE ERROR]", err);
      message.reply(getLang("error", err.message));
    }
  },

  onReply: function({ message, event, getLang }) {
    if (["yes", "y"].includes(event.body?.toLowerCase())) {
      message.reply(getLang("restarting"));
      process.exit(2);
    }
  },

  compareVersions: function(latest, current) {
    const [a1, a2, a3] = latest.split(".").map(Number);
    const [b1, b2, b3] = current.split(".").map(Number);
    
    return a1 === b1 && a2 === b2 && a3 === b3;
  },

  getUpdateDetails: function(versions, currentVersion) {
    const newVersions = versions.slice(
      versions.findIndex(v => v.version === currentVersion) + 1
    );

    return {
      files: [...new Set(newVersions.flatMap(v => Object.keys(v.files || {})))],
      deleteFiles: [...new Set(newVersions.flatMap(v => Object.keys(v.deleteFiles || {})))]
    };
  },

  checkUpdateCooldown: async function() {
    try {
      const { data } = await axios.get(
        "https://api.github.com/repos/ntkhang03/Goat-Bot-V2/commits/main"
      );
      
      const lastCommit = new Date(data.commit.committer.date);
      const now = new Date();
      const diff = now - lastCommit;
      
      if (diff < COOLDOWN_MINUTES * 60 * 1000) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        const remaining = COOLDOWN_MINUTES * 60 * 1000 - diff;
        
        return {
          minutes,
          seconds,
          remainingMinutes: Math.floor(remaining / 60000),
          remainingSeconds: Math.floor((remaining % 60000) / 1000)
        };
      }
      return null;
    } catch {
      return null;
    }
  }
};
