---
name: module-boundary-guard
description: Keep modules split by responsibility and prevent orchestration, transport, state, domain logic, and UI concerns from collapsing into kitchen-sink files. Use when designing or refactoring pages, composables, services, stores, handlers, routes, or integration modules.
---

# Module Boundary Guard

## Use this workflow
1. Identify the responsibilities present in the feature.
2. Separate orchestration from transport and domain rules.
3. Keep read models, mutations, and UI state distinct.
4. Split files when one unit owns multiple unrelated reasons to change.
5. Recheck the final shape for "kitchen-sink" modules.

## Default boundary map
Use these roles unless the existing architecture strongly suggests another shape:
- page or handler: orchestration and wiring;
- API layer: transport and payload mapping;
- domain layer: rules, transitions, invariants;
- state layer: loading, pagination, caching, optimistic updates;
- presentation layer: rendering and local formatting.

## Good ownership signals
- A page composes hooks and reacts to user intent.
- A transport module knows endpoints and raw payloads.
- A domain helper knows transitions and business rules.
- A state module knows loading, append, reset, and error handling.
- A component formats and emits intent, not cross-feature policy.

## Smells to remove
- One file performs bootstrap, fetch, pagination, errors, and business transitions.
- UI components build API payloads directly.
- Transport modules decide product rules.
- Domain helpers know router or widget details.
- A single composable exports "everything for the page".

## Splitting heuristics
- Split when a file owns both fetching and domain transitions.
- Split when read loading and write mutations have separate failure modes.
- Split when dictionaries and paged entities evolve independently.
- Split when drag-and-drop or workflow transitions become a domain of their own.

## Keep the page thin
- Read filters and route state.
- Call dedicated modules.
- Convert errors to user-facing labels.
- Avoid embedding transport or transition logic inline unless trivial.

## Finish with a boundary audit
Before finishing, check:
- each module has one primary reason to change;
- orchestration is separate from transport;
- domain rules are not hidden in fallback conditionals across the UI;
- state containers are small and feature-shaped;
- names of modules describe responsibility, not implementation accident.
