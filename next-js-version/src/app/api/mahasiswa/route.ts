import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(`SELECT id_mahasiswa, nama_mahasiswa FROM mahasiswa`);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nama } = body;

  if (!nama || nama.trim() === "") {
    return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
  }

  const [exists]: any = await db.query(
    `SELECT id_mahasiswa FROM mahasiswa WHERE LOWER(nama_mahasiswa) = LOWER(?)`,
    [nama]
  );

  if (exists.length > 0) {
    return NextResponse.json({ message: "Mahasiswa sudah ada" }, { status: 400 });
  }

  await db.query(`INSERT INTO mahasiswa (nama_mahasiswa) VALUES (?)`, [nama]);

  return NextResponse.json({ message: "Mahasiswa berhasil ditambahkan" });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id_mahasiswa, nama } = body;

  if (!id_mahasiswa || !nama) {
    return NextResponse.json({ message: "ID dan Nama wajib diisi" }, { status: 400 });
  }

  const [used]: any = await db.query(
    `SELECT id_nilai FROM nilai WHERE id_mahasiswa = ?`,
    [id_mahasiswa]
  );

  if (used.length > 0) {
    return NextResponse.json(
      { message: "Mahasiswa digunakan di nilai, tidak bisa edit" },
      { status: 400 }
    );
  }

  await db.query(`UPDATE mahasiswa SET nama_mahasiswa = ? WHERE id_mahasiswa = ?`, [
    nama,
    id_mahasiswa,
  ]);

  return NextResponse.json({ message: "Mahasiswa berhasil diupdate" });
}

export async function DELETE(req: Request) {
  const { id_mahasiswa } = await req.json();

  const [used]: any = await db.query(`SELECT id_nilai FROM nilai WHERE id_mahasiswa = ?`, [
    id_mahasiswa,
  ]);

  if (used.length > 0) {
    return NextResponse.json(
      { message: "Mahasiswa digunakan di nilai, tidak bisa hapus" },
      { status: 400 }
    );
  }

  await db.query(`DELETE FROM mahasiswa WHERE id_mahasiswa = ?`, [id_mahasiswa]);
  return NextResponse.json({ message: "Mahasiswa berhasil dihapus" });
}
