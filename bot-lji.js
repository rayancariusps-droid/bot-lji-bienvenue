// =====================
// CONFIG
// =====================
require("dotenv").config();
const express = require("express");
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  ActionRowBuilder, 
  StringSelectMenuBuilder, 
  ButtonBuilder, 
  ButtonStyle, 
  PermissionsBitField 
} = require("discord.js");

// =====================
// SERVEUR WEB
// =====================
const app = express();
app.get("/", (req, res) => res.send("Bot Naya en ligne"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur web actif sur le port " + PORT));

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
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const STATUS_ROLE_ID = "1486974281073168495";
const BOOSTER_ROLE_ID = "1450116107061956800";
const SUPPORT_CHANNEL_ID = "1483992232121077930";
const REGLEMENT_CHANNEL_ID = "1483583968241651722";
const TICKET_CHANNEL_ID = "1483599648018006150";
const RECRUTEMENT_CHANNEL_ID = "1491684338377687070";
const TICKET_HANDLER_ROLE_ID = "1390086486291910726";
const WELCOME_ROLE_ID = "1479358568091357234";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME TEXTE SIMPLE
// =====================
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    // Ajout automatique du rôle welcome
    const role = member.guild.roles.cache.get(WELCOME_ROLE_ID);
    if (role) await member.roles.add(role);

    await channel.send(
      `Bienvenue sur Naya ❄️ ${member} ! Nous sommes maintenant **${member.guild.memberCount}** membres. Prends tes rôles dans <#${ROLES_CHANNEL_ID}> <@&${WELCOME_ROLE_ID}>`
    );
  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});

// =====================
// CHECK STATUT /NAYA
// =====================
async function checkStatus(member) {
  try {
    const presence = member.presence;
    if (!presence) return;

    const customStatus = presence.activities.find(a => a.type === 4);
    const statusText = customStatus && customStatus.state ? customStatus.state.toLowerCase() : "";

    const hasStatus = statusText.includes("/naya") || statusText.includes("gg.naya");

    if (hasStatus && !member.roles.cache.has(STATUS_ROLE_ID)) {
      await member.roles.add(STATUS_ROLE_ID);
      console.log("Rôle ajouté à", member.user.tag);
    }

    if (!hasStatus && member.roles.cache.has(STATUS_ROLE_ID)) {
      await member.roles.remove(STATUS_ROLE_ID);
      console.log("Rôle retiré à", member.user.tag);
    }

  } catch (err) {
    console.error("Erreur statut:", err);
  }
}

// Vérification périodique
setInterval(async () => {
  client.guilds.cache.forEach(async (guild) => {
    const members = await guild.members.fetch();
    members.forEach(member => checkStatus(member));
  });
}, 30000);

client.on("presenceUpdate", (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.member) return;
  checkStatus(newPresence.member);
});

// =====================
// COMMANDES
// =====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  const msg = message.content.toLowerCase();

  // ----- PING -----
  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    await sent.edit(`🏓 ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // ----- MEMBRES -----
  if (msg === "!membres") {
    await message.channel.send(`👥 Nous sommes actuellement ${message.guild.memberCount} membres sur Naya ❄️`);
  }

  // ----- SOUTIEN -----
  if (msg === "!soutien") {
    const channel = await client.channels.fetch(SUPPORT_CHANNEL_ID);
    const embed = new EmbedBuilder()
      .setTitle("Soutenir Naya ❄️")
      .setColor("#00BFFF")
      .setDescription(`
Ajoute **/Naya** ou **gg.Naya** dans ton statut pour obtenir <@&${STATUS_ROLE_ID}>

Booste le serveur pour avoir <@&${BOOSTER_ROLE_ID}> 💎
`);
    channel.send({ embeds: [embed] });
  }

  // ----- REGLEMENT -----
  if (msg === "!règlement") {
    const channel = await client.channels.fetch(REGLEMENT_CHANNEL_ID);
    const embed = new EmbedBuilder()
      .setTitle("📜 Règlement")
      .setColor("#00BFFF")
      .setDescription(`
Respecte les règles Discord et le serveur.

Pas d'insultes, spam ou contenu interdit.

Ouvre un ticket en cas de problème.
`);
    channel.send({ embeds: [embed] });
  }

  // ----- RECRUTEMENT -----
  if (msg === "!recrutement") {
    const channel = await client.channels.fetch(RECRUTEMENT_CHANNEL_ID);
    const embed = new EmbedBuilder()
      .setTitle("Recrutement Staff")
      .setColor("#00BFFF")
      .setDescription(`
Conditions :
- 15 ans minimum
- 3 invitations
- actif

Ouvre un ticket staff dans <#${TICKET_CHANNEL_ID}>
`);
    channel.send({ embeds: [embed] });
  }

  // ----- TICKET PANEL -----
  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
    const embed = new EmbedBuilder()
      .setTitle("Support Naya 🎟️")
      .setColor("#FFA500")
      .setDescription(`
👑・ **Tickets Couronne**  
🔹 Professionnel, achats, etc…

🛡️・ **Tickets Gestion Staff**  
🔹 Staff, rankup…

🚨・ **Tickets Gestion Abus**  
🔹 Signalement…

🎉・ **Tickets Animation**  

🤝・ **Tickets Partenariat**  

_Choisis une catégorie_
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choisir")
        .addOptions([
          { label: "Couronne", value: "ticket_couronne" },
          { label: "Staff", value: "ticket_staff" },
          { label: "Abus", value: "ticket_abus" },
          { label: "Animation", value: "ticket_animation" },
          { label: "Partenariat", value: "ticket_partenaire" }
        ])
    );

    channel.send({ embeds: [embed], components: [row] });
  }
});

// =====================
// TICKETS INTERACTIFS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;
  const { guild, user } = interaction;
  const member = guild.members.cache.get(user.id);

  // ----- CREATION TICKET -----
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const name = `ticket-${user.id}`; // nom unique par ID

    const existing = guild.channels.cache.find(c => c.name === name);
    if (existing) return interaction.reply({ content: `Déjà ouvert : ${existing}`, ephemeral: true });

    const channel = await guild.channels.create({
      name,
      type: 0,
      permissionOverwrites: [
        { id: guild.roles.everyone, deny: [PermissionsBitField.Flags.ViewChannel] },
        { id: user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
        { id: TICKET_HANDLER_ROLE_ID, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] }
      ]
    });

    const btn = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Fermer")
      .setStyle(ButtonStyle.Danger);

    const row = new ActionRowBuilder().addComponents(btn);

    await channel.send({
      content: `Salut ${user} <@&${TICKET_HANDLER_ROLE_ID}> va t'aider`,
      components: [row]
    });

    interaction.reply({ content: `Ticket créé : ${channel}`, ephemeral: true });
  }

  // ----- FERMER TICKET -----
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    const channel = interaction.channel;

    if (!channel.name.startsWith("ticket-") || 
        (channel.name !== `ticket-${user.id}` && !member.roles.cache.has(TICKET_HANDLER_ROLE_ID))) {
      return interaction.reply({ content: "❌ Refusé", ephemeral: true });
    }

    interaction.reply("Fermeture...");
    setTimeout(() => channel.delete(), 3000);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
