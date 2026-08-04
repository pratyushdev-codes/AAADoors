import { uid, pad, YY, daysAgoISO } from "./helpers";
import { presetPerms } from "./domain";


export function seedDB() {
  const fac = [
    { id: "f_main", name: "Main Warehouse", code: "MW", address: "Plot 14, Peenya Industrial Area, Bengaluru", active: true },
    { id: "f_yard", name: "Nelamangala Yard", code: "NY", address: "Survey 88, NH-48, Nelamangala", active: true },
    { id: "f_show", name: "Indiranagar Showroom", code: "IS", address: "100 Ft Road, Indiranagar, Bengaluru", active: true },
  ];
  const items = [
    { id: "i1", code: "DR-0001", name: "Teak Flush Door 32\" x 80\"", desc: "Solid core flush door, teak veneer both sides, 35mm", cat: "DR", unit: "pcs", cost: 6800, min: 20, active: true, serialSeq: 0, createdAt: daysAgoISO(90) },
    { id: "i2", code: "DR-0002", name: "Fire Rated Steel Door 2hr", desc: "Galvanised steel, 2 hour rating, with vision panel", cat: "DR", unit: "pcs", cost: 21500, min: 20, active: true, serialSeq: 0, createdAt: daysAgoISO(85) },
    { id: "i3", code: "DR-0003", name: "WPC Bathroom Door 30\" x 78\"", desc: "Waterproof WPC, pre-laminated white", cat: "DR", unit: "pcs", cost: 4200, min: 25, active: true, serialSeq: 0, createdAt: daysAgoISO(70) },
    { id: "i4", code: "WN-0001", name: "uPVC Sliding Window 5' x 4'", desc: "2 track sliding, 5mm clear glass, mesh optional", cat: "WN", unit: "pcs", cost: 12400, min: 40, active: true, serialSeq: 0, createdAt: daysAgoISO(60) },
    { id: "i5", code: "WN-0002", name: "Aluminium Casement Window 4' x 3'", desc: "Powder coated, double casement, 6mm glass", cat: "WN", unit: "pcs", cost: 9800, min: 8, active: true, serialSeq: 0, createdAt: daysAgoISO(55) },
    { id: "i6", code: "FR-0001", name: "Sal Wood Door Frame 4\" x 2.5\"", desc: "Seasoned sal wood, primer coated, per set", cat: "FR", unit: "set", cost: 3100, min: 30, active: true, serialSeq: 0, createdAt: daysAgoISO(50) },
    { id: "i7", code: "HW-0001", name: "Mortise Lock Set — SS Satin", desc: "6 lever mortise lock with handle pair and cylinder", cat: "HW", unit: "set", cost: 1850, min: 40, active: true, serialSeq: 0, createdAt: daysAgoISO(44) },
    { id: "i8", code: "GL-0001", name: "Toughened Glass 8mm", desc: "Clear toughened, cut to size, charged per sqft", cat: "GL", unit: "sqft", cost: 145, min: 500, active: true, serialSeq: 0, createdAt: daysAgoISO(30) },
  ];
  const users = [
    { id: "u_admin", name: "Owner", username: "admin", pin: "1234", role: "admin", perms: presetPerms("admin"), facilityIds: [], active: true, createdAt: daysAgoISO(90) },
    { id: "u_ravi", name: "Ravi Kumar", username: "ravi", pin: "1111", role: "manager", perms: presetPerms("manager"), facilityIds: [], active: true, createdAt: daysAgoISO(60) },
    { id: "u_sunil", name: "Sunil M", username: "sunil", pin: "2222", role: "operator", perms: presetPerms("operator"), facilityIds: ["f_main"], active: true, createdAt: daysAgoISO(20) },
  ];
  return {
    company: { name: "AAA Doors", tagline: "aaadoors.com", currency: "₹", gst: "" },
    facilities: fac,
    items,
    users,
    counters: { IN: 0, OUT: 0, TRF: 0, ADJ: 0, cat: { DR: 3, WN: 2, FR: 1, HW: 1, GL: 1, AC: 0, OT: 0 } },
    createdAt: new Date().toISOString(),
  };
}

