# Claim and check fees

This folder contains scripts for checking and claiming unclaimed fees from locked positions in a **Meteora DAMM V1 pool**.

## Scripts

### Check Unclaimed Fees

Checks for any unclaimed fees by owner of a locked position
- [Check Fees](./src/get-locked-fees.ts)

### Claim Unclaimed Fees

Claims any unclaimed fees from a locked position
- [Claim Fees](./src/claim-locked-fees.ts)

## Usage

1. Enter your parameters into the script

- [Check Fees](./src/get-locked-fees.ts)
Enter the pool address into `poolAddress` and the owner's public key into `owner`.

- [Claim Fees](./src/claim-locked-fees.ts)
Enter the pool address into `poolAddress` and optionally enter the receiver's public key into `receiver` (defaults to owner if empty).

Note that private key is not needed for checking fees. For claiming fees, ensure your private key is set in the `.env` file.

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# damm-v1-get-locked-fees
	# damm-v1-claim-locked-fees
	```