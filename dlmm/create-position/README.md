## DLMM Create Position

## Scripts

### Create Balanced Position

Creates a DLMM position with balanced amounts of both tokens.
- [Create Balanced Position](./src/create-balanced-position.ts)

### Create Imbalanced Position

Creates a DLMM position with imbalanced amounts of tokens.
- [Create Imbalanced Position](./src/create-imbalanced-position.ts)

## Usage

1. Enter your parameters into the script
	
- [Create Balanced Position](./src/create-balanced-position.ts)
Enter the pool address into `poolAddress`, the amount of token X into `XAmount`. Configure the range liquidity will be deployed on both sides of the active bin with `totalRangeInterval` and change `strategyType` to change the distribution of liquidity.

- [Create Imbalanced Position](./src/create-imbalanced-position.ts)
Enter the pool address into `poolAddress`, the amount of token X into `XAmount`, the amount of token Y into `YAmount`. Configure the range liquidity will be deployed on both sides of the active bin with `totalRangeInterval` and change `strategyType` to change the distribution of liquidity.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dlmm-create-balanced-position
	# dlmm-create-imbalanced-position
	```