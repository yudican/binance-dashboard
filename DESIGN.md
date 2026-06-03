# Design System Inspired by Binance

## 1. Visual Theme & Atmosphere

Binance's design system embodies trust, security, and financial sophistication within a modern, high-energy cryptocurrency trading platform. The visual identity balances a dark, professional foundation with bold, energetic accent colors that convey confidence and opportunity. The atmosphere is data-driven and action-oriented, emphasizing clarity and immediacy across complex financial information. Clean typography, precise spacing, and deliberate color choices create a sense of control and reliability, while strategic use of yellow and vibrant accents inject dynamism and urgency into critical user interactions.

**Key Characteristics**

- Dark, professional foundation with navy and charcoal neutrals
- Bold yellow primary accent (`#F0B90B`) for high-priority CTAs and notifications
- Multicolored semantic palette for market data visualization (green for gains, red for losses, orange for warnings)
- Precision typography in the custom BinanceNova font family
- Minimal elevation and shadow philosophy; flat, accessible design
- High contrast between text and backgrounds for clarity in data-dense layouts
- Responsive, mobile-first interaction patterns

## 2. Color Palette & Roles

### Primary

- **Primary Yellow** (`#F0B90B`): Primary call-to-action buttons, sign-up flows, and high-priority actions. Dominates the "Sign Up" button and key engagement moments.
- **Primary Yellow Alternate** (`#FCD535`): Secondary yellow used in warning states and supporting CTAs; slightly lighter variant for hover or alternative contexts.

### Accent Colors

- **Electric Blue** (`#1F8DF9`): Data highlights, links, and informational badges. Used extensively in cryptocurrency symbol colors and interactive elements.
- **Hot Pink** (`#F6465D`): Negative market indicators, loss states, and critical alerts. Represents declining asset values.
- **Vibrant Green** (`#2EBD85`): Positive market indicators and gain states. Represents rising asset values and successful transactions.
- **Warm Orange** (`#DD7A2B`): Warning and caution states; secondary accent for tertiary information.
- **Deep Magenta** (`#EA0070`): Brand accent and special feature highlights.

### Interactive

- **Dark Button Default** (`#333B47`): Secondary button background; neutral interactive surface.
- **Yellow Button** (`#FCD535`): Primary interactive button; converts visitors and initiates trades.

### Neutral Scale

- **White** (`#FFFFFF`): Backgrounds, input fields, and maximum contrast surfaces.
- **Light Gray** (`#EAECEF`): Subtle dividers, borders, and secondary backgrounds.
- **Medium Gray** (`#4F4F4F`): Body text and secondary copy; readable but not dominant.
- **Off-White Gray** (`#EDEDED`): Tertiary surface backgrounds and subtle separations.
- **Black** (`#000000`): Primary text, headers, and maximum legibility contexts.

### Surface & Borders

- **Dark Navy** (`#202630`): Primary page background and elevated surface containers.
- **Slightly Lighter Navy** (`#29313D`): Card backgrounds and nested containers; subtle depth distinction.
- **Border Gray** (`#2B3139`): Subtle border color for buttons and input outlines; dark mode appropriate.

### Semantic / Status

- **Success/Gain** (`#2EBD85`): Market gains, positive confirmations, and upward price movements.
- **Loss/Decline** (`#F6465D`): Market losses, negative warnings, and downward price movements.
- **Warning/Caution** (`#F0B90B`): Important notifications, security alerts, and action required states.
- **Alt Warning** (`#FCD535`): Secondary warning and information highlights.

## 3. Typography Rules

### Font Family

**Primary:** BinanceNova, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif

