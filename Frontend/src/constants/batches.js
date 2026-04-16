// Generate batch years dynamically based on current year
const generateBatches = () => {
  const currentYear = new Date().getFullYear();
  const batches = [];

  // Generate batches from current year - 3 to current year + 5
  for (let year = currentYear - 3; year <= currentYear + 5; year++) {
    batches.push({
      value: year.toString(),
      label: year.toString(),
    });
  }

  return batches.sort((a, b) => b.value - a.value); // Sort in descending order (newest first)
};

export const BATCHES = generateBatches();
export const batches = BATCHES.map((batch) => batch.value); // Keep backward compatibility

export default BATCHES;
