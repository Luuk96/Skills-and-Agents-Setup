# ECOSYSTEM.md — [PROJECT NAME]

This file is the single source of truth for all data definitions in this project.
Every field name, data type, API shape, and enum value lives here.
Before creating any new data fields or API endpoints, check this file first.
After creating them, add them here immediately.

Agents: Always read this file before designing or modifying any data layer.

---

## Database tables

### [table_name]
| Column | Type | Description | Example value |
|---|---|---|---|
| id | uuid | Primary key, auto-generated | "a1b2c3..." |
| created_at | timestamp | Auto-set on insert | "2026-04-05T14:00:00Z" |
| [add columns here] | | | |

---

## API endpoints

### [GET /example]
**Purpose:** [what this endpoint does]
**Auth required:** Yes / No
**Request params:**
```
[param_name]: [type] — [description]
```
**Response shape:**
```json
{
  "field": "value"
}
```

---

## Enums and fixed values

### [enum_name]
| Value | Meaning |
|---|---|
| [value] | [what it means] |

---

## Shared field naming rules

Document any field naming conventions that must be consistent across the project.
Example: "Always use snake_case for database columns, camelCase for JavaScript variables."

- 
- 

---

## External services and contracts

If this project connects to external APIs or services, document the key fields here
so they never get renamed accidentally.

### [Service name]
- Base URL: [url or env variable name]
- Auth method: [API key / OAuth / etc.]
- Key fields used: [list field names the project depends on]

---

## Change log

Every time a field, table, or API shape changes, record it here.

| Date | What changed | Why |
|---|---|---|
| [date] | [description] | [reason] |
