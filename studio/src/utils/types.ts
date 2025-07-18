export interface CliArguments {
  config?: string | undefined;
}

export interface CreateTokenMintOptions {
  dryRun: boolean;
  mintTokenAmount: string | number;
  decimals: number;
  computeUnitPriceMicroLamports: number;
}

export interface MeteoraConfig {
  rpcUrl: string;
  dryRun: boolean;
  keypairFilePath: string;
  computeUnitPriceMicroLamports: number;
  createBaseToken: CreateBaseMintConfig | null;
  baseMint: string | null;
  quoteSymbol?: string;
  quoteMint?: string;
  dynamicAmm: DynamicAmmConfig | null;
  dynamicAmmV2: DynamicAmmV2Config | null;
  dlmm: DlmmConfig | null;
  alphaVault: FcfsAlphaVaultConfig | ProrataAlphaVaultConfig | null;
  lockLiquidity: LockLiquidityConfig | null;
  lfgSeedLiquidity: LfgSeedLiquidityConfig | null;
  singleBinSeedLiquidity: SingleBinSeedLiquidityConfig | null;
  m3m3: M3m3Config | null;
  setDlmmPoolStatus: SetDlmmPoolStatusConfig | null;
}

export interface CreateBaseMintConfig {
  mintBaseTokenAmount: number | string;
  baseDecimals: number;
}

export interface DynamicAmmConfig {
  baseAmount: number | string;
  quoteAmount: number | string;
  tradeFeeNumerator: number;
  activationType: ActivationTypeConfig;
  activationPoint: number | null;
  hasAlphaVault: boolean;
}

export interface DynamicAmmV2Config {
  creator: string;
  baseAmount: number | string;
  quoteAmount: number | string | null;
  initPrice: number | string;
  maxPrice: number | string | null;
  poolFees: {
    maxBaseFeeBps: number;
    minBaseFeeBps: number;
    numberOfPeriod: number;
    totalDuration: number;
    feeSchedulerMode: number;
    useDynamicFee: boolean;
    dynamicFeeConfig: DynamicFee | null;
  };
  collectFeeMode: number;
  activationType: ActivationTypeConfig;
  activationPoint: number | null;
  hasAlphaVault: boolean;
}

export interface DynamicFee {
  filterPeriod: number;
  decayPeriod: number;
  reductionFactor: number;
  variableFeeControl: number;
  maxVolatilityAccumulator: number;
}

export interface DlmmConfig {
  binStep: number;
  feeBps: number;
  initialPrice: number;
  activationType: ActivationTypeConfig;
  activationPoint: number | null;
  priceRounding: PriceRoundingConfig;
  hasAlphaVault: boolean;
  // Allow creator to turn on/off the pool
  creatorPoolOnOffControl: boolean;
}

export interface CloudflareKvProofUploadConfig {
  kvNamespaceId: string;
  accountId: string;
  apiKey: string;
}

export interface FcfsAlphaVaultConfig {
  poolType: PoolTypeConfig;
  alphaVaultType: AlphaVaultTypeConfig;
  // absolute value, depend on the pool activation type it will be the timestamp in secs or the slot number
  depositingPoint: number;
  // absolute value
  startVestingPoint: number;
  // absolute value
  endVestingPoint: number;
  // total max deposit
  maxDepositCap: number;
  // user max deposit
  individualDepositingCap: number;
  // fee to create stake escrow account
  escrowFee: number;
  // whitelist mode: permissionless / permission_with_merkle_proof / permission_with_authority
  whitelistMode: WhitelistModeConfig;
  merkleProofBaseUrl: string;
  whitelistFilepath?: string;
  chunkSize?: number;
  kvProofFilepath?: string;
  cloudflareKvProofUpload?: CloudflareKvProofUploadConfig;
}

export interface ProrataAlphaVaultConfig {
  poolType: PoolTypeConfig;
  alphaVaultType: AlphaVaultTypeConfig;
  // absolute value, depend on the pool activation type it will be the timestamp in secs or the slot number
  depositingPoint: number;
  // absolute value
  startVestingPoint: number;
  // absolute value
  endVestingPoint: number;
  // total max deposit
  maxBuyingCap: number;
  // fee to create stake escrow account
  escrowFee: number;
  // whitelist mode: permissionless / permission_with_merkle_proof / permission_with_authority
  whitelistMode: WhitelistModeConfig;
  merkleProofBaseUrl: string;
  whitelistFilepath?: string;
  chunkSize?: number;
  kvProofFilepath?: string;
  cloudflareKvProofUpload?: CloudflareKvProofUploadConfig;
}

export interface LockLiquidityConfig {
  allocations: LockLiquidityAllocation[];
}

export interface LockLiquidityAllocation {
  percentage: number;
  address: string;
}

export interface LfgSeedLiquidityConfig {
  minPrice: number;
  maxPrice: number;
  curvature: number;
  seedAmount: string;
  basePositionKeypairFilepath: string;
  operatorKeypairFilepath: string;
  positionOwner: string;
  feeOwner: string;
  lockReleasePoint: number;
  seedTokenXToPositionOwner: boolean;
}

export interface SingleBinSeedLiquidityConfig {
  price: number;
  priceRounding: string;
  seedAmount: string;
  basePositionKeypairFilepath: string;
  operatorKeypairFilepath: string;
  positionOwner: string;
  feeOwner: string;
  lockReleasePoint: number;
  seedTokenXToPositionOwner: boolean;
}

export interface M3m3Config {
  topListLength: number;
  unstakeLockDurationSecs: number;
  secondsToFullUnlock: number;
  startFeeDistributeTimestamp: number;
}

export interface SetDlmmPoolStatusConfig {
  poolAddress: string;
  enabled: boolean;
}

export enum ActivationTypeConfig {
  Slot = 'slot',
  Timestamp = 'timestamp',
}

export enum PriceRoundingConfig {
  Up = 'up',
  Down = 'down',
}

export enum AlphaVaultTypeConfig {
  Fcfs = 'fcfs',
  Prorata = 'prorata',
}

export enum PoolTypeConfig {
  Dynamic = 'dynamic',
  Dlmm = 'dlmm',
  DammV2 = 'damm2',
}

export enum WhitelistModeConfig {
  Permissionless = 'permissionless',
  PermissionedWithMerkleProof = 'permissioned_with_merkle_proof',
  PermissionedWithAuthority = 'permissioned_with_authority',
}
