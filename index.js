#!/usr/bin/env node

import * as p from "@clack/prompts";
import { exec } from "child_process";
import cliProgress from "cli-progress";
import Table from "cli-table";
import fse from "fs-extra";
import { sync } from "glob";
import { hideBin } from "yargs/helpers";
import yargs from "yargs/yargs";

const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// Arguments
const argv = yargs(hideBin(process.argv)).argv;
//Use dev dependencies
const includeDevDeps = argv["include-dev"] || false; //by default false

p.intro("Package usage check");

const packageJson = fse.readJSONSync("package.json");
if (!packageJson) {
  p.note("Couldn't find package.json", "Error");
  process.exit(0);
}

const sourceInput = await p.text({
  message:
    "Enter the folder you would like to scan: (Type 'root' to use the root of the project)",
  defaultValue: "src",
  placeholder: "src",
  validate: (value) => {
    const invalidChars = /[!@#$%^&*()_+{}\[\]:;<>,.?~\\/]/;
    if (invalidChars.test(value)) {
      return "Special characters are not allowed.";
    }
  },
});

const dependencies = Object.keys(packageJson.dependencies || {});
const allDependencies = includeDevDeps
  ? dependencies.concat(Object.keys(packageJson.devDependencies || {}))
  : dependencies;

let files;
try {
  // Read files ignoring node_modules
  files = sync("**/*.{js,jsx,ts,tsx,mjs}", {
    cwd: sourceInput === "root" ? "./" : sourceInput,
    ignore: ["**/node_modules/**"],
  });
} catch {
  p.note("Something went wrong", "Error");
  process.exit(0);
}
const usedPackages = new Set();
console.log("\n");
progressBar.start(files.length, 0);

for (const file of files) {
  try {
    const fileContent = fse.readFileSync(
      `${sourceInput === "root" ? "./" : `${sourceInput}/`}${file}`,
      "utf-8"
    );

    // For each package, check if the file content contains an import with said package.
    for (const packageName of allDependencies) {
      const packageImportRegex = new RegExp(
        `(import .* from ['"]${packageName}['"]);|require\\(['"]${packageName}['"]\\);`,
        "g"
      );
      if (fileContent.match(packageImportRegex)) {
        usedPackages.add(packageName);
      }
    }
    progressBar.increment();
  } catch {
    progressBar.stop();
    p.note("Something went wrong", "Error");
    process.exit(0);
  }
}
progressBar.stop();

const unusedPackages = allDependencies.filter(
  (packageName) => !usedPackages.has(packageName)
);

if (unusedPackages.length === 0) {
  p.outro("No unused packages");
  process.exit(0);
}

const table = new Table({
  head: ["Unused Packages"],
  colWidths: [40],
});

unusedPackages.forEach((packageName) => {
  table.push([packageName]);
});

// Print out the table containing the unused packages
console.log("\n");
console.log(table.toString());

p.note(
  "Note: Please exercise caution when uninstalling packages. Some packages may be used internally or by other dependencies in your project.",
  "Disclaimer"
);

// Confirm that the user wants to uninstall unused packages
const shouldUninstall = await p.confirm({
  message: "Do you want to uninstall any of the unused packages?",
});

if (shouldUninstall) {
  // Select which packages to uninstall
  const packagesToUninstall = await p.multiselect({
    message: "Select which packages you want to uninstall:",
    options: unusedPackages.map((uP) => ({
      label: uP,
      value: uP,
    })),
  });
  // Select the package manager used
  const packageManager = await p.select({
    message: "Select the package manager used in the project:",
    options: [
      {
        label: "npm",
        value: "npm",
      },
      {
        label: "yarn",
        value: "yarn",
      },
      {
        label: "pnpm",
        value: "pnpm",
      },
      {
        label: "bun",
        value: "bun",
      },
    ],
  });

  // Build the command based on the package manager used
  const command = `${packageManager} ${
    packageManager === "npm" ? "uninstall" : "remove" //only npm uses "uninstall", others use or at least support "remove"
  } ${packagesToUninstall.join(" ")}`;

  exec(command, (error) => {
    if (error) {
      p.note(error, "Something went wrong");
    } else {
      p.note(
        `Removed packages: ${packagesToUninstall.join(", ")}`,
        "Packages removed successfully"
      );
    }
  });
}
