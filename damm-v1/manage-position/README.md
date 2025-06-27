## DAMM V1 Manage Position

## Scripts

### Create Position

Creates a balanced position in a DAMM V1 pool
- [Create DAMM V1 Position](./src/create-position.ts)

### Withdraw Liquidity

Removes liquidity from a position in a DAMM V1 pool
- [Withdraw Liquidity](./src/withdraw-liquidity.ts)

## Usage

1. Enter your parameters into the script
	
- [Create DAMM V1 Position](./src/create-position.ts)
Enter the pool address into `poolAddress`, the slippage tolerance in percent and the amount of token A to be deposited.

- [Withdraw Liquidity](./src/withdraw-liquidity.ts)
Enter the pool address into `poolAddress`, the slippage tolerance in percent and the amount of LP tokens to be withdrawn.

	Alternatively, if you want to withdraw a fraction of or all your LP, uncomment or paste this code into the script after `amm` is defined
	```typescript
	const LpBalance = await amm.getUserBalance(payer.publicKey);
	const poolTokenAmount = LpBalance.toNumber()/10**amm.decimals
	```

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# damm-v1-create-position
	# damm-v1-withdraw-liquidity
	```

