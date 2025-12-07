# Implementation Plan - System Admin Dashboard

**Context**: This implementation is for the System Admin dashboard under `app/dashboard/system-admin/`. The project already has:
- ✅ Next.js 14+ with TypeScript
- ✅ Tailwind CSS + DaisyUI configured
- ✅ Existing BM dashboard structure to follow as a pattern
- ✅ Some SVG icons in `/public` (dashboard.svg, calendar.svg, filter.svg, etc.)
- ✅ Basic UI components in `app/_components/ui/`

**Goal**: Implement the Figma dashboard design pixel-perfect for System Admin role.

---

- [x] 1. Create system admin dashboard structure





  - Create `app/dashboard/system-admin/` directory
  - Create `app/dashboard/system-admin/page.tsx` for overview dashboard
  - Create `app/dashboard/system-admin/layout.tsx` following BM dashboard pattern (Navbar + Sidebar)
  - _Requirements: Project structure_

- [x] 1.1 Implement design tokens in globals.css


  - Add CSS variables for all Figma colors (#7F56D9, #F4F6FA, #FFFFFF, #021C3E, #888F9B, #8B8F96, #5CC47C, #E43535, etc.)
  - Add typography variables (font sizes: 12px, 14px, 16px, 18px, 24px)
  - Add spacing scale (4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 47px)
  - Add border radius values (4px, 6px, 8px, 12px, 16px, 20px, 200px)
  - Add shadow tokens (xs, sm, card blur)
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 1.2 Download and configure Open Sauce Sans font


  - Download Open Sauce Sans font files (Regular 400, Medium 500, SemiBold 600, Bold 700)
  - Place font files in `public/fonts/` directory
  - Configure font loading in layout.tsx or globals.css
  - Test font rendering across different weights
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 2. Create or verify SVG icon components




  - Check existing icons in `/public`: dashboard.svg, calendar.svg, filter.svg, loans.svg, report.svg, settings.svg, customer.svg, credit.svg
  - Create missing icon components in `app/_components/icons/` or `components/icons/`:
    - branches-icon.tsx (18x18px)
    - credit-officers-icon.tsx (21.97x16.81px, dual vectors)
    - arrow-down-icon.tsx (16x16px)
    - dots-vertical-icon.tsx (20x20px)
  - Ensure all icons accept className and color props
  - Use exact SVG paths from Figma data
  - _Requirements: 11.1, 11.2, 11.3, 11.4, 11.5_

- [ ] 3. Build system admin sidebar component
  - Create `app/_components/layouts/dashboard/SystemAdminSidebar.tsx` (or reuse/extend existing Sidebar)
  - Set fixed width: 232px, white background (#FFFFFF)
  - Add Kaytop MI logo at top (use existing `/public/logo.png`, 119x47px)
  - Position logo 35px from left, 29.85px from top
  - _Requirements: 2.1, 2.4_

- [ ] 3.1 Implement sidebar menu items
  - Create menu items: Dashboard, Branches, Credit Officers, Customers, Loans, Reports, Settings
  - Use icons from `/public` or newly created icon components
  - Style text: Open Sauce Sans, 16px, font-weight 500, line-height 20px
  - Set up vertical layout with 47px gap, positioned 125px from top, 35px from left
  - _Requirements: 2.1, 2.2_

- [ ] 3.2 Implement sidebar active state
  - Add purple accent color (#7F56D9) for active menu item
  - Add 2px left border indicator (width: 2px, height: 44px, position: x:0, y:115)
  - Apply font-weight 500 to active text
  - Set inactive items to gray (#888F9B)
  - Use Next.js `usePathname()` to detect active route
  - _Requirements: 2.2, 2.3_

- [ ] 3.3 Add sidebar navigation functionality
  - Implement Next.js Link components for each menu item
  - Add routing to: /dashboard/system-admin, /dashboard/system-admin/branches, /dashboard/system-admin/credit-officers, etc.
  - Handle click events for navigation
  - Test navigation between routes
  - _Requirements: 2.5_

- [ ] 4. Build or extend header/navbar component
  - Use existing `app/_components/layouts/dashboard/Navbar.tsx` or create SystemAdminNavbar
  - Ensure full width (1440px max) and 70px height
  - White background (#FFFFFF) with 0.2px border (#5A6880)
  - Position logo wrap at left (2.29% from left)
  - _Requirements: Header structure_

- [ ] 4.1 Implement user profile section in header
  - Add user name display (Open Sauce Sans, 16px, font-weight 400, right-aligned)
  - Position at 78.75% from left, 34.29% from top
  - Add user avatar (29x29px circle) at 86.88% from left
  - Add dropdown arrow icon (14x14px) at 96.25% from left
  - Implement dropdown menu for user actions
  - _Requirements: Header user profile_

- [ ] 5. Create StatisticsCard component
  - Create `app/_components/ui/StatisticsCard.tsx` (NOT individual StatCard components)
  - This component renders ONE card container with multiple internal sections
  - White background (#FFFFFF)
  - Border: 0.5px solid rgba(2, 28, 62, 0.2)
  - Border-radius: 4px
  - Shadow: blur(30px) rgba(0, 0, 0, 0.04) at bottom
  - Accept array of sections as prop
  - _Requirements: 3.5_

- [ ] 5.1 Implement StatisticsCard section layout
  - Use flexbox or grid to layout sections horizontally
  - Add thin vertical divider lines (1px solid #EAECF0) between sections
  - Each section displays:
    - Label: 14px, font-weight 600, #8B8F96, 90% opacity
    - Value: 18px, font-weight 600, #021C3E, letter-spacing 1.3%
    - Change indicator: 14px, font-weight 400, letter-spacing 0.6%
  - Add proper padding and spacing within each section
  - _Requirements: 3.1, 3.2, 3.3, 3.5_

- [ ] 5.2 Implement section change indicator logic
  - Green color (#5CC47C) for positive changes with "+" prefix
  - Red color (#E43535) for negative changes with "-" prefix
  - Append " this month" suffix to all change indicators
  - Accept change value as prop (number) for each section
  - _Requirements: 3.3, 3.4_

- [ ] 5.3 Implement currency formatting utility
  - Create `lib/formatCurrency.ts` utility function
  - Use Naira symbol (₦) with comma separators
  - Format with 2 decimal places (e.g., ₦50,350.00)
  - Handle both regular numbers and currency values
  - Export and use in StatCard component
  - _Requirements: 3.5_

- [ ] 6. Build dashboard overview page statistics section
  - In `app/dashboard/system-admin/page.tsx`, create statistics section
  - **CRITICAL**: Total of 2 statistics cards (NOT 7 separate cards!)
  - **Card 1**: Single card with 4 internal sections (1091px × 119px at x:290, y:254)
  - **Card 2**: Single card with 3 internal sections (833px × 119px at x:290, y:389)
  - Each card: white background, 0.5px border rgba(2, 28, 62, 0.2), 4px border-radius
  - Internal sections separated by thin vertical divider lines (1px solid #EAECF0)
  - _Requirements: 3.1, 3.2, 3.5_
  - _Reference: LAYOUT_DIAGRAM.md - Card Structure_

- [ ] 6.1 Implement top statistics card (1 card with 4 sections)
  - Create StatisticsCard component that renders ONE card container
  - **Section 1 - All Branches**: Value: 42,094, Change: +8% (green #5CC47C)
  - **Section 2 - All CO's**: Value: 15,350, Change: -8% (red #E43535)
  - **Section 3 - All Customers**: Value: 28,350, Change: -26% (red #E43535)
  - **Section 4 - Loans Processed**: Value: ₦50,350.00, Change: -10% (red #E43535)
  - Add thin vertical divider lines (1px solid #EAECF0) between sections
  - Use flexbox or grid to layout 4 sections horizontally within single card
  - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - _Reference: LAYOUT_DIAGRAM.md - Card 1_

- [ ] 6.2 Implement middle statistics card (1 card with 3 sections)
  - Create second StatisticsCard instance with 3 sections
  - **Section 1 - Loan Amounts**: Value: 42,094, Change: +8% (green #5CC47C)
  - **Section 2 - Active Loans**: Value: 15,350, Change: -6% (red #E43535)
  - **Section 3 - Missed Payments**: Value: 15,350, Change: +6% (green #5CC47C)
  - Add thin vertical divider lines (1px solid #EAECF0) between sections
  - Use flexbox or grid to layout 3 sections horizontally within single card
  - _Requirements: 3.1, 3.2, 3.3, 3.5_
  - _Reference: LAYOUT_DIAGRAM.md - Card 2_

- [ ] 7. Create PerformanceCard component
  - Create `app/_components/ui/PerformanceCard.tsx`
  - White background (#FFFFFF), 1px border (#EAECF0), 12px border-radius
  - Shadow: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)
  - Dimensions: 400px width, 312px height
  - Padding: 24px
  - _Requirements: Performance cards_

- [ ] 7.1 Implement PerformanceCard header
  - Title: 18px, font-weight 600, #101828
  - Add dots-vertical icon (20x20px) for dropdown menu
  - Position with 20px gap below header
  - _Requirements: Performance cards_

- [ ] 7.2 Implement PerformanceCard table
  - Two-column layout: 250px (branch info) + 102px (amount)
  - First column: branch name (14px, font-weight 500, #101828) + active loans (14px, font-weight 400, #475467)
  - Second column: amount (14px, font-weight 400, #039855 green)
  - Add 1px bottom borders (#EAECF0) between rows, 16px padding
  - _Requirements: Performance cards_

- [ ] 7.3 Add performance cards to dashboard (2 cards)
  - **Card 3 - Top 3 Best performing branch**: 
    - Position: x:290, y:548
    - Dimensions: 400px width, 312px height
    - 3 rows: "Igando Branch", "10 active loans", "₦64,240.60" (green #039855)
  - **Card 4 - Top 3 worst performing branch**: 
    - Position: x:722, y:548
    - Dimensions: 400px width, 312px height
    - 3 rows: "Igando Branch", "10 active loans", "₦64,240.60" (green #039855)
  - **TOTAL DASHBOARD CARDS: 5 cards (2 statistics cards with internal sections + 2 performance + 1 table)**
  - _Requirements: Performance cards_
  - _Reference: LAYOUT_DIAGRAM.md - Cards 3 & 4_

- [ ] 8. Build filter controls component
  - Create `app/_components/ui/FilterControls.tsx` (or extend existing FilterButton)
  - Container: row layout, space-between, 1091px width
  - Position at x:290, y:198
  - _Requirements: 5.1_

- [ ] 8.1 Implement time period button group
  - Button group with 1px border (#D0D5DD), 8px border-radius
  - Shadow: drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.05))
  - Buttons: "12 months", "30 days", "7 days", "24 hours"
  - Active button: background #F9FAFB, font-weight 600
  - Inactive buttons: white background, font-weight 600, #344054
  - Font size: 14px, padding: 10px 16px, gap: 8px
  - _Requirements: 5.1, 5.2, 5.5_

- [ ] 8.2 Implement date picker and filter buttons
  - "Select dates" button with calendar icon (20x20px from `/public/calendar.svg`)
  - "Filters" button with filter icon (20x20px from `/public/filter.svg`)
  - Style: white background, 1px border (#D0D5DD), 8px border-radius
  - Text: font-weight 600, 14px, #667085 for "Select dates", #344054 for "Filters"
  - Shadow: 0px 1px 2px rgba(16, 24, 40, 0.05)
  - _Requirements: 5.1, 5.5_

- [ ] 9. Create tab navigation component
  - Create `app/_components/ui/TabNavigation.tsx`
  - Container at x:297, y:928
  - Tabs: "Disbursements", "Re-collections", "Savings", "Missed payments"
  - Font: 16px, font-weight 500, 24px gap between tabs
  - _Requirements: 5.4_

- [ ] 9.1 Implement tab active state
  - Active tab: color #7F56D9
  - Active indicator: 2px bottom border (#7F56D9), width 99px, border-radius 20px, positioned at y:952
  - Inactive tabs: color #ABAFB3
  - Add click handlers for tab switching
  - _Requirements: 5.4_

- [ ] 10. Build DataTable component for disbursements (Card 5)
  - Create `app/_components/ui/DisbursementsTable.tsx` (or extend existing Table component)
  - This is the 5th and final card on the dashboard
  - Container: 1041px width, 764px height, white background
  - Position at x:290, y:986
  - _Requirements: 4.1_

- [ ] 10.1 Implement table header
  - Header row: #F9FAFB background, 44px height
  - Columns: checkbox (165px), "Loan ID" (165px), "Name" (221px), "Status" (131px), "Interest" (165px), "Amount" (162px), "Date disbursed" (197px)
  - Font: 12px, font-weight 500, #475467
  - Bottom border: 1px solid #EAECF0
  - Add arrow-down icon (16x16px) to "Status" column for sorting
  - _Requirements: 4.1, 4.3_

- [ ] 10.2 Implement table rows
  - Row height: 72px, white background
  - Bottom border: 1px solid #EAECF0
  - Padding: 16px 24px
  - Font: 14px, font-weight 400, #475467
  - Name column: font-weight 500, #101828
  - _Requirements: 4.2_

- [ ] 10.3 Implement table checkboxes
  - Checkbox: 20x20px, 6px border-radius
  - White background, 1px border (#D0D5DD)
  - Position in first column with 12px gap
  - Add selection state management
  - _Requirements: 4.4_

- [ ] 10.4 Implement status badges
  - Create `app/_components/ui/StatusBadge.tsx`
  - Badge: 16px border-radius, padding 2px 8px 2px 6px, 4px gap
  - "Active": background #ECFDF3, text #027A48, dot #12B76A (6px circle in 8px container)
  - "Scheduled": background rgba(255, 147, 38, 0.1), text rgba(204, 119, 32, 0.99), dot #FF9326
  - Font: 12px, font-weight 500
  - _Requirements: 4.5_

- [ ] 10.5 Populate table with exact loan data
  - Add 10 rows with data from Figma:
    1. ID: 43756, Name: Ademola Jumoke, Status: Active, Interest: 7.25%, Amount: NGN87,000, Date: June 03, 2024
    2. ID: 45173, Name: Adegboyoga Precious, Status: Active, Interest: 6.50%, Amount: NGN55,000, Date: Dec 24, 2023
    3. ID: 70668, Name: Nneka Chukwu, Status: Scheduled, Interest: 8.00%, Amount: NGN92,000, Date: Nov 11, 2024
    4. ID: 87174, Name: Damilare Usman, Status: Active, Interest: 7.75%, Amount: NGN68,000, Date: Feb 02, 2024
    5. ID: 89636, Name: Jide Kosoko, Status: Active, Interest: 7.00%, Amount: NGN79,000, Date: Aug 18, 2023
    6. ID: 97174, Name: Oladejo israel, Status: Active, Interest: 6.75%, Amount: NGN46,000, Date: Sept 09, 2024
    7. ID: 22739, Name: Eze Chinedu, Status: Active, Interest: 8.25%, Amount: NGN61,000, Date: July 27, 2023
    8. ID: 22739, Name: Adebanji Bolaji, Status: Active, Interest: 7.50%, Amount: NGN73,000, Date: April 05, 2024
    9. ID: 48755, Name: Baba Kaothat, Status: Active, Interest: 6.25%, Amount: NGN62,000, Date: Oct 14, 2023
    10. ID: 30635, Name: Adebayo Salami, Status: Active, Interest: 7.10%, Amount: NGN84,000, Date: March 22, 2024
  - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5_

- [ ] 11. Implement page header section
  - Add "Overview" heading: 24px, font-weight 700, #021C3E, positioned at x:290, y:110
  - Add "Osun state" subheading: 16px, font-weight 500, #021C3E, 50% opacity, positioned at x:290, y:150
  - _Requirements: Page header_

- [ ] 12. Implement responsive layout
  - Add Tailwind responsive classes for tablet (md:) and mobile (sm:)
  - Make sidebar collapsible on mobile (use DaisyUI drawer pattern like BM dashboard)
  - Stack statistics cards vertically on smaller screens (grid-cols-1 sm:grid-cols-2 lg:grid-cols-4)
  - Enable horizontal scroll for table on mobile (overflow-x-auto)
  - Stack button group vertically on mobile
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ] 13. Add interactive states to all components
  - Implement hover states for buttons (use Tailwind hover: classes)
  - Add active states for clickable elements
  - Implement focus rings for keyboard navigation (focus:ring-2)
  - Add disabled states with reduced opacity (disabled:opacity-50)
  - Add smooth transitions (transition-all duration-200)
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2_

- [ ] 14. Implement sorting functionality
  - Add useState for sort column and direction
  - Add click handler to sortable table columns (Status column)
  - Toggle sort direction on column header click
  - Rotate arrow icon based on sort state
  - Sort data array based on selected column
  - _Requirements: 4.3_

- [ ] 15. Implement selection functionality
  - Add useState for selected row IDs (array of strings)
  - Implement "select all" checkbox in header
  - Add individual row checkbox handlers
  - Track selected row IDs in state
  - Add visual feedback for selected rows (background color change)
  - _Requirements: 4.4_

- [ ] 16. Add date formatting utility
  - Create `lib/formatDate.ts` utility function
  - Format dates as "Month DD, YYYY" (e.g., "June 03, 2024")
  - Handle Date objects and string inputs
  - Use Intl.DateTimeFormat for formatting
  - Export and use in table component
  - _Requirements: 12.5_

- [ ] 17. Implement filter functionality
  - Add useState for selected time period ("12months" | "30days" | "7days" | "24hours")
  - Add click handlers to time period buttons
  - Implement date picker modal/dropdown (can use DaisyUI modal)
  - Add filter button click handler
  - Connect filters to data fetching logic (prepare for API integration)
  - _Requirements: 5.1, 5.2, 5.3_

- [ ] 18. Add tab switching functionality
  - Add useState for active tab ("disbursements" | "re-collections" | "savings" | "missed-payments")
  - Add click handlers to tab buttons
  - Update active tab styling on selection
  - Show/hide corresponding table content based on active tab
  - Prepare data structure for each tab type
  - _Requirements: 5.4_

- [ ] 19. Implement accessibility features
  - Add aria-label to icon-only buttons
  - Implement keyboard navigation (Tab, Enter, Space keys)
  - Add visible focus indicators (focus:ring-2 focus:ring-purple-600)
  - Verify 4.5:1 color contrast ratio for all text (use browser DevTools)
  - Add aria-sort="ascending|descending|none" to sortable columns
  - Use semantic HTML (nav, main, table, thead, tbody elements)
  - Add alt text to all images/icons
  - _Requirements: Accessibility_

- [ ] 20. Final checkpoint - Verify pixel-perfect implementation
  - **CRITICAL**: Compare rendered dashboard with Figma design side-by-side
  - **Verify exact layout** (use LAYOUT_SPECIFICATIONS.md as reference):
    - [ ] Sidebar is exactly 232px wide
    - [ ] Main content starts at x:290px
    - [ ] Page header "Overview" at x:290, y:110
    - [ ] Filter controls at x:290, y:198
    - [ ] First statistics row (4 cards) at y:254
    - [ ] Second statistics row (3 cards) at y:389
    - [ ] Performance cards (2 cards) at y:548
    - [ ] Tab navigation at y:928
    - [ ] Data table at y:986
  - **Verify card count**:
    - [ ] **CRITICAL**: Total 5 cards (NOT 9!)
    - [ ] Card 1: Top statistics card with 4 internal sections
      - Section 1: All Branches (42,094, +8%)
      - Section 2: All CO's (15,350, -8%)
      - Section 3: All Customers (28,350, -26%)
      - Section 4: Loans Processed (₦50,350.00, -10%)
    - [ ] Card 2: Middle statistics card with 3 internal sections
      - Section 1: Loan Amounts (42,094, +8%)
      - Section 2: Active Loans (15,350, -6%)
      - Section 3: Missed Payments (15,350, +6%)
    - [ ] Card 3: Top 3 Best performing branch
    - [ ] Card 4: Top 3 worst performing branch
    - [ ] Card 5: Data table with tabs
  - **Verify card dimensions**:
    - [ ] Statistics cards: 115px height
    - [ ] Performance cards: 400px width, 312px height
  - **Verify colors** match exactly:
    - [ ] Primary purple: #7F56D9
    - [ ] Page background: #F4F6FA
    - [ ] Card background: #FFFFFF
    - [ ] Success green: #5CC47C
    - [ ] Error red: #E43535
  - **Verify typography**:
    - [ ] Font family: Open Sauce Sans
    - [ ] Sizes: 12px, 14px, 16px, 18px, 24px
    - [ ] Weights: 400, 500, 600, 700
  - **Verify table**:
    - [ ] Exactly 10 rows of data
    - [ ] Column widths match specification
    - [ ] All data matches Figma exactly
  - Test navigation between routes
  - Validate responsive behavior at breakpoints (375px, 768px, 1024px, 1440px)
  - Test all interactive states (hover, active, focus, disabled)
  - Test sorting and filtering functionality
  - Test checkbox selection (individual and select all)
  - Validate accessibility with keyboard navigation
  - Ensure all SVG icons display correctly
  - Confirm currency formatting (₦50,350.00)
  - Confirm date formatting (June 03, 2024)
  - _Requirements: All_
  - _Reference: LAYOUT_SPECIFICATIONS.md - Complete checklist_
