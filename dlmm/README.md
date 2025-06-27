# DLMM (Dynamic Liquidity Market Maker)

This folder contains all the scripts to interact with Meteora's Dynamic Liquidity Market Maker

## Create Pool
- Create a new DLMM pool. [Create Pool](./create-pool/src/create-pool.ts)

## Create Position
- Create a balanced liquidity position with equal token amounts. [Create Balanced Position](./create-position/src/create-balanced-position.ts)
- Create an imbalanced liquidity position with different token amounts. [Create Imbalanced Position](./create-position/src/create-imbalanced-position.ts)



## Manage Position
- Get the active bin ID and price for a pool. [Get Active Bin](./get-position/src/get-active-bin.ts)
- Get all positions by wallet address in a pool. [Get Positions List](./get-position/src/get-positions-list.ts)
- Add balanced liquidity to an existing position. [Add Balanced Liquidity](./manage-position/src/add-balanced-liquidity.ts)
- Add imbalanced liquidity to an existing position. [Add Imbalanced Liquidity](./manage-position/src/add-imbalanced-liquidity.ts)

## Claim Fees
- Claim fees earned from a position. [Claim Position Fees](./claim-fees/src/claim-position-fees.ts)
- Get the amount of fees earned from a position. [Get Position Fees](./claim-fees/src/get-position-fees.ts)



## Terminology

**Bin Step**: The bin step determines the granularity increase in price from one bin to the next. A large bin step is often used for more volatile pools, whereas a small bin step is used for more stable pools.

**Strategy Type**: There are 3 strategies that Meteora uses to distribute liquidity across bins.
- Spot: Liquidity is distributed evenly across all bins.
- Curve: Liquidity is concentrated around the active bin. Forms an inverted V shape.
- Bid Ask: Liquidity is concentrated at the ends of the position and away from the active bin. Forms a V shape