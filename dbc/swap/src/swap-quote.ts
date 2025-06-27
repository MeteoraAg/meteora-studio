import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import {
    deriveDbcPoolAddress,
    DynamicBondingCurveClient,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { NATIVE_MINT } from '@solana/spl-token'
import BN from 'bn.js'
import "dotenv/config";

const connection = new Connection(
    process.env.RPC_URL || "https://api.mainnet-beta.solana.com"
);


async function swapQuote() {

    // Variables to be configured
    const baseMint = new PublicKey('')
    const amountIn = 0.1; 
    const amountInDecimals = 9;
    const swapBaseForQuote = false; // False to buy token, true to sell token

    //

    try{
        const client = new DynamicBondingCurveClient(connection, "confirmed");
        const virtualPoolState = await client.state.getPoolByBaseMint(baseMint);
        if (!virtualPoolState) {
        throw new Error(`Pool not found for base mint: ${baseMint.toString()}`);
        }

        const config = virtualPoolState.account.config;
        if (!config) {
        throw new Error("Pool config is undefined");
        }

        const poolAddress = deriveDbcPoolAddress(NATIVE_MINT, baseMint, config) // ensure that your quote mint is correct
        console.log('Derived pool address:', poolAddress.toString())



        const poolConfigState = await client.state.getPoolConfig(
            virtualPoolState.account.config
        )


        const hasReferral = true
        const currentPoint = new BN(0)

        console.log('Calculating swap quote...')
        try {
            if (
                !virtualPoolState.account.sqrtPrice ||
                virtualPoolState.account.sqrtPrice.isZero()
            ) {
                throw new Error(
                    'Invalid pool state: sqrtPrice is zero or undefined'
                )
            }

            if (!poolConfigState.curve || poolConfigState.curve.length === 0) {
                throw new Error('Invalid config state: curve is empty')
            }

            const quote = await client.pool.swapQuote({
                virtualPool: virtualPoolState.account,
                config: poolConfigState,
                swapBaseForQuote,
                amountIn: new BN(amountIn * 10 ** amountInDecimals),
                slippageBps: 5000,
                hasReferral,
                currentPoint,
            })

            console.log('Swap Quote:', {
                amountIn: amountIn.toString(),
                amountOut: quote.amountOut.toString(),
                minimumAmountOut: quote.minimumAmountOut.toString(),
                nextSqrtPrice: quote.nextSqrtPrice.toString(),
                fee: {
                    trading: quote.fee.trading.toString(),
                    protocol: quote.fee.protocol.toString(),
                    referral: quote.fee.referral?.toString() || '0',
                },
                price: {
                    beforeSwap: quote.price.beforeSwap.toString(),
                    afterSwap: quote.price.afterSwap.toString(),
                },
            })
        } catch (error) {
            console.error('Failed to calculate swap quote:', error)
            console.log('Pool state:', {
                sqrtPrice:
                    virtualPoolState.account.sqrtPrice?.toString() || 'undefined',
                baseReserve:
                    virtualPoolState.account.baseReserve?.toString() || 'undefined',
                quoteReserve:
                    virtualPoolState.account.quoteReserve?.toString() || 'undefined',
            })
            console.log('Config state:', {
                curveLength: poolConfigState.curve?.length || 0,
                collectFeeMode: poolConfigState.collectFeeMode,
            })
        }
    } catch (error) {
        console.error('Failed to get swap quote:', error)
        console.log('Error details:', JSON.stringify(error, null, 2))
    }
}

swapQuote()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
    })
