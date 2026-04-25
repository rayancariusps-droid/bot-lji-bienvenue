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
  TextInputStyle,
  PermissionsBitField
} = require("discord.js");

// =====================
// WEB SERVER
// =====================
const app = express();
app.get("/", (req, res) => res.send("Bot Naya en ligne"));
app.listen(process.env.PORT || 3000);

// =====================
// CLIENT
// =====================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildPresences
  ]
});

// =====================
// IDS
// =====================
const TICKET_CHANNEL_ID = "1483599648018006150";
const LOG_CHANNEL_ID = "1492774051549020180";
const REACT_CHANNEL_ID = "1483992171538550935";
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const WELCOME_ROLE_ID = "1479358568091357234";
const STAFF_ROLE = "1390086486291910726";
const STATUS_ROLE = "1486974281073168495";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté : ${client.user.tag}`);
});

// =====================
// WELCOME
// =====================
client.on("guildMemberAdd", async (member) => {
  try {
    const role = member.guild.roles.cache.get(WELCOME_ROLE_ID);
    if (role) await member.roles.add(role).catch(() => {});

    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID).catch(() => null);
    if (!channel) return;

    channel.send(`**Bienvenue sur Naya ❄️ ${member} ! Nous sommes maintenant ${member.guild.memberCount} membres. Prends tes rôles ici : <#${ROLES_CHANNEL_ID}> <@&1496497468324712449>**`);
  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});

// =====================
// STATUS ROLE SYSTEM
// =====================
client.on("presenceUpdate", async (_, newPresence) => {
  try {
    if (!newPresence || !newPresence.activities) return;

    const member = newPresence.member;
    if (!member || !member.roles) return;

    const activity = newPresence.activities.find(a => a.type === 4);
    const text = activity?.state?.toLowerCase() || "";

    const has = text.includes("/naya") || text.includes("gg.naya");

    if (has && !member.roles.cache.has(STATUS_ROLE)) {
      member.roles.add(STATUS_ROLE).catch(() => {});
    }

    if (!has && member.roles.cache.has(STATUS_ROLE)) {
      member.roles.remove(STATUS_ROLE).catch(() => {});
    }
  } catch {}
});

