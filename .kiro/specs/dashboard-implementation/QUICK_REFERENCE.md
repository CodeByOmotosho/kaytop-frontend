# Quick Reference - Dashboard Layout

## 📊 Card Count: 9 TOTAL CARDS

### Statistics Cards: 7 cards
**Row 1 (4 cards)** - Position y: 254px
1. ✅ All Branches → 42,094 (+6% green)
2. ✅ All CO's → 15,350 (+6% green)
3. ✅ All Customers → 28,350 (-26% RED)
4. ✅ Loans Processed → ₦50,350.00 (+40% green)

**Row 2 (3 cards)** - Position y: 389px
5. ✅ Loan Amounts → 42,094 (+6% green)
6. ✅ Active Loans → 15,350 (+6% green)
7. ✅ Missed Payments → 15,350 (+6% green)

### Performance Cards: 2 cards
**Position y: 548px**
8. ✅ Top 3 Best performing branch (400x312px)
9. ✅ Top 3 worst performing branch (400x312px)

---

## 📐 Key Dimensions

| Element | Width | Height | Position |
|---------|-------|--------|----------|
| Sidebar | 232px | 1855px | x:0, y:0 |
| Header | 1440px | 70px | x:0, y:0 |
| Main Content Start | - | - | x:290px |
| Statistics Row 1 | 1091px | 119px | x:290, y:254 |
| Statistics Row 2 | 833px | 119px | x:290, y:389 |
| Performance Card | 400px | 312px | y:548 |
| Data Table | 1041px | 764px | x:290, y:986 |

---

## 🎨 Color Palette

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| Primary Purple | #7F56D9 | Active menu, tabs, borders |
| Page Background | #F4F6FA | Main background |
| Card Background | #FFFFFF | All cards |
| Text Primary | #021C3E | Headings, values |
| Text Secondary | #475467 | Body text |
| Text Tertiary | #888F9B | Inactive menu |
| Text Label | #8B8F96 | Card labels |
| Success Green | #5CC47C | Positive changes |
| Error Red | #E43535 | Negative changes |
| Border Gray | #EAECF0 | Card borders |

---

## 📝 Typography Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page Title | 24px | 700 | #021C3E |
| Card Title | 18px | 600 | #101828 |
| Card Value | 18px | 600 | #021C3E |
| Card Label | 14px | 600 | #8B8F96 |
| Card Change | 14px | 400 | #5CC47C/#E43535 |
| Tab Text | 16px | 500 | #7F56D9/#ABAFB3 |
| Table Header | 12px | 500 | #475467 |
| Table Cell | 14px | 400 | #475467 |
| Button Text | 14px | 600 | Various |

---

## 📋 Data Table (10 Rows)

| ID | Name | Status | Interest | Amount | Date |
|----|------|--------|----------|--------|------|
| 43756 | Ademola Jumoke | Active | 7.25% | NGN87,000 | June 03, 2024 |
| 45173 | Adegboyoga Precious | Active | 6.50% | NGN55,000 | Dec 24, 2023 |
| 70668 | Nneka Chukwu | Scheduled | 8.00% | NGN92,000 | Nov 11, 2024 |
| 87174 | Damilare Usman | Active | 7.75% | NGN68,000 | Feb 02, 2024 |
| 89636 | Jide Kosoko | Active | 7.00% | NGN79,000 | Aug 18, 2023 |
| 97174 | Oladejo israel | Active | 6.75% | NGN46,000 | Sept 09, 2024 |
| 22739 | Eze Chinedu | Active | 8.25% | NGN61,000 | July 27, 2023 |
| 22739 | Adebanji Bolaji | Active | 7.50% | NGN73,000 | April 05, 2024 |
| 48755 | Baba Kaothat | Active | 6.25% | NGN62,000 | Oct 14, 2023 |
| 30635 | Adebayo Salami | Active | 7.10% | NGN84,000 | March 22, 2024 |

---

## ✅ Implementation Checklist

### Layout Verification
- [ ] Sidebar: 232px wide, white background
- [ ] Content starts at x:290px
- [ ] 7 statistics cards (4 + 3 layout)
- [ ] 2 performance cards (400x312px each)
- [ ] 1 data table with 10 rows

### Card Verification
- [ ] Card 1: All Branches - 42,094 (+6%)
- [ ] Card 2: All CO's - 15,350 (+6%)
- [ ] Card 3: All Customers - 28,350 (-26% RED)
- [ ] Card 4: Loans Processed - ₦50,350.00 (+40%)
- [ ] Card 5: Loan Amounts - 42,094 (+6%)
- [ ] Card 6: Active Loans - 15,350 (+6%)
- [ ] Card 7: Missed Payments - 15,350 (+6%)
- [ ] Card 8: Best performing branch
- [ ] Card 9: Worst performing branch

### Styling Verification
- [ ] All colors match Figma exactly
- [ ] Font: Open Sauce Sans (all weights)
- [ ] Card borders: 0.5px rgba(2, 28, 62, 0.2)
- [ ] Card shadows: blur(30px) rgba(0, 0, 0, 0.04)
- [ ] Border radius: 4px (stats), 12px (performance)

### Data Verification
- [ ] All 10 table rows with exact data
- [ ] Currency format: ₦50,350.00
- [ ] Date format: June 03, 2024
- [ ] Interest format: 7.25%

---

## 🚀 Quick Start

1. Open `tasks.md`
2. Start with Task 1 (Create structure)
3. Follow tasks sequentially
4. Reference `LAYOUT_SPECIFICATIONS.md` for exact measurements
5. Use this quick reference for card count and data
6. Test at `http://localhost:3000/dashboard/system-admin`

---

## 📏 Measurement Tool

Use browser DevTools to verify:
```
Right-click element → Inspect → Computed tab
- Check width, height, padding, margin
- Verify colors in Styles tab
- Use ruler tool to measure spacing
```

Compare with Figma:
```
Figma → Select element → Right panel
- Check W (width), H (height)
- Check X, Y positions
- Verify colors, fonts, effects
```
