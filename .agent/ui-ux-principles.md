# UI/UX Agent Notes

## Product stance

Founder Assets JP is not a dashboard for dataset owners. It is a decision aid for founders who need to decide whether a startup-support asset is worth pursuing.

Every UI decision should answer one of these user questions:

1. Can I use this?
2. How much effort and cost will applying require?
3. What return do I get if it works?
4. What should I do next?

## Journey-first rules

- Keep search visible at all times.
- Keep filters available, but secondary to search.
- Show applied filters in an overview near the result count.
- Prioritize filters whose labels match founder language: support type, stage, equity, application status, geography.
- Prefer selectors, segmented controls, or compact disclosure patterns over always-visible option clouds.
- Prefer a single composer-like search surface: query input first, result context second, compact selectors third.
- Do not show long option lists unless the user explicitly opens the control.
- Show selected values clearly after the control closes.
- Avoid separate "open filters" helper text when the visible selectors already explain the available controls.
- Avoid dataset-owner metrics in the primary experience.
- Cards should be scannable in the order `fit -> effort -> return -> action`.
- Never invent exact effort, cost, or return values. If the data is not structured, show a cautious estimate or "要確認".

## Research references

- NN/g defines journey maps as goal-oriented visualizations of a person's process: https://www.nngroup.com/articles/journey-mapping-101/
- NN/g recommends useful faceted search categories and values be appropriate, predictable, jargon-free, and prioritized: https://www.nngroup.com/articles/filter-categories-values/
- NN/g notes filters should support user intent without disruptive refresh/position changes: https://www.nngroup.com/articles/applying-filters/
- Baymard recommends an applied-filter overview so users understand active constraints: https://baymard.com/blog/how-to-design-applied-filters
