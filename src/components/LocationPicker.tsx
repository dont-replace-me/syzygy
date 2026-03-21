'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { NominatimResult } from '@/core/types';

interface Props {
  candidates: NominatimResult[];
  onSelect: (result: NominatimResult) => void;
}

export default function LocationPicker({ candidates, onSelect }: Props) {
  const { t } = useLanguage();

  if (candidates.length === 0) {
    return <p>{t.noResults}</p>;
  }

  return (
    <div>
      <p><strong>{t.selectLocation}</strong></p>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {candidates.map((c) => (
          <li key={c.place_id} style={{ marginBottom: '4px' }}>
            <button
              onClick={() => onSelect(c)}
              style={{ cursor: 'pointer', textAlign: 'left' }}
            >
              {c.display_name} (lat: {c.lat}, lon: {c.lon})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
