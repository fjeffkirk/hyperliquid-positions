# Hyperliquid PnL Viewer

A lightweight, mobile-first web app to view your Hyperliquid perpetual positions with real-time PnL calculations.

## Features

✅ **Real-time Position Tracking**
- View all open perpetual positions from any Ethereum address
- Live mark prices from CoinGecko
- Automatic uPnL (unrealized profit/loss) calculation
- Liquidation price display

✅ **Account Summary**
- Total equity
- Margin used
- Available margin
- Margin usage percentage with visual indicator

✅ **Auto-Refresh**
- Toggle 10-second polling for live updates
- Manual refresh on demand

✅ **Share Links**
- Generate shareable URLs with address encoded in hash
- One-click copy to clipboard

✅ **Mobile-First Design**
- Dark, Material-inspired UI
- Optimized for phone screens
- Responsive layout
- Color-coded PnL (green = profit, red = loss)

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool & dev server
- **TailwindCSS** - Styling
- **Hyperliquid API** - Position data
- **CoinGecko API** - Price feeds

## Quick Start

### Prerequisites

- Node.js 18+ and npm (or yarn/pnpm)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for Production

```bash
# Build static files
npm run build

# Preview production build
npm run preview
```

The production files will be in the `dist/` directory.

## Deployment

This app is 100% client-side (no backend required) and can be deployed to any static hosting service:

### GitHub Pages

1. Update `vite.config.ts` base path:
   ```ts
   export default defineConfig({
     plugins: [react()],
     base: '/your-repo-name/',
   })
   ```

2. Build and deploy:
   ```bash
   npm run build
   # Push dist/ folder to gh-pages branch
   ```

### Netlify

1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Deploy!

### Vercel

1. Import your GitHub repository
2. Framework: Vite
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy!

### Other Static Hosts

Simply upload the contents of `dist/` folder to:
- AWS S3 + CloudFront
- Firebase Hosting
- Cloudflare Pages
- Any web server

## Usage

1. **Enter an Ethereum address** in the input field
2. **Click "View Positions"** to load data
3. **View your positions** with live mark prices and PnL
4. **Toggle "Start" for auto-refresh** (updates every 10 seconds)
5. **Click "Share Link"** to copy a shareable URL

### URL Sharing

Share your positions by sending a link like:
```
https://your-app.com/#addr=0x1234...
```

The app will automatically load positions for that address.

## API Integration

### Hyperliquid API

Fetches position data via POST request:
```
POST https://api.hyperliquid.xyz/info
Body: { "type": "clearinghouseState", "user": "0x..." }
```

### CoinGecko API

Resolves symbols to coin IDs and fetches USD prices:
- Includes manual overrides for common symbols (BTC, ETH, SOL, etc.)
- Automatic symbol search for unknown tokens
- LocalStorage caching for resolved IDs
- Batch price fetching for efficiency

## Project Structure

```
project/
├── index.html                 # Entry HTML
├── src/
│   ├── main.tsx              # React entry point
│   ├── App.tsx               # Main app component
│   ├── index.css             # Global styles
│   ├── components/
│   │   ├── AddressInput.tsx  # Address input & share
│   │   ├── AccountSummary.tsx # Equity & margin display
│   │   ├── PollingControls.tsx # Auto-refresh toggle
│   │   └── PositionCard.tsx  # Individual position card
│   └── lib/
│       ├── hyperliquid.ts    # HL API integration
│       ├── coingecko.ts      # CoinGecko integration
│       └── utils.ts          # Helper functions
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

## Error Handling

The app gracefully handles:
- Invalid Ethereum addresses
- API failures (Hyperliquid or CoinGecko)
- Missing price data (shows "—")
- No open positions (displays message)
- Network errors

## Browser Support

Modern browsers with ES2020+ support:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

### Available Scripts

- `npm run dev` - Start dev server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Customization

**Add more symbol overrides** in `src/lib/coingecko.ts`:
```ts
const SYMBOL_OVERRIDES: Record<string, string> = {
  YOUR_SYMBOL: 'coingecko-id',
  // ...
};
```

**Adjust polling interval** in `src/App.tsx`:
```ts
const intervalId = setInterval(() => {
  fetchPositions(address);
}, 10000); // Change to desired milliseconds
```

**Modify UI colors** in Tailwind classes throughout components.

## Limitations

- **CoinGecko Rate Limits**: Free tier allows ~50 calls/minute. The app uses batch fetching and caching to minimize requests.
- **No Authentication**: All data is public. Anyone with the URL can view positions.
- **Client-Side Only**: All logic runs in browser. No backend for enhanced features.

## License

MIT - Feel free to use and modify!

## Contributing

Pull requests welcome! Please ensure:
- TypeScript types are correct
- Code follows existing style
- UI remains mobile-first
- No breaking changes to API integration

## Support

For issues or questions:
- Check browser console for errors
- Verify Ethereum address format
- Ensure APIs are accessible (not blocked by firewall/VPN)

---

**Built with ❤️ for the Hyperliquid community**

