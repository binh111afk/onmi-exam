# Design System — Onmi

## Overview

Onmi uses a custom design system built on **TailwindCSS v4**. Design tokens are defined as CSS custom properties in `src/index.css` using the `@theme` block. All colors, radii, and font settings must be used through these tokens — never hardcoded hex values in Tailwind classes.

---

## Color Palette

### Primary (Brand Purple)

| Token | CSS Variable | Hex | Tailwind Class |
|---|---|---|---|
| Primary | `--color-primary` | `#6C5DD3` | `text-primary`, `bg-primary`, `border-primary` |
| Primary Hover | `--color-primary-hover` | `#584BBA` | `hover:bg-primary-hover` |
| Primary Light | `--color-primary-light` | `#F1EEFC` | `bg-primary-light` |

### Success (Green)

| Token | CSS Variable | Hex | Tailwind Class |
|---|---|---|---|
| Success | `--color-success` | `#10B981` | `text-success`, `bg-success` |
| Success Hover | `--color-success-hover` | `#059669` | `hover:bg-success-hover` |
| Success Light | `--color-success-light` | `#ECFDF5` | `bg-success-light` |

### Accent (Pink/Rose)

| Token | CSS Variable | Hex | Tailwind Class |
|---|---|---|---|
| Accent | `--color-accent` | `#FF758F` | `text-accent`, `bg-accent` |
| Accent Hover | `--color-accent-hover` | `#E0536C` | `hover:bg-accent-hover` |
| Accent Light | `--color-accent-light` | `#FFF0F2` | `bg-accent-light` |

### Danger (Red)

| Token | CSS Variable | Hex | Tailwind Class |
|---|---|---|---|
| Danger | `--color-danger` | `#EF4444` | `text-danger`, `bg-danger` |
| Danger Hover | `--color-danger-hover` | `#DC2626` | `hover:bg-danger-hover` |
| Danger Light | `--color-danger-light` | `#FEF2F2` | `bg-danger-light` |

### Text Colors

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Text Primary | `--color-text-primary` | `#1F2C3F` | Main body text, headings |
| Text Secondary | `--color-text-secondary` | `#7E8B9B` | Subtext, labels, metadata |
| Text Muted | `--color-text-muted` | `#A3AED0` | Placeholders, disabled states |

### Background Colors

| Token | CSS Variable | Hex | Usage |
|---|---|---|---|
| Background Base | `--color-bg-base` | `#F4F6FA` | Page backgrounds |
| Background Surface | `--color-bg-surface` | `#FFFFFF` | Cards, modals, sidebars |

### Slate (Neutral)

Tailwind's built-in `slate-*` scale is used for borders, dividers, and neutral surfaces:
- `slate-50` — lightest neutral surface
- `slate-100` — borders, dividers
- `slate-200` — strong borders
- `slate-300` — icon strokes
- `slate-400` — secondary text (prefer `text-text-secondary`)
- `slate-500` — body text on light backgrounds
- `slate-600` — dark body text
- `slate-800` — near-black headings

---

## Typography

### Font Family
```css
--font-sans: 'Inter', 'system-ui', 'sans-serif'
```
Inter is loaded from Google Fonts. Applied globally via `font-family: var(--font-sans)` on `body`.

### Type Scale

The design system uses small, precise type sizes to achieve a premium look. Common sizes:

| Class | Size | Usage |
|---|---|---|
| `text-[8px]` | 8px | Extremely fine labels, sub-labels |
| `text-[9px]` | 9px | Section labels, ALL CAPS headers |
| `text-[10px]` | 10px | Metadata, timestamps, tags |
| `text-[11px]` | 11px | Small body text, secondary UI |
| `text-xs` | 12px | Standard UI text, button labels |
| `text-sm` | 14px | Primary body text, headings in modals |
| `text-base` | 16px | Main page body text |
| `text-lg` | 18px | Section headings |
| `text-xl` | 20px | Page headings |
| `text-2xl` | 24px | Hero/dashboard headings |
| `text-3xl+` | 30px+ | Landing page display text |

### Font Weights

| Class | Weight | Usage |
|---|---|---|
| `font-medium` | 500 | Body copy |
| `font-bold` | 700 | Labels, sidebar items, buttons |
| `font-black` | 900 | ALL CAPS section labels, primary headings |

