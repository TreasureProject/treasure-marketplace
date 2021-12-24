# Treasure Marketplace

This is the source code for Treasure Marketplace frontend. Check out the [subgraph repo](https://github.com/TreasureProject/treasure-marketplace-subgraph) for the API integration part.

Tech stack:

- Next.js
- tailwindcss
- react-query

## Development

This repo uses yarn to manage dependencies.

1. `yarn install`

2. `yarn dev`

to get the dev environment running on localhost:3000

We also use `graphql-codegen` to read the graphql endpoint defined in `codegen.yml` and automatically generate type-safe graphql queries to be consumed by `react-query`

On a separate window, run:

`yarn watch:codegen`

and everytime you make changes to `queries.graphql.ts`, the watcher will check if that query exists in the endpoint, and if it does, spits out appropriate typesafe query for you.

## Contributing

Create a new branch from main, and create a PR and tag @wyze or @jcheese1 and we will review!

We will have roadmaps/todos on the Projects tab, but feel free to create issues!
