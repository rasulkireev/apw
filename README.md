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
