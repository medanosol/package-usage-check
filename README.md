# @medanosol/package-usage-check

`@medanosol/package-usage-check` is a command-line utility that helps you identify and list unused npm packages in your project's source code.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [How it Works](#how-it-works)

## Installation

Before using `@medanosol/package-usage-check`, you need to install it globally via npm:

```bash
npm install -g @medanosol/package-usage-check
```

or

```bash
npx @medanosol/package-usage-check
```

## Usage

To check for unused npm packages in your project, follow these steps:

1. Open your terminal.
2. Navigate to the root directory of your project.
3. Run the following command:

```bash
npx @medanosol/package-usage-check
```

or

```bash
npx @medanosol/package-usage-check  #(If you haven't installed it globally)
```

4. The tool will prompt you to enter the source directory of your project. The default value is "src," but you can change it to the path where your source code is located.
5. Wait for the tool to analyze your source code. It will identify and list any unused npm packages.
6. If any unused packages are found, the tool will display them in a table format, listing the unused package names.
7. If no unused packages are found, the tool will display a message indicating that there are no unused packages.

## How it Works

The `@medanosol/package-usage-check` utility works by analyzing your project's source code to find
import statements of npm packages in your .js, .ts, .tsx or .jsx files. It checks the
dependencies specified in your project's package.json and identifies which packages are not
used in your codebase.
