import * as fs from 'fs/promises';

const getEnemies = async () => {
  const response = await fetch('https://api.tibiadata.com/v3/guild/Gide+Lovers');
  const data = await response.json();
  return data;
};

const getDeaths = async (name) => {
  console.log(`Processing enemy ${name}…`);
  const slug = name.replaceAll(' ', '+');
  const url = `https://api.tibiadata.com/v3/character/${slug}`;
  const response = await fetch(url);
  const data = await response.json();
  const deaths = data.characters.deaths;
  return deaths;
};

const data = await getEnemies();
const names = data.guilds.guild.members.map(entry => entry.name);
const ENEMY_NAMES = new Set(names);

const FRAGGERS = new Map();

// Kick off all requests in parallel.
const deathsPerName = names.map(name => getDeaths(name));
await Promise.allSettled(deathsPerName);

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
const DATE_ID = new Date().toISOString().slice(0, 10);
await fs.writeFile(`./data/fraggers-${DATE_ID}.json`, `${json}\n`);
