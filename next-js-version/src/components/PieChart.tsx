'use client';

import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

type Props = {
  data: {
    ket_lulus: 'Lulus' | 'Tidak Lulus';
  }[];
};

export default function PieChart({ data }: Props) {
  const lulus = data.filter(d => d.ket_lulus === 'Lulus').length;
  const tidakLulus = data.length - lulus;

  return (
    <div style={{ width: 300 }}>
      <Pie
        data={{
          labels: ['Lulus', 'Tidak Lulus'],
          datasets: [
            {
              data: [lulus, tidakLulus],
              backgroundColor: ['#22c55e', '#ef4444'],
            },
          ],
        }}
      />
    </div>
  );
}
