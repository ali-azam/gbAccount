export interface Module {
  id: number;
  code: string;
  name: string;
}

export const MODULES: Module[] = [
  { id: 1, code: "01", name: "Accounting" },
  { id: 2, code: "02", name: "Portfolio" },
  { id: 3, code: "03", name: "Deposit Banking" },
  { id: 4, code: "04", name: "Payroll" },
  { id: 5, code: "05", name: "Inventory" },
  { id: 6, code: "06", name: "Asset Management" },
];

export const DEFAULT_MODULE = MODULES[0].name;

export function moduleById(id: number | null | undefined): Module | undefined {
  if (id === null || id === undefined) return undefined;
  return MODULES.find((m) => m.id === id);
}

export function moduleByName(name: string | null | undefined): Module | undefined {
  if (!name) return undefined;
  return MODULES.find((m) => m.name === name);
}

/**
 * Resolves whatever a row currently holds for Module into a display label.
 * Accepts a numeric ModuleID from the database or an existing label string,
 * and falls back to showing the raw value so unmapped codes stay visible.
 */
export function moduleLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";

  const asNumber = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(asNumber)) {
    const found = moduleById(asNumber);
    return found ? found.name : String(value);
  }

  const byName = moduleByName(String(value));
  return byName ? byName.name : String(value);
}

export interface OfficeLevel {
  id: number;
  code: string;
  name: string;
}

export const OFFICE_LEVELS: OfficeLevel[] = [
  { id: 1, code: "01", name: "Head Office" },
  { id: 2, code: "02", name: "Zonal Office" },
  { id: 3, code: "03", name: "Regional Office" },
  { id: 4, code: "04", name: "Branch Office" },
];

export const DEFAULT_OFFICE_LEVEL = "Branch Office";

export function officeLevelById(id: number | null | undefined): OfficeLevel | undefined {
  if (id === null || id === undefined) return undefined;
  return OFFICE_LEVELS.find((o) => o.id === id);
}

export function officeLevelByName(name: string | null | undefined): OfficeLevel | undefined {
  if (!name) return undefined;
  return OFFICE_LEVELS.find((o) => o.name === name);
}

/**
 * Resolves whatever a row currently holds for Office Level into a display label.
 * Same contract as moduleLabel: numeric OfficeLevel from the database or an
 * existing label string, with the raw value shown for unmapped codes.
 */
export function officeLevelLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";

  const asNumber = typeof value === "number" ? value : Number(value);
  if (!Number.isNaN(asNumber)) {
    const found = officeLevelById(asNumber);
    return found ? found.name : String(value);
  }

  const byName = officeLevelByName(String(value));
  return byName ? byName.name : String(value);
}

export interface AccountNote {
  id: number;
  name: string;
}

/** NoteID 7 and 8 are intentionally absent — they are unused in the source list. */
export const ACCOUNT_NOTES: AccountNote[] = [
  { id: 1, name: "Property, Plant & Equipment - net" },
  { id: 2, name: "Investment in Shares" },
  { id: 3, name: "Deferred Tax Asset" },
  { id: 4, name: "Expenditure" },
  { id: 5, name: "Fixed Assets" },
  { id: 6, name: "capital" },
  { id: 9, name: "invoice" },
  { id: 10, name: "Income" },
];

export const NOTE_PLACEHOLDER = "Please Select";

/** NoteID 0 is the database's "no note assigned" value, not a real note. */
export const NOTE_UNASSIGNED = 0;

export function noteById(id: number | null | undefined): AccountNote | undefined {
  if (id === null || id === undefined) return undefined;
  return ACCOUNT_NOTES.find((n) => n.id === id);
}

export function noteByName(name: string | null | undefined): AccountNote | undefined {
  if (!name) return undefined;
  return ACCOUNT_NOTES.find((n) => n.name === name);
}

/**
 * Resolves whatever a row currently holds for Note into a display label.
 * Placeholder values render as "-" so unset notes stay visually empty in the
 * table, matching how the list treated "Please Select" before.
 */
export function noteLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  if (value === NOTE_PLACEHOLDER || value === "Select None") return "-";

  const asNumber = typeof value === "number" ? value : Number(value);
  if (asNumber === NOTE_UNASSIGNED) return "-";
  if (!Number.isNaN(asNumber)) {
    const found = noteById(asNumber);
    return found ? found.name : String(value);
  }

  const byName = noteByName(String(value));
  return byName ? byName.name : String(value);
}

/**
 * Nature is stored as "1" | "2" | "3" on AccChart. The mapping is derivable
 * from the Category cross-tab in the live data: nature 1 covers Assets and
 * Liability, 2 covers Income, 3 covers Expenditure.
 */
export const NATURES: Record<string, string> = {
  "1": "Debit",
  "2": "Credit",
  "3": "Debit",
};

export function natureLabel(value: number | string | null | undefined): string {
  if (value === null || value === undefined || value === "") return "-";
  return NATURES[String(value)] ?? String(value);
}