**Secondary:** BinanceNova (no secondary stack; unified across product)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|----------------|-------|
| Display / H1 | BinanceNova | 40px | 600 | 48px | 0px | Large hero headlines; used sparingly |
| Heading 2 | BinanceNova | 40px | 600 | 48px | 0px | Page section headers and major titles |
| Heading 3 | BinanceNova | 16px | 600 | 24px | 0px | Card headers and subsection titles |
| Heading 4 | BinanceNova | 14px | 700 | 21px | 0px | Form labels and micro-headers |
| Body | BinanceNova | 12px | 400 | 16px | 0px | Default body copy and descriptions |
| Body Emphasis | BinanceNova | 14px | 500 | 22px | 0px | Highlighted body text and span content |
| Input | BinanceNova | 16px | 500 | 24px | 0px | Form input and placeholder text |
| Caption | BinanceNova | 12px | 400 | 16px | 0px | Small disclaimers and secondary labels |
| Link | BinanceNova | 14px | 500 | 22px | 0px | Navigation links and interactive text |

### Principles

- **Clarity Over Decoration:** Typography is utilitarian and supports rapid information scanning in a trading context.
- **Weight Contrast:** Body uses 400 weight; headers use 600–700 to create clear visual hierarchy.
- **Consistent Font:** BinanceNova throughout ensures brand cohesion and optimized rendering for financial data.
- **High Legibility:** Minimum 12px body size and 16px input size support readability on small screens and data-dense layouts.
- **Spacing as Hierarchy:** Line height increases with size to maintain vertical rhythm and reduce visual congestion.

## 4. Component Stylings

### Buttons

#### Primary Button (Sign Up / Major CTA)

- **Background:** `#FCD535`
- **Text Color:** `#202630`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `10px 20px`
- **Border Radius:** `4px`
- **Border:** `0px none`
- **Box Shadow:** `none`
- **Height:** `44px` (min-height for touch targets)
- **Line Height:** `22px`
- **Hover State:** Opacity `0.9`, cursor `pointer`
- **Active State:** Opacity `0.8`, slight scale `0.98`

#### Secondary Button (Form Actions)

- **Background:** `#333B47`
- **Text Color:** `#EAECEF`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `10px 16px`
- **Border Radius:** `4px`
- **Border:** `0px none`
- **Box Shadow:** `none`
- **Height:** `32px`
- **Line Height:** `22px`
- **Hover State:** Background `#3E4654`, opacity `0.95`
- **Active State:** Background `#2B3139`

#### Ghost Button (Icon / Minimal Action)

- **Background:** `transparent`
- **Text Color:** `#EAECEF`
- **Font Size:** `0px` (icon-only)
- **Padding:** `11px`
- **Border Radius:** `10px`
- **Border:** `1px solid #2B3139`
- **Box Shadow:** `none`
- **Height:** `48px`
- **Width:** `48px`
- **Hover State:** Border color `#4F4F4F`, background `rgba(79, 79, 79, 0.1)`
- **Active State:** Border color `#EAECEF`

### Cards & Containers

#### Standard Card

- **Background:** `#29313D`
- **Padding:** `24px`
- **Border Radius:** `8px`
- **Border:** `1px solid #2B3139`
- **Box Shadow:** `none`
- **Text Color:** `#EAECEF`
- **Hover State:** Border color `#4F4F4F`, opacity `0.98`

#### Data Card (Market Data Display)

- **Background:** `#202630`
- **Padding:** `16px 20px`
- **Border Radius:** `8px`
- **Border:** `1px solid #2B3139`
- **Box Shadow:** `none`
- **Font Size:** `14px` (data content)
- **Text Color:** `#EAECEF`
- **Accent Accent:** Up `#2EBD85`, Down `#F6465D`

#### Content Section

- **Background:** `transparent` or `#202630` (contextual)
- **Padding:** `48px 24px` (vertical) `24px` (horizontal)
- **Border Radius:** `0px`
- **Gap (internal stacking):** `24px` or `32px`

### Inputs & Forms

#### Text Input (Email, Phone, etc.)

- **Background:** `#FFFFFF`
- **Text Color:** `#000000`
- **Font Size:** `12.8px`
- **Font Weight:** `400`
- **Padding:** `6px 35px 6px 15px`
- **Border Radius:** `50px`
- **Border:** `1px solid #707070`
- **Box Shadow:** `none`
- **Height:** `32px`
- **Line Height:** `normal`
- **Placeholder Color:** `#4F4F4F`
- **Focus State:** Border color `#1F8DF9`, box-shadow `0 0 0 3px rgba(31, 141, 249, 0.1)`
- **Error State:** Border color `#F6465D`

