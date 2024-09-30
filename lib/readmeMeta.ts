import { readFileSync, writeFileSync } from "fs";
import { parse as mdParse } from "marked";
import { parse as htmlParse } from "node-html-parser";
import { join } from "path";

export interface ReadmeMeta {
  description: string;
  keywords: string[];
  homepage: string;
}

/* Read readme file and extract meta description, keywords and homepage link */
async function loadMeta(readmeFilePath: string): Promise<ReadmeMeta> {
  const readmeFileContent: string = readFileSync(readmeFilePath, {
    encoding: "utf8",
  });

  const parsedMD: string = await mdParse(readmeFileContent, {
    gfm: true,
  });

  const parsedHTML = htmlParse(parsedMD);

  const description: string = (
    parsedHTML.querySelector("#intro")?.innerText ?? ""
  ).replace(/\n/g, " ");

  const keywords: string[] =
    parsedHTML
      .querySelector("#keywords")
      ?.childNodes.filter((child) => child.rawTagName === "li")
      .map((child) => child.innerText?.toLowerCase() ?? "") ?? [];

  const homepage: string =
    parsedHTML.querySelector("#url")?.getAttribute("href") ?? "";

  return {
    description: description,
    keywords: keywords,
    homepage: homepage,
  };
}

function updateNpmJson(jsonPath: string, meta: ReadmeMeta): void {
  try {
    const jsonData: Record<string, any> = JSON.parse(
      readFileSync(jsonPath, { encoding: "utf8" })
    );

    /* Updating content */
    jsonData["homepage"] = meta.homepage;
    jsonData["description"] = meta.description;
    jsonData["keywords"] = meta.keywords;

    writeFileSync(jsonPath, JSON.stringify(jsonData, null, 2), {
      encoding: "utf8",
    });
  } catch (err) {
    console.log("package.json not-found so skipped");
    console.log(err);
  }
}

export default async function getReadmeMeta(
  repoRoot: string
): Promise<ReadmeMeta> {
  try {
    const readmeFilePath = join(repoRoot, "README.md");
    const npmFilePath = join(repoRoot, "package.json");

    const meta: ReadmeMeta = await loadMeta(readmeFilePath);
    updateNpmJson(npmFilePath, meta);

    return meta;
  } catch (err) {
    return {
      description: "",
      keywords: [],
      homepage: "",
    };
  }
}
