---
name: crm-logical-client
description: Design or extend a typed CRM-domain client packaged as a reusable module with business-level methods, stable DTOs, and explicit installation boundaries. Use when replacing raw endpoint calls with a product-facing client library or when planning an API surface for agent-built CRM extensions.
---

# CRM Logical Client

## Goal
Build a client that speaks in CRM business capabilities, not raw HTTP trivia.

## Use this workflow
1. List the product capabilities the client should expose.
2. Group methods by CRM domain, not by transport endpoint count.
3. Define typed DTOs for requests, responses, filters, and mutations.
4. Hide raw transport details behind a narrow adapter.
5. Package the client so features install it as a module instead of reimplementing calls.

## Prefer business-level methods
Prefer methods like:
- `orders.list(filters)`
- `orders.get(id)`
- `orders.updateManager(input)`
- `statuses.list()`
- `users.listManagers()`

Avoid exposing callers to:
- raw URLs;
- query-string assembly;
- response shape normalization in feature code;
- duplicated retry or auth logic.

## Keep layers inside the client
- transport adapter: auth, base URL, retries, low-level request execution;
- schema layer: parse and normalize external payloads;
- domain facade: typed business methods used by features;
- installation layer: module factory or dependency injection entrypoint.

## Typing rules
- Use separate types for external payloads and normalized domain DTOs when they differ.
- Prefer enums or narrow unions for statuses and discriminants.
- Keep pagination and filtering typed explicitly.
- Expose result types that are pleasant for product code to consume.

## Module installation
The client should be installable once and reused:
- one module or factory per app/runtime;
- explicit dependencies such as auth token provider, base URL, logger, feature flags;
- no hidden globals;
- feature code imports domain-facing methods, not transport helpers.

## Design for agent-built extensions
- Keep the public surface small and capability-based.
- Expose safe primitives, not arbitrary internal endpoints.
- Make permissions and supported operations explicit.
- Prefer templateable high-level methods over open-ended generic execution.

## Finish with a client audit
Before finishing, check:
- feature code does not assemble raw CRM requests;
- client methods are grouped by domain capability;
- normalized DTOs are typed and stable;
- transport concerns stay inside the client module;
- the installation path is clear enough that teams will reuse the module instead of bypassing it.
