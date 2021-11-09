# Repo setup w/ Eslint + Conventional Commits

## Repository set up

1. Install project dependencies using Yarn.

```
yarn
```

2. Run the dev server (select an option from below):

```
// Watch all (HTML + TypeScript + SCSS) files
yarn dev

// Watch only HTML files
yarn dev:html

// Watch HTML + TypeScript files
yarn dev:ts
```

## Contribution

[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

This repository's use the [Conventional Commits](https://www.conventionalcommits.org/) standard.

To make a commit:

1. Ensure the repository dependencies have been installed.
2. You staged all your changes in git.
3. Use the following command.

```
yarn cz
```

## Build distribution

To build the distribution static files into the `public/*` directory.

```
yarn build
```
