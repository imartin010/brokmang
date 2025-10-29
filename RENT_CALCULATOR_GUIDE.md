# 💰 Smart Rent Calculator - User Guide

## ✨ New Feature

The Analyze page now includes a **smart rent calculator** that helps you calculate rent per agent/team leader automatically!

---

## 🎯 Two Ways to Enter Rent

### **Option 1: Direct Entry (Default)** ✏️

**When to use:** You already know the rent cost per person.

**How it works:**
1. Leave the checkbox unchecked
2. Enter the rent amount per agent/team leader
3. That's it!

**Example:**
```
Rent Per Agent: 5000 EGP
```

---

### **Option 2: Calculate from Total Office Rent** 🧮

**When to use:** You know your total office rent but not the per-person cost.

**How it works:**
1. ✅ Check the box "Calculate from total office rent"
2. Enter your total monthly office rent
3. The system automatically divides it by (agents + team leaders)
4. See the calculated rent per person in a green box

**Example:**
```
Office has: 10 Agents + 2 Team Leaders = 12 people
Total Office Rent: 60,000 EGP

Calculation:
60,000 ÷ 12 = 5,000 EGP per person ✓
```

---

## 📊 What You'll See

### **Mode 1: Direct Entry**

```
┌──────────────────────────────────────┐
│ Rent Per Agent                       │
│ □ Calculate from total office rent   │
│                                      │
│ [Enter rent per agent: 5000]        │
│ Monthly rent cost per agent/TL       │
└──────────────────────────────────────┘
```

### **Mode 2: Auto-Calculate**

```
┌──────────────────────────────────────┐
│ Rent Per Agent                       │
│ ✓ Calculate from total office rent   │
│                                      │
│ Total Office Rent (Monthly)          │
│ [Enter total office rent: 60000]    │
│ Total monthly rent for your office   │
│                                      │
│ ┌────────────────────────────────┐  │
│ │ ✓ Rent per person: 5,000 EGP   │  │
│ │ 60,000 ÷ 12 people = 5,000     │  │
│ └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

---

## ⚠️ Important Notes

### **1. Enter Team Size First**

When using auto-calculate mode, make sure to fill in:
- ✅ Number of Agents
- ✅ Number of Team Leaders

**Why?** The system needs to know how many people to divide the rent by.

**If you don't:** You'll see a warning:
```
⚠️ Please enter number of agents and team leaders first
```

### **2. Automatic Updates**

The rent per person **updates automatically** when you change:
- Total office rent amount
- Number of agents
- Number of team leaders

### **3. Rounding**

The calculated rent is rounded to 2 decimal places for precision.

**Example:**
```
60,123 ÷ 13 people = 4,624.85 EGP
```

---

## 🎨 Visual Features

### **Highlighted Section**
The rent field is highlighted with a blue border to make it stand out.

### **Color-Coded Feedback**
- 🟢 **Green Box**: Successful calculation shown
- 🟡 **Yellow Box**: Warning - need more info

### **Real-time Calculation**
Changes are reflected immediately as you type!

---

## 📝 Step-by-Step Example

### Scenario: You have a 60,000 EGP office

**Step 1: Enter Team Structure**
```
Number of Agents: 10
Number of Team Leaders: 2
```

**Step 2: Enable Auto-Calculate**
```
✓ Check "Calculate from total office rent"
```

**Step 3: Enter Total Rent**
```
Total Office Rent: 60,000
```

**Step 4: See Result**
```
✓ Rent per person: 5,000 EGP
60,000 ÷ 12 people = 5,000
```

**Step 5: Continue**
The calculated 5,000 EGP is now used in your break-even analysis!

---

## 🔄 Switching Modes

### From Auto-Calculate to Direct Entry:
1. Uncheck "Calculate from total office rent"
2. The previous calculated value stays
3. You can now edit it manually

### From Direct Entry to Auto-Calculate:
1. Check "Calculate from total office rent"
2. Enter your total office rent
3. The field becomes read-only (calculated automatically)

---

## 💡 Tips & Tricks

### **Tip 1: Quick Comparison**
Use auto-calculate mode to see how adding/removing team members affects per-person rent:
```
12 people: 60,000 ÷ 12 = 5,000 EGP/person
15 people: 60,000 ÷ 15 = 4,000 EGP/person
```

### **Tip 2: Shared Spaces**
If you have shared office space, you can calculate your portion:
```
Total Building Rent: 200,000 EGP
Your Share: 30% = 60,000 EGP
Enter: 60,000 in Total Office Rent
```

### **Tip 3: Include Utilities**
You can include utilities in the total rent:
```
Base Rent: 50,000 EGP
+ Utilities: 10,000 EGP
= Total: 60,000 EGP
```

---

## 🐛 Troubleshooting

### Problem: Calculation not showing
**Solution:** Make sure agents + team leaders > 0

### Problem: Wrong calculation
**Solution:** Check that you entered the right number of people

### Problem: Can't edit rent field
**Solution:** Uncheck "Calculate from total office rent" to edit manually

---

## 🎯 Benefits

✅ **Saves Time** - No manual calculations needed
✅ **Accurate** - Automatic division with proper rounding
✅ **Flexible** - Switch between manual and auto modes
✅ **Visual** - Clear feedback with colored boxes
✅ **Dynamic** - Updates in real-time as you change team size

---

## 📊 Use Cases

### **Scenario 1: Growing Team**
As you hire more people, the rent per person automatically decreases.

### **Scenario 2: Office Planning**
Calculate how many people you need to make the rent affordable:
```
Target rent per person: 4,000 EGP
Office rent: 60,000 EGP
Need: 60,000 ÷ 4,000 = 15 people
```

### **Scenario 3: Budget Planning**
Quickly see the impact of different office rents:
```
Option A: 50,000 ÷ 12 = 4,167 EGP/person
Option B: 70,000 ÷ 12 = 5,833 EGP/person
```

---

## ✅ Quick Reference

| Mode | When to Use | You Enter | System Calculates |
|------|-------------|-----------|-------------------|
| **Direct** | Know per-person cost | Rent per agent | Nothing |
| **Auto** | Know total rent only | Total office rent | Rent per person |

---

## 🎉 That's It!

You now have a smart rent calculator that makes break-even analysis even easier!

**Happy calculating!** 🚀

