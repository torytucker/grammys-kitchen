# Grammy’s Kitchen — recreated prototype

Clean, modern mauve family cookbook for phones, tablets, and computers. No build step, account, API key, or paid service needed.

## Compact design update

The opening hero and repeated keepsake section are removed. The homepage opens directly to recipes with generated food cover images; original scans remain in recipe details and backups. Recipe verification notes stay inside recipe views. Backup, restore, and installation help are grouped under More. The food covers are embedded in `app.js`, so the existing site can be updated with only `index.html`, `styles.css`, `app.js`, and `sw.js`. Upload these files into the existing GitHub `grammys-kitchen` subfolder. See IMAGE-NOTES.md for image provenance and prompts.

## Recipe transcription status

The original photo was provided November 6, 2026. Orange Juice Cookies and Quick Mix Spritz are now transcribed, with the original photo preserved at `assets/original-recipe-photo.png`. Each recipe also contains a compact JPEG copy for viewing and backup.

The owner clarified that the orange juice amount is **½ can of orange juice concentrate, thawed**. The can size is unknown. The orange cookie handwritten yield is 100 cookies per batch. The printed directions omit frosting quantities. Quick Mix Spritz lists 1 tablespoon vanilla but omits its addition from the directions; it lists 1 egg while the directions say “eggs.” Temperature scales are not printed (350° and 375°). These details are flagged rather than guessed. Both recipes remain marked for verification.

Existing app users can import the supplied `grammys-kitchen-two-recipes.json` backup using **Restore backup**. This replaces all recipes on that device: export any personal additions first. It does not update other devices or the GitHub files. To update the published starting recipes, replace the existing app files in the repository’s current `grammys-kitchen` subfolder; preserve the current nested URL. The updated app upgrades only untouched original placeholders and preserves manually edited entries. Existing service workers may need all app tabs closed and reopened after the update.

## Get started and publish with GitHub Pages

1. Extract `grammys-kitchen-prototype.zip`. Open the `grammys-kitchen` folder.
2. Sign in at https://github.com or create a free account. Create a public repository named `grammys-kitchen`. Add a README when creating it so a `main` branch exists.
3. In the repository’s **Code** tab, choose **Add file → Upload files**. Upload the **contents** of the extracted folder, including `index.html`, `styles.css`, `app.js`, `sw.js`, `manifest.webmanifest`, and the whole `assets` folder. Do not upload the ZIP or enclose everything inside an extra `grammys-kitchen` folder. Commit the upload to `main`. Replace the generated README if asked. Include `.nojekyll` when your file picker shows hidden files; this simple app also works without it.
4. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, select **main** and **/(root)**, and Save.
5. Wait for deployment, then use **Visit site** on the Pages settings screen. It may take about 10 minutes. The address will normally be `https://YOUR-USERNAME.github.io/grammys-kitchen/`.
6. Open that HTTPS link on your phone or tablet. On iPhone/iPad in Safari: **Share → Add to Home Screen**. On Android in Chrome: **Install app** or **Add to Home screen** from the menu. The exact wording depends on your device.
7. While online, open the site once and allow the offline files to finish downloading. Then try reopening it with airplane mode on. Installation and offline support require HTTPS or localhost; double-clicking `index.html` is only a basic preview.

Official publishing guide: https://docs.github.com/en/pages/getting-started-with-github-pages/creating-a-github-pages-site
Publishing source guide: https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

GitHub Pages publishes the site and any bundled content publicly. Add only family material you intend to publish. Recipes added through the app stay on your device and do not modify the repository.

## What works

- Responsive cookbook, category filter, search, favorites, ingredient checkboxes, recipe print layout.
- Add, edit, and delete recipes; store recipe photos captured by the phone or selected from a device. Photos are resized to at most 1800 pixels for local storage.
- Back up all recipes and photos to JSON; restore a validated backup with a replacement confirmation.
- Installable PWA with local icons and an offline app shell. No external fonts, image services, or CDNs.
- Text rendering escapes recipe content, including imported text.

## Current limitations

- **Two recipes are transcribed, with specific uncertainties flagged.** Review their notes and confirm those details before cooking.
- **Automatic photo transcription is not implemented.** Capture/select a photo, type the text in the standard fields, review it, then save. No photo is sent to an external service.
- Recipes and favorites persist in this browser’s local storage, not a shared family database. They do not sync across devices. Clearing browser data removes them. Export a backup regularly and before replacing/importing recipes.
- Local storage is limited, especially for photos. A failed save is reported without discarding the previous stored data. Use smaller photos and keep backups. This is a prototype for a small collection, not hundreds of full-size scans.
- Sharing the public site shares the bundled starting entries, not edits made privately on your device. For a shared verified starting cookbook, update the `seed` array in `app.js` before publishing; existing browsers keep their local edits and must restore a new backup to replace them.
- Service-worker caches are versioned. When updating app files, increment the `CACHE` value in `sw.js`. Close all app tabs and reopen after an update to allow the new worker to take over. Clearing site data also resets recipes, so export first.

