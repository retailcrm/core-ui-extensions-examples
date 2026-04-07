---
name: domain-contract-guard
description: Define and preserve business terms, single sources of truth, and invariants across UI, API, storage, and integrations. Use when adding or refactoring product logic, renaming fields, aligning frontend and backend semantics, or reviewing domain models for duplication and drift.
---

# Domain Contract Guard

## Use this workflow
1. Name the core business entities, statuses, actors, and filters in plain product language.
2. Mark one source of truth for each meaningful field.
3. Write down invariants before changing code.
4. Remove duplicate terms when they mean the same thing.
5. Recheck naming in types, payloads, serialization, storage, and UI text before finishing.

## Start from a mini glossary
- List the canonical terms first.
- Prefer product terms over transport terms.
- If two names mean the same thing, keep one canonical name and delete the alias.
- If two names look similar but differ in meaning, state that difference explicitly.

## Mark source of truth
For each important field, identify where truth lives:
- domain object;
- CRM or external system;
- local workflow state;
- derived UI-only representation.

Do not let a downstream layer silently become a second source of truth.

## Capture invariants
Write short invariants such as:
- "`assignee` is always the order manager"
- "`processingStatus` is local workflow state, not CRM status"
- "filter names match API payload names"

If a change violates an invariant, either redesign it or rewrite the invariant explicitly.

## Prefer semantic types
- Prefer enums or named unions for domain states.
- Prefer distinct DTOs for domain entities, filters, and mutation payloads.
- Prefer explicit error codes over ad-hoc strings when behavior depends on them.

## Smells to remove
- Two fields with overlapping meaning in one contract.
- Fallback logic that hides a semantic mismatch instead of fixing it.
- Storage fields that copy external data "for convenience".
- Transport naming leaking into UI or product naming.
- UI labels or translations using a different vocabulary than the API.

## Finish with a domain audit
Before finishing, check:
- one canonical name per business concept;
- one source of truth per important field;
- no hidden semantic fallback between near-duplicate fields;
- frontend types, backend serializers, storage, and filters agree on meaning;
- error names and translation keys use the same vocabulary.
