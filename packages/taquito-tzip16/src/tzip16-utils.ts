import { sha256 } from 'sha.js'

export function calculateSHA256Hash(preimage: string): string {
    return new sha256().update(preimage, 'utf8').digest('hex');
}
