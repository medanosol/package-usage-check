#!/usr/bin/env node

import * as p from "@clack/prompts";
import Table from "cli-table";
import fse from "fs-extra";
import { sync } from "glob";

const s = p.spinner();
p.intro("Package usage check");

const packageJson = fse.readJSONSync("package.json");
if (!packageJson) {
  p.note("Couldn't find package.json", "Error");
  process.exit(0);
}

const source = await p.text({
  message: "Enter the source of the project: ",
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
let files;
try {
  files = sync("**/*.{js,jsx,ts,tsx,mjs}", { cwd: source });
} catch {
  p.note("Something went wrong", "Error");
  process.exit(0);
}
const usedPackages = new Set();
s.message("Reading files...");
s.start();
for (const file of files) {
  try {
    const fileContent = fse.readFileSync(`${source}/${file}`, "utf-8");
    for (const packageName of dependencies) {
      const packageImportRegex = new RegExp(
        `import .* from ['"]${packageName}['"];`,
        "g"
      );
      if (fileContent.match(packageImportRegex)) {
        usedPackages.add(packageName);
      }
    }
  } catch {
    s.stop();
    p.note("Something went wrong", "Error");
    process.exit(0);
  }
}
s.stop();

const unusedPackages = dependencies.filter(
  (packageName) => !usedPackages.has(packageName)
);

if (unusedPackages.length > 0) {
  const table = new Table({
    head: ["Unused Packages"],
    colWidths: [40],
  });

  unusedPackages.forEach((packageName) => {
    table.push([packageName]);
  });

  console.log(table.toString());
} else {
  p.outro("No unused packages");
}
