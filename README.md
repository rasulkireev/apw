# Astro Starter Kit: Minimal

```
npm create astro@latest -- --template minimal
```

[![Open in StackBlitz](https://developer.stackblitz.com/img/open_in_stackblitz.svg)](https://stackblitz.com/github/withastro/astro/tree/latest/examples/minimal)
[![Open with CodeSandbox](https://assets.codesandbox.io/github/button-edit-lime.svg)](https://codesandbox.io/p/sandbox/github/withastro/astro/tree/latest/examples/minimal)
[![Open in GitHub Codespaces](https://github.com/codespaces/badge.svg)](https://codespaces.new/withastro/astro?devcontainer_path=.devcontainer/minimal/devcontainer.json)

> 🧑‍🚀 **Seasoned astronaut?** Delete this file. Have fun!

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```
/
├── public/
├── src/
│   └── pages/
│       └── index.astro
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page is exposed as a route based on its file name.

There's nothing special about `src/components/`, but that's where we like to put any Astro/React/Vue/Svelte/Preact components.

Any static assets, like images, can be placed in the `public/` directory.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |

## 👀 Want to learn more?

Feel free to check [our documentation](https://docs.astro.build) or jump into our [Discord server](https://astro.build/chat).

## PostHog analytics

The shared layout loads PostHog on `rasulkireev.com` and `www.rasulkireev.com`
only, in production builds with a configured key. Development and preview hosts
do not send events. Existing Plausible scripts are unchanged.

Project: https://us.posthog.com/project/632904

- `$pageview`, `$pageleave`, and masked interaction autocapture are enabled.
- Visitors retain the SDK's anonymous distinct ID; there is no login/identify flow.
- Session replay, heatmaps, and surveys are disabled. Autocapture excludes text
  and element attributes; no newsletter email/name properties are added.
- Standard SDK URL/referrer and campaign attribution remain enabled. Avoid putting
  personal information in page URLs. SDK persistence uses its normal cookie/localStorage identity.

### Build configuration

Copy `.env.example` to `.env.local` for a local production build. The browser
project key (`PUBLIC_POSTHOG_KEY`) is a public ingestion token, never a personal
API key. `PUBLIC_POSTHOG_HOST` is `https://us.i.posthog.com`.

GitHub repository variables with those names are configured for deployment.
The deployment workflow passes them as Docker build arguments because Astro
bakes public variables into static JavaScript; setting nginx runtime environment
variables would have no effect. Local env files are excluded from Git and Docker.
Builds without a key remain valid and do not initialize analytics.

After merging/deploying, visit a production page and check PostHog Live events
for `$pageview` and navigation/click events. Check that newsletter field values
are absent. Blocking PostHog should not affect navigation or newsletter forms.
To disable collection, clear the GitHub `PUBLIC_POSTHOG_KEY` variable and rebuild.

## IndexNow

After each successful production rollout, the deployment workflow notifies
[IndexNow](https://www.indexnow.org/documentation) about added, changed, and
removed sitemap pages. No editorial content is generated or modified.

- `scripts/indexnow-config.json` defines the final non-www origin and ownership
  key. The matching `public/<key>.txt` is intentionally served publicly; it is
  not an administrative credential. Sitemap URLs currently use `www`, which
  redirects to the apex host; submissions normalize to the final HTTPS host.
  This integration does not change existing canonicals or redirect rules.
- The build writes `dist/indexnow-manifest.json` containing SHA-256 hashes of
  sitemap HTML and `INDEXNOW_REVISION` (the deployed commit). A layout/asset
  reference change can correctly mark multiple pages as changed.
- Deployment waits up to 30 polls for that revision, verifies the live key,
  then submits batches of at most 10,000 URLs. HTTP 200 means received; 202
  means received with key validation pending. Neither guarantees indexing.
- GitHub Actions caches the last successfully submitted manifest. Failed
  submissions fail the notification step without rolling back the website or
  advancing submission state. Rerun the failed deploy workflow to retry. If the
  cache expires/is evicted, the next run safely resubmits the full sitemap.
- Production deployments are serialized to avoid overlapping rollout/submission
  operations. The first deployment submits the whole sitemap.

Run integration checks with `node --test tests/*.test.mjs`. For an explicit
operator retry, use `INDEXNOW_REVISION=<live-commit> node scripts/indexnow.mjs submit`
from the matching checkout (without local state this submits all sitemap URLs).