#### Input Label

- **Font Size:** `14px`
- **Font Weight:** `700`
- **Color:** `#EAECEF`
- **Margin Bottom:** `8px`
- **Line Height:** `21px`

#### Checkbox / Radio

- **Size:** `16px × 16px`
- **Border Radius:** `4px` (checkbox), `50%` (radio)
- **Border:** `1px solid #707070`
- **Checked Background:** `#1F8DF9`
- **Checked Border:** `1px solid #1F8DF9`

### Navigation

#### Top Navigation Bar

- **Background:** `#202630`
- **Height:** `64px`
- **Padding:** `0px 24px`
- **Border Bottom:** `1px solid #2B3139` (optional)
- **Display:** `flex`
- **Align Items:** `center`
- **Justify Content:** `space-between`

#### Navigation Link

- **Font Size:** `14px`
- **Font Weight:** `500`
- **Color:** `#EAECEF`
- **Line Height:** `22px`
- **Padding:** `0px 12px`
- **Hover Color:** `#FCD535`
- **Active Color:** `#F0B90B`
- **Text Decoration:** `none`

#### Dropdown Menu

- **Background:** `#29313D`
- **Border:** `1px solid #2B3139`
- **Border Radius:** `8px`
- **Padding:** `8px 0px`
- **Min Width:** `180px`
- **Box Shadow:** `0 4px 12px rgba(0, 0, 0, 0.15)` (inferred)

#### Breadcrumb

- **Font Size:** `12px`
- **Color:** `#4F4F4F`
- **Separator:** `/` or `>`
- **Active:** Color `#EAECEF`, weight `500`

### Badges

#### Status Badge (Green / Positive)

- **Background:** `#2EBD85`
- **Color:** `#FFFFFF`
- **Padding:** `4px 12px`
- **Border Radius:** `16px`
- **Font Size:** `12px`
- **Font Weight:** `500`

#### Status Badge (Red / Negative)

- **Background:** `#F6465D`
- **Color:** `#FFFFFF`
- **Padding:** `4px 12px`
- **Border Radius:** `16px`
- **Font Size:** `12px`
- **Font Weight:** `500`

#### Status Badge (Warning / Yellow)

- **Background:** `#F0B90B`
- **Color:** `#202630`
- **Padding:** `4px 12px`
- **Border Radius:** `16px`
- **Font Size:** `12px`
- **Font Weight:** `500`

### Tabs

#### Tab Navigation

- **Background:** `transparent`
- **Border Bottom:** `2px solid #2B3139`
- **Display:** `flex`
- **Gap:** `24px`

#### Tab Button (Inactive)

- **Color:** `#4F4F4F`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `12px 0px`
- **Border Bottom:** `2px solid transparent`
- **Hover Color:** `#EAECEF`

#### Tab Button (Active)

- **Color:** `#FCD535`
- **Font Size:** `14px`
- **Font Weight:** `500`
- **Padding:** `12px 0px`
- **Border Bottom:** `2px solid #FCD535`

## 5. Layout Principles

### Spacing System

**Base Unit:** `4px`

**Scale:**
- `4px`: Minimal spacing (adjacent elements, micro-interactions)
- `8px`: Tight spacing (related components)
- `12px`: Comfortable padding within components
- `16px`: Standard padding and gaps
- `20px`: Medium spacing between sections
- `24px`: Comfortable section padding
- `32px`: Large section gaps
- `36px`: Extra-large gaps
- `40px`: Paragraph / block separation
- `44px`: Generous section breaks
- `48px`: Major section spacing
- `64px`: Hero and page-level spacing

**Usage Context:**
- Buttons / Small Components: `8px–12px` padding
- Cards: `16px–24px` padding
- Sections: `24px–48px` padding
- Grid gaps: `16px–24px` between columns

### Grid & Container

- **Max Width:** `1440px` (content container)
- **Column Strategy:** Flexible 12-column grid; adapts to `6 col` (tablet), `4 col` (mobile)
- **Horizontal Padding:** `24px` (desktop), `20px` (tablet), `16px` (mobile)
- **Section Patterns:** Full-width background containers with centered inner content max-width
- **Gutter Width:** `24px` between grid columns (consistent across breakpoints)

