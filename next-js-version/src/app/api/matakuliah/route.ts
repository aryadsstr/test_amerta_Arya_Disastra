import { NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(`SELECT id_matakuliah, nama_matakuliah FROM matakuliah`);
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const body = await req.json();
  const { nama } = body;

  if (!nama || nama.trim() === "") {
    return NextResponse.json({ message: "Nama wajib diisi" }, { status: 400 });
  }

  const [exists]: any = await db.query(
    `SELECT id_matakuliah FROM matakuliah WHERE LOWER(nama_matakuliah) = LOWER(?)`,
    [nama]
  );

  if (exists.length > 0) {
    return NextResponse.json({ message: "Mata kuliah sudah ada" }, { status: 400 });
  }

  await db.query(`INSERT INTO matakuliah (nama_matakuliah) VALUES (?)`, [nama]);
  return NextResponse.json({ message: "Mata kuliah berhasil ditambahkan" });
}

export async function PUT(req: Request) {
  const body = await req.json();
  const { id_matakuliah, nama } = body;

  if (!id_matakuliah || !nama) {
    return NextResponse.json({ message: "ID dan Nama wajib diisi" }, { status: 400 });
  }

  const [used]: any = await db.query(`SELECT id_nilai FROM nilai WHERE id_matakuliah = ?`, [
    id_matakuliah,
  ]);

  if (used.length > 0) {
    return NextResponse.json(
      { message: "Mata kuliah digunakan di nilai, tidak bisa edit" },
      { status: 400 }
    );
  }

  const [exists]: any = await db.query(
    `SELECT id_matakuliah FROM matakuliah WHERE LOWER(nama_matakuliah) = LOWER(?) AND id_matakuliah != ?`,
    [nama, id_matakuliah]
  );

  if (exists.length > 0) {
    return NextResponse.json({ message: "Nama mata kuliah sudah ada" }, { status: 400 });
  }

  await db.query(`UPDATE matakuliah SET nama_matakuliah = ? WHERE id_matakuliah = ?`, [
    nama,
    id_matakuliah,
  ]);

  return NextResponse.json({ message: "Mata kuliah berhasil diupdate" });
}

export async function DELETE(req: Request) {
  const { id_matakuliah } = await req.json();

  const [used]: any = await db.query(`SELECT id_nilai FROM nilai WHERE id_matakuliah = ?`, [
    id_matakuliah,
  ]);

  if (used.length > 0) {
    return NextResponse.json(
      { message: "Mata kuliah digunakan di nilai, tidak bisa hapus" },
      { status: 400 }
    );
  }

  await db.query(`DELETE FROM matakuliah WHERE id_matakuliah = ?`, [id_matakuliah]);
  return NextResponse.json({ message: "Mata kuliah berhasil dihapus" });
}
