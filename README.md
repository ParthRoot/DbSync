<p align="center">
  <a href="https://www.scaletech.xyz/" target="blank">
  <img src="https://raw.githubusercontent.com/mono-repo-dev/assets/master/logo-alt.png" width="180" alt="Scaletech Logo" />
  </a>
</p>

## Description

**Monorepo** framework TypeScript starter repository.

## Core Features

- Module based code structure easily decouple features when not required
- Postgres connection and base code
- Unit tests and integration tests setup
- Implement unit tests and integration tests for authentication and authorization
- Prettier and ES-Lint setup
- Docker file for project image
- Docker compose file for environment image
- CI/CD configurations

## Prerequisite

1. [Curl](https://curl.se/docs/install.html) `optional`
2. [node.js](https://nodejs.org/en/)
3. [pnpm](https://pnpm.io/installation) alternate `$ npm i -g pnpm`
4. [docker](https://docs.docker.com/engine/install/)
5. [MakeFile](https://blogs.iu.edu/ncgas/2019/03/11/installing-software-makefiles-and-the-make-command/)

## Basic skills to work in the project

1. Javascript
2. Typescript
3. pnpm
4. Basic Docker lifecycle
5. Jest
6. NestJs ( according to project )
7. Client Library like React/NextJs/Vue/Angular ( according to project )

### Set up env

```Bash
cp .env.example .env
```

### Start Backend

```Bash
# It will use the make file to run the best commands at once Take a look at Makefile in the root for reference.
make bakend
```

### Start Frontend

```Bash
# It will use the make file to run the best commands at once Take a look at Makefile in the root for reference.
make frontend
```

## Run individual packages command mentioned inside script propperty inside package.json

```bash
# [package_name] -> each app and library have its own package.json file in that `name` peroperty will called as package_name

# [package_script] -> each app and library have its own package.json file in that `script` peroperty will called as package_script
$ pnpm run --filter [package_name] [package_script]
```

## Installation

```bash
# install dependency
$ pnpm install
```

## Build the packages and library

```bash
# Build packages using Nx
$ pnpm build
```

## Test

```bash
# unit tests
$ pnpm test
```

## Migration

#### Generate migration

`generate` `FOR=nameOfMigartion npm run migration:generate`
`create` `FOR=nameOfMigartion npm run migration:create`
`up` `npm run migration:up`
`down` `npm run migration:up`
