export const setValueAtPath = (obj, path, value) => {
  const keys = path.split(".");
  const next = Array.isArray(obj) ? [...obj] : { ...(obj || {}) };
  let cursor = next;
  keys.slice(0, -1).forEach((key) => {
    if (cursor[key] === undefined || cursor[key] === null || typeof cursor[key] !== "object") {
      cursor[key] = {};
    } else {
      cursor[key] = Array.isArray(cursor[key]) ? [...cursor[key]] : { ...cursor[key] };
    }
    cursor = cursor[key];
  });
  cursor[keys[keys.length - 1]] = value;
  return next;
};

export const moveItem = (list, from, to) => {
  if (from === to) return list;
  const next = [...list];
  const [moved] = next.splice(from, 1);
  next.splice(to, 0, moved);
  return next;
};
