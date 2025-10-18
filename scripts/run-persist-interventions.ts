#!/usr/bin/env tsx

import "dotenv/config";
import { persistInterventions } from "../src/features/interventions/actions/persist-interventions";

async function main() {
  console.log("Running persistInterventions...");
  try {
    const res = await persistInterventions();
    console.log("Result:", res);
  } catch (err) {
    console.error("Error running persistInterventions:", err);
    process.exit(1);
  }
}

void main();
