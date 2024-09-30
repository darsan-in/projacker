import aggregateMeta from "./lib/aggregateMeta";
import { GithubRepoMeta } from "./lib/ds";
/* @ts-ignore */
import { writeFileSync } from "fs";
import { join } from "path";
import { dontCount, ignore } from "./ignorelist.json";

async function main(): Promise<void> {
  let ungroupedMeta: GithubRepoMeta[] = [];
  try {
    ungroupedMeta = await aggregateMeta();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }

  const mostUsedLanguages = getMostUsedLanguages(ungroupedMeta);
  const groupedMeta = makeRepoGroups(mostUsedLanguages, ungroupedMeta);

  const totalContributions: number = 1037 + 108 + 10;

  const localMeta = {
    projects: groupedMeta,
    totalProjects: ungroupedMeta.length + ignore.length - dontCount.length,

    totalCommits: totalContributions,
    overallDownloadCounts: getOverallDownloadCounts(ungroupedMeta),
  };

  writeFileSync(join(process.cwd(), "ghmeta.json"), JSON.stringify(localMeta));

  /* summary */
  console.log("Repo cards count: ", ungroupedMeta.length);
  console.log("Ignored repo cards count: ", ignore.length);
  console.log("DontCount size: ", dontCount.length);

  console.log(
    "Final repos count = ( ungroupedMeta.length + ignore.length - dontCount.length ) : ",
    localMeta.totalProjects
  );
}

function getMostUsedLanguages(rawGHMEta: GithubRepoMeta[]): string[] {
  const mostUsedLanguages: Set<string> = new Set();

  rawGHMEta.forEach((repoMeta: GithubRepoMeta) => {
    mostUsedLanguages.add(repoMeta.language);
  });

  return Array.from(mostUsedLanguages).filter((lang) => lang);
}

function makeRepoGroups(
  uniqueLangs: string[],
  rawGHMEta: any
): Record<string, GithubRepoMeta[]> {
  let groupsMeta: Record<string, GithubRepoMeta[]> = {};

  uniqueLangs.forEach((language: string) => {
    const groupedMeta = rawGHMEta.filter(
      (repoMeta: GithubRepoMeta) => repoMeta.language === language
    );

    groupsMeta[language] = groupedMeta;
  });

  return groupsMeta;
}

function getOverallDownloadCounts(ghMetas: GithubRepoMeta[]): number {
  let overallDownloadCounts: number = 0;

  ghMetas.forEach((meta) => {
    const downloadCount: number = meta.downloadCount ?? 0;

    if (!!downloadCount) {
      overallDownloadCounts += downloadCount;
    }
  });

  return overallDownloadCounts;
}

main().catch(console.log);
