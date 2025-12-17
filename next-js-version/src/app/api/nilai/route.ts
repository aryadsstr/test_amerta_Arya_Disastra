import { NextResponse } from "next/server";
import db from '@/lib/db';

export async function GET() {
  const [rows] = await db.query(`
    SELECT
      n.id_nilai,
      n.id_mahasiswa,
      n.id_matakuliah,
      m.nama_mahasiswa,
      mk.nama_matakuliah,
      n.nilai,
      CASE
        WHEN n.nilai >= 70 THEN 'Lulus'
        ELSE 'Tidak Lulus'
      END AS ket_lulus
    FROM nilai n
    JOIN mahasiswa m ON m.id_mahasiswa = n.id_mahasiswa
    JOIN matakuliah mk ON mk.id_matakuliah = n.id_matakuliah
  `);

  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();

  const [exists]: any = await db.query(
    `SELECT id_nilai FROM nilai
     WHERE id_mahasiswa = ? AND id_matakuliah = ?`,
    [body.id_mahasiswa, body.id_matakuliah]
  );

  if (exists.length > 0) {
    return NextResponse.json(
      { message: 'Nilai untuk mahasiswa dan mata kuliah ini sudah ada' },
      { status: 400 }
    );
  }

  await db.query(
    `INSERT INTO nilai (id_mahasiswa, id_matakuliah, nilai)
     VALUES (?, ?, ?)`,
    [body.id_mahasiswa, body.id_matakuliah, body.nilai]
  );

  return NextResponse.json({ message: 'Data berhasil ditambahkan' });
}

export async function PUT(req: Request) {
  const body = await req.json();

  const [exists]: any = await db.query(
    `SELECT id_nilai FROM nilai
     WHERE id_mahasiswa = ?
     AND id_matakuliah = ?
     AND id_nilai != ?`,
    [body.id_mahasiswa, body.id_matakuliah, body.id_nilai]
  );

  if (exists.length > 0) {
    return NextResponse.json(
      { message: 'Data nilai dengan mahasiswa dan matakuliah ini sudah ada' },
      { status: 400 }
    );
  }

  await db.query(
    `UPDATE nilai
     SET id_mahasiswa = ?, id_matakuliah = ?, nilai = ?
     WHERE id_nilai = ?`,
    [
      body.id_mahasiswa,
      body.id_matakuliah,
      body.nilai,
      body.id_nilai,
    ]
  );

  return NextResponse.json({ message: 'Data berhasil diupdate' });
}

export async function DELETE(req: Request) {
  const { id_nilai } = await req.json();
  await db.query(`DELETE FROM nilai WHERE id_nilai=?`, [id_nilai]);

  return NextResponse.json({ success: true });
}