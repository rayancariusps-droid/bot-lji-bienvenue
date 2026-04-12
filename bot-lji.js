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

const WELCOME_CHANNEL_ID = "ID_DU_SALON_BIENVENUE";
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
// BIENVENUE (MODIFIÉ + AJOUT AUTO ROLE)
// =====================
client.on("guildMemberAdd", async (member) => {
try {

// 🔹 auto role welcome  
const role = member.guild.roles.cache.get(WELCOME_ROLE_ID);  
if (role) {  
  await member.roles.add(role).catch(() => {});  
}  

// 🔹 salon bienvenue  
const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);  
if (!channel) return;  

// 🔹 message final stylé  
channel.send(  
  `**Bienvenue sur Naya ❄️ ${member} ! Nous sommes maintenant ${member.guild.memberCount} membres.**\n` +  
  `**Prends tes rôles ici : <#${ROLES_CHANNEL_ID}> <@&${WELCOME_ROLE_ID}>**`  
);

} catch (err) {
console.error("Erreur welcome:", err);
}
});

// =====================
// ROLE NAYA (STATUT)
// =====================
client.on("presenceUpdate", async (_, newPresence) => {
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

// =====================
// TICKET PANEL
// =====================
if (msg === "!ticket") {
const channel = await client.channels.fetch(TICKET_CHANNEL_ID);

const embed = new EmbedBuilder()
.setColor("#000000")
.setTitle("Support Naya")
.setDescription(`

Tickets Couronne
Tickets Gestion Staff
Tickets Gestion Abus
Tickets Animation
Partenariat

Choisis une catégorie
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
// REACT COMMANDES
// =====================

if (msg === "!react1") sendReact(message, "genre",
"Sélectionnez votre genre",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492970578011885689/17760222888293576085531044650226.gif",
[
["Homme","1398475032480583821"],
["Femme","1398475137678049370"],
["Non binaire","1441952406685352208"]
]
);

if (msg === "!react2") sendReact(message, "age",
"Sélectionnez votre âge",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492972636844851341/17760227849791360223833108533606.gif",
[
["Majeur","1492989745385443560"],
["Mineur","1492989803531342045"]
]
);

if (msg === "!react3") sendReact(message, "situation",
"Sélectionnez votre situation",
"https://cdn.discordapp.com/attachments/1483604871276924959/1492994572148543518/17760280123167317692973232058489.gif",
[
["Couple","1492993649141612575"],
["Célibataire","1492993697627902033"],
["Compliqué","1492993754225705070"]
]
);

if (msg === "!react4") sendReact(message, "couleur",
"Sélectionnez une couleur",
"https://cdn.discordapp.com/attachments/1483604871276924959/1493001041233444915/17760295614282950030473050114055.gif",
[
["Noir","1492991889815765072"],
["Blanc","1492991801332863118"],
["Gris","1448233887431131146"],
["Rouge","1448056662706618430"],
["Violet","1448058153500414124"],
["Rose","1448056143736996062"],
["Vert","1448058039109160980"],
["Jaune","1448057680680718550"],
["Orange","1448233970910105691"],
["Marron","1448233601354170421"],
["Bleu","1448057514678812732"],
["Bleu foncé","1492992429454917765"],
["Pastel","1492992142904266752"]
]
);

});

// =====================
// FONCTION REACT
// =====================
function sendReact(message, id, title, gif, options) {
client.channels.fetch(REACT_CHANNEL_ID).then(channel => {

const embed = new EmbedBuilder()
.setColor("#000000")
.setTitle(title)
.setImage(gif);

const row = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId(id)
.setPlaceholder("Choisir")
.addOptions(options.map(o => ({ label: o[0], value: o[1] })))
);

channel.send({ embeds: [embed], components: [row] });

});
}

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (interaction) => {

// CREATE TICKET
if (interaction.isStringSelectMenu() && interaction.customId === "ticket") {

const type = interaction.values[0];
const user = interaction.user.username.toLowerCase().replace(/[^a-z0-9]/g,"");

const channel = await interaction.guild.channels.create({
name: `${type}-${user}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: interaction.guild.roles.everyone.id, deny: ["ViewChannel"] },
{ id: interaction.user.id, allow: ["ViewChannel","SendMessages"] },
{ id: STAFF_ROLE, allow: ["ViewChannel","SendMessages"] }
]
});

channel.send({
content: `Ticket ${type} ${interaction.user} <@&${STAFF_ROLE}>`,
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

if (!interaction.member.roles.cache.has(STAFF_ROLE))
return interaction.reply({ content: "❌ Staff uniquement", ephemeral: true });

const modal = new ModalBuilder()
.setCustomId("closeModal")
.setTitle("Raison");

modal.addComponents(
new ActionRowBuilder().addComponents(
new TextInputBuilder()
.setCustomId("reason")
.setLabel("Pourquoi ?")
.setStyle(TextInputStyle.Paragraph)
)
);

interaction.showModal(modal);

}

// CLOSE SUBMIT (FIX IMPORTANT)
if (interaction.isModalSubmit() && interaction.customId === "closeModal") {

const reason = interaction.fields.getTextInputValue("reason");
const log = await client.channels.fetch(LOG_CHANNEL_ID);

const embed = new EmbedBuilder()
.setColor("#000000")
.setTitle("Ticket fermé")
.addFields(
{ name: "Staff", value: `${interaction.user}` },
{ name: "Raison", value: reason }
);

log.send({ embeds: [embed] });

interaction.reply({ content: "Ticket fermé", ephemeral: true });

setTimeout(() => interaction.channel.delete(), 2000);

}

// REACT ROLES
if (interaction.isStringSelectMenu() && interaction.customId !== "ticket") {

const member = interaction.member;
const role = interaction.values[0];

const groups = {
genre: ["1398475032480583821","1398475137678049370","1441952406685352208"],
age: ["1492989745385443560","1492989803531342045"],
situation: ["1492993649141612575","1492993697627902033","1492993754225705070"],
couleur: ["1492991889815765072","1492991801332863118","1448233887431131146","1448056662706618430","1448058153500414124","1448056143736996062","1448058039109160980","1448057680680718550","1448233970910105691","1448233601354170421","1448057514678812732","1492992429454917765","1492992142904266752"]
};

if (groups[interaction.customId]) {
await member.roles.remove(groups[interaction.customId]);
await member.roles.add(role);

interaction.reply({ content: "Rôle mis à jour", ephemeral: true });
}

}

});

client.login(process.env.DISCORD_TOKEN);
