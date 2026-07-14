# Cross Clues Tabletop

A language-light board surface for playing Cross Clues with physical cards. The board supports standard 4×4 and 5×5 layouts, deals words from the reference game list, and mirrors controls and coordinate labels for players seated around a tabletop display.

```sh
npm install
npm run dev
```

The application only provides the physical board layout. Clues, guesses, scoring, and turns stay at the table.

Card spaces are calibrated for the target display: 257.48 px × 259.84 px, which is 60 mm × 60 mm at 109 horizontal and 110 vertical pixels per inch.

## Deployment

The Pages workflow publishes `main` to `https://anicolao.github.io/crossclues/`. Pull request 123, for example, is published to `https://anicolao.github.io/crossclues/pr123/`. Relative production assets allow the same build output to run at either depth.

## Verification

```sh
npm run check
npm run build
npm run test:e2e
```

Playwright screenshots use the same `TestStepHelper` documentation flow and zero-pixel tolerance as the sibling Food project. Update intentional visual baselines with `npm run test:e2e:update-snapshots`.
