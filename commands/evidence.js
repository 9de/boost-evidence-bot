// commands/evidence.js
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');
const Evidence = require('../schemas/Evidence');
const { staffRoleId, logChannelId } = require('../config.js');
const TIMEOUT = 60000;

const ITEMS_PER_PAGE = 5;

function createNavigationRow(currentPage, totalPages, isFirstPage, isLastPage) {
    return new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId('first')
                .setEmoji('⏮️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isFirstPage),
            new ButtonBuilder()
                .setCustomId('previous')
                .setEmoji('◀️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isFirstPage),
            new ButtonBuilder()
                .setCustomId('pageInfo')
                .setLabel(`Page ${currentPage + 1} of ${totalPages}`)
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId('next')
                .setEmoji('▶️')
                .setStyle(ButtonStyle.Primary)
                .setDisabled(isLastPage),
            new ButtonBuilder()
                .setCustomId('last')
                .setEmoji('⏭️')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(isLastPage)
        );
}

function createEvidenceEmbed(evidences, currentPage, searchType = '') {
    const startIdx = currentPage * ITEMS_PER_PAGE;
    const relevantEvidence = evidences.slice(startIdx, startIdx + ITEMS_PER_PAGE);
    
    const embed = new EmbedBuilder()
        .setTitle('📚 Evidence Database')
        .setDescription(searchType ? `${searchType}` : 'All Evidence')
        .setColor(0x2b2d31)
        .setTimestamp();

    if (relevantEvidence.length === 0) {
        embed.addFields({ 
            name: 'No Evidence Found', 
            value: 'No entries match your criteria.' 
        });
        return embed;
    }

    relevantEvidence.forEach((evidence, index) => {
        const addedTimestamp = Math.floor(evidence.addedAt.getTime() / 1000);
        
        embed.addFields({
            name: `${startIdx + index + 1}. ${evidence.name}`,
            value: [
                `📝 **URL:** ${evidence.url}`,
                `👤 **Added by:** <@${evidence.addedBy}>`,
                `🔍 **ID:** \`${evidence._id}\``,
                `⏰ **Added:** <t:${addedTimestamp}:R>`,
                '▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬▬'
            ].join('\n')
        });
    });

    embed.setFooter({ 
        text: `Total Evidence: ${evidences.length} • Page ${currentPage + 1}/${Math.ceil(evidences.length / ITEMS_PER_PAGE)}`
    });

    return embed;
}

async function handlePagination(interaction, evidences, searchType = '') {
    if (evidences.length === 0) {
        return interaction.reply({
            embeds: [
                new EmbedBuilder()
                    .setTitle('❌ No Evidence Found')
                    .setDescription(searchType ? `No evidence found for ${searchType}` : 'No evidence found in the database')
                    .setColor(0xff0000)
            ],
            ephemeral: true
        });
    }

    const totalPages = Math.ceil(evidences.length / ITEMS_PER_PAGE);
    let currentPage = 0;

    const embed = createEvidenceEmbed(evidences, currentPage, searchType);
    const row = createNavigationRow(currentPage, totalPages, currentPage === 0, currentPage === totalPages - 1);

    const response = await interaction.reply({
        embeds: [embed],
        components: [row],
        fetchReply: true
    });

    const collector = response.createMessageComponentCollector({ 
        componentType: ComponentType.Button,
        time: TIMEOUT 
    });

    collector.on('collect', async (i) => {
        if (i.user.id !== interaction.user.id) {
            await i.reply({ 
                content: '❌ These buttons are not for you!', 
                ephemeral: true 
            });
            return;
        }

        switch (i.customId) {
            case 'first': currentPage = 0; break;
            case 'previous': currentPage = Math.max(0, currentPage - 1); break;
            case 'next': currentPage = Math.min(totalPages - 1, currentPage + 1); break;
            case 'last': currentPage = totalPages - 1; break;
        }

        const newEmbed = createEvidenceEmbed(evidences, currentPage, searchType);
        const newRow = createNavigationRow(currentPage, totalPages, currentPage === 0, currentPage === totalPages - 1);

        await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', async () => {
        const finalRow = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('expired')
                    .setLabel('Navigation Expired')
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(true)
            );

        await response.edit({ components: [finalRow] }).catch(() => {});
    });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('evidence')
        .setDescription('Evidence management system')
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('Add new evidence')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Minecraft username')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('url')
                        .setDescription('Evidence URL')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('Remove evidence by ID')
                .addStringOption(option =>
                    option.setName('id')
                        .setDescription('Evidence ID to remove')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('List all evidence'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('search')
                .setDescription('Search evidence by Minecraft username')
                .addStringOption(option =>
                    option.setName('username')
                        .setDescription('Minecraft username to search')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('user')
                .setDescription('List evidence added by a Discord user')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('Discord user who added the evidence')
                        .setRequired(true))),

    async execute(interaction) {
        const logChannel = await interaction.client.channels.fetch(logChannelId);
        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'add': {
                    if(!interaction.member.roles.cache.has(staffRoleId)) {
                        return interaction.reply({
                            content: "You don't have permission to use this command! \nYou need Staff role to use this command!",
                            ephemeral: true
                        });
                    }
                    const username = interaction.options.getString('username');
                    const url = interaction.options.getString('url');

                    try {
                        new URL(url);
                    } catch {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('❌ Invalid URL')
                                    .setDescription('Please provide a valid URL')
                                    .setColor(0xff0000)
                            ],
                            ephemeral: true
                        });
                    }

                    const evidence = new Evidence({
                        name: username,
                        url: url,
                        addedBy: interaction.user.id,
                    });

                    await evidence.save();

                    const logEmbed = new EmbedBuilder()
                        .setTitle('📝 New Evidence Added')
                        .addFields(
                            { name: 'Username', value: username },
                            { name: 'URL', value: url },
                            { name: 'Added By', value: `<@${interaction.user.id}>` },
                            { name: 'Evidence ID', value: evidence._id.toString() }
                        )
                        .setColor(0x00ff00)
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });

                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ Evidence Added Successfully')
                        .addFields(
                            { name: 'Username', value: username },
                            { name: 'URL', value: url },
                            { name: 'ID', value: evidence._id.toString() }
                        )
                        .setColor(0x00ff00)
                        .setTimestamp();

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'remove': {
                   if(!interaction.member.roles.cache.has(staffRoleId)) {
                        return interaction.reply({
                            content: "You don't have permission to use this command! \nYou need Staff role to use this command!",
                            ephemeral: true
                        });
                    }
                    const id = interaction.options.getString('id');
                    const evidence = await Evidence.findById(id);

                    if (!evidence) {
                        return interaction.reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle('❌ Not Found')
                                    .setDescription('Evidence with this ID was not found')
                                    .setColor(0xff0000)
                            ],
                            ephemeral: true
                        });
                    }

                    await Evidence.findByIdAndDelete(id);

                    const logEmbed = new EmbedBuilder()
                        .setTitle('🗑️ Evidence Removed')
                        .addFields(
                            { name: 'Username', value: evidence.name },
                            { name: 'URL', value: evidence.url },
                            { name: 'Removed By', value: `<@${interaction.user.id}>` },
                            { name: 'Originally Added By', value: `<@${evidence.addedBy}>` },
                            { name: 'Evidence ID', value: id }
                        )
                        .setColor(0xff0000)
                        .setTimestamp();

                    await logChannel.send({ embeds: [logEmbed] });

                    const successEmbed = new EmbedBuilder()
                        .setTitle('✅ Evidence Removed Successfully')
                        .addFields(
                            { name: 'Username', value: evidence.name },
                            { name: 'URL', value: evidence.url },
                            { name: 'ID', value: id }
                        )
                        .setColor(0xff0000)
                        .setTimestamp();

                    await interaction.reply({ embeds: [successEmbed] });
                    break;
                }

                case 'list': {
                       if(!interaction.member.roles.cache.has(staffRoleId)) {
                        return interaction.reply({
                            content: "You don't have permission to use this command! \nYou need Staff role to use this command!",
                            ephemeral: true
                        });
                    }
                    const evidences = await Evidence.find().sort({ addedAt: -1 });
                    await handlePagination(interaction, evidences);
                    break;
                }

                case 'search': {
                       if(!interaction.member.roles.cache.has(staffRoleId)) {
                        return interaction.reply({
                            content: "You don't have permission to use this command! \nYou need Staff role to use this command!",
                            ephemeral: true
                        });
                    }
                    const username = interaction.options.getString('username');
                    const evidences = await Evidence.find({
                        name: { $regex: username, $options: 'i' }
                    }).sort({ addedAt: -1 });
                    await handlePagination(interaction, evidences, `Search results for username: ${username}`);
                    break;
                }

                case 'user': {
                       if(!interaction.member.roles.cache.has(staffRoleId)) {
                        return interaction.reply({
                            content: "You don't have permission to use this command! \nYou need Staff role to use this command!",
                            ephemeral: true
                        });
                    }
                    const user = interaction.options.getUser('user');
                    const evidences = await Evidence.find({ addedBy: user.id }).sort({ addedAt: -1 });
                    await handlePagination(interaction, evidences, `Evidence added by: ${user.tag}`);
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            await interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle('❌ Error')
                        .setDescription('An error occurred while processing your request')
                        .setColor(0xff0000)
                ],
                ephemeral: true
            });
        }
    }
};