// =====================
// CONFIG
// =====================
require("dotenv").config();
const express = require("express");
const { Client, GatewayIntentBits } = require("discord.js");

// =====================
// SERVEUR WEB
// =====================
const app = express();

app.get("/", (req, res) => {
  res.send("Bot Naya en ligne");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Serveur web actif sur le port " + PORT);
});

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
const WELCOME_ROLE_ID = "1479358568091357234"; // rôle welcome
const TICKET_CHANNEL_ID = "1483599648018006150";

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

  // ----- TICKETS -----
  if (msg === "!tickets") {
    const channel = await client.channels.fetch(TICKET_CHANNEL_ID);
    if (!channel || !channel.isTextBased()) return;

    const embed = {
      color: 0xFFA500,
      title: "💛 _Support Naya_",
      description: `
👑・ **Ticket Couronne**  
🔹 Tout ce qui est professionnel, échange de dm4ll, fournir chez nous etc…

🛡️・ **Ticket Gestion Staff**  
🔹 Devenir staff, questions relatives aux permissions, demander un rankup / derank etc…

🚨・ **Ticket Gestion Abus**  
🔹 Signaler quelqu’un, abus de permission, problème général…

🎉・ **Ticket Animation**  
🔹 Devenir animateur / animatrice, questions sur les animations…

🤝・ **Ticket Partenariat**  
🔹 Effectuer un partenariat, questions sur les partenariats…

_Choisis la catégorie adaptée à ta demande pour ouvrir ton ticket_
`,
      image: { url: "https://cdn.discordapp.com/attachments/1483604871276924959/1491682627063644232/17757152214445740943822744119404.gif" }
    };

    await channel.send({ embeds: [embed] });
  }
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
