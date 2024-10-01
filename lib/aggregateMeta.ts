import { execSync } from "child_process";
import { existsSync } from "fs";
import { basename, join } from "path";
import { ignore } from "../ignorelist.json";
import getClocMeta, { ClocMeta } from "./clocMeta";
import { GithubRepoMeta } from "./ds";
import getRepos from "./listRepo";
import getNpmMeta, { NpmMeta } from "./npmMeta";
import getReadmeMeta, { ReadmeMeta } from "./readmeMeta";

export default async function aggregateMeta(): Promise<
  Promise<GithubRepoMeta[]>
> {
  const availableRepos = getRepos();

  const reposMeta: GithubRepoMeta[] = [];

  for (const userName of Object.keys(availableRepos)) {
    for (const repoPath of availableRepos[userName]) {
      const gitUrl = execSync(`git remote get-url origin`, {
        cwd: repoPath,
      })
        .toString("utf8")
        .trim();

      const name = basename(repoPath);
      if (ignore.includes(name)) {
        continue;
      }

      const owner = userName;

      let htmlUrl = "";
      if (userName === "cresteem") {
        htmlUrl = `https://github.com/cresteem/${name}`;
      } else {
        htmlUrl = `https://gitlab.com/darsan.in/${name}`;
      }

      const readmeMeta: Awaited<ReadmeMeta> = await getReadmeMeta(repoPath);

      const createdAt = execSync(
        `git log --format=%ad --date=short | Sort-Object | Select-Object -First 1`,
        {
          cwd: repoPath,
          shell: "powershell",
        }
      )
        .toString("utf8")
        .trim();

      const updatedAt = execSync(
        `git log --format=%ad --date=short | Sort-Object | Select-Object -Last 1`,
        {
          cwd: repoPath,
          shell: "powershell",
        }
      )
        .toString("utf8")
        .trim();

      const clocMeta: ClocMeta = getClocMeta(repoPath);

      let downloadCount: number = 0;
      let latestVersion: string | boolean = "1.0.0";
      let license: {
        name: string;
        spdxId: string;
      } = { name: "MIT", spdxId: "MIT" };

      const isNPMProject: boolean = existsSync(join(repoPath, "package.json"));

      if (isNPMProject) {
        const npmMeta: Awaited<NpmMeta> = await getNpmMeta(repoPath);

        downloadCount = npmMeta.downloadCount;
        latestVersion = npmMeta.latestVersion;
        license = npmMeta.license;
      }

      reposMeta.push({
        name: name,
        owner: { login: owner },
        htmlUrl: htmlUrl,
        description: readmeMeta.description,
        homepage: readmeMeta.homepage,
        topics: readmeMeta.keywords,
        createdAt: createdAt,
        updatedAt: updatedAt,
        language: clocMeta.language,
        languagesMeta: clocMeta.languagesMeta,
        loc: clocMeta.loc,
        openIssuesCount: 0,
        downloadCount: downloadCount,
        latestVersion: latestVersion,
        license: license,
      });
    }
  }

  return reposMeta;
}
