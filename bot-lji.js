// 🌐 Serveur web pour rester en ligne (Render / Freshping)
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot LJI en ligne 🐾");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

// 🤖 Discord
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const fs = require("fs");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// 🆔 IDS DES SALONS
const WELCOME_CHANNEL_ID = "1441916367942193233";
const ROLES_CHANNEL_ID = "1446702499082928158";
const REGLEMENT_CHANNEL_ID = "1441951191234908290";

// 📄 Fichier pour savoir si les règles ont déjà été envoyées
const FILE = "./regles_envoyees.json";

// Bot prêt
client.on("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// Message de bienvenue
client.on("guildMemberAdd", async member => {
  const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
  if (!channel) return;

  const memberCount = member.guild.memberCount;

  channel.send(
    `🐾 Bienvenue sur **や . Naya . lji** ${member} !\n` +
    `>>> Nous sommes maintenant **${memberCount}** membres\n` +
    `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n\n` +
    `<@&1479358568091357234>`
  );
});

// Commandes
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!ping") {
    const sent = await message.channel.send("Pong...");
    sent.edit(`Pong! Latence : ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  if (msg === "!membres") {
    message.channel.send(
      `Nous sommes actuellement **${message.guild.memberCount}** membres sur le serveur !`
    );
  }

  if (msg === "!règlement") {
    if (fs.existsSync(FILE)) return;

    const embed = new EmbedBuilder()
      .setTitle(" Règlement 🐾")
      .setColor("Blue")
      .setDescription(
        "**I. Le respect**\nRespectez-vous tous...\n\n" +
        "**IX. Important**\nSi vous n’aimez pas une personne..."
      );

    const channel = await message.guild.channels.fetch(REGLEMENT_CHANNEL_ID);
    if (!channel) return;

    await channel.send({ embeds: [embed] });
    fs.writeFileSync(FILE, JSON.stringify({ envoye: true }));
    console.log("Règlement envoyé ✅");
  }

  // 🐾 Commande pour envoyer les rôles
  if (msg === "!roles") {

    const channel = await message.guild.channels.fetch(ROLES_CHANNEL_ID);
    if (!channel) return;

    channel.send(`
<@&1390036255227777197> **chef**

c’est le chef actuel qui gère l’ensemble du serveur. Il gère tout les rôle il a toute les perms 

<@&1390036395493556245> **Vice chef**

c’est le vice chef actuel du serveur qui remplace le chef en cas d’absence qui propose des idées etc.

<@&1448188699052478554>

c’était les 2 personnes qui on été a l’origine de la création du serveur se rôle ne leurs sera jamais retiré.

<@&1446287927180132434>

ce sont les 3 personnes qui on été a l’origine du 2 eme serveur qui se appelait (LJI WORLD) se rôle ne leurs sera jamais retiré.

<@&1392940328733900890> **the first**

cette personne est la personne qui guide l’ensemble du serveur cette a dire les admin les modo etc elle peut donner directement des conseils au chef et au vice chef en cas de besoin.

<@&1478162378825924648> **admin**

un administrateur a presque le même pouvoir que le chef ou vice chef mais sans privilège liés à la gestion du serveur comme le transfert de la propriété du serveur. Il peut gérer les membres,les rôle et les permissions.

<@&1449320025453367378> **modérateur**

Le rôle modérateur inclut des permissions comme la gestion des messages,La suppression de contenu inapproprié et l’interaction avec les membres pour assurer le respect des règles du serveur 

<@&1479683496279543949> **L’animateur**

est responsable de l’animation des discussions et des événements sur le serveur. Ce rôle peut inclure des taches comme organiser des jeux, des concours ou des discussions thématiques L’animateur crée de l’engagement et s’assure que l’ambiance reste vivante et agréable,mais il n’a généralement pas de pouvoir administratifs.

<@&1479683856159211613> **les community managers**

S’occupent à faire de la pub c’est à dire à faire des partenariats ou des échanges en publicité avec d’autres serveur.
Ils doivent aussi gérer le compte TikTok/youtube du serveur et aussi donné une image positive du serveur

<@&1390086486291910726>

seuls les personnes de l’équipe naya peuvent avoir se rôle 

<@&1431984265393995867> **Perm**

se sont des membres du serveur qui ont des perm en plus comme par exemple rejoindre les voc quand elle sont pleine

<@&1390037539162685462>

se rôle est attribué à tous les membres du serveur en bref vous êtes des membres 

**J’espère que les informations fournies on été claires**

https://tenor.com/view/black-and-white-couple-scenery-flower-gif-6383016691428567000
`);
  }

});

client.login(process.env.DISCORD_TOKEN);
