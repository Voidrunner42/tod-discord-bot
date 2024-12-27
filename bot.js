// bot.js
const { Client, GatewayIntentBits, Partials, REST, Routes, ActionRowBuilder, ButtonBuilder, EmbedBuilder, ButtonStyle } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');

dotenv.config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel]
});

let questions = JSON.parse(fs.readFileSync('questions.json', 'utf8'));

client.once('ready', async () => {
    console.log('Bot is online!');

    const commands = [
        {
            name: 'start',
            description: 'Start a game of Truth or Dare'
        }
    ];

    const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

    try {
        console.log('Started refreshing application (/) commands.');

        await rest.put(
            Routes.applicationCommands(client.user.id),
            { body: commands }
        );

        console.log('Successfully reloaded application (/) commands.');
    } catch (error) {
        console.error(error);
    }
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand() && !interaction.isButton()) return;

    if (interaction.isCommand()) {
        if (interaction.commandName === 'start') {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Truth or Dare')
                .setDescription('Select a PG rating to start the game.');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('below13')
                        .setLabel('Below 13')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId('pg13')
                        .setLabel('13+')
                        .setStyle(ButtonStyle.Secondary),
                    new ButtonBuilder()
                        .setCustomId('pg18')
                        .setLabel('18+')
                        .setStyle(ButtonStyle.Danger)
                );

            await interaction.reply({ embeds: [embed], components: [row] });
        }
    } else if (interaction.isButton()) {
        let selectedCategory;
        if (interaction.customId === 'below13') {
            selectedCategory = 'below13';
        } else if (interaction.customId === 'pg13') {
            selectedCategory = 'pg13';
        } else if (interaction.customId === 'pg18') {
            selectedCategory = 'pg18';
        }

        if (selectedCategory) {
            const embed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('Truth or Dare')
                .setDescription('Press a button to choose Truth, Dare, or Random.');

            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`truth_${selectedCategory}`)
                        .setLabel('Truth')
                        .setStyle(ButtonStyle.Primary),
                    new ButtonBuilder()
                        .setCustomId(`dare_${selectedCategory}`)
                        .setLabel('Dare')
                        .setStyle(ButtonStyle.Danger),
                    new ButtonBuilder()
                        .setCustomId(`random_${selectedCategory}`)
                        .setLabel('Random')
                        .setStyle(ButtonStyle.Success)
                );

            await interaction.update({ embeds: [embed], components: [row] });
        } else {
            let response;
            const [type, category] = interaction.customId.split('_');
            if (type === 'truth') {
                response = questions[category].truths[Math.floor(Math.random() * questions[category].truths.length)];
            } else if (type === 'dare') {
                response = questions[category].dares[Math.floor(Math.random() * questions[category].dares.length)];
            } else if (type === 'random') {
                const all = questions[category].truths.concat(questions[category].dares);
                response = all[Math.floor(Math.random() * all.length)];
            }

            await interaction.reply(response);
        }
    }
});

client.login(process.env.DISCORD_TOKEN);