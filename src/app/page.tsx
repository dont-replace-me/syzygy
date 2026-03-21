'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LanguageToggle from '@/components/LanguageToggle';
import BirthForm from '@/components/BirthForm';
import ChartResult from '@/components/ChartResult';
import type { NatalChart, BirthData, NominatimResult } from '@/core/types';

interface ChartResponse {
  input: BirthData;
  placidus: NatalChart;
  wholeSign: NatalChart;
  timestamp: string;
}

export default function Home() {
  const { t } = useLanguage();
  const [chartData, setChartData] = useState<ChartResponse | null>(null);
  const [apiResults, setApiResults] = useState<unknown[]>([]);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>{t.title}</h1>
        <LanguageToggle />
      </div>

      <BirthForm
        onResult={(data: ChartResponse) => {
          setChartData(data);
          setApiResults((prev) => [...prev, { type: 'chart', data }]);
        }}
        onGeocode={(raw: NominatimResult[]) => {
          setApiResults((prev) => [...prev, { type: 'geocode', data: raw }]);
        }}
      />

      {chartData && (
        <>
          <hr />
          <h2>{t.placidus}</h2>
          <ChartResult chart={chartData.placidus} />

          <hr />
          <h2>{t.wholeSign}</h2>
          <ChartResult chart={chartData.wholeSign} />
        </>
      )}

      <hr />
      <h2>{t.apiResults}</h2>
      <pre style={{ background: '#f5f5f5', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
        {JSON.stringify(apiResults, null, 2)}
      </pre>
    </div>
  );
}
