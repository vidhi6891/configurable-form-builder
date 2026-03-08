# Configurable Form Builder

An interactive React + TypeScript application for building form configurations with nested groups, previewing the live form behavior, and importing/exporting the configuration as JSON.

## Features
- Add field types: `text`, `number`, `group`
- Recursively nest groups inside groups
- Edit field properties
  - Common: `label`, `required`
  - Number-only: `min`, `max`
- Delete and reorder fields (move up/down in same group)
- Live preview updates immediately from current structure
- Live validation
  - Required field checks
  - Number parsing and min/max constraints
  - Predictable invalid number handling
- JSON export and JSON import (with runtime validation)
- State persistence to `localStorage`

## Tech Stack
- React 19 + TypeScript + Vite
- Custom hooks + reducer-based state
- No state management library
- No form library
- No UI framework

## Getting Started
### Prerequisites
- Node.js 20+ (Node 22 used during development)
- npm

### Install
```bash
npm install
```

### Run in development
```bash
npm run dev
```

### Build
```bash
npm run build
```

### Lint
```bash
npm run lint
```

## Test Commands
```bash
npm test                  # all unit + integration tests (Vitest)
npm run test:watch        # watch mode
npm run test:unit         # utils tests
npm run test:integration  # component integration tests
npm run test:e2e          # Playwright e2e
```

## Architecture
### High-level component hierarchy
- `ConfigurableFormBuilder`
  - `FormStructureEditor`
    - `FormFieldCollectionEditor` (recursive)
      - `FormFieldNodeEditor`
  - `LiveFormPreview` (recursive)
  - `FormConfigJsonPanel`

### State and hooks
- `useFormBuilderConfig`
  - Owns schema/config state via reducer
  - Handles add/update/delete/move/replace actions
  - Hydrates/persists form config to localStorage
- `useLiveFormValues`
  - Owns preview input values
  - Computes validation errors via `useMemo`
  - Hydrates/persists preview values to localStorage
- `useFormConfigJson`
  - Handles export text, import text, success/error messaging

### Core utilities
- `src/types/form.ts`
  - Domain model (`text`, `number`, `group` field unions)
- `src/utils/formTree.ts`
  - Immutable tree updates by path (`number[]`)
- `src/utils/formValidation.ts`
  - Import JSON validation + preview validation logic
- `src/utils/createField.ts`
  - Field factory + id generation

## Data Model
A form config is:
```ts
type FormConfig = {
  fields: FormField[];
};
```

`FormField` is a discriminated union:
- `TextField`: `type: "text"`
- `NumberField`: `type: "number"`, plus `min`/`max` (`number | null`)
- `GroupField`: `type: "group"`, plus recursive `children: FormField[]`

## Validation Rules
### Preview validation
- Required text/number fields must be non-empty
- Number inputs must parse to valid finite numbers
- Number values must satisfy optional `min`/`max`
- Field setup error when `min > max`
- Required groups must have at least one descendant value filled

### Import validation
- Accepts either:
  - `{ "fields": [...] }`
  - raw array `[...]`
- Validates shape, supported field types, and recursive children
- Validates number constraints (`min <= max`)
- Returns user-facing errors for invalid JSON/config structure

## Persistence
`localStorage` keys:
- `configurable-form-builder:form-config`
- `configurable-form-builder:preview-values`

On app load:
- Config is hydrated and validated before use
- Preview values are hydrated safely (fallback to `{}` if malformed)

## Example Import JSON
```json
{
  "fields": [
    {
      "id": "profile",
      "type": "group",
      "label": "Profile",
      "required": false,
      "children": [
        {
          "id": "name",
          "type": "text",
          "label": "Name",
          "required": true
        },
        {
          "id": "age",
          "type": "number",
          "label": "Age",
          "required": false,
          "min": 18,
          "max": 99
        }
      ]
    }
  ]
}
```

## Test Coverage Summary
- Unit tests
  - `formTree` immutable path operations
  - `formValidation` JSON parsing and validation rules
- Integration tests
  - Add/edit/required validation behavior in UI
  - JSON import/export flow
  - localStorage hydration behavior
- E2E test
  - Build form, validate preview, export config, refresh persistence check

## Notes
- IDs are internal and auto-generated if missing during import.
- Labels are fully user-editable.
- Reordering is intentionally scoped to siblings within the same group.
