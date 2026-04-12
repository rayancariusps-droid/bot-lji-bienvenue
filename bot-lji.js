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
  ChannelType,
  ButtonBuilder,
  ButtonStyle,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle
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
const LOG_CHANNEL_ID = "1492774051549020180";
const TICKET_HANDLER_ROLE_ID = "1390086486291910726";
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
    if (!channel) return;

    await channel.send(
      `Bienvenue sur **Naya ❄️** ${member} ! Nous sommes maintenant **${member.guild.memberCount}** membres. Prends tes rôles ici : <#${ROLES_CHANNEL_ID}> <@&${WELCOME_ROLE_ID}>`
    );
  } catch (err) {
    console.error(err);
  }
});

// =====================
// ROLE STATUT /NAYA
// =====================
client.on("presenceUpdate", async (oldPresence, newPresence) => {
  if (!newPresence || !newPresence.member) return;

  const member = newPresence.member;
  const customStatus = member.presence?.activities.find(a => a.type === 4);
  const statusText = customStatus?.state?.toLowerCase() || "";

  const hasStatus = statusText.includes("/naya") || statusText.includes("gg.naya");

  if (hasStatus && !member.roles.cache.has(STATUS_ROLE_ID)) {
    await member.roles.add(STATUS_ROLE_ID);
  }

  if (!hasStatus && member.roles.cache.has(STATUS_ROLE_ID)) {
    await member.roles.remove(STATUS_ROLE_ID);
  }
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
      .setDescription(`
Merci de respecter les règles du serveur.  
Pour tout problème, ouvre un ticket dans <#${TICKET_CHANNEL_ID}>  

**Les sanctions peuvent aller du mute au bannissement selon la gravité.**  
**Le respect est obligatoire envers tous les membres et le staff.**  
`)
      .setImage("https://cdn.discordapp.com/attachments/1441925760020385915/1491652731197325402/17757081041677587786669827963131.gif")
      .setFooter({ text: "Si vous avez un problème, n'hésitez pas à aller ici : #ticket 🎫" });

    channel.send({ embeds: [embed] });
  }

  // ----- ROLES INFO -----
  if (msg === "!rolesinfo") {
    const channel = await client.channels.fetch("1483992112780415126");

    const embed = new EmbedBuilder()
      .setTitle("📜 Informations des rôles - Naya")
      .setColor("#00BFFF")
      .setDescription(`
<@&1448188699052478554>  
Ce rôle est attribué au créateur du serveur. Il a tous les privilèges administratifs, y compris la gestion des rôles, des canaux et des paramètres du serveur.

<@&1446287927180132434>  
Ce rôle est attribué au co-créateur du serveur. Il possède tous les privilèges administratifs, y compris la gestion des rôles, des canaux et des paramètres du serveur.

<@&1478162378825924648>  
Un administrateur a presque les mêmes pouvoirs qu'un fondateur, mais sans certains privilèges comme le transfert de propriété du serveur. Il peut gérer les membres, les rôles et les permissions.

<@&1449320025453367378>  
Le rôle de modérateur inclut des permissions comme la gestion des messages, la suppression de contenu inapproprié et l’interaction avec les membres pour assurer le respect des règles.

<@&1479683496279543949>  
L'animateur est responsable de l'animation des discussions et des événements. Il organise des jeux, concours et discussions pour garder une bonne ambiance.

<@&1479683856159211613>  
Les community managers s’occupent de la promotion du serveur (partenariats, publicités) et donnent une image positive du serveur.

<@&1390086486291910726>  
Seules les personnes de l'équipe Naya peuvent avoir ce rôle.

<@&1431984265393995867>  
Ce rôle est attribué aux membres classiques avec des permissions de base.

<@&1486974281073168495>  
Ce rôle est attribué si vous mettez \`/naya\` ou \`gg.naya\` dans votre statut. Il permet d’envoyer des gifs et images dans les vocs et offre plusieurs avantages.  
👉 Va voir ici : <#1483992232121077930>

**J'espère que les informations fournies sont claires.**
`)
      .setImage("https://cdn.discordapp.com/attachments/1483992446810587136/1492772818998263870/17759751427231649579972197828701.gif");

    channel.send({ embeds: [embed] });
  }

  // ----- TICKETS -----
  if (msg === "!ticket") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("Support Naya 🎫")
      .setColor("#FFA500")
      .setDescription(`
👑・ **Tickets Couronne**  
🔹 Tout ce qui est professionnel, échange de Dm4ll, fournir chez nous, etc…

🛡️・ **Tickets Gestion Staff**  
🔹 Devenir staff, questions relatives aux permissions, demander un rankup / derank, etc…

🚨・ **Tickets Gestion Abus**  
🔹 Signaler quelqu’un, abus de permission, problème général…

🎉・ **Tickets Animation**  
🔹 Devenir animateur / animatrice, questions sur les animations…

🤝・ **Partenariat**  
🔹 Effectuer un partenariat, questions sur les partenariats…

_Choisis la catégorie adaptée à ta demande pour ouvrir ton ticket_
`)
      .setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif");

    const row = new ActionRowBuilder().addComponents(
      new StringSelectMenuBuilder()
        .setCustomId("ticket_select")
        .setPlaceholder("Choisis une option")
        .addOptions([
          { label: "👑 Tickets Couronne", value: "ticket_couronne" },
          { label: "🛡️ Tickets Gestion Staff", value: "ticket_staff" },
          { label: "🚨 Tickets Gestion Abus", value: "ticket_abus" },
          { label: "🎉 Tickets Animation", value: "ticket_animation" },
          { label: "🤝 Partenariat", value: "ticket_partenariat" }
        ])
    );

    await channel.send({ embeds: [embed], components: [row] });
  }
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {

  if (interaction.isStringSelectMenu()) {
    const user = interaction.user;
    const guild = interaction.guild;

    const channel = await guild.channels.create({
      name: `ticket-${user.id}`,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        { id: guild.roles.everyone.id, deny: ["ViewChannel"] },
        { id: user.id, allow: ["ViewChannel", "SendMessages"] },
        { id: TICKET_HANDLER_ROLE_ID, allow: ["ViewChannel", "SendMessages", "ManageChannels"] }
      ]
    });

    await channel.send({
      content: `Salut ${user}, ton ticket est ouvert ! <@&${TICKET_HANDLER_ROLE_ID}>`,
      components: [
        new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Fermer le ticket")
            .setStyle(ButtonStyle.Danger)
        )
      ]
    });

    await interaction.reply({ content: `Ticket créé : ${channel}`, ephemeral: true });
  }

  if (interaction.isButton() && interaction.customId === "close_ticket") {

    if (!interaction.member.roles.cache.has(TICKET_HANDLER_ROLE_ID)) {
      return interaction.reply({ content: "❌ Seul le staff Naya peut fermer ce ticket.", ephemeral: true });
    }

    const modal = new ModalBuilder()
      .setCustomId("close_modal")
      .setTitle("Raison de fermeture");

    const input = new TextInputBuilder()
      .setCustomId("reason")
      .setLabel("Pourquoi fermez-vous ce ticket ?")
      .setStyle(TextInputStyle.Paragraph);

    modal.addComponents(new ActionRowBuilder().addComponents(input));
    await interaction.showModal(modal);
  }

  if (interaction.isModalSubmit()) {
    const reason = interaction.fields.getTextInputValue("reason");
    const channel = interaction.channel;
    const userId = channel.name.split("-")[1];

    const user = await client.users.fetch(userId).catch(() => null);

    if (user) {
      await user.send(`📩 Ton ticket **${channel.name}** a été fermé.\n\n📝 Raison :\n${reason}`);
    }

    const logChannel = await client.channels.fetch(LOG_CHANNEL_ID);

    const embed = new EmbedBuilder()
      .setTitle("📜 Ticket fermé")
      .setColor("#FF0000")
      .addFields(
        { name: "👤 Utilisateur", value: user ? `<@${user.id}>` : "Inconnu", inline: true },
        { name: "🔒 Fermé par", value: `${interaction.user}`, inline: true },
        { name: "📁 Ticket", value: channel.name },
        { name: "📝 Raison", value: reason }
      )
      .setTimestamp();

    logChannel.send({ embeds: [embed] });

    await interaction.reply({ content: "✅ Ticket fermé avec succès !", ephemeral: true });

    setTimeout(() => channel.delete().catch(console.error), 2000);
  }

});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
