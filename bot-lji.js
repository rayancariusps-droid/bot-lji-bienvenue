require("dotenv").config();
const express = require("express");

const {
Client,
GatewayIntentBits
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
STATUS_ROLE: "1486974281073168495"
};

// =====================
// SYSTEMS
// =====================
const spam = new Map();

// =====================
// READY
// =====================
client.once("ready", () => {
console.log(`✅ Connecté: ${client.user.tag}`);
});

// =====================
// STATUS ROLE (NAYA / GG.NAYA)
// =====================
client.on("presenceUpdate", async (_, presence) => {
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
});

// =====================
// ANTI SPAM (SEULEMENT CORE)
// =====================
client.on("messageCreate", async (m) => {
if (m.author.bot) return;

const now = Date.now();
if (spam.has(m.author.id) && now - spam.get(m.author.id) < 2000) return;
spam.set(m.author.id, now);

// ❌ plus de ping command ici
});

client.login(process.env.DISCORD_TOKEN);
