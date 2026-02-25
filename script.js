const { Client } = require('pg');
const fs = require('fs');

const envPath = '../enfysync_backend/.env';
if (!fs.existsSync(envPath)) {
    console.log("No backend .env found");
    process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8').split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = env.split('=')[1].trim().replace(/['"]/g, '');

async function run() {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    // Check recruiter submissions count per job
    const subs = await client.query(`
        SELECT job_id, COUNT(*) as actual_subs
        FROM recruiter_submissions
        GROUP BY job_id
    `);

    console.log("Found actual submissions:");
    for (const r of subs.rows) {
        // Find the job code
        const job = await client.query(`SELECT job_code, submission_done FROM jobs WHERE id = $1`, [r.job_id]);
        if (job.rows.length > 0) {
            console.log(`Job: ${job.rows[0].job_code}, DB submission_done: ${job.rows[0].submission_done}, Actual computed count: ${r.actual_subs}`);
            // Let's backfill it!
            await client.query(`UPDATE jobs SET submission_done = $1 WHERE id = $2`, [parseInt(r.actual_subs), r.job_id]);
        }
    }

    console.log("Backfill complete.");
    await client.end();
}
run().catch(console.error);
