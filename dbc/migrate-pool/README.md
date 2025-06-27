## DBC Migrate Pool

## Scripts

### Migrate to DAMM V1

Migrates a Dynamic Bonding Curve pool which has hit its migration quote threshold to DAMM V1.
- [Migrate to DAMM V1](./src/migrate-to-damm-v1.ts)

### Migrate to DAMM V2

Migrates a Dynamic Bonding Curve pool which has hit its migration quote threshold to DAMM V2.
- [Migrate to DAMM V2](./src/migrate-to-damm-v2.ts)

## Usage

1. Enter your parameters into the script
	
- [Migrate to DAMM V1](./src/migrate-to-damm-v1.ts)
Enter the base mint address into the `baseMint` variable. 

- [Migrate to DAMM V2](./src/migrate-to-damm-v2.ts)
Enter the base mint address into the `baseMint` variable. 

2. Run the script
	```bash
	npm run <script-name>
	
	# Script names
	# dbc-migrate-to-damm-v1
	# dbc-migrate-to-damm-v2
	``` 