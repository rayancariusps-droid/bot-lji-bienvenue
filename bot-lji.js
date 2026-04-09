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
  ChannelType 
} = require("discord.js");

// =====================
// SERVEUR WEB
// =====================
const app = express();
app.get("/", (req, res) => res.send("Bot Naya en ligne"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Serveur web actif sur le port " + PORT));

// =====================
// DISCORD CLIENT
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
// IDS DES SALONS ET RÔLES
// =====================
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const STATUS_ROLE_ID = "1486974281073168495";
const BOOSTER_ROLE_ID = "1450116107061956800";
const SUPPORT_CHANNEL_ID = "1483992232121077930";
const REGLEMENT_CHANNEL_ID = "1483583968241651722";
const TICKET_CHANNEL_ID = "1483599648018006150";
const RECRUTEMENT_CHANNEL_ID = "1491684338377687070";
const TICKET_HANDLER_ROLE_ID = "1390086486291910726"; // rôle qui peut voir/fermer tickets
const WELCOME_ROLE_ID = "1479358568091357234";

// =====================
// READY
// =====================
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME
// =====================
client.on("guildMemberAdd", async (member) => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    await channel.send(
      `Bienvenue sur **Naya ❄️** ${member} ! Nous sommes maintenant **${member.guild.memberCount}** membres. Prends tes rôles ici : <#${ROLES_CHANNEL_ID}> <@&${WELCOME_ROLE_ID}>`
    );
  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});

// =====================
// ROLE STATUT /NAYA
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
      console.log(`Rôle /Naya ajouté à ${member.user.tag}`);
    }

    if (!hasStatus && member.roles.cache.has(STATUS_ROLE_ID)) {
      await member.roles.remove(STATUS_ROLE_ID);
      console.log(`Rôle /Naya retiré à ${member.user.tag}`);
    }
  } catch (err) {
    console.error("Erreur statut:", err);
  }
}

setInterval(async () => {
  client.guilds.cache.forEach(async guild => {
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
      .setTitle("❄️ **Soutenir __Naya__**")
      .setColor("#00BFFF")
      .setDescription(`
- Ajoute dans ton **statut** \`/Naya\` ou \`gg.Naya\` pour obtenir le rôle <@&${STATUS_ROLE_ID}>
- **Booster le serveur** pour recevoir <@&${BOOSTER_ROLE_ID}>
- Ajouter le **tag du serveur** pour plus de visibilité 💙
`)
      .setImage("https://cdn.discordapp.com/attachments/1441925760020385915/1491651763714003016/17757078415539010381883249.gif");
    await channel.send({ embeds: [embed] });
  }

  // ----- REGLEMENT -----
  if (msg === "!règlement") {
    const channel = message.guild.channels.cache.get(REGLEMENT_CHANNEL_ID);
    if (!channel) return;
    const embed = new EmbedBuilder()
      .setTitle("📜 **RÈGLEMENT NAYA**")
      .setColor("#00BFFF")
      .setDescription(`Merci de respecter les règles du serveur. Pour tout problème, ouvre un [ticket](<#${TICKET_CHANNEL_ID}>)`)
      .setImage("https://cdn.discordapp.com/attachments/1441925760020385915/1491652731197325402/17757081041677587786669827963131.gif");
    channel.send({ embeds: [embed] });
  }

  // ----- RECRUTEMENT -----
  if (msg === "!recrutement") {
    const channel = await client.channels.fetch(RECRUTEMENT_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const invites = await message.guild.invites.fetch();
    let userInvites = 0;
    invites.forEach(invite => {
      if (invite.inviter && invite.inviter.id === message.author.id) userInvites += invite.uses;
    });

    if (userInvites < 3) {
      return message.channel.send(`❌ Désolé ${message.author}, tu dois avoir **au moins 3 invitations** pour postuler au staff.`);
    }

    const embed = new EmbedBuilder()
      .setTitle("Recrutement Staff")
      .setColor("#00BFFF")
      .setDescription(`Tu souhaites faire partie du staff ? Regarde les conditions et ouvre un ticket dans <#${TICKET_CHANNEL_ID}>`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491691648411893780/17757173762299050023420614074528.gif");
    channel.send({ embeds: [embed] });
  }

  // ----- TICKETS -----
  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const embed = new EmbedBuilder()
      .setTitle("Support Naya 🎫")
      .setColor("#FFA500")
      .setDescription(`
👑・ **Tickets Couronne**  
🔹 Tout Ce Qui Est Professionnel, Échange De Dm4ll, Fournir Chez Nous Etc…

🛡️・ **Tickets Gestion Staff**  
🔹 Devenir Staff, Questions Relatives Aux Permissions, Demander Un Rankup / Derank Etc…

🚨・ **Tickets Gestion Abus**  
🔹 Signaler Quelqu’un, Abus De Permission, Problème Général…

🎉・ **Tickets Animation**  
🔹 Devenir Animateur / Animatrice, Questions Sur Les Animations…

🤝・ **Partenariat**  
🔹 Effectuer Un Partenariat, Questions Sur Les Partenariats…

_Choisis La Catégorie Adaptée À Ta Demande Pour Ouvrir Ton Ticket_
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choisis une option")
        .addOptions([
          { label: "👑 Tickets Couronne", value: "ticket_couronne", description: "Tout ce qui est professionnel, échange de Dm4ll, fournir chez nous etc…" },
          { label: "🛡️ Tickets Gestion Staff", value: "ticket_staff", description: "Devenir Staff, questions sur les permissions, demander un rankup / derank etc…" },
          { label: "🚨 Tickets Gestion Abus", value: "ticket_abus", description: "Signaler quelqu’un, abus de permission, problème général…" },
          { label: "🎉 Tickets Animation", value: "ticket_animation", description: "Devenir animateur/animatrice, questions sur les animations…" },
          { label: "🤝 Partenariat", value: "ticket_partenariat", description: "Effectuer un partenariat, questions sur les partenariats…" },
        ])
    );

    await channel.send({ embeds: [embed], components: [row] });
  }
});

// =====================
// INTERACTIONS TICKETS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isStringSelectMenu()) return;

  const { values, user, guild } = interaction;
  const category = values[0];

  const nameMap = {
    ticket_staff: "gestion-staff",
    ticket_abus: "gestion-abus",
    ticket_couronne: "couronne",
    ticket_animation: "animation",
    ticket_partenariat: "partenariat"
  };
  const ticketName = `${nameMap[category]}-${user.username.toLowerCase()}`;

  const existingChannel = guild.channels.cache.find(c => c.name === ticketName);
  if (existingChannel) {
    return interaction.reply({ content: "Vous avez déjà un ticket ouvert !", ephemeral: true });
  }

  const channel = await guild.channels.create({
    name: ticketName,
    type: ChannelType.GuildText,
    permissionOverwrites: [
      { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
      { id: user.id, allow: ["ViewChannel", "SendMessages"] },
      { id: TICKET_HANDLER_ROLE_ID, allow: ["ViewChannel", "SendMessages", "ManageChannels"] }
    ]
  });

  await interaction.reply({ content: `Ticket créé : ${channel}`, ephemeral: true });

  const embed = new EmbedBuilder()
    .setTitle(`Support Naya 🎫 - ${category.replace("ticket_", "")}`)
    .setColor("#FFA500")
    .setDescription(`Salut ${user}, ton ticket pour **${category.replace("ticket_", "")}** est ouvert !\n<@&${TICKET_HANDLER_ROLE_ID}> va le prendre en charge.`)
    .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

  await channel.send({ embeds: [embed] });
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
