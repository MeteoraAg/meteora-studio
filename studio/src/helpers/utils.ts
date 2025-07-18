import { Keypair } from '@solana/web3.js';
import fs from 'fs/promises';

export async function safeParseJsonFromFile<T>(filePath: string): Promise<T> {
  try {
    const rawData = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading or parsing JSON file:', error);
    throw new Error(`failed to parse file ${filePath}`);
  }
}

export async function safeParseKeypairFromFile(filePath: string): Promise<Keypair> {
  const keypairJson: Array<number> = await safeParseJsonFromFile(filePath);
  const keypairBytes = Uint8Array.from(keypairJson);
  const keypair = Keypair.fromSecretKey(keypairBytes);
  return keypair;
}
