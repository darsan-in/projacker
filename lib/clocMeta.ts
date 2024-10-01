import { execSync } from "child_process";
import { ignorelangs } from "../ignorelist.json";

export interface ClocMeta {
  loc: number;
  languagesMeta: Record<string, number>;
  language: string;
}

export default function getClocMeta(repoRoot: string): ClocMeta {
  const clocMetaRaw = JSON.parse(
    execSync(
      `cloc . --json --exclude-dir=node_modules,dist,out,.next,richie_op`,
      {
        cwd: repoRoot,
      }
    ).toString("utf8")
  );

  const clocMeta: ClocMeta = {} as ClocMeta;

  let unwantedLOC = 0;
  for (const lang of ignorelangs) {
    if (clocMetaRaw[lang] === undefined) {
      continue;
    }
    unwantedLOC += clocMetaRaw[lang].code;
    delete clocMetaRaw[lang];
  }

  clocMeta.loc = clocMetaRaw["SUM"].code - unwantedLOC;

  delete clocMetaRaw["header"];
  delete clocMetaRaw["SUM"];

  clocMeta.languagesMeta = calculateLangUtilPercentage(
    clocMeta.loc,
    clocMetaRaw
  );

  clocMeta.language = findHighestKey(clocMeta.languagesMeta);

  return clocMeta;
}

function calculateLangUtilPercentage(
  loc: number,
  languagesMeta: Record<string, any>
): Record<string, number> {
  const sum = loc;

  const calculatedLanguageMeta: Record<string, number> = {};

  for (const language of Object.keys(languagesMeta)) {
    const utilPercent = Math.ceil((languagesMeta[language].code / sum) * 100);
    calculatedLanguageMeta[language] = utilPercent;
  }

  return calculatedLanguageMeta;
}

function findHighestKey(obj: Record<string, any>): string {
  let highestKey: string | null = null;
  let highestValue = -Infinity;

  for (const key in obj) {
    if (obj[key] > highestValue) {
      highestValue = obj[key];
      highestKey = key;
    }
  }

  return highestKey ?? Object.keys(obj)[0];
}
