# TradeMaster Design Tokens

Cross-platform design tokens for the Flutter App and React Web clients.

## Color Palette

### Brand
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-primary` | `#FF6B6B` | Primary actions, highlights, active states |
| `--color-primary-dark` | `#E85555` | Primary hover/pressed |
| `--color-secondary` | `#FFA726` | Secondary accents, chips, ratings |
| `--color-tertiary` | `#F48FB1` | Soft highlights, badges |

### Neutrals
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-background` | `#FFF8F5` | App/page background |
| `--color-surface` | `#FFFFFF` | Cards, sheets, input backgrounds |
| `--color-surface-elevated` | `#FFFFFF` | Elevated cards with shadow |
| `--color-on-surface` | `#2D2D2D` | Primary text on surfaces |
| `--color-on-surface-variant` | `#6B6B6B` | Secondary text |
| `--color-muted` | `#8D8D8D` | Placeholder, disabled text |
| `--color-border` | `#F0E6E0` | Dividers, input borders |
| `--color-border-strong` | `#E0D5CF` | Focused borders |

### Semantic
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-success` | `#66BB6A` | Success states |
| `--color-warning` | `#FFB74D` | Warnings |
| `--color-error` | `#EF5350` | Errors |
| `--color-info` | `#42A5F5` | Info |

### Dark Mode
| Token | Hex | Usage |
|-------|-----|-------|
| `--color-dark-background` | `#1A1A1A` | Dark background |
| `--color-dark-surface` | `#242424` | Dark cards |
| `--color-dark-surface-elevated` | `#2E2E2E` | Dark elevated |
| `--color-dark-on-surface` | `#F5F5F5` | Dark primary text |
| `--color-dark-on-surface-variant` | `#B0B0B0` | Dark secondary text |
| `--color-dark-border` | `#3A3A3A` | Dark borders |

## Typography

### Font Stack
- **App**: System font (Material 3 default)
- **Web**: `Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

### Type Scale
| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `display-large` | 32px / 2rem | 40px | 700 | Hero titles |
| `display-medium` | 28px / 1.75rem | 36px | 700 | Large headers |
| `headline-large` | 24px / 1.5rem | 32px | 700 | Screen titles |
| `headline-medium` | 20px / 1.25rem | 28px | 600 | Section headers |
| `title-large` | 18px / 1.125rem | 26px | 600 | Card titles |
| `title-medium` | 16px / 1rem | 24px | 600 | List items |
| `body-large` | 16px / 1rem | 24px | 400 | Body text |
| `body-medium` | 14px / 0.875rem | 20px | 400 | Secondary body |
| `label-large` | 14px / 0.875rem | 20px | 600 | Buttons, labels |
| `label-medium` | 12px / 0.75rem | 16px | 500 | Captions, badges |

## Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight gaps |
| `--space-2` | 8px | Inline spacing |
| `--space-3` | 12px | Small padding |
| `--space-4` | 16px | Default padding |
| `--space-5` | 20px | Medium padding |
| `--space-6` | 24px | Section padding |
| `--space-8` | 32px | Large sections |
| `--space-10` | 40px | Hero spacing |
| `--space-12` | 48px | Major sections |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 8px | Chips, badges |
| `--radius-md` | 12px | Buttons, inputs |
| `--radius-lg` | 16px | Cards |
| `--radius-xl` | 24px | Sheets, dialogs |
| `--radius-full` | 9999px | Pills, avatars |

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation |
| `--shadow-md` | `0 4px 12px rgba(255,107,107,0.08)` | Cards |
| `--shadow-lg` | `0 8px 24px rgba(0,0,0,0.1)` | Modals, FAB |
| `--shadow-glass` | `0 8px 32px rgba(0,0,0,0.08)` | Glassmorphic cards |

## Animation

| Token | Value | Usage |
|-------|-------|-------|
| `--duration-fast` | 150ms | Micro-interactions |
| `--duration-normal` | 250ms | Transitions |
| `--duration-slow` | 350ms | Page transitions |
| `--ease-default` | `cubic-bezier(0.4, 0, 0.2, 1)` | Standard |
| `--ease-spring` | `cubic-bezier(0.34, 1.56, 0.64, 1)` | Bouncy interactions |

## Breakpoints (Web)

| Token | Value | Usage |
|-------|-------|-------|
| `--bp-sm` | 640px | Mobile landscape |
| `--bp-md` | 768px | Tablets |
| `--bp-lg` | 1024px | Desktop |
| `--bp-xl` | 1280px | Large desktop |
