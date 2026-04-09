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
  ButtonStyle 
} = require("discord.js");

// =====================
// SERVEUR WEB
// =====================
const app = express();
app.get("/", (req, res) => {
  res.send("Bot Naya en ligne");
});

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
const TICKET_HANDLER_ROLE_ID = "1390086486291910726";

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

    const embed = new EmbedBuilder()
      .setTitle("Bienvenue sur Naya ❄️")
      .setColor("#00BFFF")
      .setDescription(`${member} rejoint le serveur !\nNous sommes maintenant **${member.guild.memberCount}** membres.\n\nPrends tes rôles dans <#${ROLES_CHANNEL_ID}>`);

    await channel.send({ embeds: [embed] });
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
      .setTitle("❄️ **Soutenir __Naya__**")
      .setColor("#00BFFF")
      .setDescription(`
- Commence par ajouter dans ton **statut** \`/Naya\` ou \`gg.Naya\`  
Cela te permettra d'obtenir le rôle <@&${STATUS_ROLE_ID}> et profiter de certaines permissions spéciales

- Tu peux aussi **booster le serveur**  
En boostant, tu recevras le rôle <@&${BOOSTER_ROLE_ID}> et des permissions supplémentaires

- Si vous le souhaitez, vous pouvez ajouter le **tag du serveur**  
Cela nous aidera à gagner en visibilité et à renforcer Naya 💙
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
      .setDescription(`
🔹 [Discord Terms of Service](https://discord.com/terms)  
🔹 [Discord Community Guidelines](https://discord.com/guidelines)  
🔹 [Discord Safety Center](https://discord.com/safety)

---

**1. Respect et bienveillance**  
• Pas d’insultes, harcèlement ou discrimination  
• Restez courtois même en cas de désaccord  
• Respectez les avis et goûts de chacun  
• Aidez les nouveaux membres à se sentir bienvenus  

**2. Contenu**  
• Pas de NSFW / gore / contenu illégal  
• Pas de spam ou publicité non autorisée  
• Les spoilers doivent être signalés avec la balise appropriée  
• Partagez des contenus pertinents pour chaque salon  

**3. Salons**  
• Respectez le thème de chaque salon  
• Pas de hors-sujet excessif  
• Utilisez les fils de discussion si nécessaire  

**4. Staff et modération**  
• Écoutez les modérateurs et administrateurs  
• Les avertissements et sanctions sont à la discrétion de l’équipe  
• Ne contestez pas publiquement les décisions du staff  

Merci de respecter ces règles pour une ambiance agréable 💙

Pour tout problème avec le staff ou autre, ouvre un [ticket](<#${TICKET_CHANNEL_ID}>)
`)
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
      .setDescription(`
Tu souhaites faire partie du staff de Naya ? Regarde les conditions ci-dessous

### Conditions
> - Avoir minimum **15 ans**
> - Avoir **3 invitations** minimum
> - Avoir **500 messages** ou **5h** de voc
> - Avoir **/Naya** ou **gg.Naya** dans ton statut

### Comportement
> - Être respectueux et un minimum gentil envers tout le monde
> - Savoir garder son calme
> - Être patient et rigoureux

Tu respectes les conditions ? Ouvre un ticket Gestion Staff dans <#${TICKET_CHANNEL_ID}>  
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491691648411893780/17757173762299050023420614074528.gif");

    channel.send({ embeds: [embed] });
  }

  // ----- TICKET -----
  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("Support Naya 🎟️")
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

🤝・ **Tickets Partenariat**  
🔹 Effectuer Un Partenariat, Questions Sur Les Partenariats…

_Choisis La Catégorie Adaptée À Ta Demande Pour Ouvrir Ton Ticket_
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif?ex=69d89534&is=69d743b4&hm=8cbbe839badfa2d59fd27c75f260a810249bfb16c867399c9375b341f0e00a49&");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choisir une option de ticket")
        .addOptions([
          { label: "Tickets Couronne", value: "ticket_couronne" },
          { label: "Tickets Gestion Staff", value: "ticket_staff" },
          { label: "Tickets Gestion Abus", value: "ticket_abus" },
          { label: "Tickets Animation", value: "ticket_animation" },
          { label: "Tickets Partenariat", value: "ticket_partenaire" }
        ])
    );

    await channel.send({ embeds: [embed], components: [row] });
  }
});

// =====================
// INTERACTIONS TICKETS
// =====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.guild) return;

  const { guild, user } = interaction;
  const member = guild.members.cache.get(user.id);

  // ----- MENU DE SÉLECTION -----
  if (interaction.isStringSelectMenu() && interaction.customId === "ticket_select") {
    const category = interaction.values[0];
    const ticketName = `ticket-${user.username}`.toLowerCase();

    const existingChannel = guild.channels.cache.find(c => c.name === ticketName);
    if (existingChannel) {
      return interaction.reply({ content: `Tu as déjà un ticket ouvert : ${existingChannel}`, ephemeral: true });
    }

    const channel = await guild.channels.create({
      name: ticketName,
      type: 0,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
        { id: user.id, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] },
        { id: STATUS_ROLE_ID, allow: ["ViewChannel", "SendMessages", "ReadMessageHistory"] }
      ]
    });

    const closeButton = new ButtonBuilder()
      .setCustomId("close_ticket")
      .setLabel("🔒 Fermer le ticket")
      .setStyle(ButtonStyle.Danger);

    const buttonRow = new ActionRowBuilder().addComponents(closeButton);

    await channel.send({
      content: `Salut ${user}, ton ticket pour **${category.replace("ticket_", "")}** est ouvert ! <@&${TICKET_HANDLER_ROLE_ID}> va le prendre en charge.`,
      components: [buttonRow]
    });

    await interaction.reply({ content: `Ton ticket a été créé : ${channel}`, ephemeral: true });
  }

  // ----- BOUTON FERMER LE TICKET -----
  if (interaction.isButton() && interaction.customId === "close_ticket") {
    const channel = interaction.channel;

    if (
      !channel.name.startsWith("ticket-") ||
      (channel.name !== `ticket-${user.username}`.toLowerCase() && !member.roles.cache.has(TICKET_HANDLER_ROLE_ID))
    ) {
      return interaction.reply({ content: "❌ Vous ne pouvez pas fermer ce ticket.", ephemeral: true });
    }

    await interaction.reply({ content: "🔒 Ticket fermé, le salon sera supprimé dans 5 secondes...", ephemeral: true });
    setTimeout(() => channel.delete(), 5000);
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
