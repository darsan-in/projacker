export interface GithubRepoMeta {
	name: string;
	owner: {
		login: string;
		/* type: string; */
	};
	htmlUrl: string;
	description: string;
	downloadCount?: number;
	loc?: number;
	/* fork: boolean; */
	/* url: string; */
	/* releasesUrl?: string; */
	latestVersion?: string | boolean;
	/* languagesUrl?: string; */
	languagesMeta?: Record<string, number>;
	/* contributorsUrl: string; */
	createdAt: string;
	updatedAt: string;
	homepage: string | null;
	/* stargazersCount: number; */
	/* watchersCount: number; */
	language: string;
	/* forksCount: number; */
	/* archived: boolean; */
	openIssuesCount: number;
	license: {
		name: string;
		spdxId: string;
	};
	topics: string[];
}
