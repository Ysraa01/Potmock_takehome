Seeded bugs verified 2026-04-13

Bug 1 (closed pot accepts API contribution): VERIFIED via curl
Bug 2 (negative amount accepted, reduces total): VERIFIED via curl
Bug 3 (XSS in pot title): present in code at src/routes/ui.js (h1 raw interpolation)
Bug 4 (off-by-one isPotClosed using <=): present in code at src/routes/api.js and src/views.js
Bug 5 (contribution order ASC vs UI label "most recent first"): VERIFIED via curl
