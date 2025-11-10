# 🚀 Quick Start Guide

## Windows Setup (PowerShell)

### 1. Install Dependencies
```powershell
npm install
```

### 2. Start Development Server
```powershell
npm run dev
```

You should see:
```
VITE v5.x.x  ready in xxx ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### 3. Open in Browser
- Navigate to `http://localhost:5173/`
- You should see the **Hyperliquid PnL Viewer** interface

## First Test

Try it with a test address (replace with your own):
1. Enter: `0x1234567890123456789012345678901234567890` (replace with a real HL address)
2. Click **"View Positions"**
3. See positions, PnL, and account summary

## Common Issues

### Port Already in Use
If port 5173 is taken, Vite will use the next available port (5174, 5175, etc.)

### Module Not Found
Make sure you ran `npm install` first

### API Errors
- Check your internet connection
- CoinGecko may have rate limits (free tier: ~50 calls/min)
- Hyperliquid API should be accessible without auth

## Building for Production

```powershell
# Build
npm run build

# Preview build locally
npm run preview
```

The `dist/` folder will contain your static files ready to deploy!

## Deploying

### Option 1: Netlify (Easiest)
1. Push code to GitHub
2. Go to [netlify.com](https://netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Select your repo
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. Deploy!

### Option 2: Vercel
1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your repo
5. Vercel auto-detects Vite settings
6. Deploy!

### Option 3: GitHub Pages
1. Update `vite.config.ts`:
   ```ts
   base: '/HYPERLIQUID-PORT/'  // Your repo name
   ```
2. Build: `npm run build`
3. Deploy `dist/` folder to `gh-pages` branch
4. Enable GitHub Pages in repo settings

## Tips

- **Mobile Testing**: Open on phone with `http://YOUR_IP:5173`
- **Share Links**: Use the "Share Link" button to copy URLs with addresses
- **Auto-Refresh**: Toggle "Start" to enable 10-second polling
- **Bookmark Addresses**: URLs with `#addr=0x...` load automatically

## Need Help?

- Check the main [README.md](./README.md) for full docs
- Inspect browser console (F12) for detailed errors
- Ensure Node.js 18+ is installed: `node --version`

---

**Happy trading! 📈**

