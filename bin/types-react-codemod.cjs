#!/usr/bin/env node
// @ts-check
const childProcess = require("child_process");
const fs = require("fs");
const inquirer = require("inquirer");
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
				return builder
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
					.option("verbose", { default: false, type: "boolean" })
					.demandOption(["codemod", "paths"]);
			},
			async (argv) => {
				const { codemod, dry, paths, verbose } = argv;

				// TODO: npx instead?
				const jscodeshiftExecutable = require.resolve(".bin/jscodeshift");

				/**
				 * @type {string[]}
				 */
				const args = [
					"--extensions=tsx,ts",
					"--ignore-pattern=**/node_modules/**",
					`--transform ${path.join(transformsRoot, `${codemod}.js`)}`,
				];

				if (codemod === "preset-18") {
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
				}

				if (dry) {
					args.push("--dry");
				}
				if (verbose) {
					args.push("--print");
					args.push("--verbose=2");
				}

				args.push(...paths);

				const command = `${jscodeshiftExecutable} ${args.join(" ")}`;
				console.info(`executing "${command}"`);
				childProcess.execSync(command, { stdio: "inherit" });
			}
		)
		.version("0.0.1")
		.strict(true)
		.help()
		.parse();
}

main().catch((error) => {
	console.error(error);
	process.exit();
});
