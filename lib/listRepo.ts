import { globSync } from "glob";

export default function getRepos() {
  const userReposPatterns: Record<string, string> = {
    cresteem: "A:/Git/cresteem/**/.git",
    "darsan.in": "A:/Git/darsan-in/**/.git",
  };

  const reposMeta: Record<string, string[]> = {
    cresteem: [],
    darsan: [],
  };

  Object.keys(userReposPatterns).forEach((userName) => {
    const repoPaths = globSync(userReposPatterns[userName], {
      absolute: true,
      dot: true,
      dotRelative: true,
    }).map((path) => {
      return path.split("\\").slice(0, -1).join("/");
    });

    reposMeta[userName] = repoPaths;
  });

  return reposMeta;
}
