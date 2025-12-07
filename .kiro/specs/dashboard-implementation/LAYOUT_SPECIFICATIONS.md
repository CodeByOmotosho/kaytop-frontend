# Exact Layout Specifications from Figma

## Dashboard Dimensions
- **Total Width**: 1440px
- **Total Height**: 1900px
- **Background Color**: #F4F6FA

## Sidebar (Left Navigation)
- **Width**: 232px (fixed)
- **Height**: 1855px
- **Position**: x: 0, y: 0
- **Background**: #FFFFFF
- **Logo Position**: x: 35px, y: 29.85px (119x47px)
- **Menu Items Start**: x: 35px, y: 125px
- **Menu Gap**: 47px vertical spacing
- **Active Indicator**: 2px width, 44px height, x: 0, y: 115px, color: #7F56D9

## Header (Top Bar)
- **Width**: 1440px
- **Height**: 70px
- **Position**: x: 0, y: 0
- **Background**: #FFFFFF
- **Border**: 0.2px solid #5A6880
- **User Name Position**: 78.75% from left, 34.29% from top
- **User Avatar**: 29x29px at 86.88% from left
- **Dropdown Arrow**: 14x14px at 96.25% from left

## Main Content Area
- **Start Position**: x: 290px (after 232px sidebar + 58px margin)
- **Content Width**: 1091px (for statistics rows)

## Page Header
- **"Overview" Title**:
  - Position: x: 290px, y: 110px
  - Font: 24px, font-weight 700, #021C3E
  - Dimensions: 113px width, 32px height

- **"Osun state" Subtitle**:
  - Position: x: 290px, y: 150px
  - Font: 16px, font-weight 500, #021C3E, 50% opacity
  - Dimensions: 86px width, 16px height

## Filter Controls Section
- **Position**: x: 290px, y: 198px
- **Total Width**: 1091px
- **Height**: 40px
- **Layout**: Space-between (button group left, action buttons right)

### Time Period Button Group
- **Total Width**: 364px
- **Height**: 40px
- **Border**: 1px solid #D0D5DD
- **Border Radius**: 8px
- **Buttons**:
  - "12 months": 106px width
  - "30 days": 87px width
  - "7 days": 78px width
  - "24 hours": 93px width

### Action Buttons
- **"Select dates"**: 149px width, 40px height
- **"Filters"**: 104px width, 40px height
- **Gap**: 12px between buttons

## Statistics Section - First Row (4 Cards)
- **Container Position**: x: 290px, y: 254px
- **Container Dimensions**: 1091px width, 119px height
- **Card Height**: 115px
- **Background**: #FFFFFF
- **Border**: 0.5px solid rgba(2, 28, 62, 0.2)
- **Border Radius**: 4px
- **Shadow**: blur(30px) rgba(0, 0, 0, 0.04)

