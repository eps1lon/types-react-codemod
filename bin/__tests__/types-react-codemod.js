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
    // TODO: toMatchInlineSnapshot fails with "Couldn't locate all inline snapshots."
		await expect(
			execTypesReactCodemod("--help")
		).resolves.toMatchSnapshot();
	});
});
