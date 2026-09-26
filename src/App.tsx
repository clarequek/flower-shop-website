// v2
import { useState, useRef, useEffect } from 'react'
import emailjs from '@emailjs/browser'

const EJS_PUBLIC_KEY  = import.meta.env.VITE_EMAILJS_PUBLIC_KEY  ?? 'TZ24f5_mUnmTZxhkE'
const EJS_SERVICE_ID  = import.meta.env.VITE_EMAILJS_SERVICE_ID  ?? 'service_bcicqii'
const EJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID ?? 'template_nw9s5si'

async function compressImage(dataUrl: string, maxPx = 200): Promise<string> {
  return new Promise(resolve => {
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1)
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(img.width * scale)
      canvas.height = Math.round(img.height * scale)
      canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/jpeg', 0.7))
    }
    img.onerror = () => resolve(dataUrl)
    img.src = dataUrl
  })
}

async function sendOrderEmail(params: Record<string, string>, inspirations: string[] = []) {
  let inspirations_html = '(none uploaded)'
  if (inspirations.length) {
    const compressed = await Promise.all(inspirations.map(url => compressImage(url)))
    inspirations_html = compressed
      .map(src => `<img src="${src}" style="width:140px;height:140px;object-fit:cover;margin:4px;border-radius:8px;display:inline-block;" />`)
      .join('')
  }
  emailjs.send(EJS_SERVICE_ID, EJS_TEMPLATE_ID, { ...params, inspirations_html }, { publicKey: EJS_PUBLIC_KEY })
    .catch(err => console.error('EmailJS error:', err))
}
import {
  GerberaSVG, HydrangeaSVG, LilySVG, TulipSVG,
  RoseSVG, CarnationSVG, ChrysanthemumSVG, FLOWER_SVGS,
  BabyBreathSVG, EucalyptusSVG,
} from './FlowerSVG'

type Page = 'storefront' | 'datepicker' | 'choosetype' | 'shop' | 'preview' | 'surprise' | 'confirmation'

interface Flower {
  id: string
  name: string
  color: string
  price: number
  description: string
}

interface ColorVariant {
  id: string
  label: string
  swatch: string
}

const FLOWER_VARIANTS: Record<string, ColorVariant[]> = {
  gerbera: [
    { id: 'orange', label: 'Orange',   swatch: '#E8673C' },
    { id: 'pink',   label: 'Pink',     swatch: '#F060A0' },
    { id: 'white',  label: 'White',    swatch: '#F5F5EE' },
    { id: 'yellow', label: 'Yellow',   swatch: '#F2C94C' },
    { id: 'red',    label: 'Red',      swatch: '#CC2020' },
  ],
  hydrangea: [
    { id: 'blue',  label: 'Blue',  swatch: '#6090E0' },
    { id: 'pink',  label: 'Pink',  swatch: '#F080A8' },
    { id: 'white', label: 'White', swatch: '#F2F2EE' },
  ],
  lily: [
    { id: 'pink',  label: 'Pink',  swatch: '#e384d1' },
    { id: 'white', label: 'White', swatch: '#F5F5EE' },
  ],
  tulip: [
    { id: 'orange', label: 'Orange', swatch: '#E8683C' },
    { id: 'pink',   label: 'Pink',   swatch: '#D4457A' },
    { id: 'purple', label: 'Purple', swatch: '#7A48C8' },
    { id: 'red',    label: 'Red',    swatch: '#CC1E1E' },
    { id: 'white',  label: 'White',  swatch: '#E8E8E0' },
    { id: 'yellow', label: 'Yellow', swatch: '#E0C030' },
  ],
  rose: [
    { id: 'red',       label: 'Red',       swatch: '#C21E3A' },
    { id: 'pink',      label: 'Pink',      swatch: '#D44880' },
    { id: 'white',     label: 'White',     swatch: '#EEEEE8' },
    { id: 'yellow',    label: 'Yellow',    swatch: '#D4A820' },
    { id: 'champagne', label: 'Champagne', swatch: '#C89858' },
    { id: 'purple',    label: 'Purple',    swatch: '#7040B8' },
  ],
  carnation: [
    { id: 'pink',   label: 'Pink',   swatch: '#F080A8' },
    { id: 'orange', label: 'Orange', swatch: '#E8683C' },
    { id: 'purple', label: 'Purple', swatch: '#9055C8' },
    { id: 'red',    label: 'Red',    swatch: '#CC2020' },
    { id: 'white',  label: 'White',  swatch: '#F2F2EE' },
    { id: 'yellow', label: 'Yellow', swatch: '#E8C030' },
  ],
  chrysanthemum: [
    { id: 'purple', label: 'Purple', swatch: '#8855C8' },
    { id: 'orange', label: 'Orange', swatch: '#E8683C' },
    { id: 'red',    label: 'Red',    swatch: '#CC2020' },
    { id: 'white',  label: 'White',  swatch: '#F0F0EC' },
  ],
}

// Default colorId per flower
const DEFAULT_COLOR: Record<string, string> = {
  gerbera: 'orange',
  hydrangea: 'blue',
  lily: 'pink',
  tulip: 'pink',
  rose: 'red',
  carnation: 'pink',
  chrysanthemum: 'yellow',
}

interface Selection {
  count: number
  colorId: string
}

const FLOWERS: Flower[] = [
  { id: 'gerbera',       name: 'Gerbera',        color: '#E8673C', price: 2.50, description: 'Bold & sunny' },
  { id: 'hydrangea',     name: 'Hydrangea',      color: '#9E82D8', price: 25.00, description: 'Lush & dreamy' },
  { id: 'lily',          name: 'Lily',            color: '#e384d1', price: 15.00, description: 'Elegant & fragrant · ~5 blooms per stalk' },
  { id: 'tulip',         name: 'Tulip',           color: '#D4457A', price: 3.50,  description: 'Classic & graceful' },
  { id: 'rose',          name: 'Rose',            color: '#C21E3A', price: 3.50, description: 'Timeless & romantic' },
  { id: 'carnation',     name: 'Carnation',       color: '#F080A8', price: 2.50, description: 'Ruffled & sweet' },
  { id: 'chrysanthemum', name: 'Chrysanthemum',   color: '#D4A800', price: 2.50, description: 'Bright & cheerful' },
]

const DISPLAY = { fontFamily: "'Oooh Baby', cursive" }

function StorefrontFlower({ type, size = 36 }: { type: string; size?: number }) {
  const Svg = FLOWER_SVGS[type]
  return Svg ? <Svg size={size} /> : null
}

function Storefront({ onEnter }: { onEnter: () => void }) {
  return (
    <div className="min-h-screen polka-bg flex flex-col items-center justify-center px-4 py-12 page-enter">
      <div className="w-full max-w-xl">

        {/* Sign */}
        <div className="relative flex flex-col items-center">
          <div className="bg-[#FFFCD5] rounded-2xl px-8 py-4 shadow-lg z-10 relative w-full text-center border-4 border-[#C8A830]">
            <p className="text-xs font-bold tracking-widest uppercase text-[#7A5200] opacity-80 mb-1">
              Est. 2024
            </p>
            <h1 className="text-6xl text-[#3D2800] leading-tight" style={DISPLAY}>
              Florals by Clare
            </h1>
            <p className="text-sm text-[#7A5200] tracking-widest mt-1 font-semibold">Flower Boutique</p>
          </div>

          {/* Awning */}
          <div className="w-full overflow-hidden -mb-1" style={{ height: 52 }}>
            <svg viewBox="0 0 480 52" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
              {Array.from({ length: 12 }).map((_, i) => (
                <rect key={i} x={i * 40} y={0} width={20} height={52}
                  fill={i % 2 === 0 ? '#F7A8BE' : '#FFFCD5'} />
              ))}
              <path d="M0,36 Q20,52 40,36 Q60,52 80,36 Q100,52 120,36 Q140,52 160,36 Q180,52 200,36 Q220,52 240,36 Q260,52 280,36 Q300,52 320,36 Q340,52 360,36 Q380,52 400,36 Q420,52 440,36 Q460,52 480,36 L480,0 L0,0 Z"
                fill="white" />
            </svg>
          </div>
        </div>

        {/* Facade */}
        <div className="bg-white border-4 border-[#FFFCD5] rounded-b-3xl shadow-2xl overflow-hidden -mt-px">
          <div className="flex gap-4 p-5 pb-3">

            {/* Left window */}
            <div className="flex-1 bg-[#FFFCD5] border-4 border-[#FFFCD5] rounded-xl p-3 flex flex-col items-center gap-1">
              <div className="flex gap-1 justify-center">
                <StorefrontFlower type="rose" size={34} />
                <StorefrontFlower type="tulip" size={34} />
              </div>
              <div className="flex gap-1 justify-center">
                <StorefrontFlower type="gerbera" size={34} />
              </div>
              <p className="text-[9px] font-black text-[#8B6B00] uppercase tracking-widest mt-1">Fresh Daily</p>
            </div>

            {/* Door */}
            <div className="w-28 flex flex-col items-center">
              <div className="w-full flex-1 bg-[#F7A8BE] border-4 border-[#E8779A] rounded-t-2xl flex flex-col items-center justify-center gap-2 min-h-[128px]">
                <div className="w-14 h-10 bg-[#FFFCD5] border-2 border-[#FFFCD5] rounded-lg flex items-center justify-center overflow-hidden">
                  <RoseSVG size={28} />
                </div>
                <div className="w-3 h-3 rounded-full bg-[#FFFCD5] border-2 border-[#C8A830] ml-8 mt-1" />
              </div>
              <div className="w-full h-3 bg-[#E8779A] rounded-b" />
            </div>

            {/* Right window */}
            <div className="flex-1 bg-[#FDD6E4] border-4 border-[#E8779A] rounded-xl p-3 flex flex-col items-center gap-1">
              <div className="flex gap-1 justify-center">
                <StorefrontFlower type="lily" size={34} />
                <StorefrontFlower type="carnation" size={34} />
              </div>
              <div className="flex gap-1 justify-center">
                <StorefrontFlower type="chrysanthemum" size={34} />
              </div>
              <p className="text-[9px] font-black text-[#E8779A] uppercase tracking-widest mt-1">Hand Picked</p>
            </div>
          </div>

          {/* CTA */}
          <div className="bg-[#FDD6E4] px-6 py-5 flex flex-col items-center gap-3">
            <p className="text-[#E8779A] font-bold text-sm text-center">
              Fresh bouquets, made with love, just for you
            </p>
            <button
              onClick={onEnter}
              className="bg-[#FFFCD5] hover:bg-[#C8A830] text-[#3D2800] font-black text-xl px-10 py-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95 border-2 border-[#C8A830]"
              style={DISPLAY}
            >
              Enter the Shop
            </button>
          </div>
        </div>

        {/* Sidewalk */}
        <div className="flex gap-1">
          {Array.from({ length: 24 }).map((_, i) => (
            <div key={i} className="flex-1 h-3 rounded-b"
              style={{ backgroundColor: i % 2 === 0 ? '#FFFCD5' : '#D4C060' }} />
          ))}
        </div>
      </div>

      {/* Corner flowers */}
      <div className="fixed top-10 left-8 opacity-50"><HydrangeaSVG size={42} /></div>
      <div className="fixed top-10 right-8 opacity-50"><TulipSVG size={42} /></div>
      <div className="fixed bottom-12 left-10 opacity-50"><GerberaSVG size={38} /></div>
      <div className="fixed bottom-12 right-10 opacity-50"><ChrysanthemumSVG size={38} /></div>
    </div>
  )
}

