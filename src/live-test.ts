
import readline from "node:readline";
import { calculateChaosScore } from "./lib/chaos-score";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Ask for a number from the user
function askNumber(question: string): Promise<number> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(Number(answer));
    });
  });
}

// Classify the crowd based on its Chaos Score
function getCrowdStatus(score: number): string {
  if (score <= 25) return "LOW";
  if (score <= 50) return "MODERATE";
  if (score <= 75) return "HIGH";
  return "CRITICAL";
}

async function startLiveTest() {
  console.log("\n===== CANTEEN APOCALYPSE =====");
  console.log("     LIVE CHAOS SCORE TEST");
  console.log("==============================\n");

  try {
    const capacity = await askNumber("Enter canteen capacity: ");
    const peopleCount = await askNumber("Enter current people count: ");
    const queueLength = await askNumber("Enter queue length: ");
    const waitTime = await askNumber("Enter waiting time (minutes): ");

    const chaosScore = calculateChaosScore(
      peopleCount,
      queueLength,
      waitTime,
      capacity
    );

    console.log("\n========== RESULTS ==========");
    console.log(`CHAOS SCORE: ${chaosScore} / 100`);
    console.log(`CROWD STATUS: ${getCrowdStatus(chaosScore)}`);
    console.log("=============================\n");
  } catch (error) {
    console.log("\nError:", (error as Error).message);
  } finally {
    rl.close();
  }
}

startLiveTest();

//accepts user inputs and calculates the crowd status using the weighted formula.
