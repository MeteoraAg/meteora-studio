import {
  ActivationType,
  BuildCurveWithMarketCapParam,
  CollectFeeMode,
  FeeSchedulerMode,
  MigrationFeeOption,
  MigrationOption,
  TokenDecimal,
  TokenType,
  TokenUpdateAuthorityOption,
} from "@meteora-ag/dynamic-bonding-curve-sdk";
import { NATIVE_MINT } from "@solana/spl-token";

export const quoteMint = NATIVE_MINT;

export const configKeyParams: BuildCurveWithMarketCapParam = {
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
  },
};

export const tokenParams = {
  name: "PUMP IT Token",
  symbol: "PUMP",
  uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTgk7EaZ4MxetCM1IB2B8z0MFJZg8IOn8AcMw&s",
};
