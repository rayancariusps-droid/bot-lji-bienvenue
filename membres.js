const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("membres")
        .setDescription("Voir le nombre de membres"),

    async execute(interaction) {
        await interaction.reply(`👥 ${interaction.guild.memberCount} membres`);
    }
};
