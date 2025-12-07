# System Admin Dashboard Implementation Notes

## Project Context

Your Kaytop application already has:
- ✅ Next.js 14+ with TypeScript configured
- ✅ Tailwind CSS + DaisyUI for styling
- ✅ Existing BM (Branch Manager) dashboard at `app/dashboard/bm/`
- ✅ Reusable layout components (Navbar, Sidebar)
- ✅ Some UI components (FilterButton, Metric, Table, Chart)
- ✅ SVG icons in `/public` directory

## Implementation Target

**Path**: `app/dashboard/system-admin/`

This spec implements the Figma dashboard design specifically for the **System Admin** role, following the same architectural pattern as the existing BM dashboard.

## Key Differences from Original Spec

### What Changed:
1. **Project Setup**: Removed initialization tasks since Next.js/TypeScript/Tailwind are already configured
2. **Component Reuse**: Tasks now reference existing components (FilterButton, Metric, Table) that can be extended
3. **Icon Strategy**: Check existing SVG icons in `/public` before creating new ones
4. **Layout Pattern**: Follow the existing BM dashboard layout structure (Navbar + Sidebar with drawer)
5. **Styling Approach**: Use Tailwind CSS + DaisyUI (already configured) instead of pure shadcn/ui

### What Stayed the Same:
- All design specifications (colors, typography, spacing, dimensions)
- All exact data from Figma (loan records, statistics, etc.)
- Pixel-perfect implementation requirements
- Component structure and functionality

## Directory Structure

```
app/
├── dashboard/
│   ├── bm/                          ← Existing BM dashboard
│   │   ├── layout.tsx
│   │   └── page.tsx
│   └── system-admin/                ← NEW: System Admin dashboard
│       ├── layout.tsx               ← Create (follow BM pattern)
│       └── page.tsx                 ← Create (implement Figma design)
│
├── _components/
│   ├── layouts/
│   │   └── dashboard/
│   │       ├── Navbar.tsx           ← Existing (reuse or extend)
│   │       ├── Sidebar.tsx          ← Existing (reuse or extend)
│   │       └── SystemAdminSidebar.tsx  ← NEW (if needed)
│   └── ui/
│       ├── FilterButton.tsx         ← Existing (extend)
│       ├── Metric.tsx               ← Existing (extend as StatCard)
│       ├── Table.tsx                ← Existing (extend)
│       ├── StatCard.tsx             ← NEW
│       ├── PerformanceCard.tsx      ← NEW
│       ├── StatusBadge.tsx          ← NEW
│       ├── TabNavigation.tsx        ← NEW
│       └── DisbursementsTable.tsx   ← NEW
│
├── styles/
│   └── globals.css                  ← Update with design tokens
│
└── lib/
    ├── formatCurrency.ts            ← NEW utility
    └── formatDate.ts                ← NEW utility

public/
├── fonts/                           ← Add Open Sauce Sans fonts
└── [existing icons]                 ← Check before creating new ones
```

## Implementation Approach

### Phase 1: Foundation (Tasks 1-2)
- Create system-admin directory structure
- Add design tokens to globals.css
- Download and configure Open Sauce Sans font
- Verify/create SVG icon components

### Phase 2: Layout (Tasks 3-4)
- Build or extend sidebar for system admin
- Implement navigation with active states
- Build or extend header/navbar
- Add user profile section

### Phase 3: Dashboard Components (Tasks 5-7)
- Create StatCard component
- Build statistics grid with 7 metrics
- Create PerformanceCard component
- Add top/worst performing branch cards

### Phase 4: Filters & Navigation (Tasks 8-9)
- Build filter controls (time periods, date picker, filters)
- Create tab navigation component
- Implement active states

### Phase 5: Data Table (Task 10)
- Build DisbursementsTable component
- Implement table header with sorting
- Add checkboxes for selection
- Create status badges
- Populate with exact data from Figma

### Phase 6: Polish (Tasks 11-20)
- Add page header
- Implement responsive layout
- Add interactive states
- Implement sorting, filtering, selection
- Add accessibility features
- Final pixel-perfect verification

## Design Tokens Reference

### Colors
```css
--primary-600: #7F56D9;
--bg-page: #F4F6FA;
--bg-card: #FFFFFF;
--text-primary: #021C3E;
--text-secondary: #475467;
--text-tertiary: #888F9B;
--text-label: #8B8F96;
--success: #5CC47C;
--error: #E43535;
--border-gray: #EAECF0;
--border-primary: rgba(2, 28, 62, 0.2);
```

### Typography
- Font Family: Open Sauce Sans
- Sizes: 12px, 14px, 16px, 18px, 24px
- Weights: 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

### Spacing
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 47px

### Border Radius
- Values: 4px, 6px, 8px, 12px, 16px, 20px, 200px (full circle)

## Data Reference

### TOTAL CARDS: 9 Cards

#### Statistics Cards: 7 Cards

**First Row (4 cards)** - y: 254px
1. All Branches: 42,094 (+6% green)
2. All CO's: 15,350 (+6% green)
3. All Customers: 28,350 (-26% RED)
4. Loans Processed: ₦50,350.00 (+40% green)

**Second Row (3 cards)** - y: 389px
5. Loan Amounts: 42,094 (+6% green)
6. Active Loans: 15,350 (+6% green)
7. Missed Payments: 15,350 (+6% green)

#### Performance Cards: 2 Cards - y: 548px
8. Top 3 Best performing branch (400x312px)
9. Top 3 worst performing branch (400x312px)

### Loan Records (10 rows)
See task 10.5 for complete data with IDs, names, statuses, interest rates, amounts, and dates.

## Testing Checklist

Before marking the implementation complete:
- [ ] All colors match Figma exactly
- [ ] Typography (font, sizes, weights) matches
- [ ] Spacing and dimensions are pixel-perfect
- [ ] All interactive states work (hover, active, focus)
- [ ] Responsive design works on mobile, tablet, desktop
- [ ] Navigation works between routes
- [ ] Sorting functionality works
- [ ] Checkbox selection works
- [ ] Filters and tabs work
- [ ] Accessibility features implemented
- [ ] Currency formatting correct (₦50,350.00)
- [ ] Date formatting correct (June 03, 2024)

## Next Steps

1. Open `tasks.md` in Kiro
2. Click "Start task" on Task 1
3. Follow the tasks sequentially
4. Each task references specific requirements and includes exact values from Figma
5. Test frequently by running `npm run dev` and viewing at `http://localhost:3000/dashboard/system-admin`

## Questions?

If you encounter any issues:
- Check the existing BM dashboard implementation for patterns
- Refer to the design.md for detailed component specifications
- Refer to requirements.md for acceptance criteria
- Use browser DevTools to measure and compare with Figma
