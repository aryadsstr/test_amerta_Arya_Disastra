'use client';

import { useEffect, useState } from 'react';
import PieChart from '@/components/PieChart';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

type Nilai = {
  id_nilai: number;
  id_mahasiswa: number;
  id_matakuliah: number;
  nama_mahasiswa: string;
  nama_matakuliah: string;
  nilai: number;
  ket_lulus: 'Lulus' | 'Tidak Lulus';
};

type Option = {
  id: number;
  nama: string;
};

export default function Home() {
  const [page, setPage] = useState<'dashboard' | 'mahasiswa' | 'matakuliah'>('dashboard');

  const [dataNilai, setDataNilai] = useState<Nilai[]>([]);
  const [dataMahasiswa, setDataMahasiswa] = useState<Option[]>([]);
  const [dataMatakuliah, setDataMatakuliah] = useState<Option[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL' | 'Lulus' | 'Tidak Lulus'>('ALL');
  const [pageNum, setPageNum] = useState(1);
  const perPage = 5;

  const [showModal, setShowModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ id_mahasiswa: '', id_matakuliah: '', nilai: '', nama: '' });
  const [errorMessage, setErrorMessage] = useState('');

  const loadData = async () => {
    setLoading(true);
    const [nilaiRes, mhsRes, mkRes] = await Promise.all([
      fetch('/api/nilai'),
      fetch('/api/mahasiswa'),
      fetch('/api/matakuliah'),
    ]);
    setDataNilai(await nilaiRes.json());
    setDataMahasiswa((await mhsRes.json()).map((x: any) => ({ id: x.id_mahasiswa, nama: x.nama_mahasiswa })));
    setDataMatakuliah((await mkRes.json()).map((x: any) => ({ id: x.id_matakuliah, nama: x.nama_matakuliah })));
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const filteredNilai = dataNilai.filter(d => {
    const matchSearch =
      d.nama_mahasiswa.toLowerCase().includes(search.toLowerCase()) ||
      d.nama_matakuliah.toLowerCase().includes(search.toLowerCase());
    const matchStatus = status === 'ALL' || d.ket_lulus === status;
    return matchSearch && matchStatus;
  });

  const totalPage = Math.max(1, Math.ceil(filteredNilai.length / perPage));
  const rows = filteredNilai.slice((pageNum - 1) * perPage, pageNum * perPage);

  const submit = async () => {
    try {
      let url = '';
      let body: any = {};

      if (page === 'dashboard') {
        url = '/api/nilai';
        body = isEdit ? { id_nilai: editId, ...form } : form;
      } else if (page === 'mahasiswa') {
        if (!form.nama.trim()) { setErrorMessage('Nama wajib diisi'); return; }
        if (!isEdit && dataMahasiswa.find(m => m.nama.toLowerCase() === form.nama.toLowerCase())) {
          setErrorMessage('Mahasiswa sudah ada'); return;
        }
        url = '/api/mahasiswa';
        body = isEdit ? { id_mahasiswa: editId, nama: form.nama } : { nama: form.nama };
      } else if (page === 'matakuliah') {
        if (!form.nama.trim()) { setErrorMessage('Nama wajib diisi'); return; }
        if (!isEdit && dataMatakuliah.find(mk => mk.nama.toLowerCase() === form.nama.toLowerCase())) {
          setErrorMessage('Mata kuliah sudah ada'); return;
        }
        url = '/api/matakuliah';
        body = isEdit ? { id_matakuliah: editId, nama: form.nama } : { nama: form.nama };
      }

      const res = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const resData = await res.json();

      if (!res.ok) { setErrorMessage(resData.message || 'Terjadi kesalahan'); return; }

      setErrorMessage('');
      reset();
      loadData();
    } catch (err) {
      setErrorMessage('Terjadi kesalahan server');
    }
  };

  const edit = (item: any) => {
    setIsEdit(true);
    if (page === 'dashboard') {
      setEditId(item.id_nilai);
      setForm({ id_mahasiswa: String(item.id_mahasiswa), id_matakuliah: String(item.id_matakuliah), nilai: String(item.nilai), nama: '' });
    } else if (page === 'mahasiswa') {
      if (dataNilai.find(n => n.id_mahasiswa === item.id)) { setErrorMessage('Mahasiswa digunakan di nilai, tidak bisa edit'); return; }
      setEditId(item.id);
      setForm({ nama: item.nama, id_mahasiswa: '', id_matakuliah: '', nilai: '' });
    } else if (page === 'matakuliah') {
      if (dataNilai.find(n => n.id_matakuliah === item.id)) { setErrorMessage('Mata kuliah digunakan di nilai, tidak bisa edit'); return; }
      setEditId(item.id);
      setForm({ nama: item.nama, id_mahasiswa: '', id_matakuliah: '', nilai: '' });
    }
    setShowModal(true);
  };

  const del = async (id: number) => {
    if (!confirm('Hapus data?')) return;

    let url = '';
    let blocked = false;
    if (page === 'dashboard') url = '/api/nilai';
    else if (page === 'mahasiswa') {
      if (dataNilai.find(n => n.id_mahasiswa === id)) { alert('Mahasiswa digunakan di nilai, tidak bisa dihapus'); blocked = true; }
      else url = '/api/mahasiswa';
    }
    else if (page === 'matakuliah') {
      if (dataNilai.find(n => n.id_matakuliah === id)) { alert('Mata kuliah digunakan di nilai, tidak bisa dihapus'); blocked = true; }
      else url = '/api/matakuliah';
    }
    if (blocked) return;

    await fetch(url, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id_nilai: id, id_mahasiswa: id, id_matakuliah: id }),
    });
    loadData();
  };

  const exportExcel = () => {
    const ws = XLSX.utils.json_to_sheet(filteredNilai);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Nilai');
    XLSX.writeFile(wb, 'nilai_mahasiswa.xlsx');
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text('Data Nilai Mahasiswa', 14, 15);
    autoTable(doc, {
      startY: 20,
      head: [['Mahasiswa', 'Matakuliah', 'Nilai', 'Status']],
      body: filteredNilai.map(d => [d.nama_mahasiswa, d.nama_matakuliah, d.nilai, d.ket_lulus]),
    });
    doc.save('nilai_mahasiswa.pdf');
  };

  const reset = () => {
    setShowModal(false);
    setIsEdit(false);
    setEditId(null);
    setForm({ id_mahasiswa: '', id_matakuliah: '', nilai: '', nama: '' });
    setErrorMessage('');
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <div style={sidebar}>
        <h2 style={{ color: '#fff', marginBottom: 20 }}>Dashboard</h2>
        <button style={sidebarBtn} onClick={() => setPage('dashboard')}>Nilai</button>
        <button style={sidebarBtn} onClick={() => setPage('mahasiswa')}>Mahasiswa</button>
        <button style={sidebarBtn} onClick={() => setPage('matakuliah')}>Matakuliah</button>
      </div>

      <div style={mainContent}>
        {page === 'dashboard' && (
          <>
            <h2>Nilai Mahasiswa</h2>
            <div style={{ marginBottom: 10, display: 'flex', gap: 10 }}>
              <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Tambah</button>
              <button style={btnSuccess} onClick={exportExcel}>Excel</button>
              <button style={btnDanger} onClick={exportPDF}>PDF</button>
            </div>

            <div style={contentWrapper}>
              <div style={{ flex: 2 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <select value={status} onChange={e => setStatus(e.target.value as any)}>
                    <option value="ALL">Semua</option>
                    <option value="Lulus">Lulus</option>
                    <option value="Tidak Lulus">Tidak Lulus</option>
                  </select>
                  <input placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>
                <table style={table}>
                  <thead>
                    <tr>
                      <th style={thtd}>Mahasiswa</th>
                      <th style={thtd}>Matakuliah</th>
                      <th style={thtd}>Nilai</th>
                      <th style={thtd}>Status</th>
                      <th style={thtd}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map(d => (
                      <tr key={d.id_nilai}>
                        <td style={thtd}>{d.nama_mahasiswa}</td>
                        <td style={thtd}>{d.nama_matakuliah}</td>
                        <td style={thtd}>{d.nilai}</td>
                        <td style={thtd}><span style={{ ...badge, background: d.ket_lulus === 'Lulus' ? '#28a745' : '#dc3545' }}>{d.ket_lulus}</span></td>
                        <td style={thtd}>
                          <button style={btnPrimary} onClick={() => edit(d)}>Edit</button>
                          <button style={btnDanger} onClick={() => del(d.id_nilai)}>Hapus</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
                  <button disabled={pageNum === 1} onClick={() => setPageNum(p => p - 1)}>Prev</button>
                  <span>Page {pageNum} / {totalPage}</span>
                  <button disabled={pageNum === totalPage} onClick={() => setPageNum(p => p + 1)}>Next</button>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <PieChart data={filteredNilai} />
              </div>
            </div>
          </>
        )}

        {page === 'mahasiswa' && (
          <>
            <h2>Mahasiswa</h2>
            <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Tambah</button>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thtd}>Nama Mahasiswa</th>
                  <th style={thtd}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataMahasiswa.map(m => (
                  <tr key={m.id}>
                    <td style={thtd}>{m.nama}</td>
                    <td style={thtd}>
                      <button style={btnPrimary} onClick={() => edit(m)}>Edit</button>
                      <button style={btnDanger} onClick={() => del(m.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {page === 'matakuliah' && (
          <>
            <h2>Matakuliah</h2>
            <button style={btnPrimary} onClick={() => setShowModal(true)}>+ Tambah</button>
            <table style={table}>
              <thead>
                <tr>
                  <th style={thtd}>Nama Matakuliah</th>
                  <th style={thtd}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {dataMatakuliah.map(mk => (
                  <tr key={mk.id}>
                    <td style={thtd}>{mk.nama}</td>
                    <td style={thtd}>
                      <button style={btnPrimary} onClick={() => edit(mk)}>Edit</button>
                      <button style={btnDanger} onClick={() => del(mk.id)}>Hapus</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}

        {showModal && (
          <div style={overlay}>
            <div style={modal}>
              <h3>{isEdit ? 'Edit' : 'Tambah'} {page}</h3>

              {(page === 'mahasiswa' || page === 'matakuliah') && (
                <input style={modalInput} placeholder="Nama" value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} />
              )}

              {page === 'dashboard' && (
                <>
                  <select style={modalInput} value={form.id_mahasiswa} onChange={e => setForm({ ...form, id_mahasiswa: e.target.value })}>
                    <option value="">Pilih Mahasiswa</option>
                    {dataMahasiswa.map(m => <option key={m.id} value={m.id}>{m.nama}</option>)}
                  </select>
                  <select style={modalInput} value={form.id_matakuliah} onChange={e => setForm({ ...form, id_matakuliah: e.target.value })}>
                    <option value="">Pilih Matakuliah</option>
                    {dataMatakuliah.map(mk => <option key={mk.id} value={mk.id}>{mk.nama}</option>)}
                  </select>
                  <input type="text" style={modalInput} placeholder="Nilai 0-100" value={form.nilai} onChange={e => {
                    let val = e.target.value.replace(/\D/g, '');
                    if (val !== '' && parseInt(val) > 100) val = '100';
                    setForm({ ...form, nilai: val });
                  }} />
                </>
              )}

              {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}

              <div style={modalActions}>
                <button style={btnPrimary} onClick={submit}>Simpan</button>
                <button style={btnSecondary} onClick={reset}>Batal</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const sidebar: React.CSSProperties = { width: 200, backgroundColor: '#007bff', padding: 20, display: 'flex', flexDirection: 'column', gap: 10 };
const sidebarBtn: React.CSSProperties = { background: 'transparent', color: '#fff', border: 'none', padding: '10px 0', textAlign: 'left', cursor: 'pointer', fontSize: 16 };
const mainContent: React.CSSProperties = { flex: 1, background: '#f4f6f9', padding: 20, overflowX: 'auto' };
const contentWrapper: React.CSSProperties = { display: 'flex', gap: 20, flexWrap: 'wrap' };
const table: React.CSSProperties = { width: '100%', borderCollapse: 'collapse', textAlign: 'center' };
const thtd: React.CSSProperties = { border: '1px solid #dee2e6', padding: 8 };
const badge: React.CSSProperties = { color: '#fff', padding: '4px 8px', borderRadius: 4, fontSize: 12 };
const btnPrimary: React.CSSProperties = { background: '#007bff', color: '#fff', padding: '6px 12px', marginRight: 5, border: 'none', cursor: 'pointer' };
const btnDanger: React.CSSProperties = { background: '#dc3545', color: '#fff', padding: '6px 12px', marginRight: 5, border: 'none', cursor: 'pointer' };
const btnSuccess: React.CSSProperties = { background: '#28a745', color: '#fff', padding: '6px 12px', marginRight: 5, border: 'none', cursor: 'pointer' };
const btnSecondary: React.CSSProperties = { background: '#6c757d', color: '#fff', padding: '6px 12px', border: 'none', cursor: 'pointer' };
const overlay: React.CSSProperties = { position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 };
const modal: React.CSSProperties = { backgroundColor: '#fff', width: '90%', maxWidth: 400, padding: 30, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', flexDirection: 'column', gap: 15 };
const modalInput: React.CSSProperties = { padding: '8px 10px', borderRadius: 5, border: '1px solid #ccc', fontSize: 14 };
const modalActions: React.CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 };