### Whitespace Philosophy

Binance's layout prioritizes data clarity and visual breathing room. Whitespace serves as a cognitive separator between distinct information blocks. Generous vertical spacing (`24px–48px`) between sections prevents visual fatigue when scanning financial data. Horizontal spacing is conservative (`16px–24px` within components) to maximize information density on small screens. The dark background amplifies the perceived whitespace effect, creating sophisticated separation without explicit borders.

### Border Radius Scale

- `0px`: Full-width sections, no rounding
- `2px`: Minimal, tight components (legacy buttons)
- `4px`: Standard buttons and tight containers
- `8px`: Cards, input fields, and modals
- `10px`: Icon buttons and ghost controls
- `16px`: Large image containers and rounded media
- `50px`: Fully rounded search inputs and pill-shaped badges

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| None / Base | No shadow, transparent or solid background | Page backgrounds, primary surfaces |
| Subtle | `0 1px 3px rgba(0, 0, 0, 0.12)` (inferred) | Cards at rest, input fields |
| Elevated | `0 4px 12px rgba(0, 0, 0, 0.15)` (inferred) | Dropdown menus, modals, popovers |
| High | `0 8px 24px rgba(0, 0, 0, 0.2)` (inferred) | Floating action buttons, critical modals |

**Shadow Philosophy**

Binance's design emphasizes flat, minimal elevation. Shadows are subtle and infrequent, reserved for interactive overlays and floating elements. Most components use borders (`1px solid #2B3139`) instead of shadows to define separation on dark backgrounds. This approach maintains clarity in data-dense layouts and reduces visual noise. When shadows are used, they employ low opacity black to maintain the dark theme's sophistication.

## 7. Do's and Don'ts

### Do

- Use `#F0B90B` / `#FCD535` for all primary CTAs; users recognize yellow as the action trigger
- Apply high contrast between text and background; aim for WCAG AA compliance at minimum
- Reserve `#2EBD85` for positive market movements and success states; `#F6465D` for losses and errors
- Use `#1F8DF9` for links, data highlights, and secondary interactive elements
- Maintain `24px–48px` vertical spacing between major sections to reduce cognitive load
- Organize form inputs with clear labels, helper text, and validation messaging
- Size touch targets to minimum `44px × 44px` for mobile accessibility
- Use BinanceNova font exclusively for brand consistency and optimal rendering of financial data
- Apply the 4px spacing scale strictly to maintain alignment grid
- Test all components on dark backgrounds to ensure readability and visual hierarchy

### Don't

- Mix button colors; yellow is reserved for primary actions, dark gray for secondary
- Use shadows instead of borders for dark-mode component separation
- Exceed `1440px` max-width; constrain layouts to improve readability
- Reduce font size below `12px` for body copy; legibility suffers at smaller sizes
- Apply transparency gradients; use solid colors from the palette
- Create custom colors outside the defined palette; maintain visual cohesion
- Overuse the multicolor semantic palette; limit to gain/loss/warning contexts
- Nest containers deeper than 3 levels; flattens visual clarity
- Ignore the 4px grid; alignment precision reinforces trust and professionalism
- Use all caps for body copy; reserve for labels and micro-interactions only

## 8. Responsive Behavior

### Breakpoints

| Breakpoint Name | Width | Key Changes |
|-----------------|-------|------------|
| Mobile | 320px–767px | Single column, 16px horizontal padding, 20px section spacing, 32px stacked buttons, 50% reduced heading sizes |
| Tablet | 768px–1023px | 2–6 column grid, 20px padding, 24px section gaps, flexible card layouts |
| Desktop | 1024px–1439px | 12-column grid, 24px padding, 32px–48px section gaps, full component set |
| Large Desktop | 1440px+ | Max-width container, centered, 40px horizontal padding |

### Touch Targets

