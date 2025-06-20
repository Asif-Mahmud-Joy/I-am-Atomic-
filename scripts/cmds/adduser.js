const sleep = ms => new Promise(res => setTimeout(res, ms));

module.exports = {
  config: {
    name: "adduser",
    aliases: ["atomicadd", "quantumadd"],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 3,
    role: 1,
    shortDescription: {
      en: "⚛️ Quantum User Integration"
    },
    longDescription: {
      en: "Add members to groups using quantum entanglement protocols"
    },
    category: "⚡ Box Management",
    guide: {
      en: "{pn} [profile link | UID | reply | @mention]"
    }
  },

  langs: {
    en: {
      alreadyInGroup: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐔𝐏𝐋𝐈𝐂𝐀𝐓𝐄: User already exists in quantum field",
      successAdd: "✅ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐈𝐍𝐓𝐄𝐆𝐑𝐀𝐓𝐈𝐎𝐍: Added %1 user(s) to quantum matrix",
      pendingApproval: "⏳ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐏𝐄𝐍𝐃𝐈𝐍𝐆: %1 user(s) awaiting quantum approval",
      failedAdd: "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐅𝐀𝐈𝐋𝐔𝐑𝐄: Couldn't integrate %1 user(s)",
      invalidLink: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐈𝐍𝐕𝐀𝐋𝐈𝐃: Malformed quantum signature",
      cannotGetUid: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐎𝐁𝐒𝐂𝐔𝐑𝐄: User signature not found",
      linkNotExist: "⚠️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝐎𝐈𝐃: Quantum signature doesn't exist",
      cannotAddUser: "⛔ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐁𝐀𝐑𝐑𝐈𝐄𝐑: Quantum firewall blocked integration"
    }
  },

  onStart: async function ({ message, api, event, args, getLang }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐔𝐒𝐄𝐑 𝐈𝐍𝐓𝐄𝐆𝐑𝐀𝐓𝐎𝐑 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🔭", "👥", "🔗"]
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

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      // Get thread information
      const threadInfo = await api.getThreadInfo(event.threadID);
      const currentMembers = threadInfo.participantIDs;
      const isApprovalMode = threadInfo.approvalMode;
      const botID = api.getCurrentUserID();
      const isBotAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);

      const success = { direct: [], pending: [] };
      const failed = [];

      // Get target inputs
      const getInputs = () => {
        if (event.type === "message_reply") {
          return [event.messageReply.senderID];
        }
        if (Object.keys(event.mentions).length > 0) {
          return Object.keys(event.mentions);
        }
        return [...args];
      };

      const inputs = getInputs();

      // Quantum UID resolver
      const resolveQuantumUid = async (input) => {
        if (!isNaN(input)) return input;
        
        const facebookRegex = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:[^\/]+\/)?([^\/?]+)/i;
        if (facebookRegex.test(input)) {
          try {
            const uid = await api.getUID(input);
            if (!uid) throw new Error(getLang("linkNotExist"));
            return uid;
          } catch (e) {
            throw new Error(getLang("cannotGetUid"));
          }
        }
        throw new Error(getLang("invalidLink"));
      };

      // Process quantum integration
      for (const input of inputs) {
        try {
          const uid = await resolveQuantumUid(input);
          
          // Check quantum duplication
          if (currentMembers.includes(uid)) {
            failed.push(`${input}: ${getLang("alreadyInGroup")}`);
            continue;
          }

          // Attempt quantum integration
          try {
            await api.addUserToGroup(uid, event.threadID);
            
            if (isApprovalMode && !isBotAdmin) {
              success.pending.push(uid);
            } else {
              success.direct.push(uid);
            }
          } catch (addError) {
            // Handle quantum barrier (error code 100 = pending approval)
            if (addError.errorCode === 100) {
              success.pending.push(uid);
            } else {
              throw new Error(getLang("cannotAddUser"));
            }
          }
        } catch (error) {
          failed.push(`${input}: ${error.message}`);
        }
        await sleep(500); // Quantum stabilization delay
      }

      // Generate quantum report
      let quantumReport = "";
      
      if (success.direct.length > 0) {
        quantumReport += getLang("successAdd", success.direct.length) + "\n";
      }
      
      if (success.pending.length > 0) {
        quantumReport += getLang("pendingApproval", success.pending.length) + "\n";
      }
      
      if (failed.length > 0) {
        quantumReport += getLang("failedAdd", failed.length) + "\n";
        quantumReport += failed.map(f => `☢️ ${f}`).join("\n");
      }

      return message.reply(formatResponse(quantumReport));

    } catch (error) {
      console.error("Quantum Integration Error:", error);
      return message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
