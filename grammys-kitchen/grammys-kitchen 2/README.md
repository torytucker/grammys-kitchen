# Grammy’s Kitchen — recreated prototype

Clean, modern mauve family cookbook for phones, tablets, and computers. No build step, account, API key, or paid service needed.

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
