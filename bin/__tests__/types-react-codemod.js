import { describe, expect, test } from "@jest/globals";
import * as childProcess from "child_process";
import * as path from "path";
import { promisify } from "util";

describe("types-react-codemod", () => {
	const exec = promisify(childProcess.exec);
	const typesReactCodemodBin = path.join(
		__dirname,
		"../types-react-codemod.cjs"
	);
	function execTypesReactCodemod(args) {
		return exec(`${typesReactCodemodBin} ${args}`, {});
	}

	test("provides help", async () => {
		await expect(execTypesReactCodemod("--help")).resolves
			.toMatchInlineSnapshot(`
					Object {
					  "stderr": "",
					  "stdout": "types-react-codemod <codemod> <paths...>

					Positionals:
					  codemod [string] [required] [choices: \\"context-any\\", \\"deprecated-react-child\\",
					     \\"deprecated-react-text\\", \\"deprecated-react-type\\", \\"deprecated-sfc-element\\",
					        \\"deprecated-sfc\\", \\"deprecated-stateless-component\\", \\"implicit-children\\",
					                           \\"preset-18\\", \\"preset-19\\", \\"useCallback-implicit-any\\"]
					  paths                                                      [string] [required]

					Options:
					  --version         Show version number                                [boolean]
					  --help            Show help                                          [boolean]
					  --dry                                               [boolean] [default: false]
					  --ignore-pattern                      [string] [default: \\"**/node_modules/**\\"]
					  --verbose                                           [boolean] [default: false]

					Examples:
					  types-react-codemod preset-18 ./          Ignores \`node_modules\` and \`build\`
					  --ignore-pattern                          folders
					  \\"**/{node_modules,build}/**\\"
					",
					}
				`);
	});

	test("provides its version", async () => {
		const { version } = require("../../package.json");
		const { stdout } = await execTypesReactCodemod("--version");
		expect(stdout.trim()).toBe(version);
	});
});
