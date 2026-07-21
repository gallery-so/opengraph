# Gallery OpenGraph

Dynamic social-preview images for Gallery profiles, galleries, collections,
communities, posts, and NFTs.

## Hosting

Production runs as a dedicated Cloudflare Worker built with OpenNext. The
public origin is `https://og.gallery.so`; Vercel is not part of the production
path.

Fonts and the fallback logo live in the private `gallery-token-media` R2 bucket
and are served through `https://cdn.gallery.so/media/system/opengraph/`.

## Development

```bash
corepack yarn install
corepack yarn dev
```

Build and preview in the same Workers runtime used in production:

```bash
corepack yarn cf:build
corepack yarn preview
```

Every commit merged to `main` is built and deployed by Cloudflare Git
integration with `yarn cf:build` and `yarn cf:deploy`. For a manual deployment
with Wrangler authentication already configured:

```bash
corepack yarn cf:deploy
```

The integration tests expect the built Worker on port 3000:

```bash
corepack yarn cf:build
corepack yarn exec wrangler dev --port 3000
corepack yarn test --runInBand
```