### ALL CAPS Labels
Many UI labels use `text-[9px] font-black text-text-muted uppercase tracking-wider` for a clean, minimal label style:
```jsx
<div className="text-[9px] font-black text-[#A3AED0] uppercase tracking-wider">
  DANH SÁCH CÂU HỎI
</div>
```

---

## Spacing

Spacing follows Tailwind's default spacing scale (4px base unit):

| Value | Pixels | Common Usage |
|---|---|---|
| `p-1` / `gap-1` | 4px | Icon micro-spacing |
| `p-2` / `gap-2` | 8px | Small padding |
| `p-3` / `gap-3` | 12px | Medium padding |
| `p-4` / `gap-4` | 16px | Standard padding |
| `p-5` / `gap-5` | 20px | Medium-large padding |
| `p-6` / `gap-6` | 24px | Large section padding |
| `p-8` / `gap-8` | 32px | Page-level padding |
| `p-12` | 48px | Extra-large padding |

---

## Border Radius

Onmi uses large, "premium" radii throughout.

| Token | CSS Variable | Value | Tailwind Class | Usage |
|---|---|---|---|---|
| Card | `--radius-card` | 24px | `rounded-[24px]` or `rounded-3xl` | Cards, modals |
| Button | `--radius-btn` | 14px | `rounded-xl` | Buttons |
| Input | `--radius-input` | 14px | `rounded-xl` | Text inputs |
| Dialog | `--radius-dialog` | 24px | `rounded-3xl` | Dialogs, drawers |
| Small | — | 12px | `rounded-2xl` | Small cards, tags |
| Pill | — | 9999px | `rounded-full` | Badges, avatars |

---

## Shadows

Onmi shadows are subtle and elevation-based:

```css
/* Standard card */
shadow-sm

/* Elevated card */
shadow-md

/* Modal/Dialog */
shadow-2xl

/* Notion-style subtle */
.notion-shadow {
  box-shadow: 0px 1px 2px rgba(0, 0, 0, 0.05), 0px 4px 12px rgba(0, 0, 0, 0.03);
}
```

Colored shadows for branded buttons:
```jsx
{/* Primary button shadow */}
className="shadow-md shadow-indigo-150"

{/* Success button shadow */}
className="shadow-md shadow-emerald-100"
```

---

## Animation

Standard transition: `250ms` cubic-bezier

```css
--transition-duration-default: 250ms
```

Common animation classes:
- `transition` — default transition on hover states
- `animate-fadeIn` — custom fade-in (defined inline or in index.css)
- `animate-spin` — loading spinners (Tailwind built-in)
- `animate-pulse` — live status indicators (Tailwind built-in)
- `animate-scaleUp` — modal entry animation (custom)

---

## Component Patterns

### Cards

Standard card pattern:
```jsx
<div className="bg-white rounded-[24px] p-6 border border-slate-100/80 shadow-sm">
  {/* card content */}
</div>
```

Hoverable card:
```jsx
<div className="bg-white rounded-[24px] p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200 transition cursor-pointer">
  {/* card content */}
</div>
```

### Buttons

**Primary button:**
```jsx
<button className="px-5 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-black rounded-xl transition cursor-pointer shadow-sm">
  Xuất bản đề thi
</button>
```

**Secondary button:**
```jsx
<button className="px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold rounded-xl transition cursor-pointer bg-white shadow-sm">
  Lưu nháp
</button>
```

**Danger button:**
```jsx
<button className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 text-xs font-bold rounded-xl transition cursor-pointer bg-white shadow-sm">
  Tạo đề mới
</button>
```

**Ghost/icon button:**
```jsx
<button className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition cursor-pointer">
  <Edit size={14} />
</button>
```

### Inputs

**Standard text input:**
```jsx
<input
  type="text"
  className="w-full bg-white border border-[#E2E8F0] focus:border-primary rounded-2xl px-4 py-3 text-xs font-bold text-slate-800 outline-none transition focus:ring-2 focus:ring-primary/10 placeholder:text-slate-400"
  placeholder="Nhập..."
/>
```

**Select input:**
```jsx
<div className="relative">
  <select className="w-full bg-white border border-[#E2E8F0] focus:border-primary rounded-2xl px-3.5 py-3 text-xs font-bold text-slate-800 appearance-none outline-none focus:ring-2 focus:ring-primary/10 transition cursor-pointer pr-10">
    <option>Option 1</option>
  </select>
  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
    <ChevronDown size={14} />
  </div>
</div>
```

