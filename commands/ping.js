const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Check bot latency'),
    async execute(interaction) {
        const sent = await interaction.reply({
            embeds: [{
                title: '📡 Pinging...',
                color: 0xffff00
            }],
            fetchReply: true
        });

        const embed = new EmbedBuilder()
            .setTitle('🏓 Pong!')
            .addFields(
                { name: 'Bot Latency', value: `${sent.createdTimestamp - interaction.createdTimestamp}ms`, inline: true },
                { name: 'API Latency', value: `${Math.round(interaction.client.ws.ping)}ms`, inline: true }
            )
            .setColor(0x00ff00)
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};