# Grammy’s Kitchen — agreed working plan

Updated November 6, 2026.

## Outcome

Build the complete family cookbook locally, review it with the owner, then deliver one consolidated folder/ZIP for GitHub Pages. Avoid repeated downloads and GitHub uploads during iteration. The owner expects to send dozens of recipe photos in a batch.

## Next priority: storage for a growing collection

Complete this before importing a large batch into the running app:

- Move the published recipe catalog into a separate, versioned data file rather than embedding it in app code.
- Store optimized original-recipe scans and generated food pictures as separate media files, referenced by stable recipe IDs and paths. Keep full-resolution originals in the local master archive.
- Load only the media needed for the displayed recipes. Keep the six-per-page browsing behavior.
- Stop copying the entire published catalog and its photos into browser local storage. Use small personal records for favorites, notes, and edits; use suitable larger storage for any device-only photo additions.
- Migrate the existing prototype data without overwriting personal notes, favorites, or edits. Export a backup before migration. Detect storage failures and report them clearly.
- Version catalog and app updates so previously installed phone copies receive the published changes while keeping personal changes separate.
- Keep the core cookbook usable without an AI service or shared database. Offline caching is a convenience, not the only copy of the recipes.

This is planned work, not a claim that the storage migration is complete. The current prototype still embeds the catalog/photos and stores recipe copies in local storage.

## Batch intake and review

1. Accept individual photos or a ZIP. Inventory every source image and preserve an unchanged original with a stable identifier.
2. Read each photo, allowing multiple recipes per page and multi-page recipes. Entirely handwritten recipes become the recipe itself. Handwritten annotations to printed recipes go in Family notes.
3. Compare with the existing master catalog and the rest of the incoming batch. Skip clear duplicates. Flag meaningful variations rather than silently merging or discarding them. Use image hashes as supporting evidence, not the only duplicate check.
4. Transcribe title, measurements, ingredient order, directions, and supplied yield/temperature/time. Never invent missing quantities, container sizes, steps, or cooking times. Collect unclear details into a concise review list in chat; do not add verification badges to the app.
5. Apply the controlled dish-type categories. Chicken/pork/beef/fish dishes normally belong to Main dishes; soup/casserole/salad type takes priority. Approved categories such as Pies appear automatically when populated. Avoid protein-specific or near-duplicate categories.
6. Group ingredients only when helpful to the method, such as Cookies/Frosting or Pasta/Sauce. Do not impose wet/dry groups universally.
7. Generate consistent illustrative food images, retaining the actual recipe photo separately. Keep an asset/provenance record and generation prompts.
8. Add timers only for supplied cooking durations; leave missing durations for manual entry. Preserve handwritten doubling notes, including unresolved question marks, without turning them into automatic scaling rules.
9. Review the batch locally, verify category counts and recipe links, and confirm originals, pictures, measurements, directions, and notes. Finish the entire batch or identify exactly which items need clarification; do not lose unresolved items.

## Publication and longevity requirements

Before final publication:

- Test the real collection on phone/tablet/desktop layouts, including long titles and long recipes.
- Verify search, categories, favorites, notes, ingredient/direction checks, timer behavior, photo viewing, printing, and standalone image sharing.
- Test an update from an older installed version without losing personal data.
- Provide one ready-to-upload site folder/ZIP and verify its archive integrity.
- Provide a complete separate master backup containing app source, structured recipe data, full-resolution source photos, and generated assets. Keep large archival originals out of the lightweight site bundle.
- Provide a portable recipe export independent of the app.
- Include plain-language deployment, backup/restore, update, and relocation instructions, plus a small annual check list.
- Keep the GitHub Pages collection public only as agreed. Explain that personal device additions/notes do not automatically publish to the family.

Annual check: open the site and a recipe on a current phone and computer; search/filter; toggle a favorite; save a note; run a short timer; view an original photo; export/share and print; verify backup restoration using a separate test copy.

## Deferred scope

Family accounts, shared editing, automatic photo transcription inside the app, and in-app AI food-image generation are future phases. For the current release the owner sends batches here; the published collection is shared for reading, and personal device changes remain local.

## Listing order

Recipe lists, search results, favorites, category views, and category selection options are alphabetical, case-insensitively, before pagination. All recipes and Favorites remain the first navigation shortcuts. Ingredient and direction order follows the original recipe.
