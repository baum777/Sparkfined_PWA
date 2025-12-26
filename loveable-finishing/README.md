## Loveable Finishing Workspace (Sparkfined PWA)

This workspace is the control center for “loveable finishing” on Sparkfined: a tab-by-tab UI/UX polishing pipeline for an **intuitive trading journal & learning interface** that guides users on the Hero’s Journey from **degen → mastery**, prioritized by **conversion/usability**, then **performance**, then **visual consistency**.

### Workspace map

- [`00-cluster-map/README.md`](00-cluster-map/README.md)
- [`10-tabs/README.md`](10-tabs/README.md)
- [`20-ui-primitives-shared/README.md`](20-ui-primitives-shared/README.md)
- [`30-shell-navigation/README.md`](30-shell-navigation/README.md)
- [`40-global-styling-theming/README.md`](40-global-styling-theming/README.md)
- [`50-ux-docs-a11y/README.md`](50-ux-docs-a11y/README.md)
- [`60-events-telemetry/README.md`](60-events-telemetry/README.md)
- [`70-user-interaction-tests/README.md`](70-user-interaction-tests/README.md)
- [`80-assets-branding/README.md`](80-assets-branding/README.md)

### How to use this workspace

- Start with [`manifest.yml`](manifest.yml) to see tabs, statuses, and allowed-path scoping.
- For each tab, write `00-current-ui.md`, then propose ≤50 words of polish in chat, then (after approval) write `01/02`.
- Keep prompts atomic and constrained to **Allowed paths** to minimize risk and keep diffs controllable.

