export type SearchParamsLike = Record<string, string | string[] | undefined> | URLSearchParams;

export function getStringParam(sp: SearchParamsLike, key: string): string | undefined {
  if (sp instanceof URLSearchParams) {
    const v = sp.get(key);
    return v === null ? undefined : v;
  }

  const v = sp[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export function getNumberParam(
  sp: SearchParamsLike,
  key: string,
  options?: { min?: number; max?: number },
): number | undefined {
  const raw = getStringParam(sp, key);
  if (!raw) return undefined;

  const n = Number(raw);
  if (!Number.isFinite(n)) return undefined;

  const min = options?.min;
  if (min !== undefined && n < min) return undefined;

  const max = options?.max;
  if (max !== undefined && n > max) return undefined;

  return n;
}

export function getEnumParam<const T extends readonly string[]>(
  sp: SearchParamsLike,
  key: string,
  allowed: T,
): T[number] | undefined {
  const raw = getStringParam(sp, key);
  if (!raw) return undefined;

  return (allowed as readonly string[]).includes(raw) ? (raw as T[number]) : undefined;
}

export function setParam(sp: URLSearchParams, key: string, value: string | undefined) {
  if (!value) sp.delete(key);
  else sp.set(key, value);
}
