require("dotenv").config();
const express = require("express");
const {
Client,
GatewayIntentBits,
EmbedBuilder,
ActionRowBuilder,
StringSelectMenuBuilder,
ChannelType,
PermissionsBitField,
REST,
Routes,
SlashCommandBuilder
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
// EXPRESS
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
GatewayIntentBits.GuildPresences,
GatewayIntentBits.GuildVoiceStates
]
});

// =====================
// IDS
// =====================
const IDS = {
WELCOME_CHANNEL: "1483601884165181604",
ROLES_CHANNEL: "1483992171538550935",
WELCOME_ROLE: "1479358568091357234",
TICKET: "1483599648018006150",
STAFF_ROLE: "1390086486291910726"
};

// =====================
// SYSTEMS
// =====================
const aiChannels = new Set();
const spam = new Map();

// =====================
// MUSIC
// =====================
const queues = new Map();

function getQueue(guildId) {
if (!queues.has(guildId)) {
queues.set(guildId, {
songs: [],
loop: false,
shuffle: false,
playing: false,
player: createAudioPlayer({ behaviors: NoSubscriberBehavior.Play }),
connection: null
});
}
return queues.get(guildId);
}

function shuffle(arr) {
for (let i = arr.length - 1; i > 0; i--) {
const j = Math.floor(Math.random() * (i + 1));
[arr[i], arr[j]] = [arr[j], arr[i]];
}
}

async function playNext(guild) {
const q = getQueue(guild.id);
if (!q.songs.length) return q.playing = false;

if (q.shuffle) shuffle(q.songs);

const song = q.songs.shift();
const stream = ytdl(song.url, { filter: "audioonly" });
const res = createAudioResource(stream);

q.player.play(res);
q.playing = true;

q.player.once(AudioPlayerStatus.Idle, () => {
if (q.loop) q.songs.push(song);
playNext(guild);
});
}

// =====================
// SLASH COMMANDS
// =====================
const commands = [
new SlashCommandBuilder().setName("play").setDescription("Play music")
.addStringOption(o => o.setName("query").setRequired(true)),
new SlashCommandBuilder().setName("skip").setDescription("Skip"),
new SlashCommandBuilder().setName("stop").setDescription("Stop"),
new SlashCommandBuilder().setName("loop").setDescription("Loop"),
new SlashCommandBuilder().setName("shuffle").setDescription("Shuffle"),
new SlashCommandBuilder().setName("ai").setDescription("Rukia AI ON/OFF")
].map(x => x.toJSON());

// =====================
// READY
// =====================
client.once("ready", async () => {
console.log("Bot ON");

// register slash
const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
await rest.put(Routes.applicationCommands(client.user.id), { body: commands });
});

// =====================
// WELCOME
// =====================
client.on("guildMemberAdd", async (member) => {
const role = member.guild.roles.cache.get(IDS.WELCOME_ROLE);
if (role) member.roles.add(role);

const ch = await member.guild.channels.fetch(IDS.WELCOME_CHANNEL);

ch.send(
`Bienvenue sur Naya ❄️ ${member} !
Prend tes rôles ici ➜ <#${IDS.ROLES_CHANNEL}>`
);
});

// =====================
// REACTION ROLES PRO (IMPORTANT)
// =====================
const groups = {
genre: ["A","B","C"],
age: ["D","E"],
situation: ["F","G","H"],
couleur: ["I","J","K"]
};

client.on("interactionCreate", async (i) => {

if (i.isStringSelectMenu() && i.customId !== "ticket") {

const member = i.member;
const role = i.values[0];

const group = groups[i.customId];
if (!group) return;

for (const r of group) {
await member.roles.remove(r).catch(()=>{});
}

await member.roles.add(role).catch(()=>{});

return i.reply({ content: "Rôle mis à jour ✅", ephemeral: true });
}
});

// =====================
// MUSIC SLASH
// =====================
client.on("interactionCreate", async (i) => {
if (!i.isChatInputCommand()) return;

const q = getQueue(i.guild.id);

if (i.commandName === "play") {

const vc = i.member.voice.channel;
if (!vc) return i.reply("Vocal requis");

let query = i.options.getString("query");
let url = query;

if (!ytdl.validateURL(query)) {
const s = await play.search(query, { limit: 1 });
if (!s.length) return i.reply("Introuvable");
url = s[0].url;
}

q.songs.push({ url });

if (!q.playing) {
const conn = joinVoiceChannel({
channelId: vc.id,
guildId: i.guild.id,
adapterCreator: i.guild.voiceAdapterCreator
});

q.connection = conn;
conn.subscribe(q.player);

playNext(i.guild);
}

return i.reply("🎵 Ajouté");
}

if (i.commandName === "skip") {
q.player.stop();
return i.reply("Skip");
}

if (i.commandName === "stop") {
q.songs = [];
q.player.stop();
return i.reply("Stop");
}

if (i.commandName === "loop") {
q.loop = !q.loop;
return i.reply("Loop: " + q.loop);
}

if (i.commandName === "shuffle") {
q.shuffle = !q.shuffle;
return i.reply("Shuffle: " + q.shuffle);
}

if (i.commandName === "ai") {
if (aiChannels.has(i.channel.id)) {
aiChannels.delete(i.channel.id);
return i.reply("AI OFF");
}
aiChannels.add(i.channel.id);
return i.reply("AI ON");
}
});

// =====================
// AI SIMPLE
// =====================
client.on("messageCreate", async (m) => {
if (m.author.bot) return;

if (spam.has(m.author.id)) {
if (Date.now() - spam.get(m.author.id) < 2000) return;
}
spam.set(m.author.id, Date.now());

if (aiChannels.has(m.channel.id)) {
return m.reply(`❄️ Rukia: ${m.content}`);
}
});

client.login(process.env.DISCORD_TOKEN);
