const { Client } = require('pg');
const fs = require('fs');

const envPath = '../enfysync_backend/.env';
if (!fs.existsSync(envPath)) {
    console.log("No backend env found");
    process.exit(1);
}

const env = fs.readFileSync(envPath, 'utf8').split('\n').find(l => l.startsWith('DATABASE_URL='));
const dbUrl = env.split('=')[1].trim().replace(/['"]/g, '');

async function run() {
    const client = new Client({ connectionString: dbUrl });
    await client.connect();

    // Check recent jobs
    const jobs = await client.query(`
        SELECT id, job_code, submission_done, submission_required
        FROM jobs 
        ORDER BY created_at DESC 
        LIMIT 5
    `);
    console.log("Jobs in DB:", jobs.rows);

    // Check recruiter submissions count per job
    const subs = await client.query(`
        SELECT job_id, COUNT(*) as actual_subs
        FROM recruiter_submissions
        GROUP BY job_id
    `);
    console.log("Actual submission counts:", subs.rows);

    await client.end();
}
run().catch(console.error);
