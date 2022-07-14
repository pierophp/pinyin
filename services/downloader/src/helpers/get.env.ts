export function getEnv(key: string) {
  const isDeno = typeof Deno !== 'undefined';
  if (isDeno) {
    return Deno.env.get(key);
  }

  // @ts-ignorem Node compatibility
  return process.env[key];
}
