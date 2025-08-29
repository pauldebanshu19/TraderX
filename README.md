# TraderX - AI-Powered Crypto Trading Platform

A modern, AI-powered cryptocurrency trading platform that combines blockchain technology with artificial intelligence to provide intelligent trading insights and automated operations.

## 🚀 Features

- **AI-Powered Trading Assistant**: Chat with an intelligent AI agent that can help with trading decisions
- **Price Prediction Model**: Machine learning model for cryptocurrency price predictions
- **Wallet Integration**: Secure wallet creation and management with private key backup
- **Gasless Transactions**: Execute transactions without holding native tokens for gas fees
- **Smart Account Support**: Advanced account abstraction features
- **Real-time Chat Interface**: Interactive chat with context-aware AI responses
- **Modern UI/UX**: Beautiful, responsive design with smooth animations

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Blockchain**: 0xGasless AgentKit, Viem
- **AI & ML**: LangChain, OpenAI GPT-4, scikit-learn
- **Data Analysis**: Pandas, NumPy, Matplotlib
- **State Management**: React Hooks
- **UI Components**: Radix UI, Lucide React

## 📋 Prerequisites

Before running this project, you'll need:

1. **Node.js** (v18 or higher)
2. **npm** or **yarn**
3. **Python** (v3.7 or higher)
4. **Conda** or **venv** for Python environment management
5. **0xGasless API Key** - Get one from [0xGasless](https://0xgasless.com)
6. **OpenRouter API Key** - Get one from [OpenRouter](https://openrouter.ai)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd traderx
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# 0xGasless Configuration
NEXT_PUBLIC_API_KEY=your_0xgasless_api_key_here
NEXT_PUBLIC_RPC_URL=https://bsc-dataseed1.binance.org
NEXT_PUBLIC_CHAIN_ID=56

# OpenAI/OpenRouter Configuration
NEXT_PUBLIC_OPENROUTER_API_KEY=your_openrouter_api_key_here

# Optional: Use EOA mode (set to "true" to enable)
USE_EOA=true
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. Set Up the ML Environment

```bash
cd Price\ Predictor\ Model\ ML
conda create -n venv python=3.7
conda activate venv/
pip install -r requirements.txt
python app.py
```

The ML service will start on [http://localhost:5000](http://localhost:5000).

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_KEY` | Your 0xGasless API key | Yes | - |
| `NEXT_PUBLIC_RPC_URL` | Blockchain RPC endpoint | Yes | - |
| `NEXT_PUBLIC_CHAIN_ID` | Chain ID for the network | Yes | - |
| `NEXT_PUBLIC_OPENROUTER_API_KEY` | OpenRouter API key for AI | Yes | - |
| `USE_EOA` | Enable EOA mode | No | true |

### Supported Networks

The platform is configured for BSC (Binance Smart Chain) by default, but you can modify the RPC URL and Chain ID for other networks:

- **BSC**: `https://bsc-dataseed1.binance.org` (Chain ID: 56)
- **Ethereum**: `https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY` (Chain ID: 1)
- **Polygon**: `https://polygon-rpc.com` (Chain ID: 137)

## 🎯 Usage

### 1. Connect Wallet
- Click "Connect Wallet" in the header
- Choose to create a new wallet or import an existing one
- **Important**: Backup your private key securely

### 2. Initialize AI Agent
- After connecting your wallet, click "Initialize Agent"
- The AI agent will be configured with your wallet

### 3. Start Trading
- Use the chat interface to interact with the AI
- Ask about balances, transfers, swaps, or general trading questions
- The AI will automatically detect your intent and use appropriate tools

### Example Commands

```
"Check my wallet balance"
"Transfer 0.1 ETH to 0x1234..."
"Swap 100 USDT for ETH"
"What's my smart account address?"
"Show me my transaction history"
```

## 🏗️ Project Structure

```
traderx/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── AgentIntialize.tsx # Agent initialization
│   ├── ChatInterface.tsx  # Chat interface
│   ├── Dashboard.tsx      # Main dashboard
│   ├── ErrorBoundary.tsx  # Error handling
│   ├── header.tsx         # Navigation header
│   ├── hero.tsx           # Hero section
│   └── Wallet.ts          # Wallet management
├── lib/                   # Utility libraries
│   ├── agent.ts           # AI agent configuration
│   ├── utils.ts           # Utility functions
│   └── wallet.ts          # Wallet utilities
├── public/                # Static assets
└── Price Predictor Model ML/ # ML model files
    ├── app.py            # Flask API for price predictions
    ├── data.csv          # Training data
    ├── listener.py       # Real-time data listener
    ├── price.ipynb       # Model development notebook
    └── requirements.txt  # Python dependencies
```

## 🔒 Security

- Private keys are stored locally in encrypted cookies
- All blockchain operations use secure, gasless transactions
- No sensitive data is sent to external servers
- Environment variables are properly validated

## 🐛 Troubleshooting

### Common Issues

1. **"Missing environment variables" error**
   - Ensure all required environment variables are set in `.env.local`
   - Check that the file is in the root directory

2. **"Agent initialization failed" error**
   - Verify your API keys are correct
   - Check your internet connection
   - Ensure the RPC URL is accessible

3. **"Wallet connection failed" error**
   - Try refreshing the page
   - Clear browser cookies and try again
   - Check browser console for detailed errors

### Debug Mode

Enable debug logging by adding to your `.env.local`:

```env
DEBUG=true
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [0xGasless](https://0xgasless.com) for the gasless transaction infrastructure
- [OpenRouter](https://openrouter.ai) for AI model access
- [LangChain](https://langchain.com) for AI agent framework
- [Viem](https://viem.sh) for blockchain interactions

## 📞 Support

If you encounter any issues or have questions:

1. Check the [troubleshooting section](#-troubleshooting)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

**⚠️ Disclaimer**: This is experimental software. Use at your own risk and never invest more than you can afford to lose.
