/* domain */

export const CATS = [
  { k: "DR", label: "Doors" },
  { k: "WN", label: "Windows" },
  { k: "FR", label: "Frames" },
  { k: "HW", label: "Hardware" },
  { k: "GL", label: "Glass" },
  { k: "AC", label: "Accessories" },
  { k: "OT", label: "Other" },
];
export const catLabel = (k) => (CATS.find((c) => c.k === k) || { label: k }).label;
export const UNITS = ["pcs", "set", "sqft", "sqm", "rft", "kg", "box", "bundle", "litre"];

export const MOVE = {
  IN: { k: "IN", label: "Stock in", doc: "Goods received note", chip: "in", cls: "in", verb: "received" },
  OUT: { k: "OUT", label: "Stock out", doc: "Gate pass", chip: "out", cls: "o", verb: "dispatched" },
  TRF: { k: "TRF", label: "Transfer", doc: "Transfer note", chip: "trf", cls: "t", verb: "transferred" },
  ADJ: { k: "ADJ", label: "Adjustment", doc: "Stock adjustment", chip: "adj", cls: "", verb: "adjusted" },
};

export const PERMS = [
  { k: "dashboard", label: "Dashboard", desc: "Open the overview screen" },
  { k: "stockIn", label: "Record stock in", desc: "Book goods arriving at a facility" },
  { k: "stockOut", label: "Record stock out", desc: "Dispatch goods with gate pass" },
  { k: "transfer", label: "Transfer stock", desc: "Move stock between facilities" },
  { k: "items", label: "Manage items", desc: "Create and edit the item master" },
  { k: "facilities", label: "Manage facilities", desc: "Add or edit warehouses and yards" },
  { k: "costs", label: "See cost & value", desc: "Show rates, line totals and stock value" },
  { k: "reports", label: "Movement log & exports", desc: "Full history plus CSV download" },
  { k: "users", label: "Manage users", desc: "Create accounts and set access" },
  { k: "delete", label: "Delete records", desc: "Remove movements, items and facilities" },
];
export const ROLES = {
  admin: { label: "Admin", desc: "Full access to everything, including users and deletions." },
  manager: { label: "Manager", desc: "Runs stock and reporting. Cannot manage users." },
  operator: { label: "Store operator", desc: "Books stock in and out at assigned facilities. No costs." },
  viewer: { label: "Viewer", desc: "Read-only dashboard and stock. Cannot record anything." },
};
export function presetPerms(role) {
  const all = (v) => PERMS.reduce((a, p) => ((a[p.k] = v), a), {});
  if (role === "admin") return all(true);
  if (role === "manager") return { ...all(true), users: false };
  if (role === "operator") return { ...all(false), dashboard: true, stockIn: true, stockOut: true, transfer: true };
  return { ...all(false), dashboard: true, reports: true };
}
export const can = (user, k) => !!(user && user.perms && user.perms[k]);
export function visibleFacilities(user, facilities) {
  if (!user) return [];
  if (!user.facilityIds || user.facilityIds.length === 0) return facilities;
  return facilities.filter((f) => user.facilityIds.includes(f.id));
}


