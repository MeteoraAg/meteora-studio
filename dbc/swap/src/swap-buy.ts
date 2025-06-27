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


const PAYER_PRIVATE_KEY = process.env.PAYER_PRIVATE_KEY;
if (!PAYER_PRIVATE_KEY) {
    throw new Error("PRIVATE_KEY is not set");
}
const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
const payer = Keypair.fromSecretKey(payerSecretKey);

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);


async function swapBuy() {

    // Variables to be configured
    const baseMint = new PublicKey('')
    const amountIn = 0.01;
    const amountInDecimals = 9;
    const minimumAmountOut = 0;
    const amountOutDecimals = 6;
    const swapBaseForQuote = false; // False to buy token, true to sell token

    //

    try{
        console.log("Payer public key:", payer.publicKey.toBase58());
        const client = new DynamicBondingCurveClient(connection, "confirmed");
        const virtualPoolState = await client.state.getPoolByBaseMint(baseMint);
        if (!virtualPoolState) {
        throw new Error(`Pool not found for base mint: ${baseMint.toString()}`);
        }

        const config = virtualPoolState.account.config;
        if (!config) {
        throw new Error("Pool config is undefined");
        }


        const poolAddress = deriveDbcPoolAddress(NATIVE_MINT, baseMint, config)
        console.log('Derived pool address:', poolAddress.toString())

        const swapParam = {
            amountIn: new BN(amountIn * 10 ** amountInDecimals),
            minimumAmountOut: new BN(minimumAmountOut * 10 ** amountOutDecimals),
            swapBaseForQuote: swapBaseForQuote,
            owner: payer.publicKey,
            pool: poolAddress,
            referralTokenAccount: null,
        }

        const swapTransaction = await client.pool.swap(swapParam)

        const swapSignature = await sendAndConfirmTransaction(
            connection,
            swapTransaction,
            [payer],
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