function DateChip({ date, onConfirm }: { date: Date; onConfirm: (date: Date) => void }) {
  const [open, setOpen] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [picked, setPicked] = useState<Date | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  const today = new Date(); today.setHours(0, 0, 0, 0)
  const [cursor, setCursor] = useState(new Date(date.getFullYear(), date.getMonth(), 1))
  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = cursor.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const prevDisabled = year === today.getFullYear() && month === today.getMonth()

  const label = date.toLocaleDateString('default', { weekday: 'short', month: 'short', day: 'numeric' })

  function isPast(d: number) {
    const dt = new Date(year, month, d); dt.setHours(0, 0, 0, 0)
    return dt < today
  }

  function handleDayClick(d: number) {
    const nd = new Date(year, month, d)
    if (nd.getTime() === date.getTime()) { setOpen(false); return }
    setPicked(nd)
    setConfirming(true)
  }

  function handleConfirm() {
    if (picked) { onConfirm(picked); setCursor(new Date(picked.getFullYear(), picked.getMonth(), 1)) }
    setPicked(null); setConfirming(false); setOpen(false)
  }

  function handleBackToCalendar() {
    setPicked(null); setConfirming(false)
  }

  // Close on outside click
  useState(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false); setConfirming(false); setPicked(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  })

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => { setOpen(o => !o); setConfirming(false); setPicked(null) }}
        className="inline-flex items-center gap-1.5 bg-[#FFFCD5] hover:bg-[#F2E870] border-2 border-[#C8A830] text-[#3D2800] rounded-full px-3 py-1 text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-sm"
      >
        <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
          <rect x="1" y="2" width="10" height="9" rx="2" stroke="#8B6B00" strokeWidth="1.2"/>
          <path d="M1 5h10" stroke="#8B6B00" strokeWidth="1.2"/>
          <path d="M4 1v2M8 1v2" stroke="#8B6B00" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        {label}
        <svg width="7" height="7" viewBox="0 0 8 8" fill="none" className="opacity-50">
          <path d="M1 2.5 L4 5.5 L7 2.5" stroke="#8B6B00" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 z-50 w-72 bg-white rounded-2xl shadow-2xl border-2 border-[#F7A8BE] overflow-hidden"
          style={{ animation: 'fadeSlideUp 0.2s ease forwards' }}
        >
          {!confirming ? (
            <>
              {/* Month nav */}
              <div className="bg-gradient-to-r from-[#FDD6E4] to-[#FFFCD5] px-4 py-2.5 flex items-center justify-between">
                <button
                  onClick={() => !prevDisabled && setCursor(new Date(year, month - 1, 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-base transition-all"
                  style={{ color: prevDisabled ? '#E0D0D0' : '#E8779A', cursor: prevDisabled ? 'default' : 'pointer' }}
                >‹</button>
                <p className="font-black text-[#3D2800] text-sm" style={DISPLAY}>{monthName} {year}</p>
                <button
                  onClick={() => setCursor(new Date(year, month + 1, 1))}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-[#E8779A] hover:bg-[#FDD6E4] transition-all text-base"
                >›</button>
              </div>

              {/* Grid */}
              <div className="p-3">
                <div className="grid grid-cols-7 mb-1.5">
                  {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                    <p key={d} className="text-center text-[9px] font-black text-gray-300 uppercase">{d}</p>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-y-0.5">
                  {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const d = i + 1
                    const past = isPast(d)
                    const dt = new Date(year, month, d)
                    const isToday = dt.getTime() === today.getTime()
                    const isCurrent = dt.getTime() === date.getTime()
                    return (
                      <button
                        key={d}
                        disabled={past}
                        onClick={() => !past && handleDayClick(d)}
                        className="aspect-square rounded-full text-xs font-bold transition-all flex items-center justify-center mx-auto w-7 h-7"
                        style={{
                          backgroundColor: isCurrent ? '#F7A8BE' : isToday ? '#FFFCD5' : 'transparent',
                          color: past ? '#D0C8C8' : isCurrent ? 'white' : isToday ? '#8B6B00' : '#3D2800',
                          border: isToday && !isCurrent ? '2px solid #C8A830' : '2px solid transparent',
                          cursor: past ? 'default' : 'pointer',
                        }}
                      >{d}</button>
                    )
                  })}
                </div>
              </div>
            </>
          ) : (
            /* Confirm panel */
            <div className="p-5 flex flex-col items-center gap-4 text-center">
              <p className="text-2xl">📅</p>
              <div>
                <p className="text-xs text-gray-400 mb-1">Change delivery date to</p>
                <p className="font-black text-[#3D2800]" style={DISPLAY}>
                  {picked?.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full">
                <button
                  onClick={handleConfirm}
                  className="w-full bg-[#FFFCD5] hover:bg-[#C8A830] text-[#3D2800] font-black py-2.5 rounded-full border-2 border-[#C8A830] transition-all text-base shadow-sm"
                  style={DISPLAY}
                >Yes, change it!</button>
                <button
                  onClick={handleBackToCalendar}
                  className="text-xs text-[#C890A0] hover:text-[#E8779A] font-semibold transition-colors py-1"
                >← Back to calendar</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const AI_SYSTEM_PROMPT = `You are a floral assistant for Florals by Clare. When the user describes a bouquet, respond with:
1. A warm one-sentence reply about their bouquet vision
2. A JSON block (fenced with \`\`\`json) with flower selections

Available flowers and their valid colorIds:
- gerbera: orange, pink, white, yellow, red
- hydrangea: blue, pink, white
- lily: pink, white
- tulip: orange, pink, purple, red, white, yellow
- rose: red, pink, white, yellow, champagne, purple
- carnation: pink, orange, purple, red, white, yellow
- chrysanthemum: purple, orange, red, white

JSON format:
{
  "flowers": [
    { "id": "rose", "count": 5, "colorId": "red" },
    { "id": "tulip", "count": 3, "colorId": "pink" }
  ]
}

Only include flowers the user wants. Count should be 1–12 per flower type. Choose the colorId that best matches the description. Always include the JSON block even if the user is vague — make a lovely suggestion.`

function AiChatPanel({ onApply }: { onApply: (selections: Record<string, Selection>) => void }) {
  const [open, setOpen] = useState(false)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [reply, setReply] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return
    setLoading(true)
    setReply(null)
    setError(null)

    const apiKey = import.meta.env.VITE_OPENAI_API_KEY
    if (!apiKey) {
      setError('No API key found. Please add VITE_OPENAI_API_KEY in your environment.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 512,
          messages: [
            { role: 'system', content: AI_SYSTEM_PROMPT },
            { role: 'user', content: text },
          ],
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `API error ${res.status}`)
      }

      const data = await res.json()
      const content: string = data.choices?.[0]?.message?.content ?? ''

      // Extract the warm reply (first sentence before the JSON block)
      const warmReply = content.split('```')[0].trim()
      setReply(warmReply || 'Here are your flowers!')
      setInput('')

      // Parse the JSON block
      const match = content.match(/```json\s*([\s\S]*?)```/)
      if (match) {
        const parsed = JSON.parse(match[1])
        const newSelections: Record<string, Selection> = {}
        for (const item of (parsed.flowers ?? [])) {
          const { id, count, colorId } = item
          if (typeof id === 'string' && typeof count === 'number' && typeof colorId === 'string') {
            newSelections[id] = { count: Math.max(1, Math.min(12, Math.round(count))), colorId }
          }
        }
        onApply(newSelections)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mb-6">
      {!open ? (
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center gap-3 bg-gradient-to-r from-[#FDD6E4] to-[#FFFCD5] border-2 border-[#F7A8BE] rounded-2xl px-4 py-3 text-left hover:shadow-md transition-all group"
        >
          <span className="text-2xl">✨</span>
          <div className="flex-1">
            <p className="text-sm font-black text-[#3D2800]">Describe your bouquet to me</p>
            <p className="text-xs text-[#C890A0]">AI will fill in the flowers for you</p>
          </div>
          <svg className="w-4 h-4 text-[#E8779A] group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      ) : (
        <div className="bg-white border-2 border-[#F7A8BE] rounded-2xl overflow-hidden shadow-md">
          <div className="bg-gradient-to-r from-[#FDD6E4] to-[#FFFCD5] px-4 py-2.5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">✨</span>
              <span className="text-sm font-black text-[#3D2800]">Bouquet Assistant</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-[#C890A0] hover:text-[#E8779A] text-lg leading-none transition-colors">×</button>
          </div>

          <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
            {reply && (
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-full bg-[#FDD6E4] flex items-center justify-center flex-shrink-0 text-sm">🌸</div>
                <div className="bg-[#FFF9FB] border border-[#F7A8BE] rounded-2xl rounded-tl-sm px-3 py-2 text-sm text-[#3D2800] flex-1">
                  {reply}
                  <p className="text-xs text-[#E8779A] font-semibold mt-1">Flowers added below ↓</p>
                </div>
              </div>
            )}
            {error && (
              <p className="text-xs text-red-400 bg-red-50 rounded-xl px-3 py-2">{error}</p>
            )}
            <p className="text-xs text-gray-400 italic">
              e.g. "I want a soft romantic bouquet with lots of pink roses and some white tulips"
            </p>
            <div className="flex gap-2">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Describe your dream bouquet…"
                className="flex-1 rounded-full border-2 border-[#F0D0DC] bg-[#FFF9FB] px-4 py-2 text-sm text-[#3D2800] placeholder-gray-300 outline-none focus:border-[#E8779A] transition-colors"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="w-10 h-10 rounded-full bg-[#F7A8BE] hover:bg-[#E8779A] disabled:opacity-40 text-white flex items-center justify-center transition-all flex-shrink-0"
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Shop({
  selected, onToggle, onColorChange, onPreview, onBack, onAiSelect, deliveryDate, onDateConfirm,
}: {
  selected: Record<string, Selection>
  onToggle: (id: string, delta: number) => void
  onColorChange: (id: string, colorId: string) => void
  onPreview: () => void
  onBack: () => void
  onAiSelect: (selections: Record<string, Selection>) => void
  deliveryDate: Date
  onDateConfirm: (date: Date) => void
}) {
  const totalItems = Object.values(selected).reduce((a, s) => a + s.count, 0)
  const totalPrice = FLOWERS.reduce((sum, f) => sum + (selected[f.id]?.count ?? 0) * f.price, 0)

  return (
    <div className="min-h-screen polka-bg page-enter">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-2 border-[#FFFCD5] px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-[#8B6B00] font-bold text-sm hover:text-[#C8A830] transition-colors">
          ← Back
        </button>
        <h1 className="text-3xl text-[#3D2800]" style={DISPLAY}>
          Pick Your Flowers
        </h1>
        <div className="text-right flex flex-col items-end gap-0.5">
          <DateChip date={deliveryDate} onConfirm={onDateConfirm} />
          <p className="text-xs text-[#E8779A] font-bold">{totalItems} stems · ${totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <AiChatPanel onApply={onAiSelect} />
        <p className="text-center text-[#E8779A] font-semibold mb-6 text-sm">
          Choose your stems — mix and match to build the perfect bouquet
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {FLOWERS.map((flower) => {
            const variants = FLOWER_VARIANTS[flower.id]
            const sel = selected[flower.id]
            const count = sel?.count ?? 0
            const colorId = sel?.colorId ?? DEFAULT_COLOR[flower.id] ?? 'default'
            const activeVariant = variants?.find(v => v.id === colorId)
            const cardColor = activeVariant?.swatch ?? flower.color
            const FlowerSvg = FLOWER_SVGS[flower.id]
            return (
              <div
                key={flower.id}
                className="flower-card bg-white rounded-3xl pt-4 pb-4 px-3 shadow-md border-2 flex flex-col items-center text-center transition-all duration-200 hover:shadow-xl hover:-translate-y-1"
                style={{ borderColor: count > 0 ? cardColor : '#E8E8E8' }}
              >
                <div className="flower-emoji mb-1">
                  {FlowerSvg && <FlowerSvg size={64} colorId={colorId} />}
                </div>
                <h3 className="text-gray-800 text-2xl leading-tight" style={{ fontFamily: "'Sue Ellen Francisco', cursive" }}>
                  {flower.name}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5 mb-1">{flower.description}</p>
                <p className="text-xs font-bold mb-2" style={{ color: cardColor }}>
                  ${flower.price.toFixed(2)} each
                </p>

                {/* Color swatches (only for flowers with variants) */}
                {variants && (
                  <div className="flex gap-1.5 mb-2 flex-wrap justify-center">
                    {variants.map(v => (
                      <button
                        key={v.id}
                        title={v.label}
                        onClick={() => onColorChange(flower.id, v.id)}
                        className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                        style={{
                          backgroundColor: v.swatch,
                          borderColor: colorId === v.id ? '#3D2800' : 'transparent',
                          outline: colorId === v.id ? `2px solid ${v.swatch}` : 'none',
                          outlineOffset: 1,
                          boxShadow: '0 0 0 1px #E8E8E8',
                        }}
                      />
                    ))}
                  </div>
                )}

                {count === 0 ? (
                  <button
                    onClick={() => onToggle(flower.id, 1)}
                    className="w-full py-1.5 rounded-full text-white text-xs font-bold transition-all hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: cardColor }}
                  >
                    Add
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onToggle(flower.id, -1)}
                      className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center transition-all hover:opacity-90"
                      style={{ backgroundColor: cardColor }}
                    >
                      &minus;
                    </button>
                    <span className="font-black text-gray-700 w-5 text-center">{count}</span>
                    <button
                      onClick={() => onToggle(flower.id, 1)}
                      className="w-7 h-7 rounded-full text-white text-sm font-bold flex items-center justify-center transition-all hover:opacity-90"
                      style={{ backgroundColor: cardColor }}
                    >
                      +
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {totalItems > 0 && (
          <div className="mt-8 flex justify-center page-enter">
            <button
              onClick={onPreview}
              className="bg-[#F7A8BE] hover:bg-[#E8779A] text-white font-black text-2xl px-12 py-4 rounded-full shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
              style={DISPLAY}
            >
              See My Bouquet
            </button>
          </div>
        )}
        <div className="h-16" />
      </div>
    </div>
  )
}

const COLOR_FAMILY: Record<string, string> = {
  red: 'passionate', orange: 'sunny', yellow: 'sunny', champagne: 'sunny',
  pink: 'romantic', white: 'pure', purple: 'enchanted', blue: 'serene',
}

const THEMES: Record<string, { title: string; desc: string; palette: string }> = {
  passionate: { title: 'Bold & Passionate',    desc: 'Deep, rich tones that speak volumes — a statement of love and intensity.',           palette: '#C21E3A' },
  romantic:   { title: 'Romance in Bloom',     desc: 'Soft, tender hues that whisper sweetness and warmth.',                              palette: '#F060A0' },
  pure:       { title: 'Pure Elegance',         desc: 'Clean and timeless — a bouquet that carries quiet grace.',                          palette: '#C8C8B8' },
  enchanted:  { title: 'Enchanted Garden',      desc: 'Mysterious and magical, like a story unfolding in petals.',                        palette: '#7A48C8' },
  serene:     { title: 'Soft Serenity',         desc: 'Calm, cool, and deeply peaceful — a breath of fresh air.',                         palette: '#6090E0' },
  sunny:      { title: 'Sunshine & Joy',        desc: 'Warm and cheerful — this bouquet brings the brightness of a golden afternoon.',    palette: '#E0C030' },
  garden:     { title: 'Wildflower Garden',     desc: 'A joyful, carefree mix — like a morning walk through a blooming meadow.',          palette: '#6BAA40' },
}

function detectTheme(selected: Record<string, Selection>): typeof THEMES[string] {
  const counts: Record<string, number> = {}
  FLOWERS.forEach(f => {
    const count = selected[f.id]?.count ?? 0
    if (!count) return
    const colorId = selected[f.id]?.colorId ?? DEFAULT_COLOR[f.id] ?? ''
    const family = COLOR_FAMILY[colorId] ?? 'garden'
    counts[family] = (counts[family] ?? 0) + count
  })
  const entries = Object.entries(counts)
  if (!entries.length) return THEMES.garden
  const totalFamilies = new Set(entries.map(([k]) => k)).size
  if (totalFamilies >= 4) return THEMES.garden
  const top = entries.sort((a, b) => b[1] - a[1])[0][0]
  return THEMES[top] ?? THEMES.garden
}

const FILLERS = [
  { name: "Baby's Breath",  desc: 'airy white clusters' },
  { name: 'Eucalyptus',     desc: 'silver-green sprigs' },
  { name: 'Eustoma',        desc: 'ruffled bell blooms' },
  { name: 'Daisies',        desc: 'cheerful little faces' },
  { name: 'Limonium',       desc: 'delicate purple wisps' },
]

const EVENTS = ['Birthday', 'Wedding', 'Anniversary', 'Graduation', 'Just Because', 'Get Well', 'Sympathy', 'Date Night', 'Other']
const VIBES  = ['Romantic', 'Elegant', 'Cheerful', 'Soft & Dreamy', 'Bold & Dramatic', 'Wild & Natural', 'Minimalist', 'Whimsical']

// ── Date Picker ──────────────────────────────────────────────────────────────
function DatePicker({ onSelect }: { onSelect: (date: Date) => void }) {
  const today = new Date(); today.setHours(0,0,0,0)
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [picked, setPicked] = useState<Date | null>(null)

  const year = cursor.getFullYear()
  const month = cursor.getMonth()
  const monthName = cursor.toLocaleString('default', { month: 'long' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const prevDisabled = year === today.getFullYear() && month === today.getMonth()

  function isPast(d: number) {
    const date = new Date(year, month, d); date.setHours(0,0,0,0)
    return date < today
  }

  return (
    <div className="min-h-screen polka-bg page-enter flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center">
          <p className="text-xs font-bold text-[#8B6B00] uppercase tracking-widest mb-1">step 1 of 3</p>
          <h1 className="text-4xl text-[#3D2800]" style={DISPLAY}>Pick a Delivery Date</h1>
          <p className="text-sm text-gray-400 mt-1">When would you like your bouquet?</p>
        </div>

        <div className="w-full bg-white rounded-3xl border-4 border-[#F7A8BE] shadow-xl p-5">
          {/* Month nav */}
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => !prevDisabled && setCursor(new Date(year, month - 1, 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center transition-all"
              style={{ color: prevDisabled ? '#E0D0D0' : '#E8779A', cursor: prevDisabled ? 'default' : 'pointer' }}
            >‹</button>
            <p className="font-black text-[#3D2800]" style={DISPLAY}>{monthName} {year}</p>
            <button
              onClick={() => setCursor(new Date(year, month + 1, 1))}
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#E8779A] hover:bg-[#FDD6E4] transition-all"
            >›</button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 mb-2">
            {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
              <p key={d} className="text-center text-[10px] font-black text-gray-300 uppercase">{d}</p>
            ))}
          </div>

          {/* Day grid */}
          <div className="grid grid-cols-7 gap-y-1">
            {Array.from({ length: firstDay }).map((_, i) => <div key={`e-${i}`} />)}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const d = i + 1
              const past = isPast(d)
              const date = new Date(year, month, d)
              const isToday = date.getTime() === today.getTime()
              const isSel = picked && date.getTime() === picked.getTime()
              return (
                <button
                  key={d}
                  disabled={past}
                  onClick={() => { const nd = new Date(year, month, d); setPicked(nd) }}
                  className="aspect-square rounded-full text-sm font-bold transition-all flex items-center justify-center mx-auto w-8 h-8"
                  style={{
                    backgroundColor: isSel ? '#F7A8BE' : isToday ? '#FFFCD5' : 'transparent',
                    color: past ? '#D0C8C8' : isSel ? 'white' : isToday ? '#8B6B00' : '#3D2800',
                    border: isToday && !isSel ? '2px solid #C8A830' : '2px solid transparent',
                    cursor: past ? 'default' : 'pointer',
                  }}
                >{d}</button>
              )
            })}
          </div>
        </div>

        {picked && (
          <div className="w-full bg-[#FFF9FB] rounded-2xl border-2 border-[#F7A8BE] px-4 py-3 text-center">
            <p className="text-xs text-gray-400">Delivery on</p>
            <p className="font-black text-[#E8779A]" style={DISPLAY}>
              {picked.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        )}

        <button
          disabled={!picked}
          onClick={() => picked && onSelect(picked)}
          className="w-full font-black text-2xl py-4 rounded-full shadow-xl transition-all duration-200 border-2"
          style={{
            ...DISPLAY,
            backgroundColor: picked ? '#FFFCD5' : '#F5F0E0',
            color: picked ? '#3D2800' : '#B0A070',
            borderColor: picked ? '#C8A830' : '#D8CC90',
            transform: picked ? undefined : undefined,
            cursor: picked ? 'pointer' : 'default',
          }}
        >
          {picked ? 'Continue' : 'Select a Date'}
        </button>
      </div>
    </div>
  )
}

// ── Choose Type ───────────────────────────────────────────────────────────────
function ChooseType({ deliveryDate, onCustom, onSurprise, onDateConfirm }: {
  deliveryDate: Date
  onCustom: () => void
  onSurprise: () => void
  onDateConfirm: (date: Date) => void
}) {
  return (
    <div className="min-h-screen polka-bg page-enter flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <div className="text-center flex flex-col items-center gap-2">
          <p className="text-xs font-bold text-[#8B6B00] uppercase tracking-widest">step 2 of 3</p>
          <h1 className="text-4xl text-[#3D2800]" style={DISPLAY}>What kind of bouquet?</h1>
          <DateChip date={deliveryDate} onConfirm={onDateConfirm} />
        </div>

        <button
          onClick={onCustom}
          className="w-full bg-white rounded-3xl border-4 border-[#F7A8BE] shadow-xl p-6 text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex gap-4 items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FDD6E4] flex items-center justify-center flex-shrink-0">
            <RoseSVG size={40} colorId="pink" />
          </div>
          <div>
            <h2 className="text-2xl text-[#3D2800]" style={DISPLAY}>Build Your Own</h2>
            <p className="text-sm text-gray-400 mt-0.5">Pick your flowers, colors & arrangement yourself</p>
          </div>
        </button>

        <button
          onClick={onSurprise}
          className="w-full bg-white rounded-3xl border-4 border-[#FFFCD5] shadow-xl p-6 text-left hover:shadow-2xl hover:-translate-y-1 transition-all duration-200 flex gap-4 items-center"
        >
          <div className="w-16 h-16 rounded-2xl bg-[#FFFCD5] flex items-center justify-center flex-shrink-0">
            <GerberaSVG size={40} colorId="yellow" />
          </div>
          <div>
            <h2 className="text-2xl text-[#3D2800]" style={DISPLAY}>Surprise Me!</h2>
            <p className="text-sm text-gray-400 mt-0.5">Tell me the vibe — I'll handle the rest</p>
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Surprise Bouquet ──────────────────────────────────────────────────────────
function SurpriseBouquet({ deliveryDate, onOrder, onBack, onDateConfirm }: {
  deliveryDate: Date
  onOrder: (info: { event: string; vibe: string; extraNote: string; budget: string; contactName: string; contactMethod: string; contactValue: string; inspirations: string[] }) => void
  onBack: () => void
  onDateConfirm: (date: Date) => void
}) {
  const [event, setEvent] = useState('')
  const [vibe, setVibe] = useState('')
  const [extraNote, setExtraNote] = useState('')
  const [budget, setBudget] = useState('')
  const [contactName, setContactName] = useState('')
  const [contactMethod, setContactMethod] = useState<'telegram'|'instagram'|'email'>('telegram')
  const [contactValue, setContactValue] = useState('')
  const [inspirations, setInspirations] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) setInspirations(prev => [...prev, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="min-h-screen polka-bg page-enter flex flex-col">
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-2 border-[#FFFCD5] px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="text-[#E8779A] font-bold text-sm hover:opacity-70 transition-opacity">← Back</button>
        <p className="text-xs font-bold text-[#8B6B00] uppercase tracking-widest">Surprise Bouquet</p>
        <DateChip date={deliveryDate} onConfirm={onDateConfirm} />
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col gap-5">
        <div className="text-center">
          <h1 className="text-3xl text-[#3D2800]" style={DISPLAY}>Tell Me the Vibe</h1>
        </div>

        {/* Postcard */}
        <div className="relative bg-[#FFFDF4] rounded-2xl shadow-lg overflow-hidden" style={{ border: '2px dashed #C8A830' }}>
          <div className="absolute top-3 right-3 w-14 h-16 border-2 border-[#C8A830] rounded-sm bg-[#FFFCD5] flex flex-col items-center justify-center gap-0.5 z-10">
            <RoseSVG size={32} colorId="pink" />
            <p className="text-[7px] font-black text-[#8B6B00] tracking-wider">FLORALS CLARE</p>
          </div>
          <svg className="absolute top-4 right-16 opacity-10 pointer-events-none" width="52" height="52" viewBox="0 0 52 52" fill="none">
            <circle cx="26" cy="26" r="24" stroke="#8B6B00" strokeWidth="1.5" strokeDasharray="3 2"/>
            <text x="26" y="22" textAnchor="middle" fontSize="5.5" fill="#8B6B00" fontFamily="sans-serif" fontWeight="bold">FLORALS</text>
            <text x="26" y="30" textAnchor="middle" fontSize="5.5" fill="#8B6B00" fontFamily="sans-serif" fontWeight="bold">BY CLARE</text>
            <line x1="8" y1="26" x2="44" y2="26" stroke="#8B6B00" strokeWidth="0.8"/>
          </svg>

          <div className="p-5 pr-20 pb-4">
            <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-3">What's the occasion?</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {EVENTS.map(e => (
                <button key={e} onClick={() => setEvent(ev => ev === e ? '' : e)}
                  className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                  style={{ borderColor: event === e ? '#C8A830' : '#E8E0C8', backgroundColor: event === e ? '#FFFCD5' : 'transparent', color: event === e ? '#3D2800' : '#A89060' }}
                >{e}</button>
              ))}
            </div>
            <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-3">What vibe are you after?</p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              {VIBES.map(v => (
                <button key={v} onClick={() => setVibe(cur => cur === v ? '' : v)}
                  className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                  style={{ borderColor: vibe === v ? '#E8779A' : '#F0D0DC', backgroundColor: vibe === v ? '#FDD6E4' : 'transparent', color: vibe === v ? '#3D2800' : '#C890A0' }}
                >{v}</button>
              ))}
            </div>
            <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-2">Anything else for us? <span className="font-normal normal-case text-gray-300">(optional)</span></p>
            <div className="relative">
              {[0,1,2].map(i => <div key={i} className="border-b border-[#F0E8C0] h-7" />)}
              <textarea value={extraNote} onChange={e => setExtraNote(e.target.value)}
                placeholder="e.g. she loves pastels, no strong scents..."
                maxLength={160}
                className="absolute inset-0 w-full h-full bg-transparent text-[#3D2800] text-xs leading-7 placeholder-gray-300 outline-none resize-none pt-1"
              />
            </div>
            <p className="text-right text-[9px] text-gray-300 mt-1">{extraNote.length}/160</p>
          </div>
        </div>

        {/* Budget */}
        <div className="w-full bg-white rounded-2xl border-2 border-[#FFFCD5] p-4">
          <label className="text-xs font-black text-[#8B6B00] uppercase tracking-widest block mb-3">What's your budget?</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {['Under $30', '$30–$50', '$50–$80', '$80–$120', '$120+'].map(b => (
              <button key={b} onClick={() => setBudget(cur => cur === b ? '' : b)}
                className="px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all"
                style={{ borderColor: budget === b ? '#C8A830' : '#E8E0C8', backgroundColor: budget === b ? '#FFFCD5' : 'transparent', color: budget === b ? '#3D2800' : '#A89060' }}
              >{b}</button>
            ))}
          </div>
        </div>

        {/* Inspiration Photos */}
        <div className="w-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Inspiration Photos</p>
          <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full rounded-2xl border-2 border-dashed border-[#F7A8BE] bg-[#FFF9FB] hover:bg-[#FDD6E4] transition-all p-4 flex flex-col items-center gap-2 cursor-pointer">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
              <rect x="2" y="6" width="28" height="20" rx="4" stroke="#E8779A" strokeWidth="1.5"/>
              <circle cx="11" cy="13" r="2.5" stroke="#E8779A" strokeWidth="1.5"/>
              <path d="M2 22 L9 16 L14 20 L20 14 L30 22" stroke="#E8779A" strokeWidth="1.5" strokeLinejoin="round"/>
              <path d="M22 9 L22 3 M19 6 L25 6" stroke="#F7A8BE" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            <p className="text-sm font-semibold text-[#E8779A]">Upload inspiration photos</p>
            <p className="text-xs text-gray-400">Show us the vibe you love <span className="text-gray-300">(optional)</span></p>
          </button>
          {inspirations.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {inspirations.map((src, i) => (
                <div key={i} className="relative group">
                  <img src={src} alt="inspiration" className="w-full h-24 object-cover rounded-xl border-2 border-[#F7A8BE]" />
                  <button onClick={() => setInspirations(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-[#E8779A] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">✕</button>
                </div>
              ))}
              <button onClick={() => fileRef.current?.click()}
                className="h-24 rounded-xl border-2 border-dashed border-[#F7A8BE] text-[#E8779A] text-2xl hover:bg-[#FDD6E4] transition-all flex items-center justify-center">+</button>
            </div>
          )}
        </div>

        {/* Contact */}
        <div className="w-full">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">How should Clare reach you?</p>
          <div className="bg-white rounded-2xl border-2 border-[#F7A8BE] p-4 flex flex-col gap-3">
            <div>
              <label className="text-xs font-bold text-[#8B6B00] uppercase tracking-wide block mb-1.5">Your name</label>
              <input value={contactName} onChange={e => setContactName(e.target.value)}
                placeholder="e.g. Jamie"
                className="w-full rounded-xl border-2 border-[#F0D0DC] bg-[#FFF9FB] px-3 py-2 text-sm text-[#3D2800] placeholder-gray-300 outline-none focus:border-[#E8779A] transition-colors" />
            </div>
            <div>
              <label className="text-xs font-bold text-[#8B6B00] uppercase tracking-wide block mb-1.5">Contact via</label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {([{ id: 'telegram', label: '✈ Telegram' }, { id: 'instagram', label: '◈ Instagram' }, { id: 'email', label: '✉ Email' }] as const).map(opt => (
                  <button key={opt.id} onClick={() => { setContactMethod(opt.id); setContactValue('') }}
                    className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                    style={{ borderColor: contactMethod === opt.id ? '#E8779A' : '#F0D0DC', backgroundColor: contactMethod === opt.id ? '#FDD6E4' : 'transparent', color: contactMethod === opt.id ? '#3D2800' : '#C890A0' }}
                  >{opt.label}</button>
                ))}
              </div>
              <input value={contactValue} onChange={e => setContactValue(e.target.value)}
                placeholder={contactMethod === 'telegram' ? '@username' : contactMethod === 'instagram' ? '@handle' : 'your@email.com'}
                className="w-full rounded-xl border-2 border-[#F0D0DC] bg-[#FFF9FB] px-3 py-2 text-sm text-[#3D2800] placeholder-gray-300 outline-none focus:border-[#E8779A] transition-colors" />
            </div>
          </div>
        </div>

        {/* Order */}
        {(() => {
          const missing = [
            !contactName.trim() && 'your name',
            !contactValue.trim() && 'your contact handle',
            !budget && 'a budget',
          ].filter(Boolean) as string[]
          const canOrder = missing.length === 0
          return (
          <div className="flex flex-col gap-3">
            {!canOrder && (
              <p className="text-center text-xs text-[#C890A0] font-semibold">
                Please fill in {missing.join(' & ')} to continue
              </p>
            )}
            <button
              disabled={!canOrder}
              onClick={() => canOrder && onOrder({ event, vibe, extraNote, budget, contactName, contactMethod, contactValue, inspirations })}
              className="w-full font-black text-2xl py-4 rounded-full shadow-xl transition-all duration-200 border-2"
              style={{
                ...DISPLAY,
                backgroundColor: canOrder ? '#FFFCD5' : '#F0EDD8',
                color: canOrder ? '#3D2800' : '#A89868',
                borderColor: canOrder ? '#C8A830' : '#D8CC90',
                cursor: canOrder ? 'pointer' : 'default',
                transform: canOrder ? undefined : 'none',
                boxShadow: canOrder ? undefined : 'none',
              }}
            >Order My Bouquet</button>
            <button onClick={onBack}
              className="w-full bg-white border-2 border-[#F7A8BE] text-[#E8779A] font-bold py-3 rounded-full hover:bg-[#FDD6E4] transition-all">
              Go Back
            </button>
          </div>
          )
        })()}
      </div>
    </div>
  )
}

function BouquetPreview({
  selected, onBack, onOrder, deliveryDate, onDateConfirm,
}: {
  selected: Record<string, Selection>
  onBack: () => void
  onOrder: (info: { event: string; vibe: string; contactName: string; contactMethod: string; contactValue: string; budget?: string; inspirations: string[] }) => void
  deliveryDate: Date
  onDateConfirm: (date: Date) => void
}) {
  const [event, setEvent] = useState('')
  const [vibe, setVibe] = useState('')
  const [extraNote, setExtraNote] = useState('')
  const [inspirations, setInspirations] = useState<string[]>([])
  const [contactName, setContactName] = useState('')
  const [contactMethod, setContactMethod] = useState<'telegram' | 'email' | 'instagram'>('telegram')
  const [contactValue, setContactValue] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = ev => {
        if (ev.target?.result) setInspirations(prev => [...prev, ev.target!.result as string])
      }
      reader.readAsDataURL(file)
    })
  }


  const stems: { flower: Flower; colorId: string; i: number }[] = []
  FLOWERS.forEach((f) => {
    const sel = selected[f.id]
    const count = sel?.count ?? 0
    const colorId = sel?.colorId ?? DEFAULT_COLOR[f.id] ?? 'default'
    for (let k = 0; k < count; k++) stems.push({ flower: f, colorId, i: stems.length })
  })

  const totalPrice = FLOWERS.reduce((sum, f) => sum + (selected[f.id]?.count ?? 0) * f.price, 0)
  const totalItems = stems.length

  // Smart arrangement: bold focal flowers toward center, delicate ones at edges
  const DISPLAY_WEIGHT: Record<string, number> = {
    rose: 5, gerbera: 4, lily: 4,
    chrysanthemum: 3, tulip: 3,
    carnation: 2, hydrangea: 2,
  }
  const byWeight = [...stems].sort(
    (a, b) => (DISPLAY_WEIGHT[b.flower.id] ?? 2) - (DISPLAY_WEIGHT[a.flower.id] ?? 2)
  )
  const n = byWeight.length
  const arranged: typeof stems = new Array(n)
  byWeight.forEach((stem, rank) => {
    const center = Math.floor(n / 2)
    const offset = rank === 0 ? 0 : rank % 2 === 1 ? -Math.ceil(rank / 2) : Math.ceil(rank / 2)
    const slot = Math.min(Math.max(center + offset, 0), n - 1)
    arranged[slot] = stem
  })

  const maxSpread = Math.min(n * 11, 86)
  const getAngle = (slot: number) =>
    n <= 1 ? 0 : -maxSpread / 2 + (maxSpread / (n - 1)) * slot
  // Center flowers slightly larger for a dome shape
  const getSize = (slot: number) =>
    Math.max(96 - Math.abs(slot - Math.floor(n / 2)) * 2, 82)

  return (
    <div className="min-h-screen polka-bg page-enter flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b-2 border-[#F7A8BE] px-4 py-3 flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-[#E8779A] font-bold text-sm hover:text-[#E8779A]/70 transition-colors">
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
            <path d="M9.5 1.5 L12.5 4.5 L4.5 12.5 L1 13 L1.5 9.5 Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
            <path d="M8 3 L11 6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
          </svg>
          Edit
        </button>
        <h1 className="text-3xl text-[#3D2800]" style={DISPLAY}>
          Your Bouquet
        </h1>
        <div className="text-right flex flex-col items-end gap-0.5">
          <DateChip date={deliveryDate} onConfirm={onDateConfirm} />
          <p className="text-xs text-[#E8779A] font-bold">{totalItems} stems · ${totalPrice.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 py-6 flex flex-col items-center">
        <div className="w-full bg-white rounded-3xl border-4 border-[#F7A8BE] shadow-2xl pt-3 px-6 pb-6 mb-6 flex flex-col items-center">
          <p className="text-[#8B6B00] font-bold text-xs uppercase tracking-widest mb-0">
            Your Custom Bouquet
          </p>

          {/* Fan — every element pivots from the exact same point: bottom-center */}
          <div className="relative flex items-end justify-center" style={{ height: 200, width: '100%' }}>

            {/* Eucalyptus: just beyond the outermost flower angle, lowest z */}
            {[-1, 1].map((side, i) => {
              const outerAngle = n <= 1 ? 0 : maxSpread / 2
              const angle = side * (outerAngle + 12)
              return (
                <div key={`eu-${i}`} className="absolute select-none"
                  style={{
                    bottom: 56, left: '50%',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    zIndex: 2,
                    transformOrigin: 'bottom center',
                  }}>
                  <EucalyptusSVG size={92} />
                </div>
              )
            })}

            {/* Baby's breath: at ±1/4 of the spread, between center and outer */}
            {[-1, 1].map((side, i) => {
              const angle = side * (maxSpread / 4)
              return (
                <div key={`bb-${i}`} className="absolute select-none"
                  style={{
                    bottom: 56, left: '50%',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    zIndex: 7,
                    transformOrigin: 'bottom center',
                  }}>
                  <BabyBreathSVG size={84} />
                </div>
              )
            })}

            {/* Main flowers: arranged by weight, center flowers larger */}
            {arranged.map((s, slot) => {
              if (!s) return null
              const FlowerSvg = FLOWER_SVGS[s.flower.id]
              const angle = getAngle(slot)
              const size = getSize(slot)
              return (
                <div key={`fl-${slot}`} className="absolute select-none"
                  style={{
                    bottom: 56, left: '50%',
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                    zIndex: slot + 10,
                    transformOrigin: 'bottom center',
                  }}>
                  {FlowerSvg && <FlowerSvg size={size} colorId={s.colorId} />}
                </div>
              )
            })}

            {/* Wrapper cone */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="-mb-1">
                <path d="M20 12 C14 8 6 4 4 10 C2 16 12 18 20 12" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M20 12 C26 8 34 4 36 10 C38 16 28 18 20 12" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="20" cy="12" r="3.5" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1"/>
              </svg>
              <svg width="56" height="72" viewBox="0 0 56 72" fill="none">
                <path d="M4 0 L52 0 L42 72 L14 72 Z"
                  fill="url(#wrap-grad)" stroke="#C8A830" strokeWidth="2" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="wrap-grad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#FFFCD5"/>
                    <stop offset="50%" stopColor="#FFFCD5"/>
                    <stop offset="100%" stopColor="#FFFCD5"/>
                  </linearGradient>
                </defs>
                <line x1="18" y1="0" x2="16" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.4"/>
                <line x1="28" y1="0" x2="28" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.3"/>
                <line x1="38" y1="0" x2="40" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.4"/>
              </svg>
            </div>
          </div>

          {/* Stem list */}
          <div className="w-full mt-4 border-t-2 border-dashed border-[#FFFCD5] pt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
              What's inside
            </p>
            <div className="flex flex-col gap-2">
              {FLOWERS.filter(f => (selected[f.id]?.count ?? 0) > 0).map(f => {
                const sel = selected[f.id]
                const count = sel?.count ?? 0
                const colorId = sel?.colorId ?? DEFAULT_COLOR[f.id] ?? 'default'
                const FlowerSvg = FLOWER_SVGS[f.id]
                const variantLabel = FLOWER_VARIANTS[f.id]?.find(v => v.id === colorId)?.label
                return (
                  <div key={f.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 flex items-center justify-center overflow-hidden">
                        {FlowerSvg && <FlowerSvg size={28} colorId={colorId} />}
                      </div>
                      <div>
                        <span className="text-sm font-bold text-gray-700" style={{ fontFamily: 'Nunito, sans-serif' }}>
                          {f.name}
                        </span>
                        {variantLabel && (
                          <span className="text-xs text-gray-400 ml-1">({variantLabel})</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-gray-400">x{count}</span>
                      <span className="text-sm font-bold text-gray-600">
                        ${(count * f.price).toFixed(2)}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="mt-3 pt-3 border-t border-[#FFFCD5] flex justify-between items-center">
              <span className="font-black text-gray-700">Total</span>
              <span className="font-black text-xl text-[#8B6B00]">${totalPrice.toFixed(2)}</span>
            </div>

            {/* ── Filler Flowers Assurance ── */}
            <div className="w-full mt-4 pt-4 border-t-2 border-dashed border-[#FFFCD5]">
              <p className="text-sm font-black text-[#4A7A28] mb-3">Your bouquet will be lovingly filled with</p>
              <div className="flex flex-col gap-1.5">
                {FILLERS.map(f => (
                  <div key={f.name} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#6BAA40] flex-shrink-0" />
                    <span className="text-sm font-bold text-gray-700">{f.name}</span>
                    <span className="text-xs text-gray-400">— {f.desc}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-400 mt-3 italic">The best combination of fillers will be used.</p>
            </div>
          </div>
        </div>

        <>
          {/* ── Postcard to florist ── */}
          <div className="w-full mt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Tell Me More</p>
            <div className="relative bg-[#FFFDF4] rounded-2xl shadow-lg overflow-hidden"
              style={{ border: '2px dashed #C8A830' }}>
              {/* Stamp corner */}
              <div className="absolute top-3 right-3 w-14 h-16 border-2 border-[#C8A830] rounded-sm bg-[#FFFCD5] flex flex-col items-center justify-center gap-0.5 z-10">
                <RoseSVG size={32} colorId="pink" />
                <p className="text-[7px] font-black text-[#8B6B00] tracking-wider">FLORALS CLARE</p>
              </div>
              {/* Postmark watermark */}
              <svg className="absolute top-4 right-16 opacity-10 pointer-events-none" width="52" height="52" viewBox="0 0 52 52" fill="none">
                <circle cx="26" cy="26" r="24" stroke="#8B6B00" strokeWidth="1.5" strokeDasharray="3 2"/>
                <text x="26" y="22" textAnchor="middle" fontSize="5.5" fill="#8B6B00" fontFamily="sans-serif" fontWeight="bold">FLORALS</text>
                <text x="26" y="30" textAnchor="middle" fontSize="5.5" fill="#8B6B00" fontFamily="sans-serif" fontWeight="bold">BY CLARE</text>
                <line x1="8" y1="26" x2="44" y2="26" stroke="#8B6B00" strokeWidth="0.8"/>
              </svg>

              <div className="p-5 pr-20 pb-4">
                <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-3">What's the occasion?</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {EVENTS.map(e => (
                    <button
                      key={e}
                      onClick={() => setEvent(ev => ev === e ? '' : e)}
                      className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                      style={{
                        borderColor: event === e ? '#C8A830' : '#E8E0C8',
                        backgroundColor: event === e ? '#FFFCD5' : 'transparent',
                        color: event === e ? '#3D2800' : '#A89060',
                      }}
                    >{e}</button>
                  ))}
                </div>

                <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-3">What vibe are you after?</p>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {VIBES.map(v => (
                    <button
                      key={v}
                      onClick={() => setVibe(cur => cur === v ? '' : v)}
                      className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                      style={{
                        borderColor: vibe === v ? '#E8779A' : '#F0D0DC',
                        backgroundColor: vibe === v ? '#FDD6E4' : 'transparent',
                        color: vibe === v ? '#3D2800' : '#C890A0',
                      }}
                    >{v}</button>
                  ))}
                </div>

                <p className="text-xs font-black text-[#8B6B00] uppercase tracking-widest mb-2">Anything else for us? <span className="font-normal normal-case text-gray-300">(optional)</span></p>
                <div className="relative">
                  {[0,1,2].map(i => (
                    <div key={i} className="border-b border-[#F0E8C0] h-7" />
                  ))}
                  <textarea
                    value={extraNote}
                    onChange={e => setExtraNote(e.target.value)}
                    placeholder="e.g. no lilies please, surprise her..."
                    maxLength={160}
                    className="absolute inset-0 w-full h-full bg-transparent text-[#3D2800] text-xs leading-7 placeholder-gray-300 outline-none resize-none pt-1"
                  />
                </div>
                <p className="text-right text-[9px] text-gray-300 mt-1">{extraNote.length}/160</p>
              </div>
            </div>
          </div>

          {/* ── Inspiration Photos ── */}
          <div className="w-full mt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">Inspiration Photos <span className="font-normal normal-case">(optional)</span></p>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
            <button
              onClick={() => fileRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-[#F7A8BE] bg-[#FFF9FB] hover:bg-[#FDD6E4] transition-all p-4 flex flex-col items-center gap-2 cursor-pointer"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect x="2" y="6" width="28" height="20" rx="4" stroke="#E8779A" strokeWidth="1.5"/>
                <circle cx="11" cy="13" r="2.5" stroke="#E8779A" strokeWidth="1.5"/>
                <path d="M2 22 L9 16 L14 20 L20 14 L30 22" stroke="#E8779A" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M22 9 L22 3 M19 6 L25 6" stroke="#F7A8BE" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
              <p className="text-sm font-semibold text-[#E8779A]">Upload inspiration photos</p>
              <p className="text-xs text-gray-400">Show us the vibe you love <span className="text-gray-300">(optional)</span></p>
            </button>
            {inspirations.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                {inspirations.map((src, i) => (
                  <div key={i} className="relative group">
                    <img src={src} alt="inspiration" className="w-full h-24 object-cover rounded-xl border-2 border-[#F7A8BE]" />
                    <button
                      onClick={() => setInspirations(prev => prev.filter((_, j) => j !== i))}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-white/90 text-[#E8779A] text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >✕</button>
                  </div>
                ))}
                <button
                  onClick={() => fileRef.current?.click()}
                  className="h-24 rounded-xl border-2 border-dashed border-[#F7A8BE] text-[#E8779A] text-2xl hover:bg-[#FDD6E4] transition-all flex items-center justify-center"
                >+</button>
              </div>
            )}
          </div>

          {/* ── Contact Info ── */}
          <div className="w-full mt-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">How can I reach you?</p>
            <div className="bg-white rounded-2xl border-2 border-[#F7A8BE] p-4 flex flex-col gap-3">
              <div>
                <label className="text-xs font-bold text-[#8B6B00] uppercase tracking-wide block mb-1.5">Your name</label>
                <input
                  value={contactName}
                  onChange={e => setContactName(e.target.value)}
                  placeholder="e.g. Jamie"
                  className="w-full rounded-xl border-2 border-[#F0D0DC] bg-[#FFF9FB] px-3 py-2 text-sm text-[#3D2800] placeholder-gray-300 outline-none focus:border-[#E8779A] transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[#8B6B00] uppercase tracking-wide block mb-1.5">Contact via</label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {([
                    { id: 'telegram', label: '✈ Telegram' },
                    { id: 'instagram', label: '◈ Instagram' },
                    { id: 'email', label: '✉ Email' },
                  ] as const).map(opt => (
                    <button
                      key={opt.id}
                      onClick={() => { setContactMethod(opt.id); setContactValue('') }}
                      className="px-3 py-1 rounded-full text-xs font-bold border-2 transition-all"
                      style={{
                        borderColor: contactMethod === opt.id ? '#E8779A' : '#F0D0DC',
                        backgroundColor: contactMethod === opt.id ? '#FDD6E4' : 'transparent',
                        color: contactMethod === opt.id ? '#3D2800' : '#C890A0',
                      }}
                    >{opt.label}</button>
                  ))}
                </div>
                <input
                  value={contactValue}
                  onChange={e => setContactValue(e.target.value)}
                  placeholder={
                    contactMethod === 'telegram' ? '@username' :
                    contactMethod === 'instagram' ? '@handle' :
                    'your@email.com'
                  }
                  className="w-full rounded-xl border-2 border-[#F0D0DC] bg-[#FFF9FB] px-3 py-2 text-sm text-[#3D2800] placeholder-gray-300 outline-none focus:border-[#E8779A] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* ── Order & Back buttons ── */}
          {(() => {
            const missing = [
              !contactName.trim() && 'your name',
              !contactValue.trim() && 'your contact handle',
            ].filter(Boolean) as string[]
            const canOrder = missing.length === 0
            return (
          <div className="flex flex-col w-full gap-3 mt-4">
            {!canOrder && (
              <p className="text-center text-xs text-[#C890A0] font-semibold">
                Please fill in {missing.join(' & ')} to continue
              </p>
            )}
            <button
              disabled={!canOrder}
              onClick={() => canOrder && onOrder({ event, vibe, contactName, contactMethod, contactValue, inspirations })}
              className="w-full font-black text-2xl py-4 rounded-full shadow-xl transition-all duration-200 border-2"
              style={{
                ...DISPLAY,
                backgroundColor: canOrder ? '#FFFCD5' : '#F0EDD8',
                color: canOrder ? '#3D2800' : '#A89868',
                borderColor: canOrder ? '#C8A830' : '#D8CC90',
                cursor: canOrder ? 'pointer' : 'default',
                boxShadow: canOrder ? undefined : 'none',
              }}
            >
              Order My Bouquet
            </button>
            <button
              onClick={onBack}
              className="w-full bg-white border-2 border-[#F7A8BE] text-[#E8779A] font-bold py-3 rounded-full hover:bg-[#FDD6E4] transition-all"
            >
              Add More Flowers
            </button>
          </div>
            )
          })()}
        </>
      </div>
    </div>
  )
}

function Confirmation({
  selected,
  orderInfo,
  deliveryDate,
  onRestart,
}: {
  selected: Record<string, Selection>
  orderInfo: { event: string; vibe: string; budget?: string; contactName: string; contactMethod: string; contactValue: string }
  deliveryDate: Date
  onRestart: () => void
}) {
  const stems = FLOWERS.flatMap(f => {
    const sel = selected[f.id]
    if (!sel || sel.count === 0) return []
    return Array.from({ length: sel.count }, () => ({ flower: f, colorId: sel.colorId }))
  })
  const DISPLAY_WEIGHT: Record<string, number> = {
    rose: 5, gerbera: 4, lily: 4,
    chrysanthemum: 3, tulip: 3,
    carnation: 2, hydrangea: 2,
  }
  const byWeight = [...stems].sort(
    (a, b) => (DISPLAY_WEIGHT[b.flower.id] ?? 2) - (DISPLAY_WEIGHT[a.flower.id] ?? 2)
  )
  const n = byWeight.length
  const arranged: typeof stems = new Array(n)
  byWeight.forEach((stem, rank) => {
    const center = Math.floor(n / 2)
    const offset = rank === 0 ? 0 : rank % 2 === 1 ? -Math.ceil(rank / 2) : Math.ceil(rank / 2)
    const slot = Math.min(Math.max(center + offset, 0), n - 1)
    arranged[slot] = stem
  })
  const maxSpread = Math.min(n * 11, 86)
  const getAngle = (slot: number) => n <= 1 ? 0 : -maxSpread / 2 + (maxSpread / (n - 1)) * slot
  const getSize = (slot: number) => Math.max(96 - Math.abs(slot - Math.floor(n / 2)) * 2, 82)

  return (
    <div className="min-h-screen polka-bg page-enter flex flex-col items-center justify-start px-4 py-10">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Heading */}
        <div className="text-center">
          <p className="text-xs font-bold text-[#8B6B00] uppercase tracking-widest mb-1">your order is in!</p>
          <h1 className="text-5xl text-[#3D2800]" style={DISPLAY}>Order Placed!</h1>
          {(orderInfo.event || orderInfo.vibe) && (
            <p className="text-sm font-semibold text-[#E8779A] mt-1">
              {[orderInfo.event, orderInfo.vibe].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        {/* Bouquet fan */}
        <div className="w-full bg-white rounded-3xl border-4 border-[#F7A8BE] shadow-2xl pt-3 px-6 pb-6 flex flex-col items-center">
          <p className="text-[#8B6B00] font-bold text-xs uppercase tracking-widest mb-0">Your Bouquet</p>
          <div className="relative flex items-end justify-center" style={{ height: 200, width: '100%' }}>
            {[-1, 1].map((side, i) => {
              const outerAngle = n <= 1 ? 0 : maxSpread / 2
              const angle = side * (outerAngle + 12)
              return (
                <div key={`eu-${i}`} className="absolute select-none"
                  style={{ bottom: 56, left: '50%', transform: `translateX(-50%) rotate(${angle}deg)`, zIndex: 2, transformOrigin: 'bottom center' }}>
                  <EucalyptusSVG size={92} />
                </div>
              )
            })}
            {[-1, 1].map((side, i) => {
              const angle = side * (maxSpread / 4)
              return (
                <div key={`bb-${i}`} className="absolute select-none"
                  style={{ bottom: 56, left: '50%', transform: `translateX(-50%) rotate(${angle}deg)`, zIndex: 7, transformOrigin: 'bottom center' }}>
                  <BabyBreathSVG size={84} />
                </div>
              )
            })}
            {arranged.map((s, slot) => {
              if (!s) return null
              const FlowerSvg = FLOWER_SVGS[s.flower.id]
              const angle = getAngle(slot)
              const size = getSize(slot)
              return (
                <div key={`fl-${slot}`} className="absolute select-none"
                  style={{ bottom: 56, left: '50%', transform: `translateX(-50%) rotate(${angle}deg)`, zIndex: slot + 10, transformOrigin: 'bottom center' }}>
                  {FlowerSvg && <FlowerSvg size={size} colorId={s.colorId} />}
                </div>
              )
            })}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center">
              <svg width="40" height="24" viewBox="0 0 40 24" fill="none" className="-mb-1">
                <path d="M20 12 C14 8 6 4 4 10 C2 16 12 18 20 12" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1.5" strokeLinejoin="round"/>
                <path d="M20 12 C26 8 34 4 36 10 C38 16 28 18 20 12" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1.5" strokeLinejoin="round"/>
                <circle cx="20" cy="12" r="3.5" fill="#FFFCD5" stroke="#C8A830" strokeWidth="1"/>
              </svg>
              <svg width="56" height="72" viewBox="0 0 56 72" fill="none">
                <path d="M4 0 L52 0 L42 72 L14 72 Z" fill="#FFFCD5" stroke="#C8A830" strokeWidth="2" strokeLinejoin="round"/>
                <line x1="18" y1="0" x2="16" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.4"/>
                <line x1="28" y1="0" x2="28" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.3"/>
                <line x1="38" y1="0" x2="40" y2="72" stroke="#C8A830" strokeWidth="0.5" opacity="0.4"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Wait message */}
        <div className="w-full bg-white rounded-2xl border-2 border-[#F7A8BE] p-5 text-center">
          <div className="flex justify-center mb-3">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <circle cx="18" cy="18" r="16" stroke="#F7A8BE" strokeWidth="2"/>
              <path d="M18 10 L18 19 L24 22" stroke="#E8779A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-sm font-bold text-[#3D2800] mb-1">I'll be in touch soon!</p>
          <p className="text-sm text-gray-400 leading-relaxed">
            Please allow up to <span className="font-bold text-[#E8779A]">3 days</span> for me to reach out and confirm your bouquet.
          </p>
          <div className="mt-2 bg-[#FFFCD5] rounded-xl px-3 py-2 inline-block">
            <p className="text-xs font-bold text-[#8B6B00]">
              Delivery: {deliveryDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          {(orderInfo.contactName || orderInfo.contactValue) && (
            <div className="mt-3 pt-3 border-t border-[#F0D0DC]">
              <p className="text-xs text-gray-400">We'll reach <span className="font-bold text-[#3D2800]">{orderInfo.contactName || 'you'}</span> via {orderInfo.contactMethod} at</p>
              <p className="text-sm font-bold text-[#E8779A]">{orderInfo.contactValue}</p>
            </div>
          )}
        </div>

        <button
          onClick={onRestart}
          className="w-full bg-[#F7A8BE] hover:bg-[#E8779A] text-white font-bold py-3 rounded-full transition-all hover:scale-105 shadow-md"
        >
          Build Another Bouquet
        </button>
      </div>
    </div>
  )
}

export default function App() {
  const [page, setPage] = useState<Page>('storefront')
  const [selected, setSelected] = useState<Record<string, Selection>>({})
  const [deliveryDate, setDeliveryDate] = useState<Date>(new Date())
  const [orderInfo, setOrderInfo] = useState({ event: '', vibe: '', budget: '', contactName: '', contactMethod: 'telegram', contactValue: '' })

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }) }, [page])

  function handleToggle(id: string, delta: number) {
    setSelected(prev => {
      const cur = prev[id] ?? { count: 0, colorId: DEFAULT_COLOR[id] ?? 'default' }
      const count = Math.max(0, cur.count + delta)
      if (count === 0) {
        const next = { ...prev }
        delete next[id]
        return next
      }
      return { ...prev, [id]: { ...cur, count } }
    })
  }

  function handleColorChange(id: string, colorId: string) {
    setSelected(prev => {
      const cur = prev[id]
      if (!cur) return { ...prev, [id]: { count: 1, colorId } }
      return { ...prev, [id]: { ...cur, colorId } }
    })
  }

  function restart() {
    setSelected({})
    setOrderInfo({ event: '', vibe: '', budget: '', contactName: '', contactMethod: 'telegram', contactValue: '' })
    setPage('storefront')
  }

  if (page === 'storefront') return <Storefront onEnter={() => setPage('datepicker')} />
  if (page === 'datepicker') return (
    <DatePicker onSelect={date => { setDeliveryDate(date); setPage('choosetype') }} />
  )
  if (page === 'choosetype') return (
    <ChooseType
      deliveryDate={deliveryDate}
      onCustom={() => setPage('shop')}
      onSurprise={() => setPage('surprise')}
      onDateConfirm={setDeliveryDate}
    />
  )
  if (page === 'shop') return (
    <Shop
      selected={selected}
      onToggle={handleToggle}
      onColorChange={handleColorChange}
      onPreview={() => setPage('preview')}
      onBack={() => setPage('choosetype')}
      onAiSelect={setSelected}
      deliveryDate={deliveryDate}
      onDateConfirm={setDeliveryDate}
    />
  )
  if (page === 'surprise') return (
    <SurpriseBouquet
      deliveryDate={deliveryDate}
      onBack={() => setPage('choosetype')}
      onOrder={info => {
        setOrderInfo(info)
        sendOrderEmail({
          order_type: 'Surprise Bouquet',
          customer_name: info.contactName,
          contact_method: info.contactMethod,
          contact_value: info.contactValue,
          delivery_date: deliveryDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }),
          event: info.event || '—',
          vibe: info.vibe || '—',
          budget: info.budget || '—',
          flowers: '(Surprise — chosen by florist)',
          extra_note: info.extraNote || '—',
        }, info.inspirations)
        setPage('confirmation')
      }}
      onDateConfirm={setDeliveryDate}
    />
  )
  if (page === 'preview') return (
    <BouquetPreview
      selected={selected}
      onBack={() => setPage('shop')}
      onOrder={info => {
        setOrderInfo({ budget: '', ...info })
        const flowerList = FLOWERS
          .filter(f => selected[f.id]?.count)
          .map(f => `${selected[f.id].count}x ${f.name} (${selected[f.id].colorId})`)
          .join(', ')
        sendOrderEmail({
          order_type: 'Custom Bouquet',
          customer_name: info.contactName,
          contact_method: info.contactMethod,
          contact_value: info.contactValue,
          delivery_date: deliveryDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' }),
          event: info.event || '—',
          vibe: info.vibe || '—',
          budget: '—',
          flowers: flowerList || '—',
          extra_note: '—',
        }, info.inspirations)
        setPage('confirmation')
      }}
      deliveryDate={deliveryDate}
      onDateConfirm={setDeliveryDate}
    />
  )
  return (
    <Confirmation
      selected={selected}
      orderInfo={orderInfo}
      deliveryDate={deliveryDate}
      onRestart={restart}
    />
  )
}
