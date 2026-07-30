const { EmbedBuilder } = require("discord.js");
const axios = require("axios");
const M = require("../setup.json");

module.exports.run = async (client, msg, args) => {
    let songLink = args[0];

    // Kiểm tra nếu người dùng tải file trực tiếp lên Discord
    if (msg.attachments && msg.attachments.size > 0) {
        let attachment = msg.attachments.first();
        if (attachment.url) {
            songLink = attachment.url;
        }
    }

    if (!songLink || songLink.trim() === '') {
        return msg.channel.send(`Cách dùng: \`/songadd url:<link-mp3>\` hoặc đính kèm file MP3!`);
    }

    let host = M.host.endsWith('/') ? M.host.slice(0, -1) : M.host;
    let apiUrl = `${host}/bot/api/songAdd.php?url=${encodeURIComponent(songLink)}`;

    try {
        let res = await axios.get(apiUrl, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            timeout: 15000
        });

        let body = res.data;
        if (typeof body === 'string') {
            try { body = JSON.parse(body); } catch(e) {}
        }

        if (!body || body.error) {
            return msg.channel.send("❌ Không thể thêm bài hát! Lỗi: " + (body ? body.error : "Không có phản hồi từ Web GDPS"));
        }

        let embed = new EmbedBuilder()
            .setTitle(body.exists ? "🎵 Bài hát đã tồn tại!" : "✅ Thêm bài hát thành công!")
            .setColor(body.exists ? "#FFA500" : "#00FF00")
            .addFields(
                { name: "ID Song (Nhập vào GDPS)", value: `\`${body.id}\``, inline: true },
                { name: "Tên Bài Hát", value: String(body.name || "Unknown"), inline: true },
                { name: "Tác Giả", value: String(body.author || "Unknown"), inline: true }
            )
            .setFooter({ text: "Sao chép ID trên và dán vào Geometry Dash!" });

        return msg.channel.send({ embeds: [embed] });

    } catch (err) {
        console.error("Lỗi songAdd API:", err.message);
        return msg.channel.send("❌ Tải nhạc quá lâu hoặc không thể kết nối đến Server GDPS!");
    }
};

module.exports.help = {
    name: "songadd"
};
