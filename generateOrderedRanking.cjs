#!/usr/bin/env node
/**
 * Generate ordered ranking file with pattern: 3 easy, 2 medium, 2 hard (repeated)
 * Randomly selects puzzles from each difficulty category
 *
 * Usage:
 *   node generateOrderedRanking.cjs [inputFile] [outputFile]
 */
const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const inputPath = args[0]
  ? path.join(__dirname, args[0])
  : path.join(__dirname, "public/NewRanking.txt");
const outputPath = args[1]
  ? path.join(__dirname, args[1])
  : path.join(__dirname, "public/OrderedRanking.txt");

/**
 * Parse the ranking file
 * Each line: 64 numbers (grid) + 1 ranking number
 */
function parseRankingFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");

  return lines.map((line, index) => {
    const numbers = line.trim().split(/\s+/).map(Number);
    return {
      grid: numbers.slice(0, 64),
      ranking: numbers[64],
      originalLine: line.trim(),
      originalIndex: index + 1, // 1-based index for the original puzzle number
    };
  });
}

/**
 * Categorize puzzles by difficulty
 * These thresholds match the game's Shape.ts definition:
 * Easy: rankings >= 14
 * Medium: rankings 7-13
 * Hard: rankings < 7 (1-6)
 */
function categorizePuzzles(puzzles) {
  const easy = [];
  const medium = [];
  const hard = [];

  for (const puzzle of puzzles) {
    if (puzzle.ranking >= 14) {
      easy.push(puzzle);
    } else if (puzzle.ranking >= 7) {
      medium.push(puzzle);
    } else {
      hard.push(puzzle);
    }
  }

  return { easy, medium, hard };
}

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Generate ordered list following pattern: 3 easy, 2 medium, 2 hard (repeated)
 */
function generateOrderedList(categories) {
  const { easy, medium, hard } = categories;

  // Shuffle each category
  const shuffledEasy = shuffleArray(easy);
  const shuffledMedium = shuffleArray(medium);
  const shuffledHard = shuffleArray(hard);

  const result = [];
  let easyIdx = 0;
  let mediumIdx = 0;
  let hardIdx = 0;

  // Pattern: 3 easy, 2 medium, 2 hard
  const pattern = [
    { category: "easy", count: 3 },
    { category: "medium", count: 2 },
    { category: "hard", count: 2 },
  ];

  // Keep cycling through the pattern until we run out of puzzles
  let patternIdx = 0;
  let currentPatternItem = 0;

  while (
    easyIdx < shuffledEasy.length ||
    mediumIdx < shuffledMedium.length ||
    hardIdx < shuffledHard.length
  ) {
    const { category, count } = pattern[patternIdx];
    let added = 0;

    // Try to add 'count' puzzles from the current category
    if (category === "easy" && easyIdx < shuffledEasy.length) {
      const toAdd = Math.min(count, shuffledEasy.length - easyIdx);
      for (let i = 0; i < toAdd; i++) {
        result.push(shuffledEasy[easyIdx++]);
        added++;
      }
    } else if (category === "medium" && mediumIdx < shuffledMedium.length) {
      const toAdd = Math.min(count, shuffledMedium.length - mediumIdx);
      for (let i = 0; i < toAdd; i++) {
        result.push(shuffledMedium[mediumIdx++]);
        added++;
      }
    } else if (category === "hard" && hardIdx < shuffledHard.length) {
      const toAdd = Math.min(count, shuffledHard.length - hardIdx);
      for (let i = 0; i < toAdd; i++) {
        result.push(shuffledHard[hardIdx++]);
        added++;
      }
    }

    // Move to next pattern item
    patternIdx = (patternIdx + 1) % pattern.length;
  }

  return result;
}

// Main execution
console.log("🎲 Ordered Ranking Generator");
console.log("===================================\n");
console.log("📋 Pattern: 3 easy, 2 medium, 2 hard (repeated)");
console.log("🎰 Randomly selecting from each category\n");
console.log("Reading puzzles from:", inputPath);

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error("❌ Error: Input file not found:", inputPath);
  process.exit(1);
}

const puzzles = parseRankingFile(inputPath);
console.log(`✓ Loaded ${puzzles.length} puzzles\n`);

console.log("Categorizing by difficulty...");
const categories = categorizePuzzles(puzzles);
console.log(`  Easy (14-20):   ${categories.easy.length} puzzles`);
console.log(`  Medium (7-13):  ${categories.medium.length} puzzles`);
console.log(`  Hard (1-6):     ${categories.hard.length} puzzles\n`);

console.log("Generating ordered list...");
const orderedPuzzles = generateOrderedList(categories);
console.log(`✓ Generated ${orderedPuzzles.length} ordered puzzles\n`);

console.log("Writing to:", outputPath);
const lines = orderedPuzzles.map((puzzle) => {
  // Append the original puzzle index to the end of each line
  return `${puzzle.originalLine} ${puzzle.originalIndex}`;
});
fs.writeFileSync(outputPath, lines.join("\n") + "\n", "utf-8");

console.log("✓ File written successfully\n");
console.log("===================================");
console.log("✨ Done! Generated ordered ranking file");
console.log("📄 Output:", outputPath);
console.log("===================================\n");

// Show pattern verification (first 21 puzzles)
console.log("Pattern verification (first 21 puzzles):");
const previewCount = Math.min(21, orderedPuzzles.length);
for (let i = 0; i < previewCount; i++) {
  const puzzle = orderedPuzzles[i];
  let difficulty = "Easy  ";
  if (puzzle.ranking < 7) difficulty = "Hard  ";
  else if (puzzle.ranking < 14) difficulty = "Medium";

  console.log(
    `  ${String(i + 1).padStart(2)}: ${difficulty} (rank ${puzzle.ranking}, puzzle #${puzzle.originalIndex})`
  );
}
