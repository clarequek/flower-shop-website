const S = { strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
const STEM = '#4A7A28'
const LEAF = '#6BAA40'

function CrayonFilter({ id }: { id: string }) {
  return (
    <defs>
      <filter id={id} x="-10%" y="-10%" width="120%" height="120%" colorInterpolationFilters="sRGB">
        <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" seed="9" result="noise" />
        <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.8" xChannelSelector="R" yChannelSelector="G" />
      </filter>
    </defs>
  )
}

type P = { size?: number; colorId?: string }

const GERBERA_PALETTES: Record<string, { o1: string; o2: string; inn: string; st: string; ct: string; ct2: string }> = {
  orange: { o1: '#E8673C', o2: '#F08050', inn: '#D45428', st: '#C04820', ct: '#1E0A02', ct2: '#2D1206' },
  pink:   { o1: '#F060A0', o2: '#F898C8', inn: '#D04080', st: '#B83070', ct: '#3D0820', ct2: '#5A1232' },
  white:  { o1: '#F5F5EE', o2: '#FAFAF5', inn: '#E0E0D0', st: '#C8C8B8', ct: '#C4A050', ct2: '#D4B060' },
  yellow: { o1: '#F2C94C', o2: '#F8DC80', inn: '#D8A820', st: '#B88010', ct: '#4A2E00', ct2: '#6A4200' },
  red:    { o1: '#CC2020', o2: '#E84040', inn: '#AA1010', st: '#900808', ct: '#180404', ct2: '#280808' },
}

/* ─── GERBERA ─── daisy-like, color-selectable ─── */
export function GerberaSVG({ size = 80, colorId = 'orange' }: P) {
  const p = GERBERA_PALETTES[colorId] ?? GERBERA_PALETTES.orange
  const cx = 40, cy = 40
  const outer = Array.from({ length: 14 }, (_, i) => (360 / 14) * i)
  const inner = Array.from({ length: 8 }, (_, i) => (360 / 8) * i + 12)
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-g-${colorId}`} />
      <path d={`M${cx} ${cy + 24} Q${cx - 2} 76 ${cx + 1} 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d={`M${cx - 1} 78 Q${cx - 14} 68 ${cx - 20} 60 Q${cx - 9} 64 ${cx - 1} 73`} fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-g-${colorId})`}>
        {outer.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy - 19} rx="4.5" ry="12" fill={i % 2 === 0 ? p.o1 : p.o2} stroke={p.st} strokeWidth="1.5" {...S} />
          </g>
        ))}
        {inner.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <ellipse cx={cx} cy={cy - 10} rx="2.8" ry="7" fill={p.inn} stroke={p.st} strokeWidth="1" {...S} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r="7.5" fill={p.ct} stroke={p.ct} strokeWidth="1" />
        <circle cx={cx - 1.5} cy={cy - 1.5} r="2" fill={p.ct2} />
      </g>
    </svg>
  )
}

const HYDRANGEA_PALETTES: Record<string, { f1: string; f2: string; st: string }> = {
  blue:  { f1: '#6090E0', f2: '#88B4F8', st: '#3A60C0' },
  pink:  { f1: '#F080A8', f2: '#F8A8C8', st: '#C05080' },
  white: { f1: '#F2F2EE', f2: '#FFFFFF',  st: '#C0C0B8' },
}

/* ─── HYDRANGEA ─── cluster of small florets, color-selectable ─── */
function Floret({ cx, cy, r, fill, stroke }: { cx: number; cy: number; r: number; fill: string; stroke: string }) {
  return (
    <>
      {[0, 90, 180, 270].map((a, i) => (
        <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
          <ellipse cx={cx} cy={cy - r} rx={r * 0.65} ry={r} fill={fill} stroke={stroke} strokeWidth="1.2" {...S} />
        </g>
      ))}
      <circle cx={cx} cy={cy} r={r * 0.35} fill="#FFFDE7" stroke={stroke} strokeWidth="0.8" />
    </>
  )
}
export function HydrangeaSVG({ size = 80, colorId = 'blue' }: P) {
  const p = HYDRANGEA_PALETTES[colorId] ?? HYDRANGEA_PALETTES.blue
  const florets = [
    { cx: 40, cy: 32 }, { cx: 28, cy: 42 }, { cx: 52, cy: 42 },
    { cx: 35, cy: 52 }, { cx: 48, cy: 52 },
  ]
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-h-${colorId}`} />
      <path d={`M40 66 Q38 80 40 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d={`M39 84 Q27 74 22 66 Q32 70 39 78`} fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-h-${colorId})`}>
        {florets.map((f, i) => (
          <Floret key={i} cx={f.cx} cy={f.cy} r={10}
            fill={i % 2 === 0 ? p.f1 : p.f2}
            stroke={p.st} />
        ))}
      </g>
    </svg>
  )
}

