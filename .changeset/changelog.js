Object.defineProperty(exports, "__esModule", { value: true });

const {
	getInfo,
	getInfoFromPullRequest,
} = require("@changesets/get-github-info");
const changesetsChangelogGithub =
	require("@changesets/changelog-github").default;

/**
 * Vendored `@changesets/changelog-github` but with the changelog entry prefix used as a suffix instead.
 * Before: #1 abcdef0 Thanks @eps1lon! - This is a summary
 * After: This is a summary (#1 abcdef0 by @eps1lon!)
 *
 * The change itself is the most important bit that should be easily scannable.
 * PR and commit are just metadata for further inspection.
 *
 * @type {import("@changesets/types").ChangelogFunctions}
 */
const changelogFunctions = {
	...changesetsChangelogGithub,
	getReleaseLine: async (changeset, type, options) => {
		if (!options || !options.repo) {
			throw new Error(
				'Please provide a repo to this changelog generator like this:\n"changelog": ["@changesets/changelog-github", { "repo": "org/repo" }]',
			);
		}

		/** @type {number | undefined} */
		let prFromSummary;
		/** @type {string | undefined} */
		let commitFromSummary;
		/** @type {string[]} */
		let usersFromSummary = [];

		const replacedChangelog = changeset.summary
			.replace(/^\s*(?:pr|pull|pull\s+request):\s*#?(\d+)/im, (_, pr) => {
				let num = Number(pr);
				if (!isNaN(num)) prFromSummary = num;
				return "";
			})
			.replace(/^\s*commit:\s*([^\s]+)/im, (_, commit) => {
				commitFromSummary = commit;
				return "";
			})
			.replace(/^\s*(?:author|user):\s*@?([^\s]+)/gim, (_, user) => {
				usersFromSummary.push(user);
				return "";
			})
			.trim();

		const [firstLine, ...futureLines] = replacedChangelog
			.split("\n")
			.map((l) => l.trimRight());

		const links = await (async () => {
			if (prFromSummary !== undefined) {
				let { links } = await getInfoFromPullRequest({
					repo: options.repo,
					pull: prFromSummary,
				});
				if (commitFromSummary) {
					const shortCommitId = commitFromSummary.slice(0, 7);
					links = {
						...links,
						commit: `[\`${shortCommitId}\`](https://github.com/${options.repo}/commit/${commitFromSummary})`,
					};
				}
				return links;
			}
			const commitToFetchFrom = commitFromSummary || changeset.commit;
			if (commitToFetchFrom) {
				let { links } = await getInfo({
					repo: options.repo,
					commit: commitToFetchFrom,
				});
				return links;
			}
			return {
				commit: null,
				pull: null,
				user: null,
			};
		})();

		const users = usersFromSummary.length
			? usersFromSummary
					.map(
						(userFromSummary) =>
							`[@${userFromSummary}](https://github.com/${userFromSummary})`,
					)
					.join(", ")
			: links.user;

		const suffix = [
			links.pull === null ? "" : ` ${links.pull}`,
			links.commit === null ? "" : ` ${links.commit}`,
			users === null ? "" : ` by ${users}`,
		].join("");

		return `\n\n- ${firstLine}${suffix ? ` (${suffix})` : ""}\n${futureLines
			.map((l) => `  ${l}`)
			.join("\n")}`;
	},
};

exports["default"] = changelogFunctions;
