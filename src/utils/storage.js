// Safe localStorage helpers (no-throw wrappers)
export function isLocalStorageAvailable() {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.localStorage !== "undefined"
    );
  } catch (e) {
    return false;
  }
}

export function getItem(key) {
  if (!isLocalStorageAvailable()) return null;
  try {
    return window.localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

export function setItem(key, value) {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (e) {
    return false;
  }
}

// JSON helpers
export function getJSON(key) {
  const raw = getItem(key);
  if (raw == null) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function setJSON(key, value) {
  try {
    return setItem(key, JSON.stringify(value));
  } catch (e) {
    return false;
  }
}

export function removeItem(key) {
  if (!isLocalStorageAvailable()) return false;
  try {
    window.localStorage.removeItem(key);
    return true;
  } catch (e) {
    return false;
  }
}

export default { isLocalStorageAvailable, getItem, setItem, removeItem };
