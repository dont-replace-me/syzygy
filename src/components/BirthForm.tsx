'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import LocationPicker from './LocationPicker';
import type { NominatimResult, BirthData, NatalChart } from '@/core/types';

interface ChartResponse {
  input: BirthData;
  placidus: NatalChart;
  wholeSign: NatalChart;
  timestamp: string;
}

interface Props {
  onResult: (data: ChartResponse) => void;
  onGeocode: (raw: NominatimResult[]) => void;
}

export default function BirthForm({ onResult, onGeocode }: Props) {
  const { t } = useLanguage();

  const [placeName, setPlaceName] = useState('');
  const [date, setDate] = useState('1995-01-15');
  const [hour, setHour] = useState(12);
  const [minute, setMinute] = useState(40);
  const [timezone, setTimezone] = useState('Asia/Seoul');
  const [locationQuery, setLocationQuery] = useState('');
  const [candidates, setCandidates] = useState<NominatimResult[]>([]);
  const [directLat, setDirectLat] = useState('');
  const [directLon, setDirectLon] = useState('');
  const [selectedLocation, setSelectedLocation] = useState<{
    name: string; lat: number; lon: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchLocation = async () => {
    if (!locationQuery.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(locationQuery)}`);
      const data: NominatimResult[] = await res.json();
      setCandidates(data);
      onGeocode(data);
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (result: NominatimResult) => {
    setSelectedLocation({
      name: result.display_name,
      lat: parseFloat(result.lat),
      lon: parseFloat(result.lon),
    });
    setCandidates([]);
  };

  const handleGenerate = async () => {
    if (!date || !selectedLocation) return;
    const [year, month, day] = date.split('-').map(Number);

    const input: BirthData = {
      year, month, day,
      hour, minute,
      latitude: selectedLocation.lat,
      longitude: selectedLocation.lon,
      timezone,
      placeName: placeName || selectedLocation.name,
    };

    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/chart', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        onResult(data);
      }
    } catch {
      setError(t.error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ marginBottom: '8px' }}>
        <label>{t.name}: </label>
        <input value={placeName} onChange={(e) => setPlaceName(e.target.value)} />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label>{t.birthDate}: </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label>{t.birthTime}: </label>
        <input type="number" min={0} max={23} value={hour}
          onChange={(e) => setHour(Number(e.target.value))} style={{ width: '50px' }} />
        <span> {t.hour} </span>
        <input type="number" min={0} max={59} value={minute}
          onChange={(e) => setMinute(Number(e.target.value))} style={{ width: '50px' }} />
        <span> {t.minute}</span>
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label>{t.timezone}: </label>
        <input value={timezone} onChange={(e) => setTimezone(e.target.value)}
          placeholder="Asia/Seoul" style={{ width: '200px' }} />
      </div>

      <div style={{ marginBottom: '8px' }}>
        <label>{t.location}: </label>
        <input value={locationQuery}
          onChange={(e) => setLocationQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && searchLocation()}
          placeholder="e.g. Seoul, South Korea" />
        <button onClick={searchLocation} style={{ marginLeft: '4px' }}>
          {t.search}
        </button>
      </div>

      {candidates.length > 0 && (
        <LocationPicker candidates={candidates} onSelect={handleSelectLocation} />
      )}

      <div style={{ marginBottom: '8px' }}>
        <span>{t.or} {t.directInput}: </span>
        <label>{t.lat} </label>
        <input type="number" step="any" value={directLat}
          onChange={(e) => setDirectLat(e.target.value)}
          style={{ width: '100px' }} placeholder="37.5665" />
        <label style={{ marginLeft: '8px' }}>{t.lon} </label>
        <input type="number" step="any" value={directLon}
          onChange={(e) => setDirectLon(e.target.value)}
          style={{ width: '100px' }} placeholder="126.978" />
        <button onClick={() => {
          const lat = parseFloat(directLat);
          const lon = parseFloat(directLon);
          if (!isNaN(lat) && !isNaN(lon)) {
            setSelectedLocation({ name: `${lat}, ${lon}`, lat, lon });
          }
        }} style={{ marginLeft: '4px' }}>
          {t.applyCoords}
        </button>
      </div>

      {selectedLocation && (
        <p>Selected: {selectedLocation.name} ({selectedLocation.lat}, {selectedLocation.lon})</p>
      )}

      <button onClick={handleGenerate}
        disabled={!date || !selectedLocation || loading}
        style={{ padding: '8px 16px', marginTop: '8px' }}>
        {loading ? t.loading : t.generate}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}
