const Discord = require('discord.js');
/*const { loadImage, registerFont, createCanvas } = require("canvas");
registerFont("fonts/Montserrat-Bold.ttf", { family: "Montserrat Bold" });
registerFont("fonts/Montserrat-ExtraBold.ttf", { family: "Montserrat Extra Bold" });
registerFont("fonts/Montserrat-SemiBold.ttf", { family: "Montserrat Semi Bold" });*/

module.exports = {
    rank: "dev",
    name: "teste",
    description: 'Comando de testes do bot.',
    options: [],
    async execute(client, interaction, args) {
       
       
        /*await client.database.users.updateMany(
            { guildID: '982626195734667336' },
            { $set: { "points": 0,
            "win": 0,
            "lose": 0,
            "mvp": 0,
            "consecutives": 0 } }
        )*/

        /*const principalImage = createCanvas(1280, 720);
        const ctx = principalImage.getContext("2d");

        // =============================== IMPORT BACKGROUND

        const background = await loadImage(
            "./media/profile_background.png"
        );
        ctx.drawImage(background, 0, 0, 1280, 720);

        // =============================== AVATAR MAKER

        ctx.arc(640, 270, 120, 0, Math.PI * 2, true);
        ctx.lineWidth = 6;
        ctx.strokeStyle = "#faf5f5";
        ctx.stroke();
        ctx.closePath();
        ctx.clip();

        const avatar = await loadImage(interaction.user.displayAvatarURL({ extension: "jpg", size: 2048 }));
        ctx.drawImage(avatar, 520, 150, 240, 240);

        // =============================== IMAGE SEND

        let file = new Discord.AttachmentBuilder(principalImage.toBuffer(), 'profile.png');

        interaction.editReply({
            files: [file]
        })*/
    }
}