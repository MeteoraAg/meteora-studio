## DBC Swap

## Scripts

### Swap Quote

Gets a quote for swapping tokens in a Dynamic Bonding Curve pool, showing expected output amount, fees, and price impact.
- [Swap Quote](./src/swap-quote.ts)

### Swap Buy

Executes a swap transaction to buy or sell tokens in a Dynamic Bonding Curve pool.
- [Swap Buy](./src/swap-buy.ts)

## Usage

1. Enter your parameters into the script
	
- [Swap Quote](./src/swap-quote.ts)
Enter the base mint address into `baseMint`, the amount to swap in `amountIn`, and set `swapBaseForQuote` to true to get a quote for selling the launched token.
Note that `amountIn` when buying the token or the output amount when selling the token is all in terms of the quote mint which is defined in the config key used to launch the pool.

- [Swap Buy](./src/swap-buy.ts)
Enter the base mint address into `baseMint`, the amount to swap in `amountIn`, set `minimumAmountOut` to set the amount of slippage you are willing to accept, and set `swapBaseForQuote` to true to sell the launched token.
Note that `amountIn` when buying the token or the output amount when selling the token is all in terms of the quote mint which is defined in the config key used to launch the pool.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dbc-swap-quote
	# dbc-swap-buy
	```
