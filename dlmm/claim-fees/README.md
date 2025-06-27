## DLMM Claim Fees

## Scripts

### Get Position Fees

Checks for any unclaimed swap fees and rewards from a DLMM position.
- [Get Position Fees](./src/get-position-fees.ts)

### Claim Position Fees

Claims any unclaimed swap fees from a DLMM position.
- [Claim Position Fees](./src/claim-position-fees.ts)

## Usage

1. Enter your parameters into the script
	
- [Get Position Fees](./src/get-position-fees.ts)
Enter the pool address into `poolAddress`, the position address into `positionAddress`, and the owner's public key into `ownerPublicKey`.

- [Claim Position Fees](./src/claim-position-fees.ts)
Enter the pool address into `poolAddress` and the position address into `positionAddress`.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dlmm-get-position-fees
	# dlmm-claim-position-fees
	```