const LILY_PALETTES: Record<string, { p1: string; p2: string; st: string; spot: string; ct: string }> = {
  pink:  { p1: '#e384d1', p2: '#efaae0', st: '#c055b0', spot: '#a030a0', ct: '#c055b0' },
  white: { p1: '#F5F5EE', p2: '#FAFAF8', st: '#C8C8B8', spot: '#A8A890', ct: '#B8B8A0' },
}

/* ─── LILY ─── 6 swept petals, color-selectable ─── */
export function LilySVG({ size = 80, colorId = 'pink' }: P) {
  const p = LILY_PALETTES[colorId] ?? LILY_PALETTES.pink
  const cx = 40, cy = 40
  const petals = [0, 60, 120, 180, 240, 300]
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-l-${colorId}`} />
      <path d={`M${cx} ${cy + 22} Q${cx + 2} 80 ${cx} 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d={`M${cx} 80 Q${cx + 14} 70 ${cx + 20} 62 Q${cx + 9} 67 ${cx} 75`} fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-l-${colorId})`}>
        {petals.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path
              d={`M${cx} ${cy} C${cx - 6} ${cy - 8} ${cx - 5} ${cy - 22} ${cx} ${cy - 30} C${cx + 5} ${cy - 22} ${cx + 6} ${cy - 8} ${cx} ${cy}`}
              fill={i < 3 ? p.p1 : p.p2} stroke={p.st} strokeWidth="1.5" {...S}
            />
            <circle cx={cx} cy={cy - 16} r="1.2" fill={p.spot} opacity="0.7" />
            <circle cx={cx - 2} cy={cy - 21} r="0.8" fill={p.spot} opacity="0.5" />
          </g>
        ))}
        {[0, 72, 144, 216, 288].map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <line x1={cx} y1={cy} x2={cx} y2={cy - 14} stroke={p.st} strokeWidth="1" />
            <circle cx={cx} cy={cy - 14} r="1.5" fill="#FFD700" />
          </g>
        ))}
        <circle cx={cx} cy={cy} r="4" fill={p.ct} stroke={p.ct} strokeWidth="1" />
      </g>
    </svg>
  )
}

const TULIP_PALETTES: Record<string, { dark: string; light: string; stD: string; stL: string }> = {
  orange:  { dark: '#E8683C', light: '#F8A070', stD: '#C04818', stL: '#D06030' },
  pink:    { dark: '#D4457A', light: '#EE6EA0', stD: '#AA2A5C', stL: '#C04A78' },
  purple:  { dark: '#7A48C8', light: '#A878E8', stD: '#5030A0', stL: '#7050B8' },
  red:     { dark: '#CC1E1E', light: '#E84040', stD: '#A01010', stL: '#B82020' },
  white:   { dark: '#E8E8E0', light: '#FAFAF8', stD: '#B8B8A8', stL: '#D0D0C0' },
  yellow:  { dark: '#E0C030', light: '#F5E060', stD: '#B09010', stL: '#C8A820' },
}

/* ─── TULIP ─── classic cup, color-selectable ─── */
export function TulipSVG({ size = 80, colorId = 'pink' }: P) {
  const p = TULIP_PALETTES[colorId] ?? TULIP_PALETTES.pink
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-t-${colorId}`} />
      <path d="M40 72 Q37 85 40 100" stroke={STEM} strokeWidth="2.5" {...S} />
      <path d="M40 82 Q26 72 20 63 Q31 68 40 76" fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-t-${colorId})`}>
        <path d="M28 68 C18 55 16 38 22 26 C26 17 32 18 34 28 C36 38 35 55 32 68 Z"
          fill={p.dark} stroke={p.stD} strokeWidth="2" {...S} />
        <path d="M52 68 C62 55 64 38 58 26 C54 17 48 18 46 28 C44 38 45 55 48 68 Z"
          fill={p.dark} stroke={p.stD} strokeWidth="2" {...S} />
        <path d="M40 70 C34 58 32 40 35 24 Q38 14 40 18 Q42 14 45 24 C48 40 46 58 40 70 Z"
          fill={p.light} stroke={p.stL} strokeWidth="2" {...S} />
        <path d="M40 65 Q39 50 38 30" stroke={p.stL} strokeWidth="0.8" opacity="0.5" {...S} />
        <path d="M36 62 Q32 50 30 34" stroke={p.stD} strokeWidth="0.8" opacity="0.4" {...S} />
        <path d="M44 62 Q48 50 50 34" stroke={p.stD} strokeWidth="0.8" opacity="0.4" {...S} />
      </g>
    </svg>
  )
}

const ROSE_PALETTES: Record<string, { out: string; mid: string; inn: string; sto: string; stm: string; sti: string; ct: string }> = {
  red:       { out: '#C21E3A', mid: '#D42A46', inn: '#E03A56', sto: '#8B1228', stm: '#A01830', sti: '#B82040', ct: '#8B0E20' },
  pink:      { out: '#D44880', mid: '#E06090', inn: '#F080A8', sto: '#A83060', stm: '#C04070', sti: '#D05080', ct: '#902040' },
  white:     { out: '#EEEEE8', mid: '#F5F5EF', inn: '#FAFAF8', sto: '#C0C0B0', stm: '#C8C8B8', sti: '#D0D0C0', ct: '#B8B8A0' },
  yellow:    { out: '#D4A820', mid: '#E0BC38', inn: '#EDD060', sto: '#A07810', stm: '#B08818', sti: '#C89828', ct: '#8B6200' },
  champagne: { out: '#C89858', mid: '#D8A86A', inn: '#E8C090', sto: '#A07038', stm: '#B08048', sti: '#C09058', ct: '#7A5020' },
  purple:    { out: '#7040B8', mid: '#8855C8', inn: '#A070D8', sto: '#5030A0', stm: '#6040B0', sti: '#7050C0', ct: '#3A1878' },
}

/* ─── ROSE ─── layered spiral, color-selectable ─── */
export function RoseSVG({ size = 80, colorId = 'red' }: P) {
  const p = ROSE_PALETTES[colorId] ?? ROSE_PALETTES.red
  const cx = 40, cy = 42
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-r-${colorId}`} />
      <path d={`M${cx} 66 Q${cx - 2} 82 ${cx} 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d={`M${cx} 80 Q${cx - 14} 70 ${cx - 20} 62 Q${cx - 9} 66 ${cx} 74`} fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-r-${colorId})`}>
        {[0, 72, 144, 216, 288].map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx} ${cy} C${cx-18} ${cy-4} ${cx-16} ${cy-26} ${cx} ${cy-28} C${cx+16} ${cy-26} ${cx+18} ${cy-4} ${cx} ${cy}`}
              fill={p.out} stroke={p.sto} strokeWidth="1.8" {...S} />
          </g>
        ))}
        {[36, 108, 180, 252, 324].map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx} ${cy} C${cx-12} ${cy-4} ${cx-10} ${cy-20} ${cx} ${cy-22} C${cx+10} ${cy-20} ${cx+12} ${cy-4} ${cx} ${cy}`}
              fill={p.mid} stroke={p.stm} strokeWidth="1.5" {...S} />
          </g>
        ))}
        {[18, 90, 162, 234, 306].map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx} ${cy} C${cx-7} ${cy-3} ${cx-6} ${cy-13} ${cx} ${cy-14} C${cx+6} ${cy-13} ${cx+7} ${cy-3} ${cx} ${cy}`}
              fill={p.inn} stroke={p.sti} strokeWidth="1.2" {...S} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r="5" fill={p.ct} stroke={p.ct} strokeWidth="1" />
        <circle cx={cx - 1} cy={cy - 1} r="2.5" fill={p.mid} />
      </g>
    </svg>
  )
}

const CARNATION_PALETTES: Record<string, { a1: string; a2: string; b: string; c: string; ct: string; sa: string; sb: string; sc: string; sct: string }> = {
  pink:   { a1: '#F080A8', a2: '#F8A0C0', b: '#E870A0', c: '#F8B8D0', ct: '#F8C8DC', sa: '#C85880', sb: '#C05878', sc: '#D06890', sct: '#E090B0' },
  orange: { a1: '#E8683C', a2: '#F09068', b: '#D85028', c: '#F8C0A0', ct: '#FAD0B8', sa: '#C04820', sb: '#B03818', sc: '#D06038', sct: '#E8A080' },
  purple: { a1: '#9055C8', a2: '#B478E0', b: '#7840A8', c: '#D0B0F0', ct: '#E0C8F8', sa: '#6830A0', sb: '#582090', sc: '#8050B8', sct: '#C0A0E0' },
  red:    { a1: '#CC2020', a2: '#E84040', b: '#B01010', c: '#F09090', ct: '#F8B0B0', sa: '#A01010', sb: '#900808', sc: '#B82020', sct: '#E08080' },
  white:  { a1: '#F2F2EE', a2: '#FAFAF8', b: '#E8E8E0', c: '#F8F8F5', ct: '#FFFFFF', sa: '#C8C8B8', sb: '#C0C0B0', sc: '#D0D0C0', sct: '#E8E8E0' },
  yellow: { a1: '#E8C030', a2: '#F5E060', b: '#D8A820', c: '#FAE898', ct: '#FEF5B8', sa: '#B89010', sb: '#A08000', sc: '#C8A820', sct: '#E8D060' },
}

/* ─── CARNATION ─── ruffled ball, color-selectable ─── */
export function CarnationSVG({ size = 80, colorId = 'pink' }: P) {
  const p = CARNATION_PALETTES[colorId] ?? CARNATION_PALETTES.pink
  const cx = 40, cy = 42
  const ruffledPetal = (angle: number, r: number) => {
    const rad = (angle * Math.PI) / 180
    const x1 = cx + Math.cos(rad - 0.3) * r
    const y1 = cy + Math.sin(rad - 0.3) * r
    const x2 = cx + Math.cos(rad + 0.3) * r
    const y2 = cy + Math.sin(rad + 0.3) * r
    const mx = cx + Math.cos(rad) * (r + 7)
    const my = cy + Math.sin(rad) * (r + 7)
    return `M${cx} ${cy} C${x1} ${y1} ${mx - 4} ${my - 3} ${mx} ${my} C${mx + 4} ${my + 3} ${x2} ${y2} ${cx} ${cy}`
  }
  const angles  = Array.from({ length: 10 }, (_, i) => (360 / 10) * i)
  const anglesB = Array.from({ length: 10 }, (_, i) => (360 / 10) * i + 18)
  const anglesC = Array.from({ length: 8 },  (_, i) => (360 / 8)  * i + 8)
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-c-${colorId}`} />
      <path d={`M${cx} 62 Q${cx + 2} 80 ${cx} 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d="M36 62 C34 58 36 55 40 56 C44 55 46 58 44 62" fill="#5A8A3C" stroke={STEM} strokeWidth="1.5" {...S} />
      <path d="M39 82 Q53 72 58 64 Q47 68 39 76" fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-c-${colorId})`}>
        {angles.map((a, i) => (
          <path key={i} d={ruffledPetal(a, 14)} fill={i % 2 === 0 ? p.a1 : p.a2} stroke={p.sa} strokeWidth="1.2" {...S} />
        ))}
        {anglesB.map((a, i) => (
          <path key={i} d={ruffledPetal(a, 9)} fill={p.b} stroke={p.sb} strokeWidth="1.2" {...S} />
        ))}
        {anglesC.map((a, i) => (
          <path key={i} d={ruffledPetal(a, 5)} fill={p.c} stroke={p.sc} strokeWidth="1" {...S} />
        ))}
        <circle cx={cx} cy={cy} r="4" fill={p.ct} stroke={p.sct} strokeWidth="1" />
      </g>
    </svg>
  )
}

