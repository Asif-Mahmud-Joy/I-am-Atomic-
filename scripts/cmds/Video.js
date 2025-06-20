const axios = require("axios");

module.exports = {
  config: {
    name: "wallpaper",
    aliases: ["animewall", "atomicwp"],
    version: "3.0",
    author: "Kshitiz | Enhanced by Asif Mahmud",
    countDown: 3,
    role: 0,
    shortDescription: "Quantum Anime Wallpapers",
    longDescription: "Access atomic-powered anime wallpapers with quantum rotation",
    category: "⚛️ Science Media",
    guide: "{p}wallpaper"
  },

  // Quantum wallpaper repository
  wallpapers: [
    { animeName: "Naruto", imageUrl: "https://drive.google.com/uc?export=download&id=1OP2zmycLmFihRISVLzFwrw__LRBsF9GN" },
    { animeName: "One Piece", imageUrl: "https://drive.google.com/uc?export=download&id=1QaK3EfNmbwAgpJm4czY8n8QRau9MXoaR" },
    { animeName: "Dragon Ball Z", imageUrl: "https://drive.google.com/uc?export=download&id=1q-8lFZD5uPmhRySvT75Bgsr2lp9UQ4Mi" },
    { animeName: "Bleach", imageUrl: "https://drive.google.com/uc?export=download&id=1bds-i6swtqi2k4YCoglPKTV7kL7f-SF7" },
    { animeName: "My Hero Academia", imageUrl: "https://drive.google.com/uc?export=download&id=1uOcTZ8r1zDGmqF9Nyg1vupuWHKEg1eVf" },
    { animeName: "Attack on Titan", imageUrl: "https://drive.google.com/uc?export=download&id=1DrBwp7irJrW_DVmIXHbNvFjofHCTmZ0a" },
    { animeName: "Hunter x Hunter", imageUrl: "https://drive.google.com/uc?export=download&id=1W4RHPv1zWtFUGFVUJ0uiCxvP5ovpURHG" },
    { animeName: "Fullmetal Alchemist: Brotherhood", imageUrl: "https://drive.google.com/uc?export=download&id=1C-pRqtjpCFFPSZf8xAsNLgn9VgZBUgu6" },
    { animeName: "Demon Slayer: Kimetsu no Yaiba", imageUrl: "https://drive.google.com/uc?export=download&id=1vU5XMLgKwBPfsiheUF4SK79LfKbzU6NX" },
    { animeName: "Death Note", imageUrl: "https://drive.google.com/uc?export=download&id=1tUJEum_tf79gj9420mHx-_q7f0QP27DC" },
    { animeName: "Yu Yu Hakusho", imageUrl: "https://drive.google.com/uc?export=download&id=1JL07gw2S4f6T_d9ufWDnNkDme3zqOuLU" },
    { animeName: "Fairy Tail", imageUrl: "https://drive.google.com/uc?export=download&id=13WKaqx8rdmwZE7VDWRK0fFkk8zkA7AOi" },
    { animeName: "One Punch Man", imageUrl: "https://drive.google.com/uc?export=download&id=10KOnQyrli8HPaeThalyN3KA2yX0T28Uj" },
    { animeName: "Sword Art Online", imageUrl: "https://drive.google.com/uc?export=download&id=1JxczwxBgreEc4tZdLTdFHh6klsvlCYkM" },
    { animeName: "JoJo's Bizarre Adventure", imageUrl: "https://drive.google.com/uc?export=download&id=1aKzkrSAYAPXNIPhazTT6pkQxJpdQOD2p" },
    { animeName: "Dragon Ball", imageUrl: "https://drive.google.com/uc?export=download&id=1oonrlOFBjdYLV2zv9V-oB0AenGH4HNr2" },
    { animeName: "Haikyuu!!", imageUrl: "https://drive.google.com/uc?export=download&id=1tFHwCTNgoLHi34YL6fdXq2taZINZERHR" },
    { animeName: "Black Clover", imageUrl: "https://drive.google.com/uc?export=download&id=1ecenM1HVzgPtwaN8eISfxwBB-uKqdZoj" },
    { animeName: "The Seven Deadly Sins", imageUrl: "https://drive.google.com/uc?export=download&id=1FzV9FwXri9xxwAy-xrlA8zA6dyO70tkf" },
    { animeName: "Mob Psycho 100", imageUrl: "https://drive.google.com/uc?export=download&id=1qBXCvbhENmyC05vLHQLFJR-xlf5HhZzF" },
    { animeName: "Assassination Classroom", imageUrl: "https://drive.google.com/uc?export=download&id=13IP6cwdimzHv3nUJi-kODbGKIAHpJEAy" },
    { animeName: "Toriko", imageUrl: "https://drive.google.com/uc?export=download&id=1Gu6us6Ue5530ynkpFu-vsGOCynq_o6EI" },
    { animeName: "Blue Exorcist", imageUrl: "https://drive.google.com/uc?export=download&id=1f8CGrENwaHOgy11yeNdPwDI_nzpcESky" },
    { animeName: "Noragami", imageUrl: "https://drive.google.com/uc?export=download&id=1PxUiu6ZhJT5btIAWNubNPD3cQPNWnvYp" },
    { animeName: "Gurren Lagann", imageUrl: "https://drive.google.com/uc?export=download&id=1o57c1C7yXr_RDHz0lAH9lWJUgpMzQn1x" },
    { animeName: "Magi: The Labyrinth of Magic", imageUrl: "https://drive.google.com/uc?export=download&id=1hQEdeO3F8v1sZQvZ6uh5n_YTwuizYt0v" },
    { animeName: "Beelzebub", imageUrl: "https://drive.google.com/uc?export=download&id=1Lz3PNL1X4ygv1U7xcFgILYODtGiwaGn9" },
    { animeName: "Fire Force", imageUrl: "https://drive.google.com/uc?export=download&id=11vryRMTkLuFvhlWjVZkuAaS0QoesIlwo" },
    { animeName: "The Rising of the Shield Hero", imageUrl: "https://drive.google.com/uc?export=download&id=1oRD7AAH_VD73o8kUlUaJQC1dFTrV1nDz" },
    { animeName: "Dr. Stone", imageUrl: "https://drive.google.com/uc?export=download&id=1jpb7fFDZpdHjACghQWUQopI0nzzvzrxY" },
    { animeName: "The Promised Neverland", imageUrl: "https://drive.google.com/uc?export=download&id=1AREnLG7w6VSdKuTi-gtnb39aoV8XdUXV" },
    { animeName: "World Trigger", imageUrl: "https://drive.google.com/uc?export=download&id=1yo-18brlycFf_ieBoWrUXXpAoUP3aUUX" },
    { animeName: "Kuroko's Basketball", imageUrl: "https://drive.google.com/uc?export=download&id=10DLx4o4V_aC9IoQyJmhd5as6bbyYzUFD" },
    { animeName: "K-On!", imageUrl: "https://drive.google.com/uc?export=download&id=1lR87igFhcRilVCky_0dzRT7TwQwd0ROt" },
    { animeName: "Durarara!!", imageUrl: "https://drive.google.com/uc?export=download&id=1OPE1Iva4JcoZkBUM8A2RokUuNwmAFXVu" },
    { animeName: "D.Gray-man", imageUrl: "https://drive.google.com/uc?export=download&id=1A6GOPhwuUZONyQvNjXtd8v5uhVuJ4a9N" },
    { animeName: "Seraph of the End", imageUrl: "https://drive.google.com/uc?export=download&id=1w77GthKwlhZlyPWHzg3adtiqRJ9znLeR" },
    { animeName: "Gintama", imageUrl: "https://drive.google.com/uc?export=download&id=1UCaRajoK2ZprPAWNWK7aRQhHDirY3-Hs" },
    { animeName: "Air Gear", imageUrl: "https://drive.google.com/uc?export=download&id=1dfTNijY40l_CZHhP__yd-v_RozKtwHw_" },
    { animeName: "Hajime no Ippo", imageUrl: "https://drive.google.com/uc?export=download&id=1cASzbVsNR-YXv02ZLdVvL-6Fsoc2B1FJ" },
    { animeName: "Rurouni Kenshin", imageUrl: "https://drive.google.com/uc?export=download&id=1MA1_270eyhBkMRF001wE2QWoq0_6EjpK" },
    { animeName: "Yu-Gi-Oh!", imageUrl: "https://drive.google.com/uc?export=download&id=19g-LMWLAhWPNbbjXrzk22ai3qFen9QXt" },
    { animeName: "Katekyo Hitman Reborn!", imageUrl: "https://drive.google.com/uc?export=download&id=1Qq-AGdBalodBDmQcY6iPC4kUUS0z7A73" },
    { animeName: "Shaman King", imageUrl: "https://drive.google.com/uc?export=download&id=1mW49sTK7YwyLE1MY-6z64mYbPE7iDlsl" },
    { animeName: "Neon Genesis Evangelion", imageUrl: "https://drive.google.com/uc?export=download&id=1dp3Pe3Ckbu6MsnlAEj5QsbQrp6chTe-p" },
    { animeName: "Blue Dragon", imageUrl: "https://drive.google.com/uc?export=download&id=1dKXAveL6LyBgClgscDrAa-doaavwXtdq" },
    { animeName: "Zatch Bell!", imageUrl: "https://drive.google.com/uc?export=download&id=1RTRPU9yF3tIfzG-rNWljdfzzLgxgxEVk" },
    { animeName: "Eyeshield 21", imageUrl: "https://drive.google.com/uc?export=download&id=1e0XOffNUQtfQDwOLZ0e7IwlBOneZdOZo" },
    { animeName: "Kenichi: The Mightiest Disciple", imageUrl: "https://drive.google.com/uc?export=download&id=1DysZxKEN_QSfMjB3DDOR-iWHFshmae_Y" },
    { animeName: "Beyblade", imageUrl: "https://drive.google.com/uc?export=download&id=14UrkjjLC2595N5yUClXRxsjq3x81unHU" }
  ],

  sentWallpapers: [],

  onStart: async function ({ api, event, message }) {
    // =============================== ⚛️ ATOMIC DESIGN ⚛️ =============================== //
    const design = {
      header: "⚛️ 𝐀𝐓𝐎𝐌𝐈𝐂 𝐀𝐍𝐈𝐌𝐄 𝐖𝐀𝐋𝐋𝐏𝐀𝐏𝐄𝐑𝐒 ⚛️",
      separator: "•⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅⋅•",
      footer: "☢️ Powered by Quantum Core | ATOM Edition ☢️",
      emojis: ["🔭", "⏳", "⚗️", "🧪", "💫"]
    };
    // ================================================================================== //

    const { threadID, messageID } = event;

    // Show atomic loading animation
    let loadingIndex = 0;
    const loadingInterval = setInterval(() => {
      api.setMessageReaction(design.emojis[loadingIndex], messageID, () => {});
      loadingIndex = (loadingIndex + 1) % design.emojis.length;
    }, 500);

    try {
      // Get available wallpapers
      let availableWallpapers = this.wallpapers.filter(
        wp => !this.sentWallpapers.includes(wp.imageUrl)
      );

      // Reset if all wallpapers have been sent
      if (availableWallpapers.length === 0) {
        this.sentWallpapers = [];
        availableWallpapers = [...this.wallpapers];
      }

      // Select quantum wallpaper
      const quantumIndex = Math.floor(Math.random() * availableWallpapers.length);
      const quantumWallpaper = availableWallpapers[quantumIndex];
      this.sentWallpapers.push(quantumWallpaper.imageUrl);

      // Get wallpaper stream
      const imageStream = await global.utils.getStreamFromURL(quantumWallpaper.imageUrl);

      // Build atomic response
      const response = [
        design.header,
        design.separator,
        `🎨 Anime: ${quantumWallpaper.animeName}`,
        `✨ Collection: ${this.sentWallpapers.length}/${this.wallpapers.length}`,
        design.separator,
        design.footer
      ].join("\n");

      // Send quantum wallpaper
      message.reply({
        body: response,
        attachment: imageStream
      });

    } catch (error) {
      console.error("Quantum Wallpaper Error:", error);
      message.reply(
        "☢️ 𝐐𝐔𝐀𝐍𝐓𝐔𝐌 𝐃𝐄𝐒𝐘𝐍𝐂𝐇𝐑𝐎𝐍𝐈𝐙𝐀𝐓𝐈𝐎𝐍 ☢️\n" +
        "Reality collapsed while retrieving your wallpaper!"
      );
    } finally {
      // Clean up quantum reactions
      clearInterval(loadingInterval);
      api.setMessageReaction("⚛️", messageID, () => {}, true);
    }
  }
};
