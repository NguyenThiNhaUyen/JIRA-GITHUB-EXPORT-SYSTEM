const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.zstumrcwdviguuwpfuwt:SuperStrongP@ss123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();
  const res = await client.query(`
    SELECT c.course_code, p.course_id, COUNT(p.id) as project_count
    FROM project p
    JOIN course c ON c.id = p.course_id
    GROUP BY c.course_code, p.course_id;
  `);
  console.log(res.rows);
  
  const courses = await client.query('SELECT course_code, id FROM course;');
  console.log("All courses:");
  console.log(courses.rows);
  await client.end();
}

run().catch(console.error);