export function seedMovements(db) {
  const out = [];
  const c = { IN: 0, OUT: 0, TRF: 0 };
  const mk = (type, day, lines, extra) => {
    c[type] += 1;
    const m = {
      id: uid("m"),
      serial: "AAA/" + type + "/" + YY() + "/" + pad(c[type]),
      type,
      date: daysAgoISO(day),
      lines,
      fromFacility: extra.from || "",
      toFacility: extra.to || "",
      party: extra.party || "",
      truckNo: extra.truck || "",
      driver: extra.driver || "",
      notes: extra.notes || "",
      photos: [],
      userId: extra.by || "u_ravi",
      userName: extra.byName || "Ravi Kumar",
      createdAt: new Date(Date.now() - day * 864e5).toISOString(),
    };
    out.push(m);
  };
  const L = (itemId, qty, cost, sf, st) => ({ itemId, qty, cost, serialFrom: sf || "", serialTo: st || "" });

  mk("IN", 26, [L("i1", 120, 6800, "DR-0001/0001", "DR-0001/0120"), L("i6", 120, 3100)], { to: "f_main", party: "Sri Balaji Timbers", truck: "KA 01 AB 4477", driver: "Mahesh" });
  mk("IN", 24, [L("i4", 60, 12400, "WN-0001/0001", "WN-0001/0060"), L("i5", 40, 9800, "WN-0002/0001", "WN-0002/0040")], { to: "f_main", party: "Fenesta Depot", truck: "KA 05 MJ 1290", driver: "Iqbal" });
  mk("IN", 21, [L("i7", 200, 1850)], { to: "f_main", party: "Godrej Locks Distributor", truck: "KA 51 C 8801" });
  mk("IN", 21, [L("i8", 2400, 145)], { to: "f_yard", party: "Saint-Gobain Glass Depot", truck: "KA 51 C 8801" });
  mk("OUT", 19, [L("i1", 34, 6800), L("i6", 34, 3100), L("i7", 34, 1850)], { from: "f_main", party: "Prestige Lakeside Habitat — Block C", truck: "KA 01 AJ 9021", driver: "Ramesh", notes: "Site handover to Mr. Anil, block C store." });
  mk("IN", 17, [L("i3", 90, 4200, "DR-0003/0001", "DR-0003/0090")], { to: "f_main", party: "Greenply WPC", truck: "KA 19 D 2211" });
  mk("OUT", 15, [L("i4", 18, 12400)], { from: "f_main", party: "Sobha Dream Acres — Tower 4", truck: "KA 03 MN 7742", driver: "Suresh" });
  mk("TRF", 14, [L("i1", 30, 6800), L("i3", 25, 4200)], { from: "f_main", to: "f_show", truck: "KA 02 X 5567", notes: "Display and buffer stock for showroom." });
  mk("IN", 12, [L("i2", 24, 21500, "DR-0002/0001", "DR-0002/0024")], { to: "f_yard", party: "Shakti Met-Dor", truck: "KA 40 B 3390", driver: "Prakash" });
  mk("OUT", 10, [L("i3", 40, 4200), L("i7", 40, 1850)], { from: "f_main", party: "Brigade Cornerstone — Phase 2", truck: "KA 01 AB 4477", driver: "Mahesh" });
  mk("OUT", 8, [L("i8", 620, 145)], { from: "f_yard", party: "Glass House Interiors, Jayanagar", truck: "KA 41 A 1122" });
  mk("IN", 6, [L("i1", 80, 6950, "DR-0001/0121", "DR-0001/0200"), L("i6", 80, 3150)], { to: "f_main", party: "Sri Balaji Timbers", truck: "KA 05 MJ 1290", driver: "Iqbal", notes: "Rate revised, new PO." });
  mk("OUT", 5, [L("i2", 8, 21500)], { from: "f_yard", party: "Manyata Tech Park — Fire doors AMC", truck: "KA 51 C 8801", driver: "Nagaraj" });
  mk("OUT", 3, [L("i1", 26, 6800), L("i6", 26, 3100), L("i7", 26, 1850)], { from: "f_main", party: "Prestige Lakeside Habitat — Block D", truck: "KA 01 AJ 9021", driver: "Ramesh" });
  mk("IN", 2, [L("i5", 30, 9950, "WN-0002/0041", "WN-0002/0070")], { to: "f_main", party: "Jindal Aluminium", truck: "KA 19 D 2211" });
  mk("OUT", 1, [L("i4", 12, 12400), L("i5", 10, 9800)], { from: "f_main", party: "Century Renaissance — Villa 22", truck: "KA 03 MN 7742", driver: "Suresh", by: "u_sunil", byName: "Sunil M" });

  db.counters.IN = c.IN; db.counters.OUT = c.OUT; db.counters.TRF = c.TRF;
  db.items.find((i) => i.id === "i1").serialSeq = 200;
  db.items.find((i) => i.id === "i2").serialSeq = 24;
  db.items.find((i) => i.id === "i3").serialSeq = 90;
  db.items.find((i) => i.id === "i4").serialSeq = 60;
  db.items.find((i) => i.id === "i5").serialSeq = 70;
  return out.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}