const CHRYS_PALETTES: Record<string, { o1: string; o2: string; mid: string; inn: string; sto: string; stm: string; sti: string; ct: string }> = {
  yellow: { o1: '#D4A800', o2: '#E0B820', mid: '#C8A000', inn: '#E8C840', sto: '#B08A00', stm: '#A07800', sti: '#C09800', ct: '#8B6200' },
  purple: { o1: '#8855C8', o2: '#A070D8', mid: '#7040B8', inn: '#C0A0E8', sto: '#6030A0', stm: '#5028A0', sti: '#9060C0', ct: '#3A1878' },
  orange: { o1: '#E8683C', o2: '#F0A060', mid: '#D85028', inn: '#F8C090', sto: '#C04820', stm: '#B04018', sti: '#D07040', ct: '#6A2808' },
  red:    { o1: '#CC2020', o2: '#E04040', mid: '#B01010', inn: '#F08080', sto: '#A01010', stm: '#880808', sti: '#C02020', ct: '#480808' },
  white:  { o1: '#F0F0EC', o2: '#FAFAF8', mid: '#E8E8E0', inn: '#FFFFFF', sto: '#C8C8B8', stm: '#C0C0B0', sti: '#D8D8C8', ct: '#B8B8A0' },
}

/* ─── CHRYSANTHEMUM ─── many thin petals, color-selectable ─── */
export function ChrysanthemumSVG({ size = 80, colorId = 'yellow' }: P) {
  const p = CHRYS_PALETTES[colorId] ?? CHRYS_PALETTES.yellow
  const cx = 40, cy = 40
  const outerPetals = Array.from({ length: 22 }, (_, i) => (360 / 22) * i)
  const midPetals   = Array.from({ length: 16 }, (_, i) => (360 / 16) * i + 8)
  const innerPetals = Array.from({ length: 10 }, (_, i) => (360 / 10) * i + 4)
  return (
    <svg width={size} height={Math.round(size * 1.3)} viewBox="0 0 80 104" fill="none">
      <CrayonFilter id={`cr-ch-${colorId}`} />
      <path d={`M${cx} ${cy + 24} Q${cx - 1} 82 ${cx} 100`} stroke={STEM} strokeWidth="2.5" {...S} />
      <path d={`M${cx} 82 Q${cx + 14} 72 ${cx + 20} 64 Q${cx + 9} 68 ${cx} 76`} fill={LEAF} stroke={STEM} strokeWidth="1.5" {...S} />
      <g filter={`url(#cr-ch-${colorId})`}>
        {outerPetals.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx-1.5} ${cy} C${cx-2} ${cy-10} ${cx-2} ${cy-22} ${cx} ${cy-26} C${cx+2} ${cy-22} ${cx+2} ${cy-10} ${cx+1.5} ${cy}`}
              fill={i % 2 === 0 ? p.o1 : p.o2} stroke={p.sto} strokeWidth="1" {...S} />
          </g>
        ))}
        {midPetals.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx-1.2} ${cy} C${cx-2} ${cy-6} ${cx-1.5} ${cy-15} ${cx} ${cy-18} C${cx+1.5} ${cy-15} ${cx+2} ${cy-6} ${cx+1.2} ${cy}`}
              fill={p.mid} stroke={p.stm} strokeWidth="1" {...S} />
          </g>
        ))}
        {innerPetals.map((a, i) => (
          <g key={i} transform={`rotate(${a} ${cx} ${cy})`}>
            <path d={`M${cx-1} ${cy} C${cx-1.5} ${cy-4} ${cx-1} ${cy-9} ${cx} ${cy-11} C${cx+1} ${cy-9} ${cx+1.5} ${cy-4} ${cx+1} ${cy}`}
              fill={p.inn} stroke={p.sti} strokeWidth="0.8" {...S} />
          </g>
        ))}
        <circle cx={cx} cy={cy} r="5" fill={p.ct} stroke={p.ct} strokeWidth="1" />
        <circle cx={cx - 1} cy={cy - 1} r="2.5" fill={p.mid} />
      </g>
    </svg>
  )
}