- **Minimum Size:** `44px × 44px` for all interactive elements (buttons, links, checkboxes)
- **Spacing:** Minimum `8px` between adjacent touch targets to prevent accidental activation
- **Button Height:** `44px` minimum (mobile), `32px` acceptable on desktop
- **Input Height:** `32px` minimum (mobile), `28px` on desktop if constrained
- **Icon Buttons:** `48px × 48px` standard for icon-only controls

### Collapsing Strategy

- **Navigation:** Top nav collapses to hamburger menu at `767px` breakpoint
- **Grids:** 12 col → 6 col (tablet) → 4 col (mobile); maintain 24px gutter
- **Cards:** Full width on mobile (`100% - 32px` padding), 2–3 per row on tablet, 3–4 on desktop
- **Forms:** Stacked inputs on mobile, 2 columns on tablet+, full width labels above fields
- **Spacing:** Reduce vertical spacing `10–20%` on mobile to optimize screen real estate
- **Typography:** Reduce display/heading sizes `20–30%` on mobile; maintain body size for readability
- **Images:** Scale responsively with `max-width: 100%`, maintain aspect ratio with `padding-bottom` technique
- **Hero Sections:** Reduce height and padding; prioritize call-to-action placement above fold

## 9. Agent Prompt Guide

### Quick Color Reference

- **Primary CTA:** Yellow (`#F0B90B`, `#FCD535`)
- **Secondary Button:** Dark Gray (`#333B47`)
- **Background:** Dark Navy (`#202630`)
- **Card Surface:** Slightly Lighter Navy (`#29313D`)
- **Text (Default):** Light Gray (`#EAECEF`)
- **Text (Dark):** Black (`#000000`)
- **Heading Text:** White (`#FFFFFF`) or Light Gray (`#EAECEF`)
- **Link / Data Highlight:** Electric Blue (`#1F8DF9`)
- **Success / Gain:** Vibrant Green (`#2EBD85`)
- **Loss / Negative:** Hot Pink (`#F6465D`)
- **Warning:** Orange (`#DD7A2B`) or Yellow (`#F0B90B`)
- **Border / Divider:** Dark Gray (`#2B3139`)

### Iteration Guide

1. **Font Foundation:** Use BinanceNova exclusively; fallback to system sans-serif stack. Enforce 12px minimum for body, 16px for inputs, 14px for UI copy.

2. **Color Consistency:** Yellow (`#FCD535`) = primary CTA always. Green (`#2EBD85`) = gains/success. Red (`#F6465D`) = losses/errors. Blue (`#1F8DF9`) = links/data. Never deviate.

3. **Spacing Discipline:** Apply 4px grid rigorously. Padding: 12px–24px per component. Section gaps: 24px–48px. Mobile reduces by 10–20% only when necessary.

4. **Dark Mode Native:** All backgrounds default to `#202630` (base) or `#29313D` (cards). Borders use `#2B3139`. Text uses `#EAECEF` (default) or `#FFFFFF` (emphasis).

5. **Touch Targets:** Minimum `44px × 48px` for buttons and interactive elements. Maintain `8px` spacing between targets. Mobile-first: optimize small-screen interaction first.

6. **Elevation / Depth:** Avoid shadows; use `1px solid #2B3139` borders instead. Reserve subtle shadows (`0 4px 12px rgba(0, 0, 0, 0.15)`) for floating elements only.

7. **Typography Hierarchy:** H2/Display = 40px/600wt. H3 = 16px/600wt. Body = 12px/400wt. Inputs = 16px/500wt. Links = 14px/500wt. Line heights scale proportionally (1.2–1.5× font size).

8. **Border Radius:** Buttons = 4px. Cards/Modals = 8px. Icon buttons = 10px. Inputs = 50px (pill shape). Images = 16px. Maintain consistency within category.

9. **Responsive Breakpoints:** Mobile (≤767px), Tablet (768px–1023px), Desktop (1024px+). Collapse grids: 12col → 6col → 4col. Reduce spacing 10–20% on mobile only. Nav to hamburger at 767px.

10. **Semantic Colors for Data:** Green (`#2EBD85`) for +values, Red (`#F6465D`) for −values, Yellow (`#F0B90B`) for alerts/warnings. Apply to price changes, badges, and status indicators consistently across all data displays.