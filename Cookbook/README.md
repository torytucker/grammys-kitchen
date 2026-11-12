# Grammy’s Kitchen

A responsive, modern mauve family cookbook. This local edition contains 195 recipes. Owner review resolved 26 additional recipes and excluded seven incomplete or unreadable items. No questions remain pending. Original photos, draft text, duplicate decisions, and generated-image prompts are preserved in the full-size master archive. Earlier historical archives remain unchanged.

## Everyday use

Recipes and categories sort alphabetically, with all matching recipes displayed together. Category buttons are compact and shrink further while scrolling. Cards show labeled Prep and Bake/Cook/Chill times. A ~ marks an estimated active prep time; cooking durations follow the source, and missing durations are not invented. Search, broad category buttons, and Favorites help browse the collection. Open a card to read, check ingredients and steps, use the small mauve timer, add personal Family notes, view the original, print, or share a standalone recipe image. On phones, a recipe opens as a full page with Back to main menu and browser Back support. Desktop uses a recipe window. No account or AI service is required to read or use the cookbook.

The original recipe photos are the source. Generated food photos are illustrations. Shorthand is expanded into full wording; Fahrenheit is the family convention. Missing quantities, temperatures, and directions are not invented. The owner clarified the retained recipe details in the accompanying records.

## Local preview

Serve this folder with any static web server, then open its local URL. For example, run `python3 -m http.server 8765` from this folder and open `http://localhost:8765/`. A server is required: opening index.html directly as a file does not load the catalog. The working preview used during development is `http://127.0.0.1:8765/grammys-kitchen/`.

## Publishing to GitHub Pages

Keep a copy of the complete site folder before uploading. Upload **all of its contents**, including the assets and data folders. Do not upload the ZIP itself, the archival originals, or only app.js. The files index.html and sw.js must sit beside assets/, data/, boot.js, and the other scripts.

For this larger collection, use GitHub Desktop for a single update. GitHub’s browser uploader accepts at most 100 files at a time; this release contains more. See [GitHub’s file-upload limits](https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository).

1. In GitHub Desktop, use File → Clone Repository to select `torytucker/grammys-kitchen` and make a local copy. [Cloning instructions](https://docs.github.com/en/desktop/adding-and-cloning-repositories/cloning-and-forking-repositories-from-github-desktop).
2. In that local copy, create `grammys-kitchen-publish-five-recipes` again if it was deleted. Put everything inside this release’s ready-to-upload folder into it, including index.html, assets/, and data/. Keep that folder name to preserve the shared address below. Keep the repository’s `.git` folder untouched.
3. In GitHub Desktop, review the changes, enter a summary such as “Update family cookbook,” choose Commit to main, then Push origin. [Commit and push instructions](https://docs.github.com/en/desktop/overview/creating-your-first-repository-using-github-desktop).
4. Wait for the Pages deployment to finish, then open the shared address online and refresh. Check a new recipe on a phone and computer.

Existing shared address: https://torytucker.github.io/grammys-kitchen/grammys-kitchen-publish-five-recipes/

For a fresh repository, put the site contents at the repository root. In Settings → Pages, choose Deploy from a branch, main, /(root). Follow [GitHub’s Pages source instructions](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site). Wait for the Pages deployment to finish before checking on a phone. Do not create another nested app folder when updating. We will walk through the actual upload when the owner is ready; this batch has not been published.

## Backups and personal changes

Published recipes and media are separate files in this folder. Browser storage keeps personal favorites, notes, edits, and deletions separately. Personal photos use the browser’s larger image database. Personal changes do **not** synchronize to family members or update GitHub.

Choose More → Back up recipes to download a portable JSON file containing all current recipes and pictures. Keep it outside the browser; clearing site data can remove personal changes. Current version-3 backups store each shared picture once, keeping a large cookbook smaller. More → Restore backup accepts version-1, version-2, and version-3 exports. It replaces the collection on that device after confirmation. Allow the backup download to finish. Do not publish a personal backup if it contains private notes.

The first update from the earlier prototype saves and verifies an exact pre-update recovery backup before converting local changes. More → Download earlier backup appears when this recovery copy is available. The old browser key is removed only after personal changes have been saved successfully. If storage cannot be read or written, the shared catalog remains readable and personal writes are blocked, with an explanation.

## Offline and installation

Use HTTPS for installation and offline support (localhost also works). Open the published app online once. The text and application shell are cached. Pictures are cached as viewed, so unvisited pictures may need a connection. Downloading a complete backup also reads all pictures, but a downloaded backup is the durable copy; browser cache can be evicted. On iPhone, use Safari → Share → Add to Home Screen. On Android, use the browser’s Install app or Add to Home screen option.

Timers use a deadline rather than counting browser ticks and support seconds, minutes, and hours. You can choose distinct stages or alternative cooking times, such as 20 minutes cooking versus 5 minutes standing. A halfway reminder keeps the full chosen duration running. Keep the app open for reminders and sound; phone lock-screen alerts are not guaranteed.

## Future updates and maintenance

Keep stable recipe IDs. Update data/catalog.v2.json and media files, and change the catalog version. Bump the shell version consistently in index.html, boot.js, and sw.js whenever publishing any app or catalog change, so installed copies receive it. Keep relative paths for GitHub Pages. Preserve published media filenames unless intentionally updating them; give replacement pictures a new filename to avoid an old cached image.

Before publishing, check phone and desktop layouts, search/categories/all-results browsing, favorites, a personal note, an original photo, a timer, sharing, printing, and backup/restore in a separate test copy. Keep the master archive and portable export in another safe location. Once a year, repeat these checks on a current phone and computer. Core reading depends on static HTML, CSS, JavaScript, JSON, and local image files, with no external runtime service.

The full-size master archive includes unchanged originals, full generated images and prompts, structured transcriptions, review questions, application source, and automated checks. A portable JSON backup is provided separately. Earlier historical archives retain prior batches and Live Photo videos. Keep archival originals and personal backups out of the lighter website upload.

Search and the right-aligned Categories toggle share one row. Category choices expand below search and stay open after selection so All recipes and other categories remain accessible. The user can collapse them explicitly.
