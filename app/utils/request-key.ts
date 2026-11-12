/** getRandomValues also works on local HTTP/IP origins where randomUUID is unavailable. */
export function requestKey(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), (value) =>
    value.toString(16).padStart(2, '0'),
  ).join('');
}
