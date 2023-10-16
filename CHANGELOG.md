# Changelog

## Version 0.0.5

### Features

- Users can now interactively select and remove unused packages directly from the command line.

## Version 0.0.4

- Minor changes

## Version 0.0.3

### Features

- Added the ability to use the root of the project as the root to scan the packages. You can now specify the root directory during analysis.

- Implemented an enhancement to ignore the `node_modules` folder during the analysis. This helps reduce noise and prevents unnecessary scans of dependencies within the `node_modules` directory.

- Introduced a new command-line flag `--include-dev` that allows you to check for `devDependencies` in addition to regular `dependencies` during the analysis. When used, this flag provides a more comprehensive package analysis.

- Added support for imports using `require`.
