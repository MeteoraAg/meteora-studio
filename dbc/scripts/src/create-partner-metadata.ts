import { Connection, Keypair, sendAndConfirmTransaction } from '@solana/web3.js'
import { DynamicBondingCurveClient } from '@meteora-ag/dynamic-bonding-curve-sdk'
import bs58 from 'bs58'
import "dotenv/config";

/**
 * Create a partner metadata for the dynamic bonding curve
 */
async function createPartnerMetadata() {
    const PAYER_PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!PAYER_PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is not set");
    }
    const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
    const payer = Keypair.fromSecretKey(payerSecretKey);
    console.log("Payer public key:", payer.publicKey.toBase58());

    const PARTNER_PRIVATE_KEY = "";
    const partnerSecretKey = bs58.decode(PARTNER_PRIVATE_KEY);
    const partner = Keypair.fromSecretKey(partnerSecretKey);
    console.log("Partner public key:", partner.publicKey.toBase58());

    const connection = new Connection(
        process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
          'confirmed'
    )

    const createPartnerMetadataParam = {
        name: 'Meteora',
        website: 'https://launch.meteora.ag',
        logo: 'https://img.cryptorank.io/coins/meteora1679488925724.png',
        feeClaimer: partner.publicKey,
        payer: payer.publicKey,
    }

    try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const transaction = await client.partner.createPartnerMetadata(
            createPartnerMetadataParam
        )

        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = payer.publicKey

        transaction.partialSign(payer)

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, partner],
            { commitment: 'confirmed' }
        )

        console.log(`Partner metadata created successfully!`)
        console.log(
            `Transaction: https://solscan.io/tx/${signature}`
        )
    } catch (error) {
        console.error('Failed to create partner metadata:', error)
    }
}

createPartnerMetadata()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
