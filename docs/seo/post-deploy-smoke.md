# Production smoke check

After the intended main commit has finished deploying on Vercel, run:

```sh
npm run smoke:production
```

This read-only gate fetches the live apex sitemap and selects the published Paladin calculator, Hunter calculator, Hunter PvP, and Protection Paladin Leveling URLs from it. It checks that the apex homepage and selected pages return HTML 200, that both `www` homepage and an inner page permanently redirect to the matching apex URL, and that the selected pages' canonical and Open Graph URLs match their sitemap entries. It follows a build-loaded calculator link rendered on the Hunter PvP page and checks that its destination contains the calculator target. For the current release, it also requires the September 24 archived-route notice on Protection Leveling, so the previous deployment cannot pass this gate.

The command exits nonzero with a specific failed check. It makes no changes to Google Search Console, Vercel, or site content, needs no credentials, and does not assume a fixed sitemap page count. A pass proves these live navigation and metadata checks at the time of execution; it does not prove that Google has indexed the pages or that browser interactions work. Keep browser QA and the existing `seo:validate` build check in the release process.
