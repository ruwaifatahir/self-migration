# Holder Batch Processor

A utility script to convert CSV holder data from BSC Scan into batch-formatted JSON files for blockchain operations.

## Overview

This tool takes a CSV file containing token holder data (downloaded directly from BSC Scan) and converts it into batches of JSON files in a format compatible with bulk transaction operations. Each batch contains up to 150 holders to manage gas costs and transaction limits.

## Requirements

- Node.js (version 12 or higher)
- A CSV file downloaded from BSC Scan (or similar format)

## How to Use

1. Download the holders CSV file directly from BSC Scan
2. Rename it to `holders.csv` and place it in the same directory as the script
3. Run the script:

```bash
node process_holders.js
```

4. The script will create a `batches` directory containing JSON files with 150 holders per batch

## Output Format

Each batch file will be formatted as an array of JSON objects:

```json
[
  {
    "recipient": "0x123...",
    "amount": "1000"
  },
  ...
]
```

Notes:

- Amounts are converted to integer strings for BigInt compatibility (decimal parts are removed)
- Batch files are named with sequential numbers (batch_001.json, batch_002.json, etc.)

## Example Usage

For a use case like airdrops or token migrations, you can process the holder data and then use the batch files to distribute tokens efficiently in smaller groups, managing gas costs and transaction limits.

## License

This utility is provided for internal use.
