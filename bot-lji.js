require("dotenv").config();
const express = require("express");
const {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
} = require("discord.js");

// =====================
// WEB
// =====================
const app = express();
app.get("/", (req, res) => res.send("Bot en ligne"));
app.listen(3000);

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences
  ]
});

// =====================
// IDS
// =====================
const TICKET_CHANNEL_ID = "1483599648018006150";
const LOG_CHANNEL_ID = "1492774051549020180";
const REACT_CHANNEL_ID = "1483992171538550935";
const STAFF_ROLE = "1390086486291910726";
const STATUS_ROLE = "1486974281073168495";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté : ${client.user.tag}`);
});

// =====================
// ROLE NAYA (STATUT)
// =====================
client.on("presenceUpdate", async (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.member) return;

  const member = newPresence.member;
  const custom = member.presence?.activities.find(a => a.type === 4);
  const text = custom?.state?.toLowerCase() || "";

  const has = text.includes("/naya") || text.includes("gg.naya");

  if (has && !member.roles.cache.has(STATUS_ROLE)) {
    member.roles.add(STATUS_ROLE).catch(() => {});
  }

  if (!has && member.roles.cache.has(STATUS_ROLE)) {
    member.roles.remove(STATUS_ROLE).catch(() => {});
  }
});

// =====================
// COMMANDES
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();

  // ping
  if (msg === "!ping") {
    const m = await message.channel.send("Pong");
    m.edit(`🏓 ${m.createdTimestamp - message.createdTimestamp}ms`);
  }

  // membres
  if (msg === "!membres") {
    message.channel.send(`👥 ${message.guild.memberCount} membres`);
  }

  // =====================
  // PANEL TICKET
  // =====================
  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🎫 Support Naya")
      .setDescription(`
👑・ **Tickets Couronne**
🔹 Tout ce qui est professionnel, échange, etc…

🛡️・ **Tickets Gestion Staff**
🔹 Devenir staff, permissions, rank…

🚨・ **Tickets Gestion Abus**
🔹 Signalement, abus…

🎉・ **Tickets Animation**
🔹 Animateur, events…

🤝・ **Partenariat**
🔹 Partenariat serveur…

_Choisis une catégorie_
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket")
        .setPlaceholder("Choisir une raison")
        .addOptions([
          { label: "Couronne", value: "couronne" },
          { label: "Gestion Staff", value: "staff" },
          { label: "Gestion Abus", value: "abus" },
          { label: "Animation", value: "animation" },
          { label: "Partenariat", value: "partenariat" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }

  // =====================
  // REACT 1
  // =====================
  if (msg === "!react1") {
    const channel = await client.channels.fetch(REACT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("👤 Sélectionnez votre genre")
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1492970578011885689/17760222888293576085531044650226.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("genre")
        .setPlaceholder("Choisir")
        .addOptions([
          { label: "Homme", value: "1398475032480583821" },
          { label: "Femme", value: "1398475137678049370" },
          { label: "Non binaire", value: "1441952406685352208" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }

  // =====================
  // REACT 2
  if (msg === "!react2") {
    const channel = await client.channels.fetch(REACT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🎂 Sélectionnez votre âge")
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1492972636844851341/17760227849791360223833108533606.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("age")
        .addOptions([
          { label: "Majeur", value: "1492989745385443560" },
          { label: "Mineur", value: "1492989803531342045" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }

  // =====================
  // REACT 3
  if (msg === "!react3") {
    const channel = await client.channels.fetch(REACT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("💞 Sélectionnez votre situation")
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1492994572148543518/17760280123167317692973232058489.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("situation")
        .addOptions([
          { label: "Couple", value: "1492993649141612575" },
          { label: "Célibataire", value: "1492993697627902033" },
          { label: "Compliqué", value: "1492993754225705070" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }

  // =====================
  // REACT 4
  if (msg === "!react4") {
    const channel = await client.channels.fetch(REACT_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("🎨 Sélectionnez une couleur")
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1493001041233444915/17760295614282950030473050114055.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("couleur")
        .addOptions([
          { label: "Noir", value: "1492991889815765072" },
          { label: "Blanc", value: "1492991801332863118" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }

});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {

  // TICKET CREATE
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket") {

    const type = interaction.values[0];
    const user = interaction.user;
    const clean = user.username.toLowerCase().replace(/[^a-z0-9]/g, "");

    const channel = await interaction.guild.channels.create({
      name: `${type}-${clean}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: ["ViewChannel"] },
        { id: user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: STAFF_ROLE, allow: ["ViewChannel", "SendMessages"] }
      ]
    });

    await channel.send({
      content: `Ticket ${type} ouvert ${user} <@&${STAFF_ROLE}>`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close")
            .setLabel("Fermer")
            .setStyle(ButtonStyle.Danger)
        )
      ]
    });

    interaction.reply({ content: `✅ ${channel}`, ephemeral: true });
  }

  // CLOSE BUTTON
  if (interaction.isButton() && interaction.customId === "close") {

    if (!interaction.member.roles.cache.has(STAFF_ROLE)) {
      return interaction.reply({ content: "❌ Staff uniquement", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId("closeModal")
      .setTitle("Raison");

    const input = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Pourquoi ?")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }

  // CLOSE SUBMIT
  if (interaction.isModalSubmit()) {

    const reason = interaction.fields.getTextInputValue("reason");
    const channel = interaction.channel;

    const log = await client.channels.fetch(LOG_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setColor("#000000")
      .setTitle("Ticket fermé")
      .addFields(
        { name: "Staff", value: `${interaction.user}` },
        { name: "Salon", value: channel.name },
        { name: "Raison", value: reason }
      );

    log.send({ embeds: [embed] });

    interaction.reply({ content: "✅ Fermé", ephemeral: true });

    setTimeout(() => channel.delete(), 2000);
  }

});
client.login(process.env.DISCORD_TOKEN);
