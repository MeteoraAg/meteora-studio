# DAMM V1

This folder contains all the scripts to interact with Meterora's Dynamic AMM V1

## Claim Fees
 - Claim fees from locked positions. [Claim Locked Fees](./claim-fees/src/claim-locked-fees.ts)
- Gets the amount of fees earned from locked positions. [Get Locked Fees](./claim-fees/src/get-locked-fees.ts)

## Create Pool
- Create constant product pool. [Create Constant Product Pool](./create-pool/src/constant-product.ts)
- Create stable pool. [Create Stable Pool](./create-pool/src/stable-pool.ts)
- Create memecoin pool. [Create Memecoin Pool](./create-pool/src/memecoin-pool.ts)
- Get configs for pool creation. [Get Configs](./create-pool/src/get-configs.ts)

## Manage Position
- Create a new liquidity position. [Create Position](./manage-position/src/create-position.ts)
- Withdraw liquidity from a position. [Withdraw Liquidity](./manage-position/src/withdraw-liquidity.ts)


## Terminology

**Token A and Token B**: These correspond to the `tokenAMint` and `tokenBMint` fields in the pool data. Typically, Token A is listed first in the pool's name.  
For example, in a SOL-USDC pool, SOL is Token A and USDC is Token B.  
To verify which token is A or B, visit the pool contract on [Solscan](https://solscan.io/), navigate to the Data tab, and look for the token addresses in the  `tokenAMint` and `tokenBMint` fields.

**Pool Address**: The public key of the pool that uniquely identifies a specific liquidity pool.

**Position Address**: The public key of a specific position by a user on a pool. 
This account stores information about a user's deposited liquidity and earned fees in the pool.

**Config**: Configs contain parameters for creating a pool and dictate the fees and the pool activation.