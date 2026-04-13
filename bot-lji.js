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
TextInputStyle,
PermissionsBitField
} = require("discord.js");

const {
joinVoiceChannel,
createAudioPlayer,
createAudioResource,
AudioPlayerStatus,
NoSubscriberBehavior
} = require("@discordjs/voice");

const ytdl = require("ytdl-core");
const play = require("play-dl");

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
GatewayIntentBits.GuildPresences,
GatewayIntentBits.GuildMessageReactions
]
});

// =====================
// IDS
// =====================
const TICKET_CHANNEL_ID = "1483599648018006150";
const LOG_CHANNEL_ID = "1492774051549020180";
const REACT_CHANNEL_ID = "1483992171538550935";

const WELCOME_CHANNEL_ID = "1483601884165181604";
const ROLES_CHANNEL_ID = "1483992171538550935";
const WELCOME_ROLE_ID = "1479358568091357234";

const STAFF_ROLE = "1390086486291910726";
const STATUS_ROLE = "1486974281073168495";

const VIOLET_CHANNEL = "1493062745371709481";

// =====================
// SYSTEMS
// =====================
const dmCooldown = new Set();
const aiChannels = new Set();
const queues = new Map();

// =====================
// MUSIC SYSTEM
// =====================
function getQueue(guildId) {
if (!queues.has(guildId)) {
queues.set(guildId, {
songs: [],
playing: false,
connection: null,
player: createAudioPlayer({
behaviors: NoSubscriberBehavior.Play
})
});
}
return queues.get(guildId);
}

async function playNext(guild, channel) {
const queue = getQueue(guild.id);

if (!queue.songs.length) {
queue.playing = false;
return;
}

const song = queue.songs.shift();

const stream = ytdl(song.url, { filter: "audioonly" });
const resource = createAudioResource(stream);

queue.player.play(resource);
queue.playing = true;

queue.player.once(AudioPlayerStatus.Idle, () => {
playNext(guild, channel);
});
}

// =====================
// READY
// =====================
client.once("ready", async () => {
console.log(`Connecté : ${client.user.tag}`);

const ch = await client.channels.fetch(VIOLET_CHANNEL).catch(()=>{});
if (ch) {
ch.send({
embeds: [
new EmbedBuilder()
.setColor("#A020F0")
.setTitle("Information Support")
.setDescription("Support h24 / respect obligatoire / patience demandée")
.setImage("https://cdn.discordapp.com/attachments/1483604871276924959/1493045666702692582/17760402075634684831978161728006.gif")
]
});
}
});

// =====================
// WELCOME
// =====================
client.on("guildMemberAdd", async (member) => {
try {
const role = member.guild.roles.cache.get(WELCOME_ROLE_ID);
if (role) await member.roles.add(role);

const channel = await member.guild.channels.fetch(WELCOME_CHANNEL_ID);
if (!channel) return;

channel.send(
`Bienvenue sur Naya ❄️ ${member} ! Nous sommes maintenant ${member.guild.memberCount} membres.\n` +
`Prend tes rôles dans <#${ROLES_CHANNEL_ID}> <@&${WELCOME_ROLE_ID}>`
);

} catch {}
});

// =====================
// STATUS ROLE
// =====================
client.on("presenceUpdate", async (_, presence) => {
if (!presence?.member) return;

const m = presence.member;
const text = m.presence?.activities?.find(a => a.type === 4)?.state?.toLowerCase() || "";

const has = text.includes("naya") || text.includes("gg.naya");

if (has && !m.roles.cache.has(STATUS_ROLE)) {
await m.roles.add(STATUS_ROLE).catch(()=>{});

if (!dmCooldown.has(m.id)) {
dmCooldown.add(m.id);

m.send({
embeds: [
new EmbedBuilder()
.setColor("#FFB6E6")
.setDescription("💖 Merci d’utiliser Naya")
]
}).catch(()=>{});
}
}

if (!has && m.roles.cache.has(STATUS_ROLE)) {
m.roles.remove(STATUS_ROLE).catch(()=>{});
}
});

