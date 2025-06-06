import { Connection, PublicKey } from '@solana/web3.js'
import {
    deriveDbcPoolAddress,
    DynamicBondingCurveClient,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { NATIVE_MINT } from '@solana/spl-token'
import BN from 'bn.js'
import "dotenv/config";

async function swapQuote() {
    const connection = new Connection(
        process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
        'confirmed'
    )

    const baseMint = new PublicKey('')
    const config = new PublicKey('')

    try {
        const poolAddress = deriveDbcPoolAddress(NATIVE_MINT, baseMint, config) // ensure that your quote mint is correct
        console.log('Derived pool address:', poolAddress.toString())

        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const virtualPoolState = await client.state.getPool(poolAddress)
        if (!virtualPoolState) {
            throw new Error(`Pool not found: ${poolAddress.toString()}`)
        }

        const poolConfigState = await client.state.getPoolConfig(
            virtualPoolState.config
        )

        const amountIn = new BN(0.01 * 1e9)
        const swapBaseForQuote = false
        const hasReferral = true
        const currentPoint = new BN(0)

        console.log('Calculating swap quote...')
        try {
            if (
                !virtualPoolState.sqrtPrice ||
                virtualPoolState.sqrtPrice.isZero()
            ) {
                throw new Error(
                    'Invalid pool state: sqrtPrice is zero or undefined'
                )
            }

            if (!poolConfigState.curve || poolConfigState.curve.length === 0) {
                throw new Error('Invalid config state: curve is empty')
            }

            const quote = await client.pool.swapQuote({
                virtualPool: virtualPoolState,
                config: poolConfigState,
                swapBaseForQuote,
                amountIn,
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
                    virtualPoolState.sqrtPrice?.toString() || 'undefined',
                baseReserve:
                    virtualPoolState.baseReserve?.toString() || 'undefined',
                quoteReserve:
                    virtualPoolState.quoteReserve?.toString() || 'undefined',
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