/* ─── BABY'S BREATH ─── airy branching clusters, cream white ─── */
export function BabyBreathSVG({ size = 80 }: P) {
  const tipPositions: [number, number][] = [
    [11, 42], [19, 37], [27, 38],
    [33, 35], [40, 34], [47, 35],
    [53, 38], [61, 37], [69, 42],
  ]
  return (
    <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 80 120" fill="none">
      <CrayonFilter id="cr-bb" />
      <path d="M40 120 Q39 95 40 72" stroke={STEM} strokeWidth="2" {...S} />
      <g filter="url(#cr-bb)">
        {/* left branch */}
        <path d="M40 72 Q30 60 22 52" stroke={LEAF} strokeWidth="1.5" {...S} />
        <path d="M22 52 Q16 46 11 42" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M22 52 Q21 44 19 37" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M22 52 Q28 45 27 38" stroke={LEAF} strokeWidth="1" {...S} />
        {/* center branch */}
        <path d="M40 72 Q40 60 40 50" stroke={LEAF} strokeWidth="1.5" {...S} />
        <path d="M40 50 Q36 42 33 35" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M40 50 Q40 42 40 34" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M40 50 Q44 42 47 35" stroke={LEAF} strokeWidth="1" {...S} />
        {/* right branch */}
        <path d="M40 72 Q50 60 58 52" stroke={LEAF} strokeWidth="1.5" {...S} />
        <path d="M58 52 Q64 46 69 42" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M58 52 Q59 44 61 37" stroke={LEAF} strokeWidth="1" {...S} />
        <path d="M58 52 Q52 45 53 38" stroke={LEAF} strokeWidth="1" {...S} />
        {/* tiny florets */}
        {tipPositions.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="3.2" fill="#FFF8F0" stroke="#D8C8A8" strokeWidth="1" />
        ))}
        {tipPositions.map(([x, y], i) => (
          <circle key={`d${i}`} cx={x} cy={y} r="1.3" fill="#F5E090" />
        ))}
      </g>
    </svg>
  )
}

