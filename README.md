SquadSave is a Kaia-EVM DeFi protocol designed to make saving money fun, social, and rewarding. Delivered as a LINE Mini-dApp that integrates directly into users' social fabric. 

## 🌟 Overview

**SquadSave** is a revolutionary savings platform that gamifies the process of building financial discipline. Users participate in **mission pools** where they commit to regular deposits of Kaia-native USDT, earning rewards through streaks, social bonuses, and yield generation.

### Core Features

- **🎯 Mission Pools**: Create or join savings missions with customizable targets and cadences
- **🔥 Streak System**: Build consecutive deposit streaks for bonus multipliers
- **👥 Social Squads**: Form teams with friends for shared rewards and accountability
- **💰 Yield Generation**: Earn base yield from underlying strategies plus social bonuses
- **📱 LINE Integration**: Seamless experience within LINE messaging app
- **🔗 Wallet Binding**: Connect Kaia wallets with LINE identity for enhanced security
- **📊 Analytics Dashboard**: Track progress with beautiful charts and insights
- **🎉 Gamification**: Achievement badges, confetti celebrations, and progress notifications

## 🏗️ Architecture

This project is structured as a monorepo with three main components:

### Frontend (`/frontend`)
- **Framework**: Next.js 15 with App Router
- **UI**: React 19, TypeScript, Tailwind CSS
- **Animations**: Framer Motion
- **Charts**: Chart.js with react-chartjs-2
- **Blockchain**: ethers.js v6
- **LINE Integration**: LINE dApp Portal SDK

### Backend (`/backend`)
- **Runtime**: Node.js with Express
- **Queue System**: BullMQ with Redis
- **Scheduling**: node-cron
- **LINE Bot**: @line/bot-sdk
- **Blockchain**: ethers.js v6
- **Data Export**: CSV generation for analytics

### Smart Contracts (`/contracts`)
- **Language**: Solidity ^0.8.20
- **Framework**: Foundry
- **Libraries**: OpenZeppelin Contracts
- **Testing**: Comprehensive unit and integration tests

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- Foundry (for smart contracts)
- Redis (for queue system)
- A Kaia wallet (e.g., Kaia Wallet, MetaMask with Kaia network)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kaia-social-savings
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Fill in your environment variables
   ```

4. **Install Foundry dependencies**
   ```bash
   cd contracts
   forge install
   ```

## 📁 Project Structure

```
kaia-social-savings/
├── frontend/                 # Next.js Mini-dApp
│   ├── src/
│   │   ├── app/             # App Router pages
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utilities and configurations
│   │   └── hooks/          # Custom React hooks
│   ├── public/             # Static assets
│   └── package.json
├── backend/                 # Node.js services
│   ├── index.js            # Main Express server
│   ├── scheduler.js        # Cron job scheduler
│   ├── worker.js           # Queue worker
│   ├── queue.js            # BullMQ configuration
│   └── package.json
├── contracts/               # Solidity smart contracts
│   ├── src/                # Contract source files
│   ├── test/               # Foundry tests
│   ├── script/             # Deployment scripts
│   └── foundry.toml        # Foundry configuration
├── package.json            # Root package.json
├── pnpm-workspace.yaml     # Workspace configuration
└── README.md
```

## 🛠️ Development

### Running the Development Environment

1. **Start the backend services**
   ```bash
   cd backend
   npm run start
   ```

2. **Start the frontend**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Deploy contracts to testnet**
   ```bash
   cd contracts
   forge script script/DeployKaiaTestnet.s.sol --rpc-url $KAIA_TESTNET_RPC_URL --broadcast --verify
   ```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run test` - Run tests
- `npm run lint` - Lint code
- `forge test` - Run contract tests
- `forge build` - Compile contracts

## 🔧 Smart Contracts

### Core Contracts

- **IdentityBinder**: Links LINE user IDs to Kaia wallet addresses
- **MissionFactory**: Creates and manages mission pools
- **MissionPool**: Core savings pool with deposit tracking
- **RewardDistributor**: Handles reward calculations and distribution
- **IYieldStrategy**: Interface for yield-generating strategies
- **MockYieldStrategy**: Mock implementation for testing

### Testing

```bash
cd contracts
forge test
```

## 📱 LINE Mini-dApp Integration

The dApp is designed to work seamlessly within LINE:

1. **LIFF Integration**: Uses LINE Front-end Framework for in-app experience
2. **Wallet Connection**: Supports Kaia wallets via WalletConnect
3. **Social Features**: Leverages LINE's social graph for squads and referrals
4. **Push Notifications**: Sends reminders and updates via LINE messages

## 📊 Analytics & Monitoring

- **Real-time Dashboard**: Built-in analytics with Chart.js
- **Event Tracking**: Comprehensive smart contract events
- **CSV Export**: For external analytics platforms like Dune
- **Performance Metrics**: TVL, user engagement, completion rates

### Development Guidelines

- Follow the existing code style
- Write comprehensive tests for new features
- Update documentation as needed
- Ensure all CI checks pass

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Kaia](https://kaia.io/) - The blockchain platform
- [LINE](https://line.me/) - Messaging platform and Mini-dApp ecosystem
- [Foundry](https://book.getfoundry.sh/) - Smart contract development framework
- [OpenZeppelin](https://openzeppelin.com/) - Secure smart contract libraries

## 📞 Support

For questions or support, please open an issue on GitHub or contact the development team.

---

**Made with ❤️ for the Kaia Stablecoin Summer Hackathon**
