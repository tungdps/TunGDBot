const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");

module.exports.run = async (client, msg, args) => {
    let levelID = args[0];

    if (!levelID || isNaN(levelID)) {
        return msg.channel.send(`Cách dùng: \`${M.prefix}level <LevelID>\` (Ví dụ: \`${M.prefix}level 189\`)`);
    }

    // Gửi tin nhắn tạm thời
    let waitMsg = await msg.channel.send("Searching, Please wait...");

    let host = M.host.endsWith('/') ? M.host.slice(0, -1) : M.host;
    let apiUrl = `${host}/bot/api/level.php?id=${levelID}`;

    try {
        let res = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 8000
        });

        let body = res.data;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }

        if (!body || body.error) {
            // Sửa tin nhắn chờ nếu không tìm thấy level
            return waitMsg.edit(`❌ Không tìm thấy Level với ID \`${levelID}\` trên máy chủ GDPS!`);
        }

        let embed = new EmbedBuilder()
            .setTitle(`🎮 Level: ${body.name} (ID: ${body.id})`)
            .setColor("#00FFFF")
            .setDescription(`**Mô tả:** ${body.description}`)
            .addFields(
                { name: "Tác giả", value: String(body.author), inline: true },
                { name: "Số Stars", value: `${body.stars} ⭐`, inline: true },
                { name: "Coins", value: `${body.coins} 🪙`, inline: true },
                { name: "Lượt thích", value: `👍 ${body.likes}`, inline: true },
                { name: "Lượt tải", value: `📥 ${body.downloads}`, inline: true },
                { name: "Song ID", value: `🎵 ${body.songID}`, inline: true }
            )
            .setFooter({ text: "TunGDPS Level Search" });

        // Chỉnh sửa tin nhắn "Searching, Please wait" thành Embed kết quả
        return waitMsg.edit({ content: null, embeds: [embed] });

    } catch (err) {
        console.error("Lỗi level API:", err.message);
        return waitMsg.edit("❌ Không thể kết nối đến Web GDPS để tra cứu Level!");
    }
};

module.exports.help = {
    name: "level"
};
