# Treasure Marketplace
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-4-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

This is the source code for Treasure Marketplace frontend. Check out the [subgraph repo](https://github.com/TreasureProject/treasure-marketplace-subgraph) for the API integration part.

Tech stack:

- Next.js
- tailwindcss
- react-query
- TypeScript

## Development

This repo uses yarn to manage dependencies.

To get the dev environment running on `localhost:3000`, run the following commands:

1. `yarn install`
2. `yarn dev`

We also use `graphql-codegen` to read the graphql endpoint defined in `codegen.yml` to generate type-safe graphql queries to be consumed by `react-query`.

**Important:** Before you attempt to run the dev environment for the first time, please run:

`yarn generate`

to generate type-safe graphql queries.

After that, in order to automatically generate type-safe graphql queries, run this command in a separate window:

`yarn watch:codegen`

Every time you make changes to `queries.graphql.ts`, the watcher will check if that query exists in the endpoint, and if it does, spits out appropriate typesafe query for you.

## Contributing

Feature Request:

- Please make an discussion under Discussions, and we will move it to issues if we think its necessary.

PR/Issues (Bug):
- Make an issue first, then fork the repo, create a PR and tag `wyze` or `jcheese1` and we will review!

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tr>
    <td align="center"><a href="https://neilkistner.com/"><img src="https://avatars.githubusercontent.com/u/186971?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Neil Kistner</b></sub></a><br /><a href="https://github.com/TreasureProject/treasure-marketplace/commits?author=wyze" title="Code">💻</a> <a href="#ideas-wyze" title="Ideas, Planning, & Feedback">🤔</a></td>
    <td align="center"><a href="https://github.com/jcheese1"><img src="https://avatars.githubusercontent.com/u/15570714?v=4?s=100" width="100px;" alt=""/><br /><sub><b>jc</b></sub></a><br /><a href="#ideas-jcheese1" title="Ideas, Planning, & Feedback">🤔</a> <a href="https://github.com/TreasureProject/treasure-marketplace/commits?author=jcheese1" title="Code">💻</a> <a href="#design-jcheese1" title="Design">🎨</a></td>
    <td align="center"><a href="http://treasure.tools"><img src="https://avatars.githubusercontent.com/u/95452264?v=4?s=100" width="100px;" alt=""/><br /><sub><b>0xkarel</b></sub></a><br /><a href="https://github.com/TreasureProject/treasure-marketplace/commits?author=0xkarel" title="Documentation">📖</a> <a href="https://github.com/TreasureProject/treasure-marketplace/commits?author=0xkarel" title="Code">💻</a></td>
    <td align="center"><a href="https://www.linkedin.com/in/peitalin"><img src="https://avatars.githubusercontent.com/u/4037878?v=4?s=100" width="100px;" alt=""/><br /><sub><b>Peita Lin</b></sub></a><br /><a href="https://github.com/TreasureProject/treasure-marketplace/commits?author=peitalin" title="Code">💻</a></td>
  </tr>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
