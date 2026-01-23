# Visitor Management System - Design Guidelines

## Design Approach
**System-Based Approach:** Material Design + Enterprise Dashboard Patterns
- Rationale: Utility-focused application requiring efficiency, clarity, and touch-friendly interactions for reception desk use
- Priority: Functionality and usability over visual flair
- Key principles: Clear hierarchy, consistent patterns, large touch targets, instant feedback

## Typography System
**Font Family:** Inter or Roboto (Google Fonts)
- Display/Headers: 600-700 weight, 24-32px
- Section Titles: 600 weight, 18-20px  
- Body Text: 400 weight, 16px
- Form Labels: 500 weight, 14px
- Helper Text: 400 weight, 13px
- Buttons: 500 weight, 16px

## Layout System
**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16
- Component padding: p-4 to p-8
- Section spacing: space-y-6 to space-y-8
- Form field gaps: gap-4 to gap-6
- Card padding: p-6 to p-8
- Touch target minimum: 44px (h-11 or h-12)

**Grid Structure:**
- Main container: max-w-7xl mx-auto px-4
- Two-column layouts for admin sections (lg:grid-cols-2)
- Single column for visitor flow (focused workflow)
- Reports: Full-width tables with horizontal scroll on mobile

## Component Library

### Core Navigation
- Top navbar: Building name (left), navigation links (center), user/logout (right)
- Height: h-16, sticky positioning
- Mobile: Hamburger menu, full-screen overlay navigation

### Visitor Registration Flow (Landing/Main Page)
- Large building name header: text-3xl to text-4xl, centered or left-aligned
- Step-by-step numbered instructions: Large numbered badges (1-5) with clear text
- Progressive form reveal: Show one step at a time with "Next" progression
- Form elements: Generous spacing (space-y-6), large dropdowns with search capability
- Action buttons: Full-width on mobile (w-full sm:w-auto), minimum h-12

### ID & Webcam Integration
- Camera preview: Large square viewport (aspect-square), 320px minimum
- "Capture Photo" button: Prominent, positioned below camera preview
- ID scanner area: Visual placeholder with scan animation indicator
- Preview thumbnails: Small (64px) with expand capability

### QR Code Scanner
- Scanner viewport: Centered, 280px square with scanning reticle overlay
- Real-time feedback: Green flash on successful scan
- Manual entry fallback: Text input below scanner for pass number

### Guest Pass Display
- Pass number: Extra large text (text-5xl to text-6xl), mono font
- QR code: Large, centered, 200px minimum
- Status indicator: Badge showing "ACTIVE" or "RETURNED"

### Admin Panel
- Sidebar navigation: w-64, collapsible on mobile
- Management tables: Striped rows, hover states, inline edit/delete icons
- Add/Edit forms: Modal overlays with clear submit/cancel actions
- Delete confirmations: Alert dialogs with destructive action styling

### Notification System
- Contact selector: Searchable dropdown with phone numbers
- Message preview: Text area with character counter
- Send button: Primary action with loading state
- Success/error toasts: Top-right positioned, auto-dismiss

### Reports Page
- Date range picker: Side-by-side inputs with calendar popups
- Filter controls: Sticky toolbar above table
- Data table: Fixed header, sortable columns, row expansion for photos/details
- Export button: Secondary action, CSV/PDF options
- Pagination: Bottom-aligned, showing total records

### About/FAQ Page
- Accordion sections: Large click targets, clear expand/collapse icons
- Search filter: Prominent at top to find FAQ items
- Contact support card: Highlighted section with phone/email

## Visual Elements

### Cards & Containers
- Border radius: rounded-lg (8px)
- Shadows: shadow-sm for forms, shadow-md for modals
- Borders: border border-gray-200 for definition

### Buttons
- Primary: Solid background, h-11 or h-12, px-6
- Secondary: Outlined, same height
- Icon buttons: Square (44x44px minimum)
- Disabled state: Reduced opacity (opacity-50)

### Form Inputs
- Height: h-12 for all inputs
- Border: 2px solid, rounded-md
- Focus state: Ring (ring-2) with primary color
- Error state: Red border + error message below

### Status Indicators
- Badges: Rounded-full, px-3, py-1, uppercase text-xs
- Success: Green background
- Warning: Yellow/orange background
- Error: Red background
- Info: Blue background

## Images
**Hero/Header Images:** Not applicable - this is a functional kiosk interface
**Instructional Graphics:** 
- Icons for each step (dropdowns, ID card, webcam, QR code symbols)
- Use Material Icons or Heroicons via CDN
- Size: 48px to 64px for step indicators

**Photo/ID Placeholders:**
- Camera icon for empty webcam state
- ID card icon for scan area
- Consistent aspect ratios (square for photos, 3:2 for ID cards)

## Interaction Patterns
- Loading states: Spinner overlays for async operations (scanning, submitting)
- Success confirmations: Green checkmark with message (2-3 second display)
- Error handling: Inline validation messages, retry actions
- Auto-focus: Next form field on completion
- Keyboard navigation: Full support for tab through forms

## Accessibility
- ARIA labels on all interactive elements
- High contrast text (WCAG AA minimum)
- Large touch targets throughout (44px minimum)
- Screen reader announcements for scanner feedback
- Keyboard shortcuts for common actions (Enter to submit, Esc to cancel)