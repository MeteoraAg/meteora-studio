# DAMM V2

This folder contains all the scripts to interact with Meterora's Dynamic AMM V2

## Claim Fees
- Claim fees from a position. [Claim Position Fees](./claim-fees/src/claim-position-fees.ts)
- Gets the amount of fees earned from a position. [Get Position Fees](./claim-fees/src/get-position-fees.ts)

## Create Pool
- Create a pool. [Create Pool](./create-pool/src/create-pool.ts)

## Manage Position
- Create a liquidity position. [Create Position](./manage-position/src/create-position.ts)
- Get all positions by a user in a pool. [Get Positions](./manage-position/src/get-positions.ts)
- Locks a position for a specified period. [Lock Position](./manage-position/src/lock-position.ts)
- Withdraw liquidity from a position. [Withdraw Liquidity](./manage-position/src/withdraw-liquidity.ts)


## Terminology

**Token A and Token B**: These correspond to the `tokenAMint` and `tokenBMint` fields in the pool data. Typically, Token A is listed first in the pool's name.  
For example, in a SOL-USDC pool, SOL is Token A and USDC is Token B.  
To verify which token is A or B, visit the pool contract on [Solscan](https://solscan.io/), navigate to the Data tab, and look for the token addresses in the  `tokenAMint` and `tokenBMint` fields.

**Pool Address**: The public key of the pool that uniquely identifies a specific liquidity pool.

**Position Address**: The public key of a specific position by a user on a pool. 
This account stores information about a user's deposited liquidity and earned fees in the pool.