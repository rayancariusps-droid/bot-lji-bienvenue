const { Client, GatewayIntentBits, SlashCommandBuilder, Routes, REST } = require("discord.js");
const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus
} = require("@discordjs/voice");

const play = require("play-dl");
const express = require("express");

// =====================
// CONFIG
// =====================
const TOKEN = "TON_TOKEN";
const CLIENT_ID = "TON_CLIENT_ID";
const GUILD_ID = "TON_GUILD_ID";

const RADIO = "http://stream-uk1.radioparadise.com/mp3-192";

// =====================
// WEB DASHBOARD
// =====================
const app = express();
let stats = { guilds: 0, songs: 0 };

app.get("/", (req, res) => {
  res.json({
    status: "ABSOLUTE GOD ONLINE",
    stats
  });
});

app.listen(3000);

// =====================
// STATE SYSTEM (multi-guild)
// =====================
const guilds = new Map();

function get(guildId) {
  if (!guilds.has(guildId)) {
    guilds.set(guildId, {
      queue: [],
      loop: false,
      playing: false,
      connection: null,
      player: createAudioPlayer(),
      channel: null
    });
  }
  return guilds.get(guildId);
}

// =====================
// VOICE JOIN (24/7)
// =====================
function join(guild, channel) {
  const g = get(guild.id);

  g.connection = joinVoiceChannel({
    channelId: channel.id,
    guildId: guild.id,
    adapterCreator: guild.voiceAdapterCreator,
    selfDeaf: true
  });

  g.channel = channel;

  g.connection.on("stateChange", (_, state) => {
    if (state.status === "disconnected") {
      setTimeout(() => join(guild, channel), 3000);
    }
  });
}

// =====================
// MUSIC ENGINE
// =====================
async function next(guildId) {
  const g = get(guildId);

  if (!g.queue.length) {
    g.playing = false;
    return;
  }

  const song = g.queue[0];

  try {
    const stream = await play.stream(song);
    const res = createAudioResource(stream.stream, { inputType: stream.type });

    g.player.play(res);
    g.connection.subscribe(g.player);
    g.playing = true;

    stats.songs++;

    g.player.once(AudioPlayerStatus.Idle, () => {
      if (!g.loop) g.queue.shift();
      next(guildId);
    });

  } catch (e) {
    console.log("error:", e);
    g.queue.shift();
    next(guildId);
  }
}

// =====================
// SLASH COMMANDS
// =====================
const cmds = [
  new SlashCommandBuilder().setName("play").setDescription("Play music").addStringOption(o =>
    o.setName("q").setDescription("url or name").setRequired(true)
  ),
  new SlashCommandBuilder().setName("skip").setDescription("Skip"),
  new SlashCommandBuilder().setName("stop").setDescription("Stop"),
  new SlashCommandBuilder().setName("queue").setDescription("Queue"),
  new SlashCommandBuilder().setName("loop").setDescription("Loop"),
  new SlashCommandBuilder().setName("radio").setDescription("24/7 radio")
].map(x => x.toJSON());

const rest = new REST({ version: "10" }).setToken(TOKEN);

(async () => {
  await rest.put(Routes.applicationGuildCommands(CLIENT_ID, GUILD_ID), { body: cmds });
  console.log("⚡ ABSOLUTE GOD COMMANDS READY");
})();

// =====================
// BOT
// =====================
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates]
});

client.once("ready", () => {
  console.log("👑 ABSOLUTE GOD ONLINE");
});

// =====================
// INTERACTIONS
// =====================
client.on("interactionCreate", async (i) => {
  if (!i.isChatInputCommand()) return;

  const vc = i.member.voice.channel;
  if (!vc) return i.reply("❌ Join vocal first");

  const g = get(i.guild.id);
  stats.guilds = client.guilds.cache.size;

  if (!g.connection) join(i.guild, vc);

  // PLAY
  if (i.commandName === "play") {
    let q = i.options.getString("q");

    if (!q.includes("http")) {
      const s = await play.search(q, { limit: 1 });
      if (s.length) q = s[0].url;
    }

    g.queue.push(q);

    if (!g.playing) next(i.guild.id);

    return i.reply(`🎵 Added (${g.queue.length})`);
  }

  // SKIP
  if (i.commandName === "skip") {
    g.player.stop();
    g.queue.shift();
    next(i.guild.id);
    return i.reply("⏭️ Skip");
  }

  // STOP
  if (i.commandName === "stop") {
    g.queue = [];
    g.player.stop();
    g.connection?.destroy();
    g.connection = null;
    g.playing = false;
    return i.reply("⛔ Stop");
  }

  // LOOP
  if (i.commandName === "loop") {
    g.loop = !g.loop;
    return i.reply("🔁 Loop " + g.loop);
  }

  // QUEUE
  if (i.commandName === "queue") {
    return i.reply(g.queue.length ? g.queue.join("\n") : "empty");
  }

  // RADIO 24/7
  if (i.commandName === "radio") {
    g.queue = [RADIO];
    g.loop = true;
    next(i.guild.id);
    return i.reply("📻 RADIO ON");
  }
});

// =====================
// SAFETY
// =====================
process.on("unhandledRejection", console.log);
process.on("uncaughtException", console.log);

// =====================
// LOGIN
// =====================
client.login(TOKEN);
