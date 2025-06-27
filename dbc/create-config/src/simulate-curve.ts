import {
    ActivationType,
    CollectFeeMode,
    BaseFeeMode,
    MigrationFeeOption,
    MigrationOption,
    TokenDecimal,
    TokenType,
    buildCurveWithLiquidityWeights,
    buildCurveWithMarketCap,
    TokenUpdateAuthorityOption,
    BuildCurveWithMarketCapParam,
} from '@meteora-ag/dynamic-bonding-curve-sdk'
import { Connection, Keypair, PublicKey, sendAndConfirmTransaction } from '@solana/web3.js'
import Decimal from 'decimal.js'
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


async function simulateCurve() {

    const configKeyParams: BuildCurveWithMarketCapParam = {
        totalTokenSupply: 1000000000,
        initialMarketCap: 23,
        migrationMarketCap: 395,
        migrationOption: MigrationOption.MET_DAMM_V2,
        tokenBaseDecimal: TokenDecimal.SIX,
        tokenQuoteDecimal: TokenDecimal.NINE,
        lockedVestingParam: {
          totalLockedVestingAmount: 0,
          numberOfVestingPeriod: 0,
          cliffUnlockAmount: 0,
          totalVestingDuration: 0,
          cliffDurationFromMigrationTime: 0,
        },
        baseFeeParams: {
          baseFeeMode: BaseFeeMode.FeeSchedulerLinear,
          feeSchedulerParam: {
            startingFeeBps: 100,
            endingFeeBps: 100,
            numberOfPeriod: 0,
            totalDuration: 0,
          },
        },
        dynamicFeeEnabled: true,
        activationType: ActivationType.Slot,
        collectFeeMode: CollectFeeMode.OnlyQuote,
        migrationFeeOption: MigrationFeeOption.FixedBps100,
        tokenType: TokenType.SPL,
        partnerLpPercentage: 0,
        creatorLpPercentage: 0,
        partnerLockedLpPercentage: 50,
        creatorLockedLpPercentage: 50,
        creatorTradingFeePercentage: 50,
        leftover: 0,
        tokenUpdateAuthority: TokenUpdateAuthorityOption.Immutable,
        migrationFee: {
          feePercentage: 0,
          creatorFeePercentage: 0,
        }
    }

    const curveConfig = buildCurveWithMarketCap(configKeyParams)
    console.log('BuildCurveGraph Config:', curveConfig)
    console.log("Starting Price:", )
    console.log('Migration Quote Threshold', curveConfig.migrationQuoteThreshold.toNumber() / 10 ** configKeyParams.tokenQuoteDecimal)

}



simulateCurve()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error)
        process.exit(1)
})
