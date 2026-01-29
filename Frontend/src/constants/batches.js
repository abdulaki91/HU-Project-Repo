// Generate batch years dynamically based on current year
const generateBatches = () => {
  const currentYear = new Date().getFullYear();
  const batches = [];

  // Generate batches from current year - 3 to current year + 5
  for (let year = currentYear - 3; year <= currentYear + 5; year++) {
    batches.push(year.toString());
  }

  return batches.sort((a, b) => b - a); // Sort in descending order (newest first)
};

export const batches = generateBatches();

export default batches;
