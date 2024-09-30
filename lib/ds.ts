export interface GithubRepoMeta {
  name: string;
  owner: {
    login: string;
  };
  htmlUrl: string;
  description: string;
  homepage: string | null;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  loc: number;
  languagesMeta: Record<string, number>;
  language: string;
  openIssuesCount: number;
  downloadCount: number;
  latestVersion: string | boolean;
  license: {
    name: string;
    spdxId: string;
  };
}
