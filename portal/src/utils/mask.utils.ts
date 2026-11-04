export function maskEmail(email: string): string {
  if (!email.includes('@')) return email;
  const [name, domain] = email.split('@');

  if (name.length <= 3) return `${name[0]}***@${domain}`;

  return `${name.slice(0, 3)}******${name.slice(-2)}@${domain}`;
}

export function maskMobile(mobile: string): string {
  if (mobile.length < 3) return mobile;
  return `******${mobile.slice(-3)}`;
}
