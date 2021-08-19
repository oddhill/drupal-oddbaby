# Odd Baby

Starter for creating new themes for Drupal 8 and 9 sites.

This starter contains everything you might need to create a bare bones theme
with some basic configuration provided out of the box.

## Requirements

- [Node.js](https://nodejs.org/en/) (Version 12)
- [Yarn](https://yarnpkg.com/en/)

## Getting started

Start by downloading the theme as a zip file from Github and unpackage it and
place in in the themes folder of your Drupal project.

The first thing you should do after you've placed the theme in your Drupal project
is to decide on a name for your theme and then rename all files and folders that
currently have the oddbaby name. You will also have to change the name of
functions, breakpoints and more.

When you are done with the previous steps you can install the required packages
by running the following command.

```
yarn install
```

## Usage

While developing you generally want changes to the CSS and JavaScript to be
built automatically. For this purpose you can use the `start` command, this will
start webpack and watch for changes in any of the files located in the `src`
folder.

```
yarn start
```

## Commands

<!-- prettier-ignore-start -->
Command       | Description
--------------|------------
start         | Compiles the CSS and JavaScript and outputs the result to the build folder and also watches for any additional changes to the source file and rebuilds automatically. This should only be used in development.
build         | Builds the CSS and JavaScript for the production environment. This will output a minified and optimized version of the CSS and JavaScript with source maps for easier debugging.
eslint        | Runs eslint and outputs the result to the terminal.
eslint-ci     | Runs eslint and outputs the result to an XML file that can be used in the CI environment.
stylelint     | Runs stylelint and outputs the result to the terminal.
stylelint-ci  | Runs stylelint and outputs the result to an XML file that can be used in the CI environment.
<!-- prettier-ignore-end -->
