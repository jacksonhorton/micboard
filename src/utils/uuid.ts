import { customAlphabet } from 'nanoid'

const alphabet = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'
const nanoid = customAlphabet(alphabet, 10)  // 10 chars long

export function short(): string {
    const id = nanoid()
    return id
}

// Hex alphabet for GUID-style IDs
const hexAlphabet = '0123456789abcdef';
const nanoidHex = customAlphabet(hexAlphabet, 32);

/**
 * Generates an RFC4122-like GUID using nanoid under the hood.
 * @returns A GUID in the form 8-4-4-4-12 (e.g. '3f50c0f2-5d3a-4e6a-b2f9-9c1d12345678')
 */
export function guid(): string {
  const id = nanoidHex();
  return `${id.slice(0,8)}-${id.slice(8,12)}-${id.slice(12,16)}-${id.slice(16,20)}-${id.slice(20)}`;
}