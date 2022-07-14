export function getEnv(key: string) {
  const isDeno = typeof Deno !== 'undefined';
  if (isDeno) {
    return Deno.env.get(key);
  }

  // @ts-ignore
  return process.env[key];
}
