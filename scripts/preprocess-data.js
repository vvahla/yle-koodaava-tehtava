import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, '..');

const inputPath = path.join(projectRoot, 'src', 'data', 'raw', '14jt.json');
const outputPath = path.join(projectRoot, 'src', 'data', 'municipalities.json');

const rawData = JSON.parse(fs.readFileSync(inputPath, 'utf8'));
const municipalityCategory = rawData.dimension.alue_23_20240101.category;
const alandMunicipalityCodes = new Set([
  'KU035',
  'KU043',
  'KU060',
  'KU062',
  'KU065',
  'KU076',
  'KU170',
  'KU295',
  'KU318',
  'KU417',
  'KU438',
  'KU478',
  'KU736',
  'KU766',
  'KU771',
  'KU941',
]);

function parseValue(value) {
  const number = Number(value);

  return Number.isFinite(number) ? number : null;
}

function calculateShare(totalChildren, foreignLanguageChildren) {
  if (
    totalChildren === null ||
    totalChildren === 0 ||
    foreignLanguageChildren === null
  ) {
    return null;
  }

  return Number(((foreignLanguageChildren / totalChildren) * 100).toFixed(2));
}

const municipalities = Object.entries(municipalityCategory.index)
  .filter(([municipalityCode]) => !alandMunicipalityCodes.has(municipalityCode))
  .sort(([, firstIndex], [, secondIndex]) => firstIndex - secondIndex)
  .map(([municipalityCode, municipalityIndex]) => {
    const totalChildren = parseValue(rawData.value[municipalityIndex * 2]);
    const foreignLanguageChildren = parseValue(
      rawData.value[municipalityIndex * 2 + 1]
    );
    const share = calculateShare(totalChildren, foreignLanguageChildren);

    return {
      municipalityCode,
      municipality:
        municipalityCode === 'SSS'
          ? 'Koko Suomi'
          : municipalityCategory.label[municipalityCode],
      totalChildren,
      foreignLanguageChildren,
      share,
    };
  })
  .sort((first, second) =>
    first.municipality.localeCompare(second.municipality, 'fi')
  );

fs.writeFileSync(outputPath, `${JSON.stringify(municipalities, null, 2)}\n`);

console.log(`Wrote ${municipalities.length} municipalities to ${outputPath}`);
