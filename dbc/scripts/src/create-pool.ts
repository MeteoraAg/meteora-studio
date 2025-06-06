import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from '@solana/web3.js'
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk'
import bs58 from 'bs58'
import "dotenv/config";

async function createPool() {
  const PAYER_PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
  }
  const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
  const payer = Keypair.fromSecretKey(payerSecretKey);
  console.log("Payer public key:", payer.publicKey.toBase58());

  const POOL_CREATOR_PRIVATE_KEY = "";
  const poolCreatorSecretKey = bs58.decode(POOL_CREATOR_PRIVATE_KEY);
  const poolCreator = Keypair.fromSecretKey(poolCreatorSecretKey);
  console.log("Pool creator public key:", poolCreator.publicKey.toBase58());

  const connection = new Connection(
    process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
  )

  const configAddress = new PublicKey('')
  console.log(`Using config: ${configAddress.toString()}`)

  try {
      const baseMint = Keypair.generate()
      console.log(`Generated base mint: ${baseMint.publicKey.toString()}`)

      const createPoolParam = {
          baseMint: baseMint.publicKey,
          config: configAddress,
          name: 'Test',
          symbol: 'TEST',
          uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Test-Logo.svg/2560px-Test-Logo.svg.png',
          payer: payer.publicKey,
          poolCreator: poolCreator.publicKey,
      }

      const client = new DynamicBondingCurveClient(connection, 'confirmed')

      console.log('Creating pool transaction...')
      const poolTransaction = await client.pool.createPool(createPoolParam)

      const signature = await sendAndConfirmTransaction(
          connection,
          poolTransaction,
          [payer, baseMint, poolCreator],
          {
              commitment: 'confirmed',
              skipPreflight: true,
          }
      )
      console.log('Transaction confirmed!')
      console.log(
          `Pool created: https://solscan.io/tx/${signature}?cluster=devnet`
      )
  } catch (error) {
      console.error('Failed to create pool:', error)
      console.log('Error details:', JSON.stringify(error, null, 2))
  }
}

createPool()
  .then(() => process.exit(0))
  .catch((error) => {
      console.error(error)
      process.exit(1)
  })
