---
name: api-contract-guard
description: Keep endpoint contracts, typed DTOs, filters, mutations, errors, and persistence aligned with product semantics instead of transport accidents. Use when designing or refactoring endpoints, serializers, typed clients, storage adapters, integration layers, or cross-layer contracts.
---

# API Contract Guard

## Use this workflow
1. Define the business capability of the endpoint or client method.
2. Design DTOs around product meaning, not database shape.
3. Keep filters, reads, and mutations explicitly typed.
4. Separate domain serialization from persistence details.
5. Recheck that storage and transport do not invent new semantics.

## Start from capabilities
Prefer:
- `loadOrderProcessingColumn`
- `moveOrderToProcessingStatus`
- `loadProcessingBootstrap`

Over vague low-level shapes like:
- `postColumn`
- `updateState`
- `getData`

## Keep contracts explicit
- Use separate types for read models, filters, and write payloads.
- Keep field names stable across frontend and backend when they mean the same thing.
- Prefer explicit error codes for meaningful client behavior.
- Avoid boolean combinations when a status enum is clearer.

## Do not leak the wrong layer
- Storage schema is not automatically the API schema.
- External CRM schema is not automatically the product schema.
- UI query params are not automatically the internal filter model.

Map between layers deliberately.

## Persistence rules
- Persist only local workflow state that truly belongs to your module.
- Do not copy external fields into storage unless they are needed for consistency or audit.
- If legacy data exists, normalize it at the boundary instead of spreading compatibility logic through the feature.

## Error and filter rules
- Error codes should describe product failures, not implementation details.
- Filter names should match the user-facing concept they represent.
- If the client uses `status`, the server should not still speak `crmStatus` unless they are genuinely different concepts.

## Finish with a contract audit
Before finishing, check:
- every endpoint or client method has a capability-shaped name;
- DTOs reflect product semantics;
- filters and mutations are typed and named consistently;
- storage does not masquerade as source of truth for external data;
- compatibility code is isolated to the boundary layer.
