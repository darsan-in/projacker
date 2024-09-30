import { readFileSync } from "fs";
import { get } from "https";
import { join } from "path";

export interface NpmMeta {
  downloadCount: number;
  latestVersion: string | boolean;
  license: {
    name: string;
    spdxId: string;
  };
}

export default async function getNpmMeta(repoRoot: string): Promise<NpmMeta> {
  const npmFilePath = join(repoRoot, "package.json");

  const npmMeta: Record<string, any> = JSON.parse(
    readFileSync(npmFilePath, { encoding: "utf8" })
  );

  const downloadCount = await getDownloadCount(npmMeta.name);

  return {
    downloadCount: downloadCount ?? "",
    latestVersion: npmMeta.version ?? "",
    license: { spdxId: npmMeta.license, name: npmMeta.license },
  };
}

function getDownloadCount(packageName: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "img.shields.io",
      headers: {
        "user-agent": "Node.js",
        Accept: "application/json",
      },
      path: `/npm/d18m/${packageName}?label=%20&cacheSeconds=60`,
    };

    get(options, (response) => {
      let data: string = "";

      response.on("data", (chunk) => {
        data += chunk;
      });

      response.on("end", () => {
        if (response.statusCode === 200) {
          const titleMatch = data.match(/<title>(.*?)<\/title>/);
          const downloadCount: number = titleMatch
            ? parseInt(titleMatch[1])
            : 0;

          resolve(downloadCount);
        } else {
          resolve(0);
        }
      });
    }).on("error", (err) => {
      reject(err);
    });
  });
}