## Optional local preview

With Python 3 installed, run this in the extracted folder:

    python3 -m http.server 8000

Then open http://localhost:8000 . Keep that window running while previewing. Stop it with Ctrl+C. Localhost on your computer is not a link your phone can open; publish with Pages for phone access.

## File map

`index.html` — accessible app markup and dialogs
`styles.css` — responsive mauve styling and print layout
`app.js` — recipe storage and interactions
`manifest.webmanifest`, `sw.js`, `assets/` — PWA installation and offline shell
`VERIFICATION.md` — checks performed and recovery limitations

Recreated November 6, 2026, from the accessible conversation evidence.

## Recipe timers

Open a recipe to start its timer. The Minutes field uses the recipe cooking-time field, supports hour/minute durations, and offers both endpoints for ranges such as 10–12 minutes. Missing times require manual entry. An optional halfway reminder prompts turning or rotating without shortening the full bake. Pause, resume, reset, and a cookbook timer bar are included. One timer runs at a time per tab; replacing an active timer requires confirmation. Deadlines use elapsed wall-clock time and survive refresh in the same tab through session storage. Halfway and completion alerts appear on screen, with a chime when browser audio permits. Keep the page open: background and lock-screen alerts are not guaranteed. Closing the tab is not a reliable alarm workflow.

The consolidated update now includes five files: index.html, styles.css, app.js, timer.js, and sw.js.

## Ingredient sections and cooking checklists

Ingredients can use explicit [Section name] lines, for example [Cookies] and [Frosting]. Existing Frosting-prefixed ingredient lines display as a separate section without rewriting their source. Other recipes stay ungrouped unless sections are specified. Directions and ingredients are checkable; progress is stored for the current tab session, persists on close/reopen and refresh, and is excluded from recipe backups. Reset checks clears both lists. Changing ingredient/direction text starts fresh progress. Latest consolidated update includes checklists.js in addition to the five previously listed files.

Family notes hold handwritten source additions and user notes; they are editable directly in recipe view and autosave on this device. The handwritten Orange Juice Cookies yield is kept there rather than treated as printed yield. Printed-source omissions remain separate from family notes. Original recipe photo opens via its action button between Favorites and Print.

## Added handwritten recipes

Pancakes, Sumbitches, and Anytime Veg Soup are included in this version. The app adds this batch once to an existing local cookbook without replacing existing recipes, notes, or favorites. The first two original recipes remain. Full-resolution handwritten originals are preserved in the local master project; optimized source scans travel with app and backup. Pancakes has only the written whisking direction and no supplied cooking time; timer duration must be entered manually. Family notes preserve doubling adjustments, including written question marks.

## Sharing a recipe without the cookbook link

Open a recipe and choose Share. A standalone PNG image includes recipe title, category, supplied timing, ingredients, and directions. Include photo is on by default; Family notes are opt-in. The preview regenerates for each choice. Long recipes split into numbered images so nothing is silently omitted. Download each image, or use Share image(s) where file sharing is supported. The native Share button uses prepared files directly from a user gesture; it does not include a cookbook URL. The recipient needs no cookbook access. The image is a static copy and will not reflect later edits.

Latest consolidated update includes share-recipe.js as a seventh file. Native sharing support varies by browser/device; per-image download is always offered. HTTPS or localhost is needed for browser file sharing.

## Controlled category policy

Recipe entry now uses an approved category list, replacing free-form categories. Chicken, pork, beef, fish, and similar main-dish labels in older/imported recipes group under Main dishes. Soup, casserole, salad, and baking dish types take precedence over protein labels (Chicken Soup goes to Soups). Unknown labels display under Other without creating new navigation tiles. Pies and other approved categories appear automatically when populated. Protein names remain in recipe titles/ingredients rather than separate categories.

## Agreed next steps for batch growth and maintenance

See PROJECT-PLAN.md. Before the next large batch is imported into the app, migrate the shared catalog and pictures into separate published files, retaining browser storage primarily for personal records. Preserve the existing local notes/favorites/edits through migration. Batch processing must inventory originals, skip clear duplicates, flag unclear text in chat, use broad controlled categories, and retain image provenance. Final handoff includes one site upload package, a separate complete master archive, a portable recipe export, and simple maintenance instructions. These changes are planned; the current prototype still uses embedded catalog/photos and browser-local recipe copies.
