# Design Brief

## Direction

Fruit Forge — bold Blox Fruit Roblox-inspired drawing app for 8-year-olds. Deep navy immersive background, vibrant orange/yellow fruit colors, hot magenta power-ups, high-contrast game UI aesthetic.

## Tone

Maximalist game UI energy with bold blocky typography and chunky rounded corners. High contrast, exciting, adventurous — designed for Roblox players. Friendly and playful without being condescending.

## Differentiation

Orange-to-magenta gradient CTAs, chunky display font (Bricolage Grotesque), dark navy base creates immersive Blox Fruit environment. All interactive elements have rapid, snappy state changes (no floaty animations).

## Color Palette

| Token       | OKLCH           | Role                                |
| ----------- | --------------- | ----------------------------------- |
| background  | 0.1 0.01 260    | Deep navy game background           |
| foreground  | 0.95 0.01 260   | Bright white text on dark           |
| card        | 0.16 0.01 260   | Slightly lighter navy for panels    |
| primary     | 0.55 0.18 32    | Vibrant orange (fruit/action)       |
| secondary   | 0.6 0.25 305    | Hot magenta (power/special)         |
| accent      | 0.8 0.15 95     | Bright yellow (highlights/power-up) |
| destructive | 0.58 0.2 25     | Coral (undo/clear)                  |
| muted       | 0.25 0.01 260   | Darker navy (secondary UI)          |

## Typography

- Display: Bricolage Grotesque — bold, chunky, game-style headers and buttons
- Body: DM Sans — UI labels, form text, body copy
- Scale: Hero `text-5xl font-bold tracking-tight`, h2 `text-3xl font-bold`, label `text-xs font-semibold uppercase`, body `text-base`

## Elevation & Depth

Card-based hierarchy with strong shadows on interactive elements (canvas, fruit preview, control panels). No flat designs — every UI element floats on the deep navy background.

## Structural Zones

| Zone           | Background         | Border             | Notes                                |
| -------------- | ------------------ | ------------------ | ------------------------------------ |
| Header         | `bg-secondary`     | None               | Chunky Bricolage Grotesque title     |
| Canvas Area    | `bg-card`          | `border-primary`   | Drawing surface with orange outline |
| Control Panel  | `bg-card`          | `border-border`    | Rounded 16px, orange/yellow buttons |
| Fruit Preview  | `bg-card`          | `border-accent`    | Yellow accent border on hover       |
| Footer         | `bg-muted`         | Top border         | Download/share actions in orange    |

## Spacing & Rhythm

12px base unit; canvas uses 24-32px gaps, controls use 8-12px compact spacing. All rounded corners 16px minimum for game UI feel. Touch targets minimum 48px (kid-friendly).

## Component Patterns

- Buttons: 16px radius, orange/magenta gradients on primary, solid yellow on accent, white/dark text with bold font
- Cards: 16px radius, navy card background, strong shadow, orange border on focus
- Badges: 10px radius, magenta background for active, yellow for highlights
- Inputs: 16px radius, orange border on focus, accent highlight

## Motion

- Entrance: Quick fade-in 0.2s on fruit preview and control panels (no bounce)
- Hover: Color intensify + shadow lift on all interactive elements
- Decorative: Gentle pulse on active draw state, snappy button press (no floaty scale)

## Constraints

- Mobile-first: 375px–480px optimized, touch-friendly 48px+ tap targets
- No layout animations during drawing (prevent canvas jank)
- High contrast always (WCAG AAA on orange/navy combinations)
- Kid-friendly: no sudden rapid flashes, max 2s animation duration

## Signature Detail

Orange-to-magenta gradient on all primary CTAs (Draw, Generate, Confirm) creates visual cohesion with Blox Fruit aesthetic — instantly recognizable game UI energy.
