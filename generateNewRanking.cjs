#!/usr/bin/env node
/**
 * Generate improved symmetry-based rankings from a ranking file
 *
 * FEATURES:
 * - Outlier detection: Identifies tiles far from the main cluster
 * - Robust scoring: Calculates symmetry/compactness with and without outliers
 * - Pattern recognition: Detects common shapes (rectangles, lines, L-shapes, etc.)
 * - Better difficulty assessment: Shapes with outliers are ranked harder
 *
 * Usage:
 *   node generateNewRanking.cjs [inputFile] [outputFile]
 */
const fs = require("fs");
const path = require("path");

// Parse command line arguments
const args = process.argv.slice(2);
const inputPath = args[0]
  ? path.join(__dirname, args[0])
  : path.join(__dirname, "public/8x8squaresNumb.txt");
const outputPath = args[1]
  ? path.join(__dirname, args[1])
  : path.join(__dirname, "public/NewRanking.txt");

// Parse shape data
// Supports two formats:
// - 64 numbers: just the 8x8 grid tiles (no ranking)
// - 65 numbers: 64 grid tiles + ranking at the end
function parseRankingFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.trim().split("\n");

  return lines.map((line) => {
    const numbers = line.trim().split(/\s+/).map(Number);

    // Detect format based on number count
    const hasRanking = numbers.length === 65;

    return {
      tiles: numbers.slice(0, 8),
      allNumbers: hasRanking ? numbers.slice(0, -1) : numbers,
      originalRanking: hasRanking ? numbers[numbers.length - 1] : null,
    };
  });
}

// Convert tile number to coordinates
function tileToCoords(tile) {
  return {
    row: Math.floor(tile / 8),
    col: tile % 8,
  };
}

// Convert coordinates to tile number
function coordsToTile(row, col) {
  return row * 8 + col;
}

// Calculate Euclidean distance between two coordinates
function distance(coord1, coord2) {
  const dr = coord1.row - coord2.row;
  const dc = coord1.col - coord2.col;
  return Math.sqrt(dr * dr + dc * dc);
}

// Calculate center of mass
function calculateCenter(tiles) {
  const coords = tiles.map(tileToCoords);
  const avgRow = coords.reduce((sum, c) => sum + c.row, 0) / coords.length;
  const avgCol = coords.reduce((sum, c) => sum + c.col, 0) / coords.length;
  return { row: avgRow, col: avgCol };
}

// Detect outlier tiles (tiles far from the main cluster)
function detectOutliers(tiles) {
  if (tiles.length <= 3) return { outliers: [], core: tiles };

  const coords = tiles.map(tileToCoords);

  // Calculate pairwise distances
  const distances = [];
  for (let i = 0; i < coords.length; i++) {
    let totalDist = 0;
    for (let j = 0; j < coords.length; j++) {
      if (i !== j) {
        totalDist += distance(coords[i], coords[j]);
      }
    }
    distances.push({
      tile: tiles[i],
      avgDistance: totalDist / (coords.length - 1),
    });
  }

  // Sort by average distance
  distances.sort((a, b) => b.avgDistance - a.avgDistance);

  // A tile is an outlier if its average distance is significantly larger than the median
  const medianDist = distances[Math.floor(distances.length / 2)].avgDistance;
  const threshold = medianDist * 1.8; // Tiles 1.8x farther than median are outliers

  const outliers = distances
    .filter((d) => d.avgDistance > threshold)
    .map((d) => d.tile);

  // Limit outliers to at most 2 tiles (if more than 2 are far, the shape is just scattered)
  const maxOutliers = Math.min(2, Math.floor(tiles.length * 0.25));
  const actualOutliers = outliers.slice(0, maxOutliers);

  const core = tiles.filter((t) => !actualOutliers.includes(t));

  return { outliers: actualOutliers, core };
}

// Check if tiles form a rectangle
function isRectangle(tiles) {
  if (tiles.length < 4) return false;

  const coords = tiles.map(tileToCoords);
  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));

  const expectedTiles = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  return expectedTiles === tiles.length;
}

