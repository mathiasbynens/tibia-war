import * as fs from 'fs/promises';

const enemyGuildNames = process.argv.slice(2);

function log(text) {
  return process.stderr.write(`${text}\n`);
}

const slugify = (name) => {
  const slug = name.replaceAll(' ', '+');
  return slug;
};

const getEnemies = async (enemyGuildName) => {
  log(`Processing enemy guild ${enemyGuildName}…`);
  const response = await fetch(`https://api.tibiadata.com/v3/guild/${slugify(enemyGuildName)}`);
  const data = await response.json();
  return data;
};

const getDeaths = async (name) => {
  log(`Processing enemy ${name}…`);
  const url = `https://api.tibiadata.com/v3/character/${slugify(name)}`;
  const response = await fetch(url);
  const data = await response.json();
  const deaths = data.characters.deaths;
  return deaths;
};

const getEnemyNamesFromGuild = async (enemyGuildName) => {
  const data = await getEnemies(enemyGuildName);
  const names = data.guilds.guild.members.map(entry => entry.name);
  return names;
};

const getEnemyNamesFromGuilds = async (enemyGuildNames) => {
  // Kick off all requests in parallel.
  const enemyNamesPerGuild = enemyGuildNames.map(enemyGuildName => getEnemyNamesFromGuild(enemyGuildName));
  await Promise.allSettled(enemyNamesPerGuild);
  const enemyNames = new Set();
  for await (const guildMembers of enemyNamesPerGuild) {
    for (const guildMember of guildMembers) {
      enemyNames.add(guildMember);
    }
  }
  return enemyNames;
};

const ENEMY_NAMES = await getEnemyNamesFromGuilds(enemyGuildNames);

// Kick off all requests in parallel.
const deathsPerName = [...ENEMY_NAMES].map(name => getDeaths(name));
await Promise.allSettled(deathsPerName);

const FRAGGERS = new Map();
for await (const deaths of deathsPerName) {
  if (!deaths) {
    continue;
  }
  for (const death of deaths) {
    const killers = [...death.killers, ...death.assists];
    for (const killer of killers) {
      if (killer.player && !ENEMY_NAMES.has(killer.name)) {
        const name = killer.name;
        if (FRAGGERS.has(name)) {
          FRAGGERS.set(name, FRAGGERS.get(name) + 1);
        } else {
          FRAGGERS.set(name, 1);
        }
      }
    }
  }
}

const mapToJson = (map) => {
  const entries = [...map].sort((a, b) => {
    return b[1] - a[1];
  });
  const object = Object.fromEntries(entries);
  const json = JSON.stringify(object, null, 2);
  return json;
};

const json = mapToJson(FRAGGERS);
console.log(json);
