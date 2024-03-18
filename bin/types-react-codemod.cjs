#!/usr/bin/env node
// @ts-check
const childProcess = require("child_process");
const fs = require("fs");
const inquirerImport = import("inquirer");
const process = require("process");
const yargs = require("yargs/yargs");
const { hideBin } = require("yargs/helpers");
const path = require("path");

async function main() {
	const transformsRoot = path.join(__dirname, "../transforms");
	const transforms = fs
		.readdirSync(transformsRoot)
		.filter((transformPath) => {
			return transformPath.endsWith(".js");
		})
		.map((transformPath) => {
			return path.basename(transformPath, ".js");
		});

	yargs(hideBin(process.argv))
		.scriptName("types-react-codemod")
		.command(
			"$0 <codemod> <paths...>",
			"",
			(builder) => {
				return (
					builder
						.positional("codemod", {
							choices: transforms,
							type: "string",
						})
						.positional("paths", {
							array: true,
							type: "string",
						})
						.option("dry", {
							default: false,
							type: "boolean",
						})
						.option("ignore-pattern", {
							default: "**/node_modules/**",
							type: "string",
						})
						.option("verbose", { default: false, type: "boolean" })
						// Ignoring `build`: https://www.digitalocean.com/community/tools/glob?comments=true&glob=%2A%2A%2F%7Bnode_modules%2Cbuild%7D%2F%2A%2A&matches=false&tests=package%2Fnode_modules%2Ftest.js&tests=package%2Fbuild%2Ftest.js&tests=package%2Ftest.js
						.example(
							'$0 preset-18 ./ --ignore-pattern "**/{node_modules,build}/**"',
							"Ignores `node_modules` and `build` folders",
						)
						.demandOption(["codemod", "paths"])
				);
			},
			async (argv) => {
				const { codemod, dry, paths, verbose } = argv;

				// TODO: npx instead?
				const jscodeshiftExecutable = require.resolve(
					"jscodeshift/bin/jscodeshift.js",
				);

				/**
				 * @type {string[]}
				 */
				const args = [
					"--extensions=tsx,ts",
					`"--ignore-pattern=${argv.ignorePattern}"`,
					// The transforms are published as JS compatible with the supported Node.js versions.
					"--no-babel",
					`--transform ${path.join(transformsRoot, `${codemod}.js`)}`,
				];

				if (codemod === "preset-18") {
					const { default: inquirer } = await inquirerImport;
					const { presets } = await inquirer.prompt([
						{
							message: "Pick transforms to apply",
							name: "presets",
							type: "checkbox",
							choices: [
								{ checked: false, value: "context-any" },
								{ checked: true, value: "deprecated-react-type" },
								{ checked: true, value: "deprecated-sfc-element" },
								{ checked: true, value: "deprecated-sfc" },
								{ checked: true, value: "deprecated-stateless-component" },
								{ checked: false, value: "implicit-children" },
								{ checked: false, value: "useCallback-implicit-any" },
							],
						},
					]);
					args.push(`--preset18Transforms="${presets.join(",")}"`);
				} else if (codemod === "preset-19") {
					const { default: inquirer } = await inquirerImport;
					const { presets } = await inquirer.prompt([
						{
							message: "Pick transforms to apply",
							name: "presets",
							type: "checkbox",
							choices: [
								{ checked: true, value: "deprecated-legacy-ref" },
								{ checked: true, value: "deprecated-prop-types-types" },
								{ checked: true, value: "deprecated-react-child" },
								{ checked: true, value: "deprecated-react-node-array" },
								{ checked: true, value: "deprecated-react-fragment" },
								{ checked: true, value: "deprecated-react-text" },
								{ checked: true, value: "deprecated-void-function-component" },
								{ checked: true, value: "refobject-defaults" },
								{ checked: true, value: "scoped-jsx" },
								{ checked: true, value: "useRef-required-initial" },
							],
						},
					]);
					args.push(`--preset19Transforms="${presets.join(",")}"`);
				}

				if (dry) {
					args.push("--dry");
				}
				if (verbose) {
					args.push("--print");
					args.push("--verbose=2");
				}

				args.push(...paths);

				const command = `node ${jscodeshiftExecutable} ${args.join(" ")}`;
				console.info(`executing "${command}"`);
				childProcess.execSync(command, { stdio: "inherit" });
			},
		)
		.version()
		.strict(true)
		.help()
		.parse();
}

main().catch((error) => {
	console.error(error);
	process.exit();
});