// Check if tiles form a straight line
function isStraightLine(tiles) {
  const coords = tiles.map(tileToCoords);
  const rows = [...new Set(coords.map((c) => c.row))];
  const cols = [...new Set(coords.map((c) => c.col))];

  return rows.length === 1 || cols.length === 1;
}

// Calculate compactness score
function calculateCompactness(tiles) {
  if (tiles.length === 0) return 0;

  const coords = tiles.map(tileToCoords);
  const minRow = Math.min(...coords.map((c) => c.row));
  const maxRow = Math.max(...coords.map((c) => c.row));
  const minCol = Math.min(...coords.map((c) => c.col));
  const maxCol = Math.max(...coords.map((c) => c.col));

  const boundingBoxArea = (maxRow - minRow + 1) * (maxCol - minCol + 1);
  return tiles.length / boundingBoxArea;
}

// Check horizontal symmetry
function checkHorizontalSymmetry(tiles) {
  const coords = tiles.map(tileToCoords);
  const center = calculateCenter(tiles);

  let symmetryScore = 0;
  const tileSet = new Set(tiles);

  for (const coord of coords) {
    const mirroredCol = 2 * center.col - coord.col;
    const mirroredTile = coordsToTile(coord.row, Math.round(mirroredCol));

    if (tileSet.has(mirroredTile)) {
      symmetryScore++;
    }
  }

  return symmetryScore / tiles.length;
}

// Check horizontal symmetry for a value grid (checks if values are mirrored)
function checkHorizontalSymmetryGrid(grid) {
  let matches = 0;
  let total = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 4; col++) {
      // Check left vs right
      const leftIdx = row * 8 + col;
      const rightIdx = row * 8 + (7 - col);
      if (grid[leftIdx] === grid[rightIdx]) {
        matches++;
      }
      total++;
    }
  }

  return matches / total;
}

// Check vertical symmetry
function checkVerticalSymmetry(tiles) {
  const coords = tiles.map(tileToCoords);
  const center = calculateCenter(tiles);

  let symmetryScore = 0;
  const tileSet = new Set(tiles);

  for (const coord of coords) {
    const mirroredRow = 2 * center.row - coord.row;
    const mirroredTile = coordsToTile(Math.round(mirroredRow), coord.col);

    if (tileSet.has(mirroredTile)) {
      symmetryScore++;
    }
  }

  return symmetryScore / tiles.length;
}

// Check vertical symmetry for a value grid (checks if values are mirrored)
function checkVerticalSymmetryGrid(grid) {
  let matches = 0;
  let total = 0;

  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 8; col++) {
      // Check top vs bottom
      const topIdx = row * 8 + col;
      const bottomIdx = (7 - row) * 8 + col;
      if (grid[topIdx] === grid[bottomIdx]) {
        matches++;
      }
      total++;
    }
  }

  return matches / total;
}

// Check diagonal symmetry
function checkDiagonalSymmetry(tiles) {
  const coords = tiles.map(tileToCoords);
  const center = calculateCenter(tiles);

  let symmetryScore = 0;
  const tileSet = new Set(tiles);

  for (const coord of coords) {
    const deltaRow = coord.row - center.row;
    const deltaCol = coord.col - center.col;
    const mirroredRow = center.row + deltaCol;
    const mirroredCol = center.col + deltaRow;
    const mirroredTile = coordsToTile(
      Math.round(mirroredRow),
      Math.round(mirroredCol)
    );

    if (tileSet.has(mirroredTile)) {
      symmetryScore++;
    }
  }

  return symmetryScore / tiles.length;
}

// Check diagonal symmetry for a value grid (transpose)
function checkDiagonalSymmetryGrid(grid) {
  let matches = 0;
  let total = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (row < col) {
        // Only check upper triangle to avoid double counting
        const idx1 = row * 8 + col;
        const idx2 = col * 8 + row;
        if (grid[idx1] === grid[idx2]) {
          matches++;
        }
        total++;
      }
    }
  }

  return total > 0 ? matches / total : 0;
}

