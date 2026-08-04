/* ---------------------------------------------------------------- storage */
export const K_DB = "aaa:db:v2";
export const K_MOV = "aaa:mov:v2";
export const K_TICKETS = "aaa:tickets:v1";
export const K_PHOTO = (id) => "aaa:ph:" + id;
export const K_TICKET_MEDIA = (id) => "aaa:tm:" + id;

export const store = {
  async get(key) {
    if (typeof window === "undefined") return null;
    try {
      const raw = window.localStorage.getItem(key);
      if (raw == null) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  },
  async set(key, val) {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(val));
      return true;
    } catch (e) {
      console.error("save failed", key, e);
      return false;
    }
  },
  async del(key) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {}
  },
};
