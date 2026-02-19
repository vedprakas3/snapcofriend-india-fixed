# SnapCofriend India 🇮🇳

**Contextual Companionship Marketplace - India Edition**

[![Vercel Deploy](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com)
[![Razorpay](https://img.shields.io/badge/Powered%20by-Razorpay-0C4DA2?logo=razorpay)](https://razorpay.com)

## 🚀 Features

- ✅ **Demo Mode** - Works without backend/environment variables
- ✅ **Razorpay Integration** - India's #1 Payment Gateway
- ✅ **INR Currency** - Indian Rupee (₹) formatting
- ✅ **Vercel Ready** - One-click deployment
- ✅ **TypeScript** - Full type safety
- ✅ **Responsive UI** - Mobile-first design

## 📋 Quick Start

### Demo Login Credentials
```
Email: demo@snapcofriend.com
Password: demo123
```

### Local Development

```bash
# Install dependencies
cd app && npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

### Build for Production

```bash
# From root directory
npm run build

# Or from app directory
cd app && npm run build
```

## 🌐 Deployment

### Vercel (Frontend)

1. Push code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Set Framework Preset: **Vite**
4. Set Root Directory: **app**
5. Deploy!

**No environment variables required for demo mode!**

### Environment Variables (Optional)

For production backend connection:

```env
VITE_API_URL=https://your-api.com/api
VITE_RAZORPAY_KEY_ID=rzp_live_your_key
```

## 💳 Razorpay Configuration

### Test Mode (Demo)
- Uses mock payments
- No real transactions
- Perfect for testing

### Live Mode
1. Sign up at [Razorpay](https://razorpay.com)
2. Complete KYC verification
3. Get API Keys from Dashboard
4. Add to environment variables

## 🏗️ Project Structure

```
snapcofriend/
├── app/                    # React Frontend
│   ├── src/
│   │   ├── components/     # UI Components
│   │   ├── pages/          # Page Components
│   │   ├── services/       # API Services
│   │   ├── lib/            # Utilities
│   │   └── config/         # Configuration
│   └── package.json
├── server/                 # Node.js Backend
│   └── src/
└── package.json           # Root package.json
```

## 💰 Currency Formatting

Indian Number Format:
- ₹1,00,000 (1 Lakh)
- ₹10,00,000 (10 Lakhs)
- ₹1,00,00,000 (1 Crore)

```typescript
import { formatINR, amountInWords } from '@/lib/currency';

formatINR(100000);        // "₹1,00,000"
amountInWords(125000);    // "One Lakh Twenty Five Thousand Rupees"
```

## 🛡️ Safety Features

- Emergency SOS button
- Location sharing
- Check-in system
- Safety code verification
- 24/7 support

## 📱 Screenshots

*Coming soon...*

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file

---

**Made with ❤️ in India**

For support, contact: support@snapcofriend.com
