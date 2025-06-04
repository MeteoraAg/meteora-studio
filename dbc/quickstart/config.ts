import {
  ActivationType,
  BuildCurveWithMarketCapParam,
  CollectFeeMode,
  MigrationFeeOption,
  MigrationOption,
  TokenDecimal,
  TokenType,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from "@solana/spl-token";
import { PublicKey } from "@solana/web3.js";

export const quoteMint = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const configKeyParams: BuildCurveWithMarketCapParam = {
  leftover: 0,
  dynamicFeeEnabled: false,
  totalTokenSupply: 100_000_000,
  initialMarketCap: 1_000_000,
  migrationMarketCap: 5_000_000,
  migrationOption: MigrationOption.MET_DAMM_V2,
  tokenBaseDecimal: TokenDecimal.SIX,
  tokenQuoteDecimal: TokenDecimal.SIX,
  collectFeeMode: CollectFeeMode.OnlyQuote,
  activationType: ActivationType.Slot,
  tokenType: TokenType.SPL,
  partnerLockedLpPercentage: 0,
  partnerLpPercentage: 100,
  creatorLockedLpPercentage: 0,
  creatorLpPercentage: 0,
  migrationFeeOption: MigrationFeeOption.FixedBps100,
  creatorTradingFeePercentage: 50,
  // lockedVestingParam: {
  //   totalLockedVestingAmount: 1_000_000,
  //   cliffUnlockAmount: 1_000_000,
  //   numberOfVestingPeriod: 1,
  //   totalVestingDuration: 0,
  //   cliffDurationFromMigrationTime: 0,
  // },
  lockedVestingParam: {
    totalLockedVestingAmount: 0,
    cliffUnlockAmount: 0,
    numberOfVestingPeriod: 0,
    totalVestingDuration: 0,
    cliffDurationFromMigrationTime: 0,
  },
  feeSchedulerParam: {
    totalDuration: 0,
    endingFeeBps: 100,
    feeSchedulerMode: 0,
    startingFeeBps: 100,
    numberOfPeriod: 0,
  },
  tokenUpdateAuthority: 1,
  migrationFee: {
    feePercentage: 0,
    creatorFeePercentage: 0,
  },
};

export const tokenParams = {
  name: "Moon Token",
  symbol: "MOON",
  uri: "https://i.pinimg.com/736x/9b/80/f6/9b80f613d125c9efd816d0be243aa1c0.jpg",
};
