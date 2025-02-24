import fs from 'node:fs/promises';

import {glob} from 'glob';

const getTotalFragsPerFile = async (filePath, charNames) => {
  const json = await fs.readFile(`./${filePath}`, 'utf8');
  const data = JSON.parse(json);

  const fraggers = new Map(Object.entries(data));

  const getFrags = (charNames) => {
    let total = 0;
    for (const ch of charNames) {
      if (fraggers.has(ch)) {
        total += fraggers.get(ch);
      }
    }
    return total;
  };

  const total = getFrags(charNames);
  return total;
};

const charNames = process.argv?.[2].split(',');

const filePaths = await glob('data/*/fraggers-{2024,2025}-*.json');

let sumTotal = 0;
for (const filePath of filePaths) {
  console.log(filePath)
  const combinedFragsThisWorldAndMonth = await getTotalFragsPerFile(filePath, charNames);
  sumTotal += combinedFragsThisWorldAndMonth;
}
console.log(`Combined frags for ${charNames}: ${sumTotal}`);
