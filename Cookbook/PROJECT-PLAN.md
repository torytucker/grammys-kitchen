# Grammy’s Kitchen — agreed working plan

Updated November 6, 2026.

## Outcome

Build the complete family cookbook locally, review it with the owner, then deliver one consolidated folder/ZIP for GitHub Pages. Avoid repeated downloads and GitHub uploads during iteration. The owner expects to send dozens of recipe photos in a batch.

## Next priority: storage for a growing collection

Completed for the November 6, 2026 batch:

- Move the published recipe catalog into a separate, versioned data file rather than embedding it in app code.
- Store optimized original-recipe scans and generated food pictures as separate media files, referenced by stable recipe IDs and paths. Keep full-resolution originals in the local master archive.
- Lazy-load recipe images. Show all matching recipes without pagination. Keep category buttons small and compact them further on scroll.
- Stop copying the entire published catalog and its photos into browser local storage. Use small personal records for favorites, notes, and edits; use suitable larger storage for any device-only photo additions.
- Migrate the existing prototype data without overwriting personal notes, favorites, or edits. Export a backup before migration. Detect storage failures and report them clearly.
- Version catalog and app updates so previously installed phone copies receive the published changes while keeping personal changes separate.
- Keep the core cookbook usable without an AI service or shared database. Offline caching is a convenience, not the only copy of the recipes.

Implemented: the versioned JSON catalog and media files are separate from app code. Local storage contains personal differences; device-only photos and a verified pre-update backup use IndexedDB. Migration and failure protections were tested, including notes, favorites, edits, deletions, new catalog entries, and photos.

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

Recipe lists, search results, favorites, category views, and category selection options are alphabetical, case-insensitively, without pagination. All recipes and Favorites remain the first navigation shortcuts. Ingredient and direction order follows the original recipe.

## Fahrenheit convention

All existing and future family recipe temperatures use Fahrenheit. A handwritten or printed temperature with no scale is treated as °F. Display °F explicitly in recipe metadata, directions, printing, and shared images. Remove scale-not-printed/written commentary. Keep missing temperatures blank; never invent a value. Preserve original source photos unchanged. This is an owner-confirmed family convention.

Mobile navigation rule: use a full recipe page with Back to main menu, phone Back support, normal document scrolling, and pinned recipe title. Preserve category and list position on return. Desktop may retain the recipe dialog.

Transcription rule: expand shorthand and shortened words into full recipe wording, including chicken, peanut butter, brown/powdered sugar, extra virgin olive oil, barbecue, and spelled-out teaspoons/tablespoons/cups. Preserve original photos unchanged. Do not guess ambiguous abbreviations. Keep °F as the confirmed temperature convention.

## Owner curation — November 9, 2026

Active collection: Pancakes, Slow Cooker Herb Bread, Deanna’s Sugar Cookies, Orange Juice Cookies, and Quick Mix Spritz. Remove all other proof-of-concept entries, explicitly including Sumbitches. Keep excluded recipes and photos in the existing historical master archive, not in the active website. Do not automatically re-add them in future batch imports.

## Selected app icon — November 11, 2026

Owner selected option 1: classic chocolate chip cookie on a mauve background. Applied to browser favicon, iPhone home-screen icon, and PWA standard/maskable icons. Keep the vector master in assets/cookie-icon.svg. Include with the next consolidated GitHub upload.


### November 11 clear-first batch
Publish complete, readable recipes locally first, with original photos and illustrative food pictures. Keep unresolved transcriptions separate until the owner reviews the questions. Cross-reference the replacement full-size photos against the intake inventory, skip duplicates, and retain original source files. The active collection now has 32 recipes, including the five retained recipes. The prior exclusion of the wife’s proof-of-concept recipes still applies.


### Full-size batch — November 11, 2026
All 115 full-size photos matched the earlier intake. The local catalog now contains 195 recipes. Owner review added 26 clarified recipes and excluded seven incomplete or unreadable items; no questions remain pending. Exact recipe duplicates are skipped. Conflicting copies of the same recipe are consolidated for review, rather than duplicated or silently reconciled. Clear handwritten annotations to printed recipes remain in Family notes.

Backups now embed each unique picture once (portable format version 3), accept earlier versions, and allow files under 250 MB. Timers include seconds and mixed-unit ranges. Recipe/category sorting ignores punctuation. For the large website upload, use GitHub Desktop to replace the existing published folder and push one commit, avoiding the browser’s 100-file batch limit. No deployment occurred in this local pass.

Cards show labeled prep and cooking times. Estimated active prep uses ~; written cooking times and endpoint cues are preserved.

Search and the right-aligned Categories toggle share one row. Category choices expand below search and stay open after selection so All recipes and other categories remain accessible. The user can collapse them explicitly.

Owner exception: baking temperatures and times written in Family notes belong in the checkable directions. Handwritten baking changes supersede printed settings; other annotations remain in Family notes.
