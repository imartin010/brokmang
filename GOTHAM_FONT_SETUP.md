# 🎨 Gotham Font Setup Guide

## ✅ Current Status

Your app is now configured to use **Gotham font everywhere**! 

Currently using **Montserrat** from Google Fonts as a fallback (it's very similar to Gotham and free).

---

## 🚀 Option 1: Using Montserrat (Current - Already Working!)

**Montserrat** is already loaded and active. It's a great free alternative to Gotham with similar geometric characteristics.

**No action needed!** Just refresh your browser and you'll see the new font.

---

## 📦 Option 2: Adding Real Gotham Font Files (If You Have Them)

If you own Gotham font files, follow these steps:

### Step 1: Create Fonts Folder

```bash
mkdir -p public/fonts
```

### Step 2: Add Your Gotham Font Files

Place your Gotham font files in `public/fonts/`:

```
public/
  fonts/
    Gotham-Book.woff2
    Gotham-Book.woff
    Gotham-Medium.woff2
    Gotham-Medium.woff
    Gotham-Bold.woff2
    Gotham-Bold.woff
    Gotham-Black.woff2
    Gotham-Black.woff
```

**Recommended font weights:**
- **Book** (400) - Regular text
- **Medium** (500) - Slightly emphasized
- **Bold** (700) - Headers and emphasis
- **Black** (900) - Extra bold headers

### Step 3: Uncomment Font Declarations

Open `app/globals.css` and **uncomment** the `@font-face` declarations (lines 8-44):

```css
@font-face {
  font-family: 'Gotham';
  src: url('/fonts/Gotham-Book.woff2') format('woff2'),
       url('/fonts/Gotham-Book.woff') format('woff');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Gotham';
  src: url('/fonts/Gotham-Medium.woff2') format('woff2'),
       url('/fonts/Gotham-Medium.woff') format('woff');
  font-weight: 500;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Gotham';
  src: url('/fonts/Gotham-Bold.woff2') format('woff2'),
       url('/fonts/Gotham-Bold.woff') format('woff');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Gotham';
  src: url('/fonts/Gotham-Black.woff2') format('woff2'),
       url('/fonts/Gotham-Black.woff') format('woff');
  font-weight: 900;
  font-style: normal;
  font-display: swap;
}
```

### Step 4: Restart Your Dev Server

```bash
npm run dev
```

---

## 🔍 Where to Get Gotham

Gotham is a **commercial font** by Hoefler&Co. 

**Purchase from:**
- [Hoefler&Co Official Site](https://www.typography.com/fonts/gotham/overview)
- Adobe Fonts (included with Creative Cloud subscription)
- MyFonts or other font retailers

**Note:** Gotham is not free. Make sure you have proper licensing before using it commercially.

---

## 🎯 What's Changed

### 1. **Global CSS** (`app/globals.css`)
- Added Montserrat font import from Google Fonts
- Added `@font-face` declarations for Gotham (commented out, ready to use)
- Applied font family to `body` element

### 2. **Tailwind Config** (`tailwind.config.ts`)
- Extended `fontFamily.sans` to include Gotham and Montserrat
- Font stack with fallbacks for compatibility

### 3. **Font Stack Priority**
```
'Gotham' → 'Montserrat' → System fonts
```

If Gotham files are present, it uses Gotham.
Otherwise, it falls back to Montserrat (free alternative).

---

## 🎨 Font Weights Available

| Weight | Name | Use For |
|--------|------|---------|
| 300 | Light | Subtle text, captions |
| 400 | Book/Regular | Body text, paragraphs |
| 500 | Medium | Emphasized text, buttons |
| 600 | Semi-Bold | Subheadings |
| 700 | Bold | Headings, CTAs |
| 800 | Extra Bold | Large titles |
| 900 | Black | Hero text, impact |

---

## 🧪 Testing the Font

### Check if font is loaded:

1. **Open DevTools** (F12)
2. Go to **Console**
3. Run:
```javascript
document.fonts.check('1em Gotham')
// Returns true if Gotham is loaded
```

### Visual check:

1. Right-click any text
2. Select **Inspect**
3. Check **Computed** tab
4. Look for `font-family` - should show "Gotham" or "Montserrat"

---

## 🎯 Usage Examples

The font is now applied **everywhere automatically**!

### Manual font classes (if needed):

```jsx
<h1 className="font-sans font-bold">
  Uses Gotham Bold
</h1>

<p className="font-sans font-normal">
  Uses Gotham Regular
</p>

<span className="font-sans font-black">
  Uses Gotham Black
</span>
```

---

## 🔧 Converting Font Formats

If you only have `.ttf` or `.otf` files, convert them to `.woff2`:

**Online converters:**
- [Transfonter](https://transfonter.org/)
- [Font Squirrel Webfont Generator](https://www.fontsquirrel.com/tools/webfont-generator)

**Recommended settings:**
- ✅ WOFF2
- ✅ WOFF (as fallback)
- ✅ Subsetting: Basic Latin + Latin Extended
- ✅ Hinting: Keep existing

---

## 📊 Performance Optimization

### Current setup already includes:

✅ **`font-display: swap`** - Shows fallback font while loading
✅ **Google Fonts CDN** - Fast delivery for Montserrat
✅ **Font stack** - Multiple fallbacks for reliability
✅ **WOFF2 format** - Best compression (80% smaller than TTF)

### For Gotham files:

- Use WOFF2 format (primary)
- Include WOFF as fallback
- Enable font subsetting if you don't need all characters
- Self-host for better control and privacy

---

## ⚠️ Licensing Note

**Important:** Gotham is a commercial font. Make sure you have:

- ✅ Valid license for number of pageviews
- ✅ Web font license (not just desktop)
- ✅ Proper attribution if required
- ✅ License covers your domain

Montserrat (current fallback) is **open source** and free for commercial use! ✅

---

## 🆘 Troubleshooting

### Font not showing?

**1. Check browser cache**
```bash
Hard reload: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

**2. Verify file paths**
```
Font files must be in: public/fonts/
Not: src/fonts/ ❌
```

**3. Check file names match**
Make sure your actual file names match the `@font-face` declarations.

**4. Check file formats**
WOFF2 is supported by all modern browsers (95%+ support).

**5. Restart dev server**
```bash
npm run dev
```

---

## ✅ Checklist

- [ ] Refresh browser to see Montserrat font (already working!)
- [ ] (Optional) Purchase Gotham font license
- [ ] (Optional) Create `public/fonts/` folder
- [ ] (Optional) Add Gotham font files
- [ ] (Optional) Uncomment `@font-face` declarations in `globals.css`
- [ ] (Optional) Restart dev server
- [ ] Test font in browser DevTools

---

## 🎉 Result

Your entire application now uses Gotham-style typography! 

**Currently active:** Montserrat (free Gotham alternative)
**Ready for:** Real Gotham font files (just add and uncomment)

Enjoy your beautiful new typography! ✨

