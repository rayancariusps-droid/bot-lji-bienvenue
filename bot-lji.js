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

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// IDS
const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const REGLEMENT_CHANNEL_ID = "1483583968241651722";

// Ready
client.once("ready", () => {
  console.log(`Connecté en tant que ${client.user.tag}`);
});

// =====================
// WELCOME SYSTEM
// =====================
client.on("guildMemberAdd", async member => {
  try {
    const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const memberCount = member.guild.memberCount;

    const message =
      `⛩️ Bienvenue sur ** Naya . lji** ${member} !\n` +
      `Nous sommes maintenant **${memberCount}** membres !\n` +
      `Prends tes rôles dans <#${ROLES_CHANNEL_ID}> \n` +
      `<@&1479358568091357234>`;

    await channel.send({
      content: message,
      files: [
        "https://media1.tenor.com/m/YXjYxFaPVr0AAAAC/akame-ga-kill.gif"
      ]
    });

  } catch (err) {
    console.error("Erreur welcome:", err);
  }
});

// =====================
// COMMANDES
// =====================
client.on("messageCreate", async message => {
  if (message.author.bot) return;

  const msg = message.content.toLowerCase();

  // ping
  if (msg === "!ping") {
    const sent = await message.channel.send("Pong");
    sent.edit(`Pong ${sent.createdTimestamp - message.createdTimestamp}ms`);
  }

  // membres
  if (msg === "!membres") {
    message.channel.send(
      `Nous sommes actuellement ${message.guild.memberCount} membres sur le serveur`
    );
  }

  // règlement
  if (msg === "!règlement") {
    const channel = message.guild.channels.cache.get(REGLEMENT_CHANNEL_ID);
    if (!channel) return message.channel.send("Salon règlement introuvable");

    const embed = new EmbedBuilder()
      .setTitle("Règlement du serveur :")
      .setColor("#5865F2")
      .setDescription(`
Bienvenue sur **や . Naya . lji**, un espace dédié aux passionnés d'anime.

**1. Respect et bienveillance**
• Aucun propos haineux, discriminatoire ou harcèlement ne sera toléré.  

**2. Contenu approprié**
• Aucune image ou contenu illégal.  

**3. Convivialité**
• Pas de spam ni publicité.  

**4. Salons**
• Respectez les catégories.  

**5. Modération**
• Suivez les instructions du staff.

Merci de respecter ces règles 🙏
`);

    await channel.send({
      content: "📜 Règlement du serveur ⬇️",
      embeds: [embed],
      files: [
        "https://media1.tenor.com/m/YXjYxFaPVr0AAAAC/akame-ga-kill.gif"
      ]
    });
  }
});

client.login(process.env.DISCORD_TOKEN);
