const moment = require("moment-timezone");

module.exports = {
  config: {
    name: "accept",
    aliases: ['acp', 'quantumfriend'],
    version: "3.0",
    author: "Asif Mahmud | Atomic Edition",
    countDown: 5,
    role: 2,
    shortDescription: "⚛️ Quantum Friend Management",
    longDescription: "Accept/delete friend requests using quantum entanglement protocols",
    category: "⚡ Utility",
  },

  onReply: async function ({ message, Reply, event, api }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐅𝐑𝐈𝐄𝐍𝐃 𝐌𝐀𝐍𝐀𝐆𝐄𝐑 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["⚡", "⏳", "🔭", "🤝", "🗑️"]
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

    const { author, listRequest, messageID } = Reply;
    if (author !== event.senderID) return;

    // Show atomic processing animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      const args = event.body.trim().split(/\s+/);
      const action = args[0]?.toLowerCase();
      const targets = args.slice(1);

      if (!['add', 'del'].includes(action)) {
        return message.reply(formatResponse("☢️ 𝐈𝐍𝐕𝐀𝐋𝐈𝐃 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐌𝐌𝐀𝐍𝐃\nUse: add/del [index|all]"));
      }

      clearTimeout(Reply.unsendTimeout);

      const formBase = {
        av: api.getCurrentUserID(),
        fb_api_caller_class: "RelayModern",
        variables: {
          input: {
            source: "friends_tab",
            actor_id: api.getCurrentUserID(),
            client_mutation_id: Math.random().toString(36).substring(2, 15)
          },
          scale: 3,
          refresh_num: 0
        }
      };

      formBase.fb_api_req_friendly_name = action === "add" 
        ? "FriendingCometFriendRequestConfirmMutation" 
        : "FriendingCometFriendRequestDeleteMutation";

      const ids = targets[0] === "all" 
        ? Array.from({ length: listRequest.length }, (_, i) => i + 1)
        : targets.map(Number).filter(n => !isNaN(n));

      const successes = [];
      const failures = [];

      for (const index of ids) {
        const user = listRequest[index - 1];
        if (!user) {
          failures.push(`☢️ Invalid quantum index: ${index}`);
          continue;
        }

        const form = JSON.parse(JSON.stringify(formBase));
        form.variables.input.friend_requester_id = user.node.id;
        form.variables = JSON.stringify(form.variables);

        try {
          const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
          const json = JSON.parse(res);
          if (json.errors) {
            failures.push(`☢️ ${user.node.name}`);
          } else {
            successes.push(`✅ ${user.node.name}`);
          }
        } catch (e) {
          failures.push(`☢️ ${user.node.name}`);
        }
      }

      let resultMessage = "";
      if (successes.length > 0) {
        resultMessage += `✨ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐎𝐍 𝐒𝐔𝐂𝐂𝐄𝐒𝐒\n`;
        resultMessage += `${action === "add" ? "Accepted" : "Deleted"} ${successes.length} requests:\n`;
        resultMessage += successes.join("\n");
      }

      if (failures.length > 0) {
        if (resultMessage) resultMessage += "\n\n";
        resultMessage += `☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐎𝐏𝐄𝐑𝐀𝐓𝐈𝐎𝐍 𝐅𝐀𝐈𝐋𝐔𝐑𝐄\n`;
        resultMessage += `Failed ${failures.length} requests:\n`;
        resultMessage += failures.join("\n");
      }

      if (!resultMessage) {
        resultMessage = "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐍𝐔𝐋𝐋 𝐑𝐄𝐒𝐔𝐋𝐓\nNo operations performed";
      }

      message.reply(formatResponse(resultMessage));
      api.unsendMessage(messageID);

    } catch (error) {
      console.error("Quantum Friend Error:", error);
      message.reply(formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nSystem overload detected"));
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  },

  onStart: async function ({ event, api, commandName }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐅𝐑𝐈𝐄𝐍𝐃 𝐌𝐀𝐍𝐀𝐆𝐄𝐑 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["🔍", "⏳", "📋", "👥", "⚡"]
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

    // Show atomic loading animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], event.messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      const form = {
        av: api.getCurrentUserID(),
        fb_api_req_friendly_name: "FriendingCometFriendRequestsRootQueryRelayPreloader",
        fb_api_caller_class: "RelayModern",
        variables: JSON.stringify({ input: { scale: 3 } })
      };

      const res = await api.httpPost("https://www.facebook.com/api/graphql/", form);
      const jsonResponse = JSON.parse(res);
      
      if (!jsonResponse.data) {
        return api.sendMessage(
          formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐀𝐓𝐀 𝐄𝐑𝐑𝐎𝐑\nFailed to retrieve friend requests"),
          event.threadID
        );
      }

      const listRequest = jsonResponse.data.viewer.friending_possibilities?.edges || [];

      if (!listRequest.length) {
        return api.sendMessage(
          formatResponse("📭 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐕𝐀𝐂𝐔𝐔𝐌\nNo friend requests detected"),
          event.threadID
        );
      }

      const timezone = global.GoatBot.config.timeZone || "Asia/Dhaka";
      let msg = "👥 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐑𝐄𝐐𝐔𝐄𝐒𝐓 𝐋𝐈𝐒𝐓:\n\n";
      
      listRequest.forEach((user, i) => {
        msg += `🔹 ${i + 1}. ${user.node.name}\n`;
        msg += `   ⚛️ ID: ${user.node.id}\n`;
        msg += `   🌐 URL: ${user.node.url.replace("www.facebook", "fb")}\n`;
        msg += `   ⏰ Time: ${moment(user.time * 1000).tz(timezone).format("DD/MM/YYYY HH:mm:ss")}\n\n`;
      });

      msg += "\n⚡ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐌𝐌𝐀𝐍𝐃𝐒:\n";
      msg += "» add [number|all] - Accept quantum connection\n";
      msg += "» del [number|all] - Delete quantum request\n\n";
      msg += "Example: add all (accept all requests)";

      api.sendMessage(
        formatResponse(msg),
        event.threadID,
        (e, info) => {
          global.GoatBot.onReply.set(info.messageID, {
            commandName,
            messageID: info.messageID,
            listRequest,
            author: event.senderID,
            unsendTimeout: setTimeout(() => {
              api.unsendMessage(info.messageID);
              api.sendMessage(
                formatResponse("⏳ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐓𝐈𝐌𝐄𝐎𝐔𝐓\nFriend request interface expired"),
                event.threadID
              );
            }, 180000) // 3 minutes
          });
        },
        event.messageID
      );

    } catch (error) {
      console.error("Quantum Friend Error:", error);
      api.sendMessage(
        formatResponse("☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐂𝐎𝐑𝐄 𝐌𝐄𝐋𝐓𝐃𝐎𝐖𝐍\nFailed to access quantum friend data"),
        event.threadID
      );
    } finally {
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", event.messageID, () => {}, true);
    }
  }
};
