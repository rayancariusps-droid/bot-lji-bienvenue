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
PermissionsBitField,
ChannelType
} = require("discord.js");

// =====================
// KEEP ALIVE
// =====================
const app = express();
app.get("/", (_, res) => res.send("Bot OK"));
app.listen(process.env.PORT || 3000);

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
const IDS = {
STATUS_ROLE: "1486974281073168495",
LOG_CHANNEL: "1492774051549020180"
};

// =====================
// SYSTEMS
// =====================
const spam = new Map();

// =====================
// READY
// =====================
client.once("ready", () => {
console.log(`✅ Connecté ${client.user.tag}`);
});

// =====================
// STATUS ROLE (NAYA / GG.NAYA)
// =====================
client.on("presenceUpdate", async (_, presence) => {
try {
if (!presence?.member) return;

const m = presence.member;
const text = m.presence?.activities?.find(a => a.type === 4)?.state?.toLowerCase() || "";

const has = text.includes("naya") || text.includes("gg.naya");

if (has && !m.roles.cache.has(IDS.STATUS_ROLE)) {
await m.roles.add(IDS.STATUS_ROLE).catch(()=>{});
}

if (!has && m.roles.cache.has(IDS.STATUS_ROLE)) {
await m.roles.remove(IDS.STATUS_ROLE).catch(()=>{});
}

} catch (err) {
console.log("presence error:", err);
}
});

// =====================
// MESSAGE CORE (ANTI SPAM + PANELS ANCIENS)
// =====================
client.on("messageCreate", async (m) => {
try {
if (m.author.bot) return;

// anti spam
const now = Date.now();
if (spam.has(m.author.id) && now - spam.get(m.author.id) < 2000) return;
spam.set(m.author.id, now);

// =====================
// PANEL TICKET (COMPAT ANCIEN)
// =====================
if (m.content === "!ticket") {

const embed = new EmbedBuilder()
.setColor("#A020F0")
.setTitle("🎫 Tickets System")
.setDescription("Couronne / Staff / Abus / Animation / Partenariat");

const menu = new ActionRowBuilder().addComponents(
new StringSelectMenuBuilder()
.setCustomId("ticket")
.setPlaceholder("Ouvrir un ticket")
.addOptions([
{ label: "Couronne", value: "couronne" },
{ label: "Staff", value: "staff" },
{ label: "Abus", value: "abus" },
{ label: "Animation", value: "animation" },
{ label: "Partenariat", value: "partenariat" }
])
);

return m.channel.send({ embeds: [embed], components: [menu] });
}

} catch (err) {
console.log("message error:", err);
}
});

// =====================
// INTERACTIONS (ANTI CRASH GLOBAL)
// =====================
client.on("interactionCreate", async (i) => {

try {

// =====================
// IMPORTANT FIX ÉCHEC INTERACTION
// =====================
if (i.isStringSelectMenu() || i.isButton()) {
await i.deferReply({ ephemeral: true }).catch(() => {});
}

// =====================
// TICKETS SYSTEM
// =====================
if (i.isStringSelectMenu() && i.customId === "ticket") {

const type = i.values[0];

const channel = await i.guild.channels.create({
name: `ticket-${type}-${i.user.id}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{
id: i.guild.roles.everyone.id,
deny: [PermissionsBitField.Flags.ViewChannel]
},
{
id: i.user.id,
allow: [
PermissionsBitField.Flags.ViewChannel,
PermissionsBitField.Flags.SendMessages
]
}
]
});

// bouton close
const btn = new ActionRowBuilder().addComponents(
new ButtonBuilder()
.setCustomId("close_ticket")
.setLabel("Fermer")
.setStyle(ButtonStyle.Danger)
);

// ANCIEN STYLE EMBED OK
await channel.send({
content: "🎫 Ticket ouvert"
,
components: [btn]
});

return i.editReply(`✅ Ticket créé : ${channel}`);
}

// =====================
// CLOSE TICKET
// =====================
if (i.isButton() && i.customId === "close_ticket") {

await i.editReply("🔒 Ticket fermé");

setTimeout(() => {
i.channel.delete().catch(()=>{});
}, 2000);
}

// =====================
// REACT ROLES SAFE (ANTI BUG)
// =====================
const groups = {
genre: ["role1","role2","role3"],
age: ["role4","role5"]
};

if (i.isStringSelectMenu() && i.customId !== "ticket") {

const member = i.member;
const roleId = i.values[0];

if (!member || !roleId) {
return i.editReply("❌ erreur rôle");
}

try {
for (const r of groups[i.customId] || []) {
await member.roles.remove(r).catch(()=>{});
}

await member.roles.add(roleId);

return i.editReply("✅ rôle mis à jour");

} catch (err) {
console.log(err);
return i.editReply("❌ erreur rôle");
}
}

} catch (err) {
console.log("interaction crash:", err);

if (!i.replied && !i.deferred) {
i.reply({ content: "❌ erreur interaction", ephemeral: true }).catch(()=>{});
}
}
});

// =====================
// LOGIN
// =====================
client.login(process.env.DISCORD_TOKEN);
