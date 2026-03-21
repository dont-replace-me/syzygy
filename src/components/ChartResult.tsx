'use client';

import { useLanguage } from '@/context/LanguageContext';
import type { NatalChart } from '@/core/types';
import { ASPECT_SYMBOL } from '@/core/constants';

interface Props {
  chart: NatalChart;
}

function dms(decimal: number): string {
  let d = Math.floor(decimal);
  let m = Math.round((decimal - d) * 60);
  if (m === 60) { d += 1; m = 0; }
  return `${d}°${String(m).padStart(2, '0')}'`;
}

export default function ChartResult({ chart }: Props) {
  const { t } = useLanguage();

  return (
    <div style={{ marginBottom: '20px' }}>
      {/* Planets */}
      <h3>{t.planets}</h3>
      <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>{t.bodyName}</th>
            <th>{t.sign}</th>
            <th>{t.signDegree}</th>
            <th>{t.degree}</th>
            <th>{t.house}</th>
            <th>{t.retrograde}</th>
            <th>{t.speed}</th>
          </tr>
        </thead>
        <tbody>
          {chart.planets.map((p) => (
            <tr key={p.planet}>
              <td>{p.planet}</td>
              <td>{p.sign}</td>
              <td>{dms(p.signDegree)}</td>
              <td>{dms(p.degree)}</td>
              <td>{p.house}</td>
              <td>{p.retrograde ? 'R' : ''}</td>
              <td>{p.speed?.toFixed(4) ?? '-'}</td>
            </tr>
          ))}
          {chart.extended?.points
            .filter((ep) => ep.key === 'lilith' || ep.key === 'southnode')
            .map((ep) => (
              <tr key={ep.key}>
                <td>{ep.label}</td>
                <td>{ep.sign}</td>
                <td>{dms(ep.signDegree)}</td>
                <td>{dms(ep.degree)}</td>
                <td>{ep.house}</td>
                <td></td>
                <td>-</td>
              </tr>
            ))}
        </tbody>
      </table>

      {/* Virtual Points */}
      {chart.virtualPoints && chart.virtualPoints.length > 0 && (
        <>
          <h3>{t.virtualPoints}</h3>
          <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>{t.bodyName}</th>
                <th>{t.sign}</th>
                <th>{t.signDegree}</th>
                <th>{t.degree}</th>
                <th>{t.house}</th>
              </tr>
            </thead>
            <tbody>
              {chart.virtualPoints.map((vp) => (
                <tr key={vp.key}>
                  <td>{vp.label}</td>
                  <td>{vp.sign}</td>
                  <td>{dms(vp.signDegree)}</td>
                  <td>{dms(vp.degree)}</td>
                  <td>{vp.house}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Angles */}
      <h3>{t.angles}</h3>
      <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>{t.bodyName}</th>
            <th>{t.sign}</th>
            <th>{t.degree}</th>
          </tr>
        </thead>
        <tbody>
          {chart.angles.map((a) => (
            <tr key={a.angle}>
              <td>{a.angle}</td>
              <td>{a.sign}</td>
              <td>{dms(a.degree % 30)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Houses */}
      <h3>{t.houses}</h3>
      <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th>{t.houseNumber}</th>
            <th>{t.sign}</th>
            <th>{t.degree}</th>
          </tr>
        </thead>
        <tbody>
          {chart.houses.map((h) => (
            <tr key={h.house}>
              <td>{h.house}</td>
              <td>{h.sign}</td>
              <td>{dms(h.degree % 30)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Planet Aspects */}
      {chart.planetAspects && chart.planetAspects.length > 0 && (
        <>
          <h3>{t.planetAspects}</h3>
          <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>{t.body1}</th>
                <th>{t.body2}</th>
                <th>{t.type}</th>
                <th>{t.orb}</th>
                <th>{t.exact}</th>
                <th>{t.applying}</th>
              </tr>
            </thead>
            <tbody>
              {chart.planetAspects.map((a, i) => (
                <tr key={i}>
                  <td>{a.point1Label}</td>
                  <td>{a.point2Label}</td>
                  <td>{ASPECT_SYMBOL[a.type]} {a.type}</td>
                  <td>{dms(a.orb)}</td>
                  <td>{a.exact ? t.yes : ''}</td>
                  <td>{a.applyingState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {/* Other Aspects */}
      {chart.otherAspects && chart.otherAspects.length > 0 && (
        <>
          <h3>{t.otherAspects}</h3>
          <table border={1} cellPadding={4} style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>{t.body1}</th>
                <th>{t.body2}</th>
                <th>{t.type}</th>
                <th>{t.orb}</th>
                <th>{t.exact}</th>
                <th>{t.applying}</th>
              </tr>
            </thead>
            <tbody>
              {chart.otherAspects.map((a, i) => (
                <tr key={i}>
                  <td>{a.point1Label}</td>
                  <td>{a.point2Label}</td>
                  <td>{ASPECT_SYMBOL[a.type]} {a.type}</td>
                  <td>{dms(a.orb)}</td>
                  <td>{a.exact ? t.yes : ''}</td>
                  <td>{a.applyingState}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
