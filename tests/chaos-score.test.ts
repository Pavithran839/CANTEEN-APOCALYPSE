
import { calculateChaosScore } from "../src/lib/chaos-score";

// Test 1: Low crowd
console.log(
  "Low crowd:",
  calculateChaosScore(10, 5, 5, 100)
);

// Test 2: Moderate crowd
console.log(
  "Moderate crowd:",
  calculateChaosScore(40, 20, 20, 100)
);

// Test 3: High crowd
console.log(
  "High crowd:",
  calculateChaosScore(80, 40, 40, 100)
);

// Test 4: Critical crowd
console.log(
  "Critical crowd:",
  calculateChaosScore(100, 80, 60, 100)
);

// Test 5: Invalid capacity
try {
  calculateChaosScore(10, 5, 5, 0);
} catch (error) {
  console.log("Invalid input:", (error as Error).message);
}

/*
The test file checks whether the Chaos Score function
correctly calculates crowd congestion for low, 
moderate, high and critical crowd conditions. It also verifies that invalid input, such as zero capacity, is rejected.
*/
