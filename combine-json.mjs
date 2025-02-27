import fs from 'node:fs/promises';

import {glob} from 'glob';
import jsesc from 'jsesc';

const filePaths = await glob('data/{peloria,retalia}/fraggers-*.json');

const readJson = async (filePath) => {
	const json = await fs.readFile(`./${filePath}`, 'utf8');
	const data = JSON.parse(json);
	return data;
};

const re = /^data\/(?<world>[^\/]+)\/fraggers-(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})\.json$/;

const map = new Map();
const dateIds = new Set();

for (const filePath of filePaths) {
	const {world, year, month, day} = re.exec(filePath).groups;
	const niceWorld = world.at(0).toUpperCase() + world.slice(1);
	const dateId = `${year}-${month}-${day}`;
	dateIds.add(dateId);
	const data = await readJson(filePath);
	const fraggers = Object.entries(data);
	for (const [characterName, fragCount] of fraggers) {
		// Ignore legacy “sorcerer familiar of Xyz” entries.
		if (/[a-z]/.test(characterName.at(0))) continue;
		const normalizedName = characterName.toLowerCase();
		const fragsEntry = {
			date: dateId,
			frags: fragCount,
		};
		if (map.has(normalizedName)) {
			map.get(normalizedName).fragData.push(fragsEntry);
		} else {
			map.set(normalizedName, {
				meta: {
					name: characterName,
					world: niceWorld,
				},
				fragData: [fragsEntry],
			});
		}
	}
}

const stringify = (data) => {
	return jsesc(data, {
		compact: false,
	});
};

const sortedDateIds = new Set(Array.from(dateIds).sort().reverse());
const sourceText = `export const dateIds = ${stringify(sortedDateIds)};\n\nexport const frags = ${stringify(map)};\n`;
await fs.writeFile('./data/frags.mjs', sourceText);
