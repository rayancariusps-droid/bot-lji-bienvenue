// Serveur web pour garder le bot en ligne
const express = require("express");
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Naya LJI en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

// Discord
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

// IDS
const WELCOME_CHANNEL_ID = "1441916367942193233";
const ROLES_CHANNEL_ID = "1441931922157735936";
const REGLEMENT_CHANNEL_ID = "1441951191234908290";

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
`Bienvenue sur le serveur ${member}

Nous sommes maintenant ${memberCount} membres

Prends tes rôles dans <#${ROLES_CHANNEL_ID}>`
  );
});

// Commandes
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    sent.edit(`Pong ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  if (msg === "!membres") {
    message.channel.send(`Nous sommes actuellement ${message.guild.memberCount} membres sur le serveur`);
  }

  if (msg === "!règlement") {
    if (fs.existsSync(FILE)) return;

    const embed = new EmbedBuilder()
      .setTitle("Règlement")
      .setColor("#ff4fd8")
      .setDescription(`
Respectez tous les membres du serveur.

Pas d'insultes.
Pas de spam.
Pas de contenu interdit.

Le staff peut sanctionner en cas de problème.
`);

    const channel = await message.guild.channels.fetch(REGLEMENT_CHANNEL_ID);
    if (!channel) return;

    channel.send({ embeds: [embed] });

    fs.writeFileSync(FILE, JSON.stringify({ envoye: true }));
  }

  if (msg === "!roles") {
    const channel = message.guild.channels.cache.get(ROLES_CHANNEL_ID);
    if (!channel) return message.channel.send("Salon roles introuvable");

    const embed = new EmbedBuilder()
      .setColor("#ff4fd8")
      .setTitle("Voici les informations sur vos rôles")
      .setDescription(`
<@&1390036255227777197> Chef  
c’est le chef actuel qui gère l’ensemble du serveur. Il gère tous les rôles et possède toutes les permissions.

<@&1390036395493556245> Vice chef  
c’est le vice chef actuel du serveur qui remplace le chef en cas d’absence et qui propose des idées.

<@&1448188699052478554>  
ce sont les deux personnes qui ont été à l’origine de la création du serveur. Ce rôle ne leur sera jamais retiré.

<@&1446287927180132434>  
ce sont les trois personnes qui ont été à l’origine du deuxième serveur appelé LJI WORLD. Ce rôle ne leur sera jamais retiré.

<@&1392940328733900890> The first  
cette personne guide l’ensemble du staff et peut donner des conseils au chef et au vice chef.

<@&1478162378825924648> Admin  
un administrateur possède presque les mêmes pouvoirs que le chef ou vice chef mais sans certaines permissions comme le transfert de propriété du serveur.

<@&1449320025453367378> Modérateur  
le modérateur gère les messages et veille au respect des règles.

<@&1479683496279543949> Animateur  
l’animateur est responsable de l’animation des discussions et des événements du serveur.

<@&1479683856159211613> Community managers  
s’occupent de la publicité et des réseaux sociaux du serveur.

<@&1390086486291910726>  
seules les personnes de l’équipe Naya peuvent avoir ce rôle.

<@&1431984265393995867> Perm  
ce sont des membres qui possèdent certaines permissions supplémentaires.

**J’espère que les informations fournies ont été claires**
`)
      .setImage("https://media.tenor.com/2ntArATLDNcAAAAM/train-lag.gif");  // ← GIF Lagtrain intégré comme dans ta 2e image

    channel.send({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);
