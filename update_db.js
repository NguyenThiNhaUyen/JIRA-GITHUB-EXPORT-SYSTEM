const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres.zstumrcwdviguuwpfuwt:SuperStrongP@ss123@aws-1-ap-south-1.pooler.supabase.com:5432/postgres'
});

async function run() {
  await client.connect();

  console.log("Updating semesters...");
  // Semester Update
  // NOTE: semesters.name có unique constraint, nên không được cycle lại một danh sách ngắn.
  // Sinh tên theo quy tắc SPRING/SUMMER/FALL lùi theo năm để đảm bảo unique cho mọi số lượng records.
  const semestersRes = await client.query("SELECT id, start_date FROM semesters ORDER BY start_date NULLS LAST, id");
  const seasons = ["SPRING", "SUMMER", "FALL"];
  const startYear = 2026;
  await client.query("BEGIN");
  try {
    // Bước 1: đổi toàn bộ sang tên tạm duy nhất để tránh unique constraint khi cập nhật theo từng dòng.
    await client.query("UPDATE semesters SET name = 'TMP_' || id::text");

    // Bước 2: gán lại đúng tên final.
    for (let i = 0; i < semestersRes.rows.length; i++) {
      const s = semestersRes.rows[i];
      const year = startYear - Math.floor(i / seasons.length);
      const season = seasons[i % seasons.length];
      const newName = `${season}${year}`;
      await client.query("UPDATE semesters SET name = $1 WHERE id = $2", [newName, s.id]);
    }

    await client.query("COMMIT");
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  }

  console.log("Updating subjects...");
  // Subject Update
  const subjectsRes = await client.query("SELECT id FROM subjects ORDER BY id");
  const subNames = ["SWD392", "SSL101", "SWP391", "EXE101", "EXE201", "PRU392", "WED101", "PRN211", "PRN222"];
  for (let i = 0; i < subjectsRes.rows.length; i++) {
    const s = subjectsRes.rows[i];
    const newName = subNames[i % subNames.length];
    await client.query("UPDATE subjects SET subject_code = $1, subject_name = $1 WHERE id = $2", [newName, s.id]);
  }

  console.log("Updating courses/classes...");
  // Course/Class update
  const coursesRes = await client.query("SELECT id FROM courses ORDER BY id");
  const classNames = ["SE1801", "SE1802", "SE1803", "SE1701", "SE1598", "SE1602", "SE1705", "SE1805", "SE1501", "SE1811"];
  for (let i = 0; i < coursesRes.rows.length; i++) {
    const c = coursesRes.rows[i];
    const newName = classNames[i % classNames.length];
    await client.query("UPDATE courses SET course_code = $1, course_name = $1 WHERE id = $2", [newName, c.id]);
  }

  console.log("Updating lecturers...");
  // Lecturer Update
  const lecRes = await client.query(`
    SELECT 
      u.id,
      u.full_name,
      u.email,
      l.lecturer_code
    FROM users u
    JOIN user_roles ur ON ur.user_id = u.id
    JOIN roles r ON r.id = ur.role_id
    LEFT JOIN lecturers l ON l.user_id = u.id
    WHERE r.role_name = 'LECTURER'
    ORDER BY u.id
  `);
  const lecNames = ["hanht4", "chienhyd87", "phuong456", "hoangthc79", "binh11", "linhct99"];
  for (let i = 0; i < lecRes.rows.length; i++) {
    const l = lecRes.rows[i];
    const newName = lecNames[i % lecNames.length];
    // Update both user display name and lecturer code to match UI expectations.
    await client.query("UPDATE users SET full_name = $1 WHERE id = $2", [newName, l.id]);
    await client.query("UPDATE lecturers SET lecturer_code = $1 WHERE user_id = $2", [newName, l.id]);
  }

  console.log("Update completed successfully!");
  await client.end();
}

run().catch(console.error);
