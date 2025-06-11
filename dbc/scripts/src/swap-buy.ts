import {
    Connection,
    Keypair,
    PublicKey,
    sendAndConfirmTransaction,
} from '@solana/web3.js'
import {
    deriveDbcPoolAddress,
    DynamicBondingCurveClient,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { NATIVE_MINT } from '@solana/spl-token'
import BN from 'bn.js'
import bs58 from 'bs58'
import "dotenv/config";
async function swapBuy() {
    console.log('Starting pool creation and swap process...')

    const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY;
    if (!WALLET_PRIVATE_KEY) {
        throw new Error("PRIVATE_KEY is not set");
    }
    const walletSecretKey = bs58.decode(WALLET_PRIVATE_KEY);
    const wallet = Keypair.fromSecretKey(walletSecretKey);
    console.log("Wallet public key:", wallet.publicKey.toBase58());

    const connection = new Connection(
        process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        'confirmed'
    )
    const baseMint = new PublicKey('')
    const config = new PublicKey('')

    try {
        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const poolAddress = deriveDbcPoolAddress(NATIVE_MINT, baseMint, config)
        console.log('Derived pool address:', poolAddress.toString())

        const swapParam = {
            amountIn: new BN(0.01 * 1e9),
            minimumAmountOut: new BN(0),
            swapBaseForQuote: false,
            owner: wallet.publicKey,
            pool: poolAddress,
            referralTokenAccount: null,
        }

        const swapTransaction = await client.pool.swap(swapParam)

        const swapSignature = await sendAndConfirmTransaction(
            connection,
            swapTransaction,
            [wallet],
            {
                commitment: 'confirmed',
                skipPreflight: true,
                maxRetries: 5,
            }
        )

        console.log(`Swap executed: https://solscan.io/tx/${swapSignature}`)
    } catch (error) {
        console.error('Failed to execute swap:', error)
    }
}

swapBuy()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
