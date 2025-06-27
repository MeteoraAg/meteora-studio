## DLMM Manage Position

## Scripts

### Get Active Bin

Gets the active bin ID and price for a DLMM pool.
- [Get Active Bin](./src/get-active-bin.ts)

### Get Positions List

Gets all positions for a specific user in a DLMM pool.
- [Get Positions List](./src/get-positions-list.ts)

### Add Balanced Liquidity

Adds balanced amounts of liquidity to an existing DLMM position.
- [Add Balanced Liquidity](./src/add-balanced-liquidity.ts)

### Add Imbalanced Liquidity

Adds imbalanced amounts of liquidity to an existing DLMM position.
- [Add Imbalanced Liquidity](./src/add-imbalanced-liquidity.ts)

## Usage

1. Enter your parameters into the script
	
- [Get Active Bin](./src/get-active-bin.ts)
Enter the pool address into `poolAddress`.

- [Get Positions List](./src/get-positions-list.ts)
Enter the pool address into `poolAddress` and the owner's public key into `owner`.

- [Add Balanced Liquidity](./src/add-balanced-liquidity.ts)
Enter the pool address into `poolAddress`, the amount of token X into `totalXAmount`, the existing position address into `existingPositionPubkey`, and configure the range with `minBinId` and `maxBinId`.

- [Add Imbalanced Liquidity](./src/add-imbalanced-liquidity.ts)
Enter the pool address into `poolAddress`, the amount of token X into `totalXAmount`, the amount of token Y into `totalYAmount`, the existing position address into `existingPositionPubkey`, and configure the range with `minBinId` and `maxBinId`.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dlmm-get-active-bin
	# dlmm-get-positions-list
	# dlmm-add-balanced-liquidity
	# dlmm-add-imbalanced-liquidity
	```
