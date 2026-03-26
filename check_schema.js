const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.zstumrcwdviguuwpfuwt:SuperStrongP@ss123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT column_name, table_name 
    FROM information_schema.columns 
    WHERE table_name IN ('project', 'course', 'user_account', 'lecturer')
  `);
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

run().catch(console.error);