// Check anti-diagonal symmetry
function checkAntiDiagonalSymmetry(tiles) {
  const coords = tiles.map(tileToCoords);
  const center = calculateCenter(tiles);

  let symmetryScore = 0;
  const tileSet = new Set(tiles);

  for (const coord of coords) {
    const deltaRow = coord.row - center.row;
    const deltaCol = coord.col - center.col;
    const mirroredRow = center.row - deltaCol;
    const mirroredCol = center.col - deltaRow;
    const mirroredTile = coordsToTile(
      Math.round(mirroredRow),
      Math.round(mirroredCol)
    );

    if (tileSet.has(mirroredTile)) {
      symmetryScore++;
    }
  }

  return symmetryScore / tiles.length;
}

// Check anti-diagonal symmetry for a value grid
function checkAntiDiagonalSymmetryGrid(grid) {
  let matches = 0;
  let total = 0;

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      if (row + col < 7) {
        // Only check lower-left triangle
        const idx1 = row * 8 + col;
        const idx2 = (7 - col) * 8 + (7 - row);
        if (grid[idx1] === grid[idx2]) {
          matches++;
        }
        total++;
      }
    }
  }

  return total > 0 ? matches / total : 0;
}

// Check 180-degree rotational symmetry
function checkRotationalSymmetry(tiles) {
  const coords = tiles.map(tileToCoords);
  const center = calculateCenter(tiles);

  let symmetryScore = 0;
  const tileSet = new Set(tiles);

  for (const coord of coords) {
    const rotatedRow = 2 * center.row - coord.row;
    const rotatedCol = 2 * center.col - coord.col;
    const rotatedTile = coordsToTile(
      Math.round(rotatedRow),
      Math.round(rotatedCol)
    );

    if (tileSet.has(rotatedTile)) {
      symmetryScore++;
    }
  }

  return symmetryScore / tiles.length;
}

// Check 180-degree rotational symmetry for a value grid
function checkRotationalSymmetryGrid(grid) {
  let matches = 0;
  let total = 0;

  for (let i = 0; i < 32; i++) {
    // Check first half vs second half (rotated)
    const oppositeIdx = 63 - i;
    if (grid[i] === grid[oppositeIdx]) {
      matches++;
    }
    total++;
  }

  return matches / total;
}

// Calculate symmetry score for a set of tiles
function calculateSymmetryForTiles(tiles) {
  if (tiles.length === 0) return 0;

  const horizontal = checkHorizontalSymmetry(tiles);
  const vertical = checkVerticalSymmetry(tiles);
  const diagonal = checkDiagonalSymmetry(tiles);
  const antiDiagonal = checkAntiDiagonalSymmetry(tiles);
  const rotational = checkRotationalSymmetry(tiles);

  return Math.max(horizontal, vertical, diagonal, antiDiagonal, rotational);
}

// Calculate symmetry score for the entire grid (checks value patterns)
function calculateGridSymmetry(grid) {
  if (!grid || grid.length !== 64) return 0;

  const horizontal = checkHorizontalSymmetryGrid(grid);
  const vertical = checkVerticalSymmetryGrid(grid);
  const diagonal = checkDiagonalSymmetryGrid(grid);
  const antiDiagonal = checkAntiDiagonalSymmetryGrid(grid);
  const rotational = checkRotationalSymmetryGrid(grid);

  return Math.max(horizontal, vertical, diagonal, antiDiagonal, rotational);
}

