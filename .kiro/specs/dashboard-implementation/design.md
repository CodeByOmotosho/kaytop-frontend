# Design Document

## Overview

This document outlines the technical design for implementing a pixel-perfect dashboard interface based on the Figma design. The implementation uses Next.js 14+ with React Server Components, TypeScript, Tailwind CSS for styling, and shadcn/ui components as a foundation. The design prioritizes exact visual fidelity, performance, and maintainability.

### Critical Card Structure

**IMPORTANT**: The dashboard contains exactly **5 cards total**, not 9 separate cards:

1. **Top Statistics Card**: ONE card with 4 internal sections (All Branches, All CO's, All Customers, Loans Processed) separated by thin vertical divider lines
2. **Middle Statistics Card**: ONE card with 3 internal sections (Loan Amounts, Active Loans, Missed Payments) separated by thin vertical divider lines
3. **Best Performing Card**: Separate card showing top 3 best performing branches
4. **Worst Performing Card**: Separate card showing top 3 worst performing branches
5. **Data Table Card**: Separate card with tabs and table data

The thin vertical lines in the statistics cards are dividers WITHIN the cards, not separate card boundaries.

## Architecture

### Technology Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5+
- **Styling**: Tailwind CSS 3+ with custom design tokens
- **UI Components**: shadcn/ui (customized to match Figma design)
- **State Management**: React Context API for global state, React hooks for local state
- **Data Fetching**: Server Components with async/await, React Query for client-side caching
- **Icons**: Custom SVG components extracted from Figma
- **Fonts**: Open Sauce Sans (loaded via next/font)

### Project Structure

```
app/
├── (dashboard)/
│   ├── layout.tsx                 # Dashboard layout with sidebar
│   ├── page.tsx                   # Overview/Dashboard page
│   ├── branches/
│   ├── credit-officers/
│   ├── customers/
│   ├── loans/
│   ├── reports/
│   └── settings/
├── components/
│   ├── ui/                        # shadcn/ui base components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── table.tsx
│   │   ├── badge.tsx
│   │   └── checkbox.tsx
│   ├── dashboard/
│   │   ├── sidebar.tsx
│   │   ├── header.tsx
│   │   ├── statistics-card.tsx    # Single card with multiple sections
│   │   ├── performance-card.tsx
│   │   ├── data-table.tsx
│   │   └── filter-controls.tsx
│   └── icons/                     # SVG icon components
│       ├── dashboard-icon.tsx
│       ├── branches-icon.tsx
│       ├── credit-officers-icon.tsx
│       ├── customers-icon.tsx
│       ├── loans-icon.tsx
│       ├── reports-icon.tsx
│       └── settings-icon.tsx
├── lib/
│   ├── utils.ts                   # Utility functions
│   ├── format.ts                  # Number/currency formatting
│   └── types.ts                   # TypeScript types
└── styles/
    └── globals.css                # Global styles and design tokens
```

## Components and Interfaces

### 1. Sidebar Component

**Purpose**: Left navigation menu with logo, menu items, and active state management

**Props Interface**:
```typescript
interface SidebarProps {
  currentPath: string;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}
```

**Key Features**:
- Fixed width: 232px
- White background (#FFFFFF)
- Active state: purple accent (#7F56D9) with 2px left border
- Menu items: Dashboard, Branches, Credit Officers, Customers, Loans, Reports, Settings
- Logo at top: "Kaytop MI" with icon

### 2. Header Component

**Purpose**: Top navigation bar with user profile and dropdown

**Props Interface**:
```typescript
interface HeaderProps {
  userName: string;
  userAvatar?: string;
}
```

**Key Features**:
- Full width with white background
- User name: "Lanre Okedele" (right-aligned)
- Dropdown arrow icon
- 0.2px border: #5A6880

### 3. StatisticsCard Component

**Purpose**: Display multiple key metrics in a single card with internal sections separated by divider lines

**Props Interface**:
```typescript
interface StatisticsCardProps {
  sections: StatSection[];
}

interface StatSection {
  label: string;
  value: string | number;
  change: number;
  changeLabel: string;
  isCurrency?: boolean;
}
```

**Key Features**:
- Single card container with white background and subtle border and shadow
- Contains multiple internal sections (4 sections for top card, 3 sections for middle card)
- Sections separated by thin vertical divider lines (1px solid #EAECF0)
- Each section displays:
  - Label: font-size 14px, font-weight 600, color #8B8F96
  - Value: font-size 18px, font-weight 600, color #021C3E
  - Change indicator: green (#5CC47C) for positive, red (#E43535) for negative
- Card border: 0.5px solid rgba(2, 28, 62, 0.2)
- Card border-radius: 4px
- Dimensions: Top card (1091px × 119px), Middle card (833px × 119px)

### 4. PerformanceCard Component

**Purpose**: Display top/worst performing branches

**Props Interface**:
```typescript
interface PerformanceCardProps {
  title: string;
  branches: Array<{
    name: string;
    activeLoans: number;
    amount: string;
  }>;
}
```

**Key Features**:
- White background with border and shadow
- Title: font-size 18px, font-weight 600
- List of 3 branches with amounts in green (#039855)
- Border-radius: 12px

### 5. DataTable Component

**Purpose**: Display loan disbursement data with sorting and selection

**Props Interface**:
```typescript
interface DataTableProps {
  columns: Column[];
  data: LoanRecord[];
  onSort?: (columnId: string) => void;
  onSelect?: (selectedIds: string[]) => void;
}

interface Column {
  id: string;
  header: string;
  sortable?: boolean;
  width?: string;
}

interface LoanRecord {
  id: string;
  loanId: string;
  name: string;
  status: 'Active' | 'Scheduled';
  interest: number;
  amount: number;
  dateDisbursed: string;
}
```

**Key Features**:
- Header: background #F9FAFB, font-size 12px, font-weight 500
- Rows: white background, 1px bottom border #EAECF0
- Checkboxes: 20x20px, 6px border-radius
- Status badges: green for Active, orange for Scheduled
- Sortable columns with arrow icon

### 6. FilterControls Component

**Purpose**: Time period filters and action buttons

**Props Interface**:
```typescript
interface FilterControlsProps {
  selectedPeriod: '12months' | '30days' | '7days' | '24hours';
  onPeriodChange: (period: string) => void;
  onDateSelect: () => void;
  onFilter: () => void;
}
```

**Key Features**:
- Button group with borders
- Active state: background #F9FAFB
- Border: 1px solid #D0D5DD
- Border-radius: 8px
- Shadow: drop-shadow(0px 1px 2px rgba(16, 24, 40, 0.05))

## Data Models

### Dashboard Statistics

```typescript
interface DashboardStats {
  topCard: {
    sections: [
      {
        label: 'All Branches';
        value: number;
        change: number;
      },
      {
        label: 'All CO\'s';
        value: number;
        change: number;
      },
      {
        label: 'All Customers';
        value: number;
        change: number;
      },
      {
        label: 'Loans Processed';
        value: number;
        change: number;
        isCurrency: true;
      }
    ];
  };
  middleCard: {
    sections: [
      {
        label: 'Loan Amounts';
        value: number;
        change: number;
      },
      {
        label: 'Active Loans';
        value: number;
        change: number;
      },
      {
        label: 'Missed Payments';
        value: number;
        change: number;
      }
    ];
  };
}
```

### Loan Record

```typescript
interface LoanRecord {
  id: string;
  loanId: string;
  borrowerName: string;
  status: 'Active' | 'Scheduled' | 'Pending';
  interestRate: number;
  amount: number;
  dateDisbursed: Date;
}
```

### Branch Performance

```typescript
interface BranchPerformance {
  branchName: string;
  activeLoans: number;
  totalAmount: number;
  rank: number;
}
```

## Design Tokens

### Colors

```css
:root {
  /* Primary */
  --primary-600: #7F56D9;
  --primary-500: #7A62EB;
  
  /* Background */
  --bg-page: #F4F6FA;
  --bg-card: #FFFFFF;
  --bg-gray-50: #F9FAFB;
  
  /* Text */
  --text-primary: #021C3E;
  --text-secondary: #475467;
  --text-tertiary: #888F9B;
  --text-label: #8B8F96;
  --text-dark: #101828;
  --text-medium: #344054;
  --text-gray: #1D2939;
  --text-light: #667085;
  
  /* Status */
  --success-600: #039855;
  --success-500: #12B76A;
  --success-400: #5CC47C;
  --success-700: #027A48;
  --error-500: #E43535;
  --warning-500: #FF9326;
  --warning-600: rgba(204, 119, 32, 0.99);
  
  /* Borders */
  --border-gray-200: #EAECF0;
  --border-gray-300: #D0D5DD;
  --border-primary: rgba(2, 28, 62, 0.2);
  --border-dark: #5A6880;
  
  /* Shadows */
  --shadow-xs: 0px 1px 2px rgba(16, 24, 40, 0.05);
  --shadow-sm: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06);
  --shadow-card: rgba(0, 0, 0, 0.04);
}
```

### Typography

```css
:root {
  --font-family: 'Open Sauce Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* Font Sizes */
  --text-xs: 12px;
  --text-sm: 14px;
  --text-base: 16px;
  --text-lg: 18px;
  --text-xl: 24px;
  
  /* Font Weights */
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
  
  /* Line Heights */
  --leading-tight: 16px;
  --leading-normal: 20px;
  --leading-relaxed: 28px;
  --leading-loose: 32px;
  
  /* Letter Spacing */
  --tracking-tight: 0.006em;
  --tracking-normal: 0.013em;
}
```

### Spacing

```css
:root {
  --spacing-1: 4px;
  --spacing-2: 8px;
  --spacing-3: 12px;
  --spacing-4: 16px;
  --spacing-5: 20px;
  --spacing-6: 24px;
  --spacing-8: 32px;
  --spacing-10: 40px;
  --spacing-12: 47px;
}
```

### Border Radius

```css
:root {
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 200px;
}
```

## Error Handling

### Client-Side Errors

1. **Network Errors**: Display toast notification with retry option
2. **Validation Errors**: Show inline error messages with red color (#E43535)
3. **Loading States**: Show skeleton screens matching component layout
4. **Empty States**: Display friendly message with illustration

### Server-Side Errors

1. **API Failures**: Return error response with status code and message
2. **Data Fetching Errors**: Implement error boundaries with fallback UI
3. **Authentication Errors**: Redirect to login page
4. **Authorization Errors**: Show 403 page with explanation

## Testing Strategy

### Unit Testing

**Framework**: Jest + React Testing Library

**Test Coverage**:
1. Component rendering with correct props
2. User interactions (clicks, hovers, form inputs)
3. Conditional rendering based on state
4. Utility functions (formatting, calculations)
5. Custom hooks behavior

**Example Tests**:
- StatCard displays correct value and change percentage
- DataTable sorts correctly when column header clicked
- Sidebar highlights active menu item
- FilterControls updates selected period on button click

### Integration Testing

**Framework**: Playwright

**Test Scenarios**:
1. Navigation between dashboard sections
2. Filtering and sorting data tables
3. Responsive layout on different screen sizes
4. Loading states and error handling
5. User profile dropdown interaction

### Visual Regression Testing

**Framework**: Percy or Chromatic

**Test Cases**:
1. Dashboard page at 1440px width
2. Sidebar active/inactive states
3. Stat cards with positive/negative changes
4. Data table with various status badges
5. Filter controls in different states

## Performance Optimization

### Code Splitting

- Lazy load route components
- Dynamic imports for heavy components
- Separate vendor bundles

### Image Optimization

- Use next/image for all images
- Serve SVG icons as React components
- Implement proper caching headers

### Data Fetching

- Server Components for initial data
- React Query for client-side caching
- Implement pagination for large datasets
- Debounce search inputs

### Bundle Size

- Tree-shake unused code
- Minimize CSS with PurgeCSS
- Compress assets with gzip/brotli
- Monitor bundle size with webpack-bundle-analyzer

## Accessibility

### WCAG 2.1 AA Compliance

1. **Keyboard Navigation**: All interactive elements accessible via keyboard
2. **Focus Indicators**: Visible focus rings on all focusable elements
3. **Color Contrast**: Minimum 4.5:1 ratio for text
4. **Screen Readers**: Proper ARIA labels and semantic HTML
5. **Alt Text**: Descriptive alt text for all images/icons

### Implementation Details

- Use semantic HTML elements (`<nav>`, `<main>`, `<table>`)
- Add `aria-label` to icon-only buttons
- Implement `aria-sort` for sortable table columns
- Use `role="status"` for dynamic content updates
- Ensure form inputs have associated labels

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Mobile browsers (iOS Safari 14+, Chrome Android 90+)

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 640px) { }

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px) { }

/* Desktop */
@media (min-width: 1025px) { }

/* Large Desktop */
@media (min-width: 1440px) { }
```

## Implementation Notes

### Font Loading

```typescript
// app/layout.tsx
import localFont from 'next/font/local';

const openSauceSans = localFont({
  src: [
    {
      path: '../public/fonts/OpenSauceSans-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../public/fonts/OpenSauceSans-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../public/fonts/OpenSauceSans-SemiBold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../public/fonts/OpenSauceSans-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-open-sauce-sans',
});
```

### SVG Icon Component Pattern

```typescript
// components/icons/dashboard-icon.tsx
interface IconProps {
  className?: string;
  color?: string;
}

export const DashboardIcon: React.FC<IconProps> = ({ 
  className, 
  color = 'currentColor' 
}) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* SVG path from Figma */}
    <path d="..." fill={color} />
  </svg>
);
```

### Currency Formatting Utility

```typescript
// lib/format.ts
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Usage: formatCurrency(50350.00) => "₦50,350.00"
```

### Date Formatting Utility

```typescript
// lib/format.ts
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).format(d);
};

// Usage: formatDate('2024-06-03') => "June 03, 2024"
```
