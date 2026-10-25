const NAVY = '#14206b';
const BLUE = '#2d4de0';
const PURPLE = '#6d3fd1';
const WHITE = '#ffffff';

// Sudut kiri-atas tiap pola penanda (finder pattern) di kode QR.
const FINDER_ORIGINS = [
  [15, 15],
  [105, 15],
  [15, 105],
];

// Modul data dekoratif: [x, y, lebar, tinggi, warna, radius?]
const DATA_MODULES = [
  [65, 20, 8, 8, BLUE],
  [80, 20, 8, 8, NAVY],
  [65, 35, 12, 8, PURPLE],
  [85, 35, 8, 12, BLUE],
  [20, 65, 8, 12, BLUE],
  [35, 65, 12, 8, NAVY],
  [55, 60, 10, 10, PURPLE],
  [70, 55, 16, 16, NAVY, 2],
  [95, 65, 8, 12, BLUE],
  [110, 60, 12, 10, NAVY],
  [130, 65, 10, 10, PURPLE],
  [65, 80, 10, 8, BLUE],
  [85, 80, 12, 10, NAVY],
  [65, 105, 10, 12, PURPLE],
  [85, 100, 8, 10, BLUE],
  [105, 90, 12, 8, NAVY],
  [125, 85, 8, 12, BLUE],
  [65, 125, 8, 12, NAVY],
  [80, 120, 12, 8, PURPLE],
  [100, 115, 14, 10, BLUE],
  [125, 110, 15, 12, NAVY],
  [105, 130, 12, 12, PURPLE],
  [125, 130, 10, 10, BLUE],
];

/**
 * Gambar kode QRIS dekoratif (bukan kode yang bisa dipindai) untuk simulasi pembayaran.
 */
export default function QrisCode() {
  return (
    <svg
      viewBox="0 0 160 160"
      width="150"
      height="150"
      className="qr-svg"
      role="img"
      aria-label="Kode QR pembayaran QRIS"
    >
      <rect width="160" height="160" fill={WHITE} rx="10" />
      {FINDER_ORIGINS.map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <rect x={x} y={y} width="40" height="40" fill={NAVY} rx="4" />
          <rect x={x + 8} y={y + 8} width="24" height="24" fill={WHITE} rx="2" />
          <rect x={x + 14} y={y + 14} width="12" height="12" fill={NAVY} rx="1" />
        </g>
      ))}
      {DATA_MODULES.map(([x, y, width, height, fill, radius]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={width} height={height} fill={fill} rx={radius} />
      ))}
    </svg>
  );
}