/* ─── EUCALYPTUS ─── round silver-green leaves on stem ─── */
export function EucalyptusSVG({ size = 80 }: P) {
  const leaves = [
    { cx: 30, cy: 50, a: -38 },
    { cx: 50, cy: 63, a: 36 },
    { cx: 29, cy: 76, a: -40 },
    { cx: 51, cy: 88, a: 38 },
    { cx: 30, cy: 100, a: -35 },
  ]
  return (
    <svg width={size} height={Math.round(size * 1.5)} viewBox="0 0 80 120" fill="none">
      <CrayonFilter id="cr-eu" />
      <path d="M40 120 Q39 102 40 44" stroke="#5A7A4A" strokeWidth="2.5" {...S} />
      {/* stem tip bud */}
      <ellipse cx={40} cy={42} rx="4" ry="6" fill="#8BA88A" stroke="#6A8A6A" strokeWidth="1.5" {...S} />
      <g filter="url(#cr-eu)">
        {leaves.map((l, i) => (
          <g key={i} transform={`rotate(${l.a} ${l.cx} ${l.cy})`}>
            <ellipse cx={l.cx} cy={l.cy} rx="11" ry="8"
              fill={i % 2 === 0 ? '#8BA88A' : '#9EBE9E'}
              stroke="#6A8A6A" strokeWidth="1.5" {...S} />
            <line x1={l.cx} y1={l.cy - 7} x2={l.cx} y2={l.cy + 7}
              stroke="#5A7A5A" strokeWidth="0.8" opacity="0.5" />
          </g>
        ))}
      </g>
    </svg>
  )
}

// Map flower id to SVG component
export const FLOWER_SVGS: Record<string, React.ComponentType<{ size?: number }>> = {
  gerbera: GerberaSVG,
  hydrangea: HydrangeaSVG,
  lily: LilySVG,
  tulip: TulipSVG,
  rose: RoseSVG,
  carnation: CarnationSVG,
  chrysanthemum: ChrysanthemumSVG,
}