// =====================
// COMMANDES
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID).catch(() => null);
    if (!channel) return;

    const embed = new EmbedBuilder()
      .setTitle("🎫 Support Naya")
      .setColor("#FFA500")
      .setDescription(`
👑・ **Tickets Couronne**  
🔹 Tout ce qui est professionnel, échange de Dm4ll, fournisseur, etc.
🛡️・ **Tickets Gestion Staff**  
🔹 Devenir staff, questions relatives aux permissions, rankup / derank
🚨・ **Tickets Gestion Abus**  
🔹 Signalement, abus de permissions, problèmes généraux…
🎉・ **Tickets Animation**  
🔹 Devenir animateur, questions sur les animations…
🤝・ **Partenariat**  
🔹 Demandes de partenariat…
**Choisis la catégorie adaptée à ta demande pour ouvrir ton ticket**
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("🎫 Choisis une option")
        .addOptions([
          { label: "👑 Couronne", value: "couronne" },
          { label: "🛡️ Staff", value: "staff" },
          { label: "🚨 Abus", value: "abus" },
          { label: "🎉 Animation", value: "animation" },
          { label: "🤝 Partenariat", value: "partenariat" }
        ])
    );

    return channel.send({ embeds: [embed], components: [row] });
  }

  if (msg === "!react1") sendReact("genre", "Sélection du genre", "gif", [
    ["Homme", "1398475032480583821"],
    ["Femme", "1398475137678049370"],
    ["Non binaire", "1441952406685352208"]
  ]);

  if (msg === "!react2") sendReact("age", "Sélection de l'âge", "gif", [
    ["Majeur", "1492989745385443560"],
    ["Mineur", "1492989803531342045"]
  ]);

  if (msg === "!react3") sendReact("situation", "Sélection situation", "gif", [
    ["Couple", "1492993649141612575"],
    ["Célibataire", "1492993697627902033"],
    ["Compliqué", "1492993754225705070"]
  ]);

  if (msg === "!react4") sendReact("couleur", "Choix de couleur", "gif", [
    ["Noir", "1492991889815765072"],
    ["Blanc", "1492991801332863118"],
    ["Gris", "1448233887431131146"],
    ["Rouge", "1448056662706618430"],
    ["Violet", "1448058153500414124"],
    ["Rose", "1448056143736996062"],
    ["Vert", "1448058039109160980"],
    ["Jaune", "1448057680680718550"],
    ["Orange", "1448233970910105691"],
    ["Marron", "1448233601354170421"],
    ["Bleu", "1448057514678812732"],
    ["Bleu foncé", "1492992429454917765"],
    ["Pastel", "1492992142904266752"]
  ]);
});

// =====================
// REACT FUNCTION
// =====================
function sendReact(id, title, gif, options) {
  client.channels.fetch(REACT_CHANNEL_ID)
    .then(channel => {
      if (!channel) return;

      const embed = new EmbedBuilder()
        .setTitle(title)
        .setColor("#2B2D31")
        .setImage("https://cdn.discordapp.com/attachments/placeholder.gif")
        .setDescription("Sélectionnez un rôle dans le menu.");

      const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
          .setCustomId(id)
          .setPlaceholder("Choisir")
          .addOptions(options.map(o => ({
            label: o[0],
            value: o[1]
          })))
      );

      channel.send({ embeds: [embed], components: [row] });
    })
    .catch(() => {});
}

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild || !interaction.member) return;

  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const type = interaction.values[0];

    const channel = await interaction.guild.channels.create({
      name: `ticket-${type}-${interaction.user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const btn = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Fermer")
        .setStyle(ButtonStyle.Danger)
    );

    channel.send({
      content: `🎫 **Votre ticket est ouvert merci de prendre un <@&1390086486291910726> va bientôt vous prendre en charge**`,
      components: [btn]
    });

    return interaction.reply({ content: `Ticket créé: ${channel}`, ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === "close_ticket") {
    if (!interaction.member.roles.cache.has(STAFF_ROLE)) {
      return interaction.reply({ content: "Staff uniquement", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId("close_modal")
      .setTitle("Fermeture ticket");

    const input = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Raison")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    return interaction.showModal(modal);
  }

  if (interaction.isModalSubmit() && interaction.customId === "close_modal") {
    const reason = interaction.fields.getTextInputValue("reason");
    const channel = interaction.channel;

    const userId = channel.name.split("-").pop();
    const member = await interaction.guild.members.fetch(userId).catch(() => null);

    const embed = new EmbedBuilder()
      .setTitle("📜 Ticket fermé")
      .setColor("#8A2BE2")
      .setDescription(
`👤 **Utilisateur**
<@${userId}>
🔒 **Fermé par**
${interaction.user}
📁 **Ticket**
${channel.name}
📝 **Raison**
${reason}`
      )
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1493040552038633604/1776038984811355544992923524004.gif")
      .setTimestamp();

    const log = await client.channels.fetch(LOG_CHANNEL_ID).catch(() => null);
    if (log) log.send({ embeds: [embed] });

    if (member) member.send({ embeds: [embed] }).catch(() => {});

    await interaction.reply({ content: "Ticket fermé", ephemeral: true });
    setTimeout(() => channel.delete().catch(() => {}), 2000);
  }

  if (interaction.isStringSelectMenu() && interaction.customId !== "ticket_select") {
    const member = interaction.member;
    const role = interaction.values[0];

    const groups = {
      genre: ["1398475032480583821","1398475137678049370","1441952406685352208"],
      age: ["1492989745385443560","1492989803531342045"],
      situation: ["1492993649141612575","1492993697627902033","1492993754225705070"],
      couleur: [
        "1492991889815765072","1492991801332863118","1448233887431131146",
        "1448056662706618430","1448058153500414124","1448056143736996062",
        "1448058039109160980","1448057680680718550","1448233970910105691",
        "1448233601354170421","1448057514678812732","1492992429454917765",
        "1492992142904266752"
      ]
    };

    const group = groups[interaction.customId];
    if (!group) return;

    await member.roles.remove(group).catch(() => {});
    await member.roles.add(role).catch(() => {});

    return interaction.reply({ content: "Rôle mis à jour", ephemeral: true });
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
