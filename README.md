# POV Boxing

A mobile-first, first-person boxing prototype built with vanilla JavaScript, SVG, and Vite. Designed for landscape phones, with responsive portrait and desktop layouts.

## Develop

Use Node.js 22 or newer.

```sh
npm ci
npm run dev
```

## Play

Tap the six edge controls to throw left and right hooks, straights, and uppercuts. On a keyboard, use **A / S / D** for the left hand and **J / K / L** for the right hand. The opponent counters every 3.5 seconds after the first punch. The fight has no timer and ends only when either fighter reaches zero health. Straights deal 2 damage; hooks and uppercuts deal 3; opponent counters deal 2. Use Reset Fight to start again. Sound is optional and enabled with the music button.

## Validate

```sh
npm test
npm run build
```

The tests cover punch damage, knockout boundaries, counter attacks, and health-only fight endings. No external assets, services, or credentials are required; web fonts fall back to system fonts when unavailable.

## GitHub Pages

The `.github/workflows/deploy-pages.yml` workflow tests, builds, and deploys every push to `main`, and can also be run manually from Actions. In repository **Settings → Pages**, select **GitHub Actions** as the build and deployment source. The expected project URL is https://itarevivo-bot.github.io/pov-boxing-game/ once the deployment succeeds.

Vite uses relative asset URLs so the game works under the project subpath.
