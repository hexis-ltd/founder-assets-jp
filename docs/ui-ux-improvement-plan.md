# UI/UX Improvement Plan

## Source principles

- Journey maps should be centered on a user's goal, actions, thoughts, and needs.
- Faceted search should use categories and labels that are predictable and useful to users.
- Applied filters should be summarized so users understand why the result set changed.

References:

- https://www.nngroup.com/articles/journey-mapping-101/
- https://www.nngroup.com/articles/filter-categories-values/
- https://www.nngroup.com/articles/applying-filters/
- https://baymard.com/blog/how-to-design-applied-filters

## Current problems

1. Filter toggle is functional but each opened category still exposes too many choices at once.
2. Active filter summary is present, but categories should use controls that fit the decision type.
3. Card content is now decision-oriented, but the action row is visually detached from the three decision axes.
4. The data model cannot yet express actual application effort, cash cost, required documents, or expected return in structured form.

## Immediate UI changes

1. Use a composer-like search surface so the first action is always typing a query.
2. Keep category selectors visible, but keep their values hidden until opened.
3. Use multi-select popovers for large or growing sets: support type and geography.
4. Use compact selectors for small bounded facets: stage, equity, and application status.
5. Summarize applied filters inside each selector and avoid duplicate filter chips.
6. Keep card order as `fit -> effort -> return`, but make the official action visually tied to evaluation.

## Schema work after UI

1. Add optional v3 fields, do not break current data.
2. Backfill 20 representative assets first.
3. Only after validating UI value, migrate all assets and export schema.
