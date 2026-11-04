// The old client-side "AES encryption" used a NEXT_PUBLIC_ key that ships to every browser, so it
// provided no security. Transport security is HTTPS; authorization is Supabase Auth + RLS.
// These are now pass-throughs kept only so existing call sites keep working; remove them gradually.
export const EncryptData = (data) => data
export const DecryptData = (data) => data

export default function EncryptingFunctions() {
    return null
}
