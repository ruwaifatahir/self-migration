const fs = require("fs");
const path = require("path");
const { parseEther } = require("viem");

// Step 1: Read and process the CSV file
process.stdout.write("Reading CSV file...\n");
const csvFile = path.join(__dirname, "holders.csv");
const csvData = fs.readFileSync(csvFile, "utf8");

// Parse the CSV data
const lines = csvData.split("\n");
const holders = [];

// Process each line (skip header)
for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;

  // Split by comma but respect quotes
  const match = line.match(/("([^"]*)"|([^,]*))(,|$)/g);
  if (!match) continue;

  const values = match.map((m) => m.replace(/[",\n\r]/g, ""));

  if (values[0]) {
    try {
      // Remove commas from the number
      const cleanAmount = values[1].replace(/,/g, "");

      // Use viem to convert to wei
      const weiAmount = parseEther(cleanAmount).toString();

      holders.push({
        recipient: values[0],
        amount: weiAmount,
      });
    } catch (error) {
      process.stdout.write(
        `Warning: Could not convert amount for ${values[0]}: ${values[1]}\n`
      );
      process.stdout.write(`Error: ${error.message}\n`);

      // Add with zero amount as fallback
      holders.push({
        recipient: values[0],
        amount: "0",
      });
    }
  }
}

process.stdout.write(`Processed ${holders.length} holders from CSV\n`);

// Step 2: Create batches directly (skip creating holders.json)
// Create output directory if it doesn't exist
const batchesDir = path.join(__dirname, "batches");
if (!fs.existsSync(batchesDir)) {
  fs.mkdirSync(batchesDir);
  process.stdout.write(`Created batches directory: ${batchesDir}\n`);
}

// Define batch size
const BATCH_SIZE = 150;

// Calculate total number of batches
const totalBatches = Math.ceil(holders.length / BATCH_SIZE);

// Create batches
process.stdout.write(`Creating ${totalBatches} batches...\n`);
for (let i = 0; i < totalBatches; i++) {
  // Get holders for this batch
  const startIndex = i * BATCH_SIZE;
  const endIndex = Math.min((i + 1) * BATCH_SIZE, holders.length);
  const batchHolders = holders.slice(startIndex, endIndex);

  // Create filename with leading zeros for proper sorting
  const batchNumber = (i + 1).toString().padStart(3, "0");
  const batchFile = path.join(batchesDir, `batch_${batchNumber}.json`);

  // Write the batch file
  fs.writeFileSync(batchFile, JSON.stringify(batchHolders, null, 2));

  // Log progress for larger processes
  if (i % 5 === 0 || i === totalBatches - 1) {
    process.stdout.write(`  Batch ${i + 1}/${totalBatches} created\n`);
  }
}

// Make sure this is displayed
process.stdout.write("\n===== SUMMARY =====\n");
process.stdout.write(
  `Process complete: ${holders.length} holders split into ${totalBatches} batches of ${BATCH_SIZE} each\n`
);
process.stdout.write(`- All amounts converted to wei using viem\n`);
process.stdout.write(`- Batch files saved in: batches/batch_XXX.json\n`);
process.stdout.write("===================\n");

// Force output to be flushed
process.stdout.write("Done!\n");