### Labels (input)
```jsx
<label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
  TÊN ĐỀ THI
</label>
```

### Section Headers (inside cards)
```jsx
<div className="flex items-center gap-3.5">
  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-primary flex items-center justify-center shrink-0">
    <FileText size={16} className="stroke-[2.5]" />
  </div>
  <div>
    <h3 className="text-xs font-black text-slate-800 uppercase tracking-wide">
      THÔNG TIN CƠ BẢN
    </h3>
    <p className="text-[10px] text-slate-400 font-bold -mt-0.5">
      Nhập thông tin chính của đề thi
    </p>
  </div>
</div>
```

### Sidebar (Teacher Studio)
```jsx
<aside className="w-64 bg-white border-r border-slate-100 flex flex-col shrink-0 min-h-0 h-full overflow-hidden">
  {/* Navigation items */}
</aside>
```

Sidebar nav button pattern:
```jsx
<button
  className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-2xl transition cursor-pointer ${
    isActive
      ? 'bg-primary-light text-primary shadow-[0_4px_12px_rgba(108,93,211,0.08)]'
      : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
  }`}
>
  <Icon size={16} />
  <span>Menu Item</span>
</button>
```

### Dialogs / Modals

```jsx
{/* Overlay */}
<div className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-sm z-[100]" onClick={onClose} />

{/* Modal */}
<div className="bg-white rounded-3xl w-full max-w-[460px] p-6 shadow-2xl relative z-[101] border border-slate-100 animate-scaleUp">
  {/* content */}
</div>
```

### Status Badge
```jsx
{/* Success */}
<span className="px-2 py-1 bg-success-light text-success text-[9px] font-black rounded-lg uppercase">
  Hoạt động
</span>

{/* Warning */}
<span className="px-2 py-1 bg-amber-50 text-amber-600 text-[9px] font-black rounded-lg uppercase">
  Chờ duyệt
</span>
```

---

## Icons

**Library:** `lucide-react` only. No emojis, no Unicode symbols, no custom SVGs.

**Usage:**
```tsx
import { Edit, Save, Eye } from 'lucide-react';

// Standard usage
<Edit size={14} />

// With stroke width (for thicker/bolder icons)
<CheckCircle2 size={13} className="stroke-[2.5]" />

// Colored
<RefreshCw size={12} className="text-primary animate-spin" />
```

**Common size conventions:**
- `size={12}` — micro icons (inline status, badges)
- `size={14}` — small icons (button icons, sidebar)
- `size={16}` — standard icons (cards, navigation)
- `size={18}` — medium icons (section icons)
- `size={20}` — large icons (feature icons)
- `size={24}` — display icons (empty states, modals)

---

## Scrollbar Styling

Custom scrollbar is globally applied:
```css
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 9999px; }
::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
```

---

## Layout Patterns

### Full-height fixed workspace (Teacher Studio)
```jsx
<div className="fixed inset-0 z-50 bg-[#F8FAFC] flex overflow-hidden font-sans text-text-primary select-none">
  <aside>{/* sidebar */}</aside>
  <main className="flex-1 flex flex-col overflow-hidden min-h-0">
    <header>{/* top nav */}</header>
    <div className="flex-1 overflow-y-auto">{/* content */}</div>
  </main>
</div>
```

### Standard page layout (student pages)
```jsx
<div className="min-h-screen bg-bg-base">
  <Navbar />
  <main className="max-w-7xl mx-auto px-4 py-8">
    {/* page content */}
  </main>
  <Footer />
</div>
```

---

## Do's and Don'ts

### ✅ Do
- Use design token Tailwind classes (`text-primary`, `bg-success-light`)
- Use `rounded-xl` for buttons, `rounded-2xl` for cards, `rounded-3xl` for modals
- Use `font-black` for ALL CAPS labels and important headings
- Use `transition cursor-pointer` on all interactive elements
- Use `lucide-react` icons with explicit size prop

### ❌ Don't
- Use arbitrary hex colors: `text-[#6C5DD3]` → instead use `text-primary`
- Use `inline styles` (`style={{}}`)
- Use emoji or Unicode symbols for icons
- Use `rounded-md` (too small for Onmi's design language)
- Mix `font-bold` and `font-black` inconsistently for the same element type
- Forget `cursor-pointer` on clickable elements
