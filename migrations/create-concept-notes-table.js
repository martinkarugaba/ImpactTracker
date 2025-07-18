// Migration script to create the concept_notes table

export async function up(db) {
  // Check if the concept_notes table already exists
  const tableExists = await db.execute(`
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_name = 'concept_notes'
    );
  `);

  const exists = tableExists.rows[0].exists;

  if (!exists) {
    // Create the concept_notes table
    await db.execute(`
      CREATE TABLE concept_notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_id UUID NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        title TEXT NOT NULL,
        charge_code TEXT,
        activity_lead TEXT,
        submission_date TIMESTAMP,
        project_summary TEXT,
        methodology TEXT,
        requirements TEXT,
        participant_details TEXT,
        budget_items TEXT[],
        budget_notes TEXT,
        created_at TIMESTAMP DEFAULT now(),
        updated_at TIMESTAMP DEFAULT now()
      );
    `);

    console.log("✅ concept_notes table created successfully");
  } else {
    console.log("ℹ️ concept_notes table already exists");
  }
}

export async function down(db) {
  // Drop the concept_notes table if it exists
  await db.execute(`
    DROP TABLE IF EXISTS concept_notes;
  `);

  console.log("✅ concept_notes table dropped successfully");
}
