
export function buildStock(movements, items) {
  // returns { [itemId]: { total, byFac: {facId: qty} } }
  const map = {};
  const ensure = (id) => (map[id] = map[id] || { total: 0, byFac: {} });
  const add = (id, fac, q) => {
    const e = ensure(id);
    if (!fac) return;
    e.byFac[fac] = (e.byFac[fac] || 0) + q;
    e.total += q;
  };
  items.forEach((i) => ensure(i.id));
  movements.forEach((m) => {
    (m.lines || []).forEach((l) => {
      const q = Number(l.qty) || 0;
      if (m.type === "IN") add(l.itemId, m.toFacility, q);
      else if (m.type === "OUT") add(l.itemId, m.fromFacility, -q);
      else if (m.type === "TRF") { add(l.itemId, m.fromFacility, -q); add(l.itemId, m.toFacility, q); }
      else if (m.type === "ADJ") { add(l.itemId, m.toFacility || m.fromFacility, q); }
    });
  });
  return map;
}
export function availableAt(stock, itemId, facId) {
  const e = stock[itemId];
  if (!e || !facId) return 0;
  return e.byFac[facId] || 0;
}
export function lineTotal(l) { return (Number(l.qty) || 0) * (Number(l.cost) || 0); }
export function movementValue(m) { return (m.lines || []).reduce((s, l) => s + lineTotal(l), 0); }
export function movementQty(m) { return (m.lines || []).reduce((s, l) => s + (Number(l.qty) || 0), 0); }


