import dns from 'node:dns';
import net from 'node:net';

const ALLOWED_PORTS = new Set(['80', '443']);

export class UnsafeUrlError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeUrlError';
  }
}

// The HTTP client wraps low-level errors, so we look through the whole cause chain
export const isUnsafeUrlError = (error) => {
  let current = error;
  for (let depth = 0; current && depth < 5; depth += 1) {
    if (current instanceof UnsafeUrlError) return true;
    current = current.cause;
  }
  return false;
};

const BLOCKED_RANGES = [
  // IPv4
  ['0.0.0.0', 8, 'ipv4'], // "this" network
  ['10.0.0.0', 8, 'ipv4'], // private
  ['100.64.0.0', 10, 'ipv4'], // carrier-grade NAT
  ['127.0.0.0', 8, 'ipv4'], // loopback
  ['169.254.0.0', 16, 'ipv4'], // link-local + cloud metadata
  ['172.16.0.0', 12, 'ipv4'], // private
  ['192.0.0.0', 24, 'ipv4'], // reserved
  ['192.168.0.0', 16, 'ipv4'], // private
  ['198.18.0.0', 15, 'ipv4'], // benchmarking
  ['224.0.0.0', 4, 'ipv4'], // multicast
  ['240.0.0.0', 4, 'ipv4'], // reserved + broadcast
  // IPv6
  ['::', 128, 'ipv6'], // unspecified
  ['::1', 128, 'ipv6'], // loopback
  ['2001::', 32, 'ipv6'], // Teredo
  ['2002::', 16, 'ipv6'], // 6to4
  ['fc00::', 7, 'ipv6'], // unique local (also Railway private network)
  ['fe80::', 10, 'ipv6'], // link-local
  ['ff00::', 8, 'ipv6'], // multicast
];

const blockList = new net.BlockList();
for (const [address, prefix, family] of BLOCKED_RANGES) {
  blockList.addSubnet(address, prefix, family);
}



// Any IPv6 spelling ("::", compressed, dotted tail) → 16 bytes
const ipv6ToBytes = (address) => {
  let text = address.toLowerCase();

  const dotted = /(\d{1,3}(?:\.\d{1,3}){3})$/.exec(text);
  if (dotted) {
    const [a, b, c, d] = dotted[1].split('.').map(Number);
    text =
      text.slice(0, -dotted[1].length) +
      ((a << 8) | b).toString(16) +
      ':' +
      ((c << 8) | d).toString(16);
  }

  const [head, rest] = text.split('::');
  const first = head ? head.split(':') : [];
  const last = rest ? rest.split(':') : [];
  const fill = rest === undefined ? [] : Array(8 - first.length - last.length).fill('0');

  const bytes = [];
  for (const group of [...first, ...fill, ...last]) {
    const value = parseInt(group, 16);
    bytes.push(value >> 8, value & 255);
  }
  return bytes;
};

// IPv4 hidden inside an IPv6 address, or null.
//   ::ffff:a.b.c.d    → IPv4-mapped
//   64:ff9b::a.b.c.d  → NAT64 (the real IPv4 is the last 32 bits)
const embeddedIPv4 = (address) => {
  const b = ipv6ToBytes(address);
  const zeros = (from, to) => b.slice(from, to).every((x) => x === 0);

  const isMapped = zeros(0, 10) && b[10] === 0xff && b[11] === 0xff;
  const isNat64 = b[0] === 0 && b[1] === 0x64 && b[2] === 0xff && b[3] === 0x9b && zeros(4, 12);

  return isMapped || isNat64 ? b.slice(12).join('.') : null;
};

export const isPublicIp = (rawAddress) => {
  const address = rawAddress.split('%')[0]; // drop IPv6 zone id
  const family = net.isIP(address);
  if (family === 0) return false;

  // An IPv6 address that wraps an IPv4 one is judged by the IPv4 inside.
  // This keeps 64:ff9b::7f00:1 (= 127.0.0.1) blocked while allowing
  // 64:ff9b::14cf:4952 (= 20.207.73.82, a public address).
  if (family === 6) {
    const embedded = embeddedIPv4(address);
    if (embedded) return isPublicIp(embedded);
  }

  return !blockList.check(address, family === 4 ? 'ipv4' : 'ipv6');
};

// Static checks on the URL itself, run before every request and every redirect
export const assertSafeUrl = (url) => {
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new UnsafeUrlError('Only http(s) links are allowed');
  }
  if (url.username || url.password) {
    throw new UnsafeUrlError('Links with credentials are not allowed');
  }
  if (url.port && !ALLOWED_PORTS.has(url.port)) {
    throw new UnsafeUrlError('Only standard web ports are allowed');
  }

  // Literal IPs (http://127.0.0.1, http://[::1]) never trigger a DNS lookup,
  // so they must be checked here. The URL parser already normalises tricks
  // like http://2130706433 into 127.0.0.1.
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (net.isIP(host) && !isPublicIp(host)) {
    throw new UnsafeUrlError('Private addresses are not allowed');
  }
};

// Plugged into the HTTP client: runs at connection time, so the IP we validate
// is the exact IP we connect to. This is what defeats DNS rebinding.
export const safeLookup = (hostname, options, callback) => {
  dns.lookup(hostname, { ...options, all: true }, (error, addresses) => {
    if (error) return callback(error);

        const blocked = addresses.filter(({ address }) => !isPublicIp(address));
    if (addresses.length === 0 || blocked.length > 0) {
      console.warn(
        `[ssrf] blocked ${hostname} -> ${blocked.map((a) => a.address).join(', ') || 'no addresses'}`
      );
      return callback(new UnsafeUrlError('Host resolves to a private address'));
    }

    if (options.all) return callback(null, addresses);
    return callback(null, addresses[0].address, addresses[0].family);
  });
};