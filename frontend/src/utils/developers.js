export const DEVELOPER_IDS = new Set(['113903862264612270084']);

export function isDeveloper(userId) {
  return !!userId && DEVELOPER_IDS.has(String(userId));
}
