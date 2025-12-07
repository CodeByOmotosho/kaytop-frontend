# System Admin Dashboard - Setup Notes

## ✅ Completed Tasks

### Task 1: Create system admin dashboard structure

#### 1.1 Design Tokens Implementation
- ✅ Added comprehensive CSS variables to `app/styles/globals.css`
- ✅ Configured colors (primary, background, text, status, borders)
- ✅ Configured typography (font sizes: 12px-24px, weights: 400-700)
- ✅ Configured spacing scale (4px-47px)
- ✅ Configured border radius values (4px-200px)
- ✅ Configured shadow tokens (xs, sm, card blur)

#### 1.2 Font Configuration
- ✅ Added @font-face declarations for Open Sauce Sans (weights: 400, 500, 600, 700)
- ✅ Created font-family CSS variable: `--font-open-sauce-sans`
- ✅ Applied font to body element globally
- ✅ Created utility class `.font-open-sauce-sans`

#### 1.3 Dashboard Structure
- ✅ Created `app/dashboard/system-admin/` directory
- ✅ Created `app/dashboard/system-admin/layout.tsx` (follows BM dashboard pattern)
- ✅ Created `app/dashboard/system-admin/page.tsx` (overview dashboard)
- ✅ Added page header with "Overview" title and "Osun state" subtitle

## 📋 Next Steps

### Font Files Required
The Open Sauce Sans font files need to be downloaded and placed in `public/fonts/`:

**Required files:**
1. `OpenSauceSans-Regular.woff2` (weight: 400)
2. `OpenSauceSans-Medium.woff2` (weight: 500)
3. `OpenSauceSans-SemiBold.woff2` (weight: 600)
4. `OpenSauceSans-Bold.woff2` (weight: 700)

**Download options:**
- Creative Market: https://creativemarket.com/SourceFoundry/2804325-Open-Sauce-Sans
- GitHub: https://github.com/marcologous/Open-Sauce-Fonts (if available)
- Alternative: Use "Inter" or "Open Sans" from Google Fonts

See `public/fonts/README.md` for detailed instructions.

### Upcoming Tasks
The following tasks will build upon this foundation:
- Task 2: Create or verify SVG icon components
- Task 3: Build system admin sidebar component
- Task 4: Build or extend header/navbar component
- Task 5: Create StatisticsCard component
- And more...

## 🎨 Design Tokens Reference

### Colors
- Primary: `#7F56D9`
- Page Background: `#F4F6FA`
- Card Background: `#FFFFFF`
- Success: `#5CC47C`
- Error: `#E43535`

### Typography
- Font Family: Open Sauce Sans
- Sizes: 12px, 14px, 16px, 18px, 24px
- Weights: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Spacing
- Scale: 4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 47px

### Border Radius
- Values: 4px, 6px, 8px, 12px, 16px, 20px, 200px

## 🔍 Testing

To test the setup:
1. Run the development server: `npm run dev`
2. Navigate to: `http://localhost:3000/dashboard/system-admin`
3. Verify the page loads with the correct background color (#F4F6FA)
4. Check that the page header displays "Overview" and "Osun state"

## 📝 Notes

- The layout follows the same pattern as the BM dashboard (Navbar + Sidebar)
- The sidebar and navbar components are reused from existing components
- Font fallbacks are configured: `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`
- All design tokens are accessible via CSS variables (e.g., `var(--color-primary-600)`)
