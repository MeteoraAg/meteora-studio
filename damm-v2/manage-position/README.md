# DAMM V2 Manage Position

This folder contains scripts for managing positions in **Meteora DAMM V2 pools**.

## Scripts

### Create Position

Creates a new position in a DAMM V2 pool
- [Create Position](./src/create-position.ts)

### Get Positions

Retrieves all positions for a user in a specific pool
- [Get Positions](./src/get-positions.ts)

### Lock Position

Locks an existing position with a vesting schedule
- [Lock Position](./src/lock-position.ts)

### Withdraw Liquidity

Removes liquidity from a position in a DAMM V2 pool
- [Withdraw Liquidity](./src/withdraw-liquidity.ts)

## Usage

1. Enter your parameters into the script

- [Create Position](./src/create-position.ts)
Enter the pool address into `poolAddress`, the amount of token A into `tokenAAmount` and token B into `tokenBAmount`, and the decimal places into `tokenADecimals` and `tokenBDecimals`.

- [Get Positions](./src/get-positions.ts)
Enter the pool address into `poolAddress` and the user wallet address into `userWallet`.

- [Lock Position](./src/lock-position.ts)
Enter the pool address into `poolAddress`, the position owner's address into `positionOwner`, the position address to lock into `positionToLock`, and the lock period in seconds into `lockPeriodInSeconds`.

- [Withdraw Liquidity](./src/withdraw-liquidity.ts)
Enter the pool address into `poolAddress`, the position address into `positionAddress`, and the amount of liquidity tokens to withdraw into `liquidityTokenAmount`.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# damm-v2-create-position
	# damm-v2-get-positions
	# damm-v2-lock-position
	# damm-v2-withdraw-liquidity
	```
