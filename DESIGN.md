# ScholarStack Design System

## Brand Identity

ScholarStack is a premium editorial review platform for advanced computer science graduates and systems architects. The visual language communicates **precision**, **depth**, and **architectural clarity**.

---

## Color Palette

### Primary

| Token                    | Value       | Usage                                    |
| ------------------------ | ----------- | ---------------------------------------- |
| `--color-primary`        | `#3e00ab`   | CTAs, active states, key brand accents   |
| `--color-primary-container` | `#5624d0` | Gradient endpoints, lighter primary uses |
| `--color-on-primary`     | `#ffffff`   | Text/icons on primary backgrounds        |
| `--color-primary-fixed`  | *(theme)*   | Badges, subtle brand fills               |

### Secondary

| Token                        | Value       | Usage                                      |
| ---------------------------- | ----------- | ------------------------------------------ |
| `--color-secondary`          | `#006a6a`   | Progress bars, success states, accents      |
| `--color-secondary-container`| `#68f7f8`   | Achievement badges, light accent fills      |

### Surfaces

| Token                               | Value                        | Usage                      |
| ----------------------------------- | ---------------------------- | -------------------------- |
| `--color-surface`                   | `#fbf9f8`                    | Page background            |
| `--color-surface-bright`            | `#ffffff`                    | Elevated cards             |
| `--color-surface-container-low`     | `#f6f3f2`                    | Sidebar, footer            |
| `--color-surface-container-lowest`  | `#ffffff`                    | Card backgrounds           |
| `--color-surface-container-high`    | `#eae8e7`                    | Input backgrounds, borders |
| `--color-surface-container-highest` | `#e4e2e1`                    | Hover states               |

### Text & Outlines

| Token                        | Value                        | Usage                   |
| ---------------------------- | ---------------------------- | ----------------------- |
| `--color-on-surface`         | `#1b1c1c`                    | Primary text            |
| `--color-on-surface-variant`  | `#494455`                    | Secondary text, labels  |
| `--color-outline-variant`    | `rgba(202, 195, 216, 0.15)`  | Borders, dividers       |
| `--color-error`              | `#ba1a1a`                    | Error states            |

---

## Typography

### Font Families

- **Sans-serif** (body): `Inter` — clean, readable, modern
- **Monospace** (code): `JetBrains Mono` — technical precision

### Scale & Weights

| Element         | Size                   | Weight      | Tracking            |
| --------------- | ---------------------- | ----------- | -------------------- |
| Hero heading    | `text-6xl` / `text-8xl`| `font-black`| `tracking-tighter`   |
| Page heading    | `text-4xl` / `text-5xl`| `font-black`| `tracking-tighter`   |
| Section heading | `text-2xl`             | `font-bold` | `tracking-tight`     |
| Card title      | `text-lg`              | `font-bold` | default              |
| Body text       | `text-sm` / `text-base`| `font-medium`| default             |
| Label / caption | `text-[10px]`          | `font-bold` | `tracking-widest`, `uppercase` |

---

## Spacing & Layout

- **Page padding**: `p-8 md:p-12`
- **Max content width**: `max-w-7xl mx-auto`
- **Section gap**: `space-y-12` (between page sections)
- **Card gap**: `gap-6` (grid items)
- **Sidebar width**: `w-64` (fixed, hidden on mobile)
- **Header**: sticky, glass-blur effect (`bg-surface/80 backdrop-blur-xl`)

---

## Radius

| Token          | Value      | Usage                    |
| -------------- | ---------- | ------------------------ |
| `--radius-lg`  | `0.5rem`   | Buttons, small cards     |
| `--radius-xl`  | `0.75rem`  | Cards                    |
| `--radius-2xl` | `1rem`     | Large panels, modals     |
| rounded-full   | pill       | Badges, avatars, pills   |

---

## Component Patterns

### Cards

- Background: `bg-surface-container-lowest`
- Border: `border border-outline-variant/10` or `border-transparent` with hover
- Hover: `hover:shadow-[0_12px_32px_rgba(62,0,171,0.04)]`
- Padding: `p-5` or `p-6`
- Radius: `rounded-xl`

### Buttons

- **Primary**: `primary-gradient text-on-primary font-bold rounded-lg shadow-lg`
- **Secondary**: `bg-surface-container-high text-on-surface font-bold rounded-lg`
- **Ghost**: `text-primary font-bold hover:underline`
- **Icon**: `p-2 text-on-surface-variant hover:bg-surface-container-high rounded-full`

### Badges / Tags

- `text-[10px] font-bold uppercase tracking-widest`
- Background varies: `bg-primary/10`, `bg-secondary-container`, `bg-primary-fixed`
- Rounded: `rounded` or `rounded-full`

### Progress Bars

- Track: `bg-secondary-container rounded-full` or `bg-outline-variant/20`
- Fill: `bg-secondary rounded-full`
- Height: `h-1` (compact) or `h-2` (standard)

### Glass Effects

- Header: `bg-surface/80 backdrop-blur-xl`
- Shadow: `shadow-[0_12px_32px_rgba(62,0,171,0.04)]`

---

## Motion

All page transitions use `framer-motion`:

- **Enter**: `opacity: 0, y: 20` → `opacity: 1, y: 0`
- **Exit**: `opacity: 1, y: 0` → `opacity: 0, y: -20`
- **Stagger delay**: `0.2s` for hero elements
- **Hover scale**: `hover:scale-105` / `hover:scale-110` for CTAs

---

## Iconography

- Library: `lucide-react`
- Size: `16`–`28` depending on context
- Active nav icons use `fill="currentColor"`

---

## Navigation Structure

| Sidebar Label | Route        | Page Component |
| ------------- | ------------ | -------------- |
| Dashboard     | `/dashboard` | Dashboard      |
| Catalog       | `/catalog`   | Catalog        |
| Library       | `/library`   | Library        |
| My Modules    | `/modules`   | Modules        |
| Workspace     | `/workspace` | Workspace      |

The landing page (`/`) is a marketing hero page, separate from the authenticated dashboard.

---

## Data Model Alignment

The UI must align with the course specification defined in `types.ts` and `constants.ts`:

- **Courses** have modules, each module has lessons
- **Lessons** include content type (video, reading, quiz), duration, and ordering
- **Progress** is tracked per-course as a percentage in Firestore
- **Workspace** snippets are keyed by courseId
- All display data should be derived from the constants/types, never hardcoded in components