### Card 1: All Branches
- **Position**: x: 353px, y: 273px (relative to container: 63px, 19px)
- **Label**: "All Branches"
- **Value**: "42,094"
- **Change**: "+6% this month" (green #5CC47C)

### Card 2: All CO's
- **Position**: x: 606px, y: 273px
- **Label**: "All CO's"
- **Value**: "15,350"
- **Change**: "+6% this month" (green #5CC47C)

### Card 3: All Customers
- **Position**: x: 876px, y: 273px
- **Label**: "All Customers"
- **Value**: "28,350"
- **Change**: "-26% this month" (red #E43535)

### Card 4: Loans Processed
- **Position**: x: 1146.23px, y: 273px
- **Label**: "Loans Processed"
- **Value**: "₦50,350.00"
- **Change**: "+40% this month" (green #5CC47C)

### Vertical Dividers (First Row)
- **Divider 1**: x: 584.08px, height: 91px, 0.5px width, 20% opacity
- **Divider 2**: x: 854.05px, height: 91px, 0.5px width, 20% opacity
- **Divider 3**: x: 1122.91px, height: 91px, 0.5px width, 20% opacity

## Statistics Section - Second Row (3 Cards)
- **Container Position**: x: 290px, y: 389px
- **Container Dimensions**: 833px width, 119px height
- **Card Height**: 115px
- **Same styling as first row**

### Card 5: Loan Amounts
- **Position**: x: 353px, y: 408px
- **Label**: "Loan Amounts"
- **Value**: "42,094"
- **Change**: "+6% this month" (green #5CC47C)

### Card 6: Active Loans
- **Position**: x: 606px, y: 408px
- **Label**: "Active Loans"
- **Value**: "15,350"
- **Change**: "+6% this month" (green #5CC47C)

### Card 7: Missed Payments
- **Position**: x: 876px, y: 408px
- **Label**: "Missed Payments"
- **Value**: "15,350"
- **Change**: "+6% this month" (green #5CC47C)

### Vertical Dividers (Second Row)
- **Divider 1**: x: 584.08px, height: 91px, 0.5px width, 20% opacity
- **Divider 2**: x: 854px, height: 91px, 0.5px width, 20% opacity

## Performance Cards Section
- **Position**: y: 548px
- **Card Dimensions**: 400px width, 312px height
- **Border**: 1px solid #EAECF0
- **Border Radius**: 12px
- **Shadow**: 0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)
- **Padding**: 24px

### Card 8: Top 3 Best Performing Branch
- **Position**: x: 290px, y: 548px
- **Title**: "Top 3 Best performing branch" (18px, font-weight 600, #101828)
- **3 Rows**: Each with branch name, active loans, and amount (₦64,240.60 in green #039855)

### Card 9: Top 3 Worst Performing Branch
- **Position**: x: 722px, y: 548px
- **Title**: "Top 3 worst performing branch" (18px, font-weight 600, #101828)
- **3 Rows**: Each with branch name, active loans, and amount (₦64,240.60 in green #039855)

## Tab Navigation
- **Position**: x: 297px, y: 928px
- **Tabs**: 4 tabs with 24px gap
  1. "Disbursements" (active - #7F56D9)
  2. "Re-collections" (inactive - #ABAFB3)
  3. "Savings" (inactive - #ABAFB3)
  4. "Missed payments" (inactive - #ABAFB3)
- **Active Indicator**: 
  - Position: x: 302px, y: 952px
  - Width: 99px, Height: 2px
  - Color: #7F56D9
  - Border Radius: 20px

## Data Table
- **Position**: x: 290px, y: 986px
- **Dimensions**: 1041px width, 764px height
- **Background**: #FFFFFF

### Table Structure
- **Header Height**: 44px
- **Header Background**: #F9FAFB
- **Row Height**: 72px
- **Total Rows**: 10 data rows + 1 header row

### Column Widths
1. **Checkbox + Loan ID**: 165px
2. **Name**: 221px
3. **Status**: 131px
4. **Interest**: 165px
5. **Amount**: 162px
6. **Date disbursed**: 197px

### Table Data (10 Rows)
1. ID: 43756, Ademola Jumoke, Active, 7.25%, NGN87,000, June 03, 2024
2. ID: 45173, Adegboyoga Precious, Active, 6.50%, NGN55,000, Dec 24, 2023
3. ID: 70668, Nneka Chukwu, Scheduled, 8.00%, NGN92,000, Nov 11, 2024
4. ID: 87174, Damilare Usman, Active, 7.75%, NGN68,000, Feb 02, 2024
5. ID: 89636, Jide Kosoko, Active, 7.00%, NGN79,000, Aug 18, 2023
6. ID: 97174, Oladejo israel, Active, 6.75%, NGN46,000, Sept 09, 2024
7. ID: 22739, Eze Chinedu, Active, 8.25%, NGN61,000, July 27, 2023
8. ID: 22739, Adebanji Bolaji, Active, 7.50%, NGN73,000, April 05, 2024
9. ID: 48755, Baba Kaothat, Active, 6.25%, NGN62,000, Oct 14, 2023
10. ID: 30635, Adebayo Salami, Active, 7.10%, NGN84,000, March 22, 2024

## Card Typography Specifications

### StatCard (Statistics Cards)
- **Label**:
  - Font: Open Sauce Sans, 14px, font-weight 600
  - Color: #8B8F96
  - Opacity: 90%
  - Letter Spacing: 0.6%
  - Position: Top of card

- **Value**:
  - Font: Open Sauce Sans, 18px, font-weight 600
  - Color: #021C3E
  - Letter Spacing: 1.3%
  - Position: 24px below label

- **Change Indicator**:
  - Font: Open Sauce Sans, 14px, font-weight 400
  - Color: #5CC47C (positive) or #E43535 (negative)
  - Letter Spacing: 0.6%
  - Position: 57px below label

### PerformanceCard
- **Title**: 18px, font-weight 600, #101828
- **Branch Name**: 14px, font-weight 500, #101828
- **Active Loans**: 14px, font-weight 400, #475467
- **Amount**: 14px, font-weight 400, #039855

### Table
- **Header**: 12px, font-weight 500, #475467
- **Cell Text**: 14px, font-weight 400, #475467
- **Name Column**: 14px, font-weight 500, #101828
- **Status Badge**: 12px, font-weight 500

## Summary: Total Card Count

### Statistics Cards: **7 cards**
1. All Branches
2. All CO's
3. All Customers
4. Loans Processed
5. Loan Amounts
6. Active Loans
7. Missed Payments

### Performance Cards: **2 cards**
8. Top 3 Best performing branch
9. Top 3 worst performing branch

### **Total: 9 cards on the dashboard**

## Responsive Breakpoints (Recommended)

- **Desktop**: 1440px+ (design baseline)
- **Laptop**: 1024px - 1439px (scale proportionally)
- **Tablet**: 768px - 1023px (stack cards 2x2, then 2x1)
- **Mobile**: < 768px (stack cards vertically, collapsible sidebar)

## Implementation Checklist

When implementing, verify:
- [ ] Sidebar is exactly 232px wide
- [ ] Main content starts at x: 290px
- [ ] First statistics row has 4 cards at y: 254px
- [ ] Second statistics row has 3 cards at y: 389px
- [ ] Performance cards are 400x312px at y: 548px
- [ ] Table starts at y: 986px with 1041px width
- [ ] All 7 statistics cards are present with correct values
- [ ] Both performance cards are present
- [ ] Table has exactly 10 rows of data
- [ ] All colors match exactly
- [ ] All font sizes and weights match
- [ ] All spacing matches (use browser DevTools to measure)
