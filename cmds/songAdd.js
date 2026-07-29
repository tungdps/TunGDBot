const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");

module.run = async (client, msg, args) => {
    let songLink = args[0];

    if (!songLink) {
        return msg.channel.send(`Cách dùng: \`${M.prefix}songAdd <link-nhạc-hoặc-mp3>\``);
    }

    let host = M.host.endsWith('/') ? M.host.slice(0, -1) : M.host;
    let apiUrl = `${host}/bot/api/songAdd.php?url=${encodeURIComponent(songLink)}`;

    try {
        let res = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 10000
        });

        let body = res.data;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }

        if (!body || body.error) {
            return msg.channel.send("❌ Không thể thêm bài hát! Lỗi: " + (body ? body.error : "Không có phản hồi từ Web"));
        }

        let embed = new EmbedBuilder()
            .setTitle(body.exists ? "🎵 Bài hát đã tồn tại!" : "✅ Thêm bài hát thành công!")
            .setColor(body.exists ? "#FFA500" : "#00FF00")
            .addFields(
                { name: "ID Song (Dùng trong game)", value: `\`${body.id}\``, inline: true },
                { name: "Tên Bài Hát", value: String(body.name), inline: true },
                { name: "Tác Giả", value: String(body.author), inline: true }
            )
            .setFooter({ text: "Sao chép ID Song trên và dán vào Geometry Dash để sử dụng!" });

        return msg.channel.send({ embeds: [embed] });

    } catch (err) {
        console.error("Lỗi songAdd API:", err.message);
        return msg.channel.send("❌ Không thể kết nối đến Web GDPS để thêm bài hát!");
    }
};

module.exports.help = {
    name: "songadd"
};
