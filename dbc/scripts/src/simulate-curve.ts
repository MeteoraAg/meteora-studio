import {
    ActivationType,
    CollectFeeMode,
    FeeSchedulerMode,
    MigrationFeeOption,
    MigrationOption,
    TokenDecimal,
    TokenType,
    DynamicBondingCurveClient,
    buildCurveWithLiquidityWeights,
    TokenUpdateAuthorityOption,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import Decimal from 'decimal.js'
import bs58 from 'bs58'
import "dotenv/config";

async function simulateCurve() {
    console.log('Testing buildCurveGraph...')

    // semi bullish curve
    let liquidityWeights: number[] = []
    for (let i = 0; i < 16; i++) {
        if (i < 5) {
            liquidityWeights[i] = new Decimal(1.1)
                .pow(new Decimal(i))
                .toNumber()
        } else {
            liquidityWeights[i] = new Decimal(1.4)
                .pow(new Decimal(i))
                .toNumber()
        }
    }


    // og bullish curve
    // const liquidityWeights = [
    //     0.01, // 0
    //     0.02, // 1
    //     0.04, // 2
    //     0.08, // 3
    //     0.16, // 4
    //     0.32, // 5
    //     0.64, // 6
    //     1.28, // 7
    //     2.56, // 8
    //     5.12, // 9
    //     10.24, // 10
    //     20.48, // 11
    //     40.96, // 12
    //     81.92, // 13
    //     163.84, // 14
    //     327.68, // 15
    // ]

    const curveConfig = buildCurveWithLiquidityWeights({
        totalTokenSupply: 1000000000,
        initialMarketCap: 250,
        migrationMarketCap: 1000000,
        migrationOption: MigrationOption.MET_DAMM_V2,
        tokenBaseDecimal: TokenDecimal.SIX,
        tokenQuoteDecimal: TokenDecimal.SIX,
        lockedVestingParam: {
            totalLockedVestingAmount: 200000000,
            numberOfVestingPeriod: 1,
            cliffUnlockAmount: 200000000,
            totalVestingDuration: 0,
            cliffDurationFromMigrationTime: (1000 * 365 * 24 * 60 * 60) / 0.4,
        },
          feeSchedulerParam: {
              startingFeeBps: 100,
              endingFeeBps: 100,
              numberOfPeriod: 0,
              totalDuration: 0,
              feeSchedulerMode: FeeSchedulerMode.Linear,
          },
        dynamicFeeEnabled: true,
        activationType: ActivationType.Slot,
        collectFeeMode: CollectFeeMode.OnlyQuote,
        migrationFeeOption: MigrationFeeOption.FixedBps25,
        tokenType: TokenType.SPL,
        partnerLpPercentage: 100,
        creatorLpPercentage: 0,
        partnerLockedLpPercentage: 0,
        creatorLockedLpPercentage: 0,
        creatorTradingFeePercentage: 0,
        leftover: 1000000,
        liquidityWeights,
        tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
        migrationFee: {
            feePercentage: 0,
            creatorFeePercentage: 0
        }
    })

    console.log('BuildCurveGraph Config:', curveConfig)
    console.log('migrationQuoteThreshold', curveConfig.migrationQuoteThreshold.toString())

    try {
        const PAYER_PRIVATE_KEY = process.env.PRIVATE_KEY;
        if (!PAYER_PRIVATE_KEY) {
            throw new Error("PRIVATE_KEY is not set");
        }
        const payerSecretKey = bs58.decode(PAYER_PRIVATE_KEY);
        const payer = Keypair.fromSecretKey(payerSecretKey);
        console.log("Payer public key:", payer.publicKey.toBase58());

        const config = Keypair.generate();

        const connection = new Connection(
            process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
            'confirmed'
        )

        const client = new DynamicBondingCurveClient(connection, 'confirmed')

        const transaction = await client.partner.createConfig(
            { 
                feeClaimer: new PublicKey(''),
                leftoverReceiver: new PublicKey(''),
                quoteMint: new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'), // USDC
                payer: payer.publicKey,
                config: config.publicKey,
                ...curveConfig
            }
        )

        const { blockhash } = await connection.getLatestBlockhash('confirmed')
        transaction.recentBlockhash = blockhash
        transaction.feePayer = payer.publicKey

        transaction.partialSign(config)

        const signature = await sendAndConfirmTransaction(
            connection,
            transaction,
            [payer, config],
            { commitment: 'confirmed' }
        )

        console.log(`Config created successfully!`)
        console.log(
            `Transaction: https://solscan.io/tx/${signature}`
        )
        console.log(`Config address: ${config.publicKey.toString()}`)
    } catch (error) {
        console.error('Failed to create config:', error)
    } 
}



simulateCurve()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
})
