// Lightweight Native Web Crypto JWT verification for Edge Runtime / Middleware

export async function verifyJwtEdge(token: string, secretString: string) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;
    const encoder = new TextEncoder();
    const data = encoder.encode(`${headerB64}.${payloadB64}`);

    const secretKey = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secretString),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    // Decode base64url signature
    const sigBase64 = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    const binarySig = Uint8Array.from(atob(sigBase64), (c) => c.charCodeAt(0));

    const isValid = await crypto.subtle.verify('HMAC', secretKey, binarySig, data);
    if (!isValid) return null;

    const payloadStr = atob(payloadB64.replace(/-/g, '+').replace(/_/g, '/'));
    const payload = JSON.parse(payloadStr);

    // Check expiration
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