// =====================
// MESSAGE COMMANDS
// =====================
client.on("messageCreate", async (message) => {
if (message.author.bot) return;
const msg = message.content.toLowerCase();

// ---------- MUSIC ----------
if (msg === "!join") {
const vc = message.member.voice.channel;
if (!vc) return message.reply("Vocal requis");

const queue = getQueue(message.guild.id);

const conn = joinVoiceChannel({
channelId: vc.id,
guildId: message.guild.id,
adapterCreator: message.guild.voiceAdapterCreator
});

queue.connection = conn;
conn.subscribe(queue.player);

return message.reply("🎧 Connecté");
}

if (msg.startsWith("!play ")) {
const vc = message.member.voice.channel;
if (!vc) return message.reply("Entre en vocal");

const queue = getQueue(message.guild.id);

let query = message.content.slice(6);
let url = query;

if (!ytdl.validateURL(query)) {
const search = await play.search(query, { limit: 1 });
if (!search.length) return message.reply("Introuvable");
url = search[0].url;
}

queue.songs.push({ url });

if (!queue.playing) {
queue.playing = true;

const conn = joinVoiceChannel({
channelId: vc.id,
guildId: message.guild.id,
adapterCreator: message.guild.voiceAdapterCreator
});

queue.connection = conn;
conn.subscribe(queue.player);

playNext(message.guild, vc);
}

return message.reply("🎵 Ajouté");
}

if (msg === "!skip") {
const queue = getQueue(message.guild.id);
queue.player.stop();
return message.reply("⏭️ Skip");
}

if (msg === "!pause") {
getQueue(message.guild.id).player.pause();
return message.reply("⏸️ Pause");
}

if (msg === "!resume") {
getQueue(message.guild.id).player.unpause();
return message.reply("▶️ Resume");
}

// ---------- RUKIA IA ----------
if (msg === "!ai-on") {
aiChannels.add(message.channel.id);
return message.reply("🤖 Rukia ON");
}

if (msg === "!ai-off") {
aiChannels.delete(message.channel.id);
return message.reply("🤖 Rukia OFF");
}

if (aiChannels.has(message.channel.id)) {
const replies = [
`❄️ Rukia: "${message.content}"`,
`🗡️ Rukia: "Hmm..."`,
`🌸 Rukia: "Intéressant"`
];
return message.reply(replies[Math.floor(Math.random()*replies.length)]);
}
});

// =====================
// INTERACTIONS (tickets + roles)
// =====================
client.on("interactionCreate", async (interaction) => {

/* TICKET */
if (interaction.isStringSelectMenu() && interaction.customId === "ticket") {

const type = interaction.values[0];

const channel = await interaction.guild.channels.create({
name: `ticket-${type}-${interaction.user.id}`,
type: ChannelType.GuildText,
permissionOverwrites: [
{ id: interaction.guild.roles.everyone.id, deny: [PermissionsBitField.Flags.ViewChannel] },
{ id: interaction.user.id, allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages] },
{ id: STAFF_ROLE, allow: [PermissionsBitField.Flags.ViewChannel] }
]
});

return interaction.reply({ content: "Ticket créé", ephemeral: true });
}

/* REACTION ROLES */
if (interaction.isStringSelectMenu() && interaction.customId !== "ticket") {

const member = interaction.member;
const role = interaction.values[0];

const groups = {
genre: ["1398475032480583821","1398475137678049370","1441952406685352208"],
age: ["1492989745385443560","1492989803531342045"],
situation: ["1492993649141612575","1492993697627902033","1492993754225705070"],
couleur: ["1492991889815765072","1492991801332863118","1448233887431131146"]
};

if (groups[interaction.customId]) {
for (const r of groups[interaction.customId]) {
await member.roles.remove(r).catch(()=>{});
}
await member.roles.add(role).catch(()=>{});
return interaction.reply({ content: "Rôle mis à jour", ephemeral: true });
}
}

});

client.login(process.env.DISCORD_TOKEN);,