// NEW IMPROVED SCORING ALGORITHM
function calculateImprovedScore(tiles, allTiles) {
  // Step 1: Detect outliers in the first 8 tiles (primary shape)
  const { outliers, core } = detectOutliers(tiles);

  // Step 2: Calculate scores for core tiles
  const coreSymmetry = calculateSymmetryForTiles(core);
  const coreCompactness = calculateCompactness(core);
  const coreScore = coreSymmetry * 0.7 + coreCompactness * 0.3;

  // Step 3: Pattern bonuses for core
  let patternBonus = 0;
  if (isRectangle(core)) {
    patternBonus = 0.15; // Rectangles are very easy
  } else if (isStraightLine(core)) {
    patternBonus = 0.1; // Lines are easy
  }

  // Step 4: Outlier penalty
  const outlierPenalty = outliers.length * 0.15; // Each outlier makes it harder

  // Step 5: If no outliers, also consider full shape symmetry
  let fullShapeBonus = 0;
  if (outliers.length === 0) {
    const fullSymmetry = calculateSymmetryForTiles(tiles);
    const fullCompactness = calculateCompactness(tiles);
    fullShapeBonus = (fullSymmetry * 0.7 + fullCompactness * 0.3) * 0.1;
  }

  // Step 6: Consider the symmetry of the entire puzzle solution (all 64 tiles)
  // This rewards solutions where the overall grid pattern is symmetrical
  const gridSymmetry = calculateGridSymmetry(allTiles);
  const gridBonus = gridSymmetry * 0.2; // Significant bonus for symmetrical full grids

  // Final score: prioritize core shape quality, penalize outliers, bonus for grid symmetry
  const finalScore = Math.max(
    0,
    Math.min(
      1,
      coreScore + patternBonus + fullShapeBonus - outlierPenalty + gridBonus
    )
  );

  return finalScore;
}

// Assign new rankings
function assignNewRankings(shapes) {
  const shapesWithScores = shapes.map((shape) => ({
    tiles: shape.tiles,
    allNumbers: shape.allNumbers,
    score: calculateImprovedScore(shape.tiles, shape.allNumbers),
  }));

  // Sort by score (descending)
  shapesWithScores.sort((a, b) => b.score - a.score);

  const maxRanking = 20;
  const minRanking = 1;
  const rangeRanking = maxRanking - minRanking;

  return shapesWithScores.map((shape, index) => {
    const percentile = 1 - index / (shapesWithScores.length - 1);
    const ranking = Math.round(minRanking + percentile * rangeRanking);

    return {
      tiles: shape.tiles,
      allNumbers: shape.allNumbers,
      ranking: ranking,
    };
  });
}

// Main execution
console.log("📊 Symmetry-Based Ranking Generator");
console.log("===================================\n");
console.log("✨ FEATURES:");
console.log("  • Outlier detection for robust scoring");
console.log("  • Pattern recognition (rectangles, lines, etc.)");
console.log("  • Better handling of shapes with 1-2 misplaced tiles\n");
console.log("Reading shapes from:", inputPath);

// Check if input file exists
if (!fs.existsSync(inputPath)) {
  console.error("❌ Error: Input file not found:", inputPath);
  process.exit(1);
}

const shapes = parseRankingFile(inputPath);
const hasOriginalRanking =
  shapes.length > 0 && shapes[0].originalRanking !== null;
console.log(`✓ Loaded ${shapes.length} shapes`);
console.log(
  `  Format: ${
    hasOriginalRanking ? "65 numbers (with ranking)" : "64 numbers (no ranking)"
  }\n`
);

console.log("Calculating improved rankings...");
const rankedShapes = assignNewRankings(shapes);
console.log("✓ Rankings calculated\n");

console.log("Writing new rankings to:", outputPath);
const lines = rankedShapes.map((shape) => {
  const allNumbersStr = shape.allNumbers.join(" ");
  return `${allNumbersStr} ${shape.ranking}`;
});

fs.writeFileSync(outputPath, lines.join("\n") + "\n", "utf-8");

console.log("✓ File written successfully\n");
console.log("===================================");
console.log("✨ Done! Generated", rankedShapes.length, "ranked shapes");
console.log("📄 Output:", outputPath);
console.log("===================================\n");

// Show statistics
const rankingCounts = {};
rankedShapes.forEach((shape) => {
  rankingCounts[shape.ranking] = (rankingCounts[shape.ranking] || 0) + 1;
});

console.log("Ranking distribution:");
Object.keys(rankingCounts)
  .sort((a, b) => Number(b) - Number(a))
  .forEach((rank) => {
    console.log(`  Rank ${rank}: ${rankingCounts[rank]} shapes`);
  });
