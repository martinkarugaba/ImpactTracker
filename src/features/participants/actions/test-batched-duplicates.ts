// Test batched duplicate detection implementation
// This file can be used to manually test that large datasets don't hit the 1MB limit

import { detectDuplicatesBatched } from "./detect-duplicates";
import { type ParticipantFormValues } from "../components/participant-form";

// Generate test data to simulate a large import
function generateTestParticipants(count: number): ParticipantFormValues[] {
  const participants: ParticipantFormValues[] = [];

  for (let i = 0; i < count; i++) {
    participants.push({
      firstName: `TestUser${i}`,
      lastName: `LastName${i}`,
      sex: i % 2 === 0 ? "male" : "female",
      age: (20 + (i % 50)).toString(),
      dateOfBirth: `199${i % 10}-0${(i % 12) + 1}-${(i % 28) + 1}`,
      contact: `070${1000000 + i}`,
      isPWD: i % 10 === 0 ? "yes" : "no",
      isMother: "no",
      isRefugee: i % 20 === 0 ? "yes" : "no",
      project_id: "test-project-id",
      cluster_id: "test-cluster-id",
      organization_id: "test-org-id",
      country: "Uganda",
      district: `District${i % 5}`,
      subCounty: `SubCounty${i % 10}`,
      parish: `Parish${i % 15}`,
      village: `Village${i % 20}`,
      designation: "Student",
      enterprise: "Technology",
      noOfTrainings: "0",
      isActive: "yes",
      isPermanentResident: "yes",
      areParentsAlive: "yes",
      numberOfChildren: "0",
      employmentStatus: "unemployed",
      monthlyIncome: "0",
      disabilityType: "",
      wageEmploymentStatus: "",
      wageEmploymentSector: "",
      wageEmploymentScale: "",
      selfEmploymentStatus: "",
      selfEmploymentSector: "",
      businessScale: "",
      secondaryEmploymentStatus: "",
      secondaryEmploymentSector: "",
      secondaryBusinessScale: "",
      accessedLoans: "no",
      individualSaving: "no",
      groupSaving: "no",
      locationSetting: "rural",
      maritalStatus: "single",
      educationLevel: "secondary",
      sourceOfIncome: "other",
      nationality: "Ugandan",
      populationSegment: "youth",
      refugeeLocation: "",
      isActiveStudent: "no",
      isSubscribedToVSLA: "no",
      vslaName: "",
      isTeenMother: "no",
      ownsEnterprise: "no",
      enterpriseName: "",
      enterpriseSector: undefined,
      enterpriseSize: undefined,
      enterpriseYouthMale: "0",
      enterpriseYouthFemale: "0",
      enterpriseAdults: "0",
      hasVocationalSkills: "no",
      vocationalSkillsParticipations: [],
      vocationalSkillsCompletions: [],
      vocationalSkillsCertifications: [],
      hasSoftSkills: "no",
      softSkillsParticipations: [],
      softSkillsCompletions: [],
      softSkillsCertifications: [],
      hasBusinessSkills: "no",
      employmentType: undefined,
      employmentSector: undefined,
      mainChallenge: "",
      skillOfInterest: "",
      expectedImpact: "",
      isWillingToParticipate: "yes",
    });
  }

  return participants;
}

export async function testBatchedDuplicateDetection() {
  console.log("🧪 Testing Batched Duplicate Detection");

  // Test with various dataset sizes
  const testSizes = [50, 200, 500, 1000];

  for (const size of testSizes) {
    console.log(`\n📊 Testing with ${size} participants...`);

    const startTime = Date.now();
    const testData = generateTestParticipants(size);

    try {
      const result = await detectDuplicatesBatched(
        testData,
        "test-cluster-id",
        progress => {
          console.log(
            `  Progress: ${progress.percentage}% (${progress.current}/${progress.total})`
          );
        }
      );

      const endTime = Date.now();
      const duration = endTime - startTime;

      console.log(`✅ Success! Processed ${size} records in ${duration}ms`);
      console.log(`   - Exact duplicates: ${result.exactDuplicates.length}`);
      console.log(
        `   - Potential duplicates: ${result.potentialDuplicates.length}`
      );
      console.log(`   - Unique records: ${result.uniqueRecords.length}`);

      // Check that we didn't lose any records
      const totalProcessed =
        result.exactDuplicates.length +
        result.potentialDuplicates.length +
        result.uniqueRecords.length;

      if (totalProcessed !== size) {
        console.error(
          `❌ Data loss detected! Expected ${size}, got ${totalProcessed}`
        );
      }
    } catch (error) {
      console.error(`❌ Failed to process ${size} records:`, error);

      // Check if it's a payload size error
      if (error instanceof Error && error.message.includes("1 MB limit")) {
        console.error(
          "🚨 Hit the 1MB payload limit! Batching needs improvement."
        );
      }
    }
  }

  console.log("\n🎉 Batched duplicate detection test completed!");
}

// Calculate approximate payload size for debugging
export function calculatePayloadSize(
  participants: ParticipantFormValues[]
): number {
  const jsonString = JSON.stringify(participants);
  const sizeInBytes = new TextEncoder().encode(jsonString).length;
  const sizeInMB = sizeInBytes / (1024 * 1024);

  console.log(
    `📏 Payload size: ${sizeInBytes.toLocaleString()} bytes (${sizeInMB.toFixed(2)} MB)`
  );

  return sizeInBytes;
}

// Uncomment below to run manual test
// testBatchedDuplicateDetection();
