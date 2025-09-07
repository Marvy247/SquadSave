# TODO: Social Savings Missions Mini-dApp

This document outlines all tasks required to build, test, and submit the Social Savings Missions project for the Kaia Stablecoin Summer hackathon. Follow these steps sequentially to ensure a successful submission.

## 0) Project Overview & Success Criteria

### One-Page Brief: "Social Savings Missions"

**Social Savings Missions** is a Kaia-EVM DeFi protocol designed to make saving money fun, social, and rewarding. It’s delivered as a LINE Mini-dApp, integrating directly into users’ social fabric.

*   **Core Loop**: Users join or create **mission pools** (e.g., “Save $5 USDT daily for 30 days”) using Kaia-native USDT. They deposit funds according to a set cadence.
*   **Gamification & Yield**: Successful deposits build a **streak**. Completing missions unlocks a base yield (generated from an underlying strategy) plus **social bonuses**. Yield is amplified by squad participation, maintaining streaks, and referring friends.
*   **Social Integration**: The dApp leverages the LINE social graph. A `LineID` is bound to an EVM wallet address, enabling features like forming **squads** with friends, sending nudges, and sharing progress. This binding also serves as a lightweight anti-sybil mechanism for fairer reward distribution.
*   **Prize Logic**: Rewards are multifaceted:
    *   **Completion Reward**: Base yield on total saved amount.
    *   **Streak Multiplier**: Bonus for perfect adherence to the deposit cadence.
    *   **Squad Bonus**: A shared reward pool for squads where all members complete the mission.
    *   **Referral Boost**: A small percentage of a referred user's savings rewards goes to the referrer.

### Key Performance Indicators (KPIs) for Dune Dashboard

*   **Growth & Adoption**:
    *   Total Value Locked (TVL) in Kaia USDT
    *   Number of Active Missions
    *   New Users (Wallets) per Day/Week
    *   Number of Squads Formed
*   **User Engagement & Retention**:
    *   Mission Completion Rate (%)
    *   Average Deposit Amount per User
    *   D1/D7/D30 Retention (Wallets returning to the dApp)
    *   Average Streak Length
    *   Distribution of Squad Sizes
*   **Social & Virality**:
    *   Referral Tree Depth & Breadth
    *   Number of Chat-Triggered Actions (e.g., "Nudge")

---

## 1) Repo, Tooling & Baseline

**Definition of Done**: A developer can clone the repo, run one command (`make setup`), and have a fully working local environment with all dependencies, ENV files, and pre-commit hooks installed.

### Milestone Tasks

*   **[ ] Task: Initialize Monorepo Structure**
    *   **What**: Create a monorepo using `pnpm` workspaces (or similar).
    *   **Why**: Organizes code logically, simplifies dependency management, and enables code sharing between apps and services.
    *   **Acceptance Criteria**: Directory structure is created as specified below. `pnpm-workspace.yaml` is configured.
    *   **Owner/Role**: Tech Lead
    *   **Est. Time**: 2 hours
    *   **Dependencies**: None
    *   **Commands**:
        ```bash
        mkdir kaia-social-savings && cd kaia-social-savings
        pnpm init
        mkdir apps services packages contracts
        # Create subdirectories: apps/mini-dapp, apps/web, services/webhook, services/scheduler, packages/ui, packages/utils
        touch pnpm-workspace.yaml
        ```
    *   **File Structure**:
        ```
        /
        ├── apps/
        │   ├── mini-dapp/  # LINE Mini-Dapp (Next.js/LIFF)
        │   └── web/        # Standalone Web DApp (Next.js)
        ├── contracts/      # Solidity (Foundry)
        ├── packages/
        │   ├── ui/         # Shared React components
        │   └── utils/      # Shared utilities (types, constants)
        ├── services/
        │   ├── webhook/    # LINE Webhook receiver (Node.js/Express)
        │   └── scheduler/  # Cron jobs (Node.js/node-cron)
        └── package.json
        ```

*   **[ ] Task: Create Baseline Scripts**
    *   **What**: Implement top-level `Makefile` or `package.json` scripts for common development tasks.
    *   **Why**: Provides a single, simple interface for developers to run, test, and deploy the project.
    *   **Acceptance Criteria**: `make setup`, `make test`, `make deploy:testnet`, `make deploy:mainnet`, `make demo-data` scripts are created and functional.
    *   **Owner/Role**: Tech Lead
    *   **Est. Time**: 3 hours
    *   **Dependencies**: Monorepo Structure
    *   **Example `Makefile`**:
        ```makefile
        .PHONY: setup test deploy:testnet deploy:mainnet demo-data

        setup:
        	pnpm install
        	cp .env.example .env
        	cd contracts && forge install
        	echo "Setup complete. Fill in your .env file."

        test:
        	pnpm test --filter="./**"

        deploy:testnet:
        	cd contracts && forge script script/Deploy.s.sol --rpc-url ${KAIA_TESTNET_RPC_URL} --broadcast --verify

        # ... other scripts
        ```

*   **[ ] Task: Define Environment Variables**
    *   **What**: Create a `.env.example` file with all necessary environment variables.
    *   **Why**: Documents required configuration and makes setup easy for new developers.
    *   **Acceptance Criteria**: `.env.example` is complete and checked into git. `.env` is in `.gitignore`.
    *   **Owner/Role**: Tech Lead
    *   **Est. Time**: 1 hour
    *   **Dependencies**: None
    *   **File Content (`.env.example`)**:
        ```env
        # Kaia Network
        KAIA_MAINNET_RPC_URL=https://public-en-kairos.klaytn.net
        KAIA_TESTNET_RPC_URL=https://public-en-baobab.klaytn.net
        KAIA_CHAIN_ID_MAINNET=8217
        KAIA_CHAIN_ID_TESTNET=1001
        BLOCK_EXPLORER_API_KEY=

        # Wallet
        DEPLOYER_PRIVATE_KEY=
        TREASURY_ADDRESS=

        # Stablecoins (Testnet Baobab)
        USDT_ADDRESS=0x...

        # LINE Integration
        LINE_CHANNEL_ID=
        LINE_CHANNEL_SECRET=
        LINE_LIFF_ID=
        LINE_WEBHOOK_URL=https://<your-ngrok-url>/webhook/line

        # Dune Analytics (for CSV upload fallback)
        DUNE_API_KEY=
        ```

*   **[ ] Task: Configure Coding Standards**
    *   **What**: Set up Prettier, ESLint, Solhint, and Commitlint with Husky pre-commit hooks.
    *   **Why**: Enforces consistent code style and quality automatically.
    *   **Acceptance Criteria**: `pnpm lint` and `pnpm format` commands work. Commits are rejected if they don't meet standards.
    *   **Owner/Role**: Tech Lead
    *   **Est. Time**: 3 hours
    *   **Dependencies**: Monorepo Structure
    *   **Commands**:
        ```bash
        pnpm add -D prettier eslint solhint @commitlint/cli @commitlint/config-conventional husky
        npx husky init
        # Edit .husky/pre-commit to run lint-staged
        ```

---

## 2) Smart Contracts (Solidity, Kaia EVM)

**Definition of Done**: All contracts are implemented, tested (100% coverage), and deployed to the Kaia testnet. They are secure, gas-optimized, and emit all necessary events for analytics.

### Milestone Tasks

*   **[ ] Task: Implement `IdentityBinder.sol`**
    *   **What**: A contract to create a binding between a `lineIdHash` and an `evmAddress`.
    *   **Why**: Enables social features by linking off-chain identity to on-chain activity. The binding is created via a signature from a trusted backend key.
    *   **Acceptance Criteria**: `bindAddress` function correctly stores the mapping. Only the owner (backend) can call it. Events are emitted.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 4 hours
    *   **Dependencies**: Tooling setup.
    *   **Scaffold**:
        ```solidity
        // SPDX-License-Identifier: MIT
        pragma solidity ^0.8.20;

        import "@openzeppelin/contracts/access/Ownable.sol";

        contract IdentityBinder is Ownable {
            mapping(bytes32 => address) public lineIdHashToAddress;
            mapping(address => bytes32) public addressToLineIdHash;

            event AddressBound(bytes32 indexed lineIdHash, address indexed userAddress);

            function bindAddress(bytes32 lineIdHash, address userAddress) external onlyOwner {
                require(lineIdHashToAddress[lineIdHash] == address(0), "ID already bound");
                require(addressToLineIdHash[userAddress] == bytes32(0), "Address already bound");

                lineIdHashToAddress[lineIdHash] = userAddress;
                addressToLineIdHash[userAddress] = lineIdHash;

                emit AddressBound(lineIdHash, userAddress);
            }
        }
        ```

*   **[ ] Task: Implement `MissionFactory.sol`**
    *   **What**: A factory contract to deploy and track `MissionPool` instances.
    *   **Why**: Centralizes mission creation and discovery.
    *   **Acceptance Criteria**: `createMission` function deploys a new `MissionPool` with correct parameters and stores its address.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 6 hours
    *   **Dependencies**: `IdentityBinder.sol`
    *   **Events**: `MissionCreated(address indexed missionPool, address indexed creator, uint256 targetAmount, uint256 cadence)`

*   **[ ] Task: Implement `MissionPool.sol`**
    *   **What**: The core contract where users deposit USDT for a specific mission.
    *   **Why**: Manages user funds, tracks progress, and enforces mission rules.
    *   **Acceptance Criteria**: `deposit` function works only within cadence windows. User balances and streak counts are updated correctly. `SafeERC20` is used for all token transfers. Reentrancy guard is in place.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 12 hours
    *   **Dependencies**: `MissionFactory.sol`
    *   **Events**: `Deposit(address indexed user, uint256 amount, uint256 newStreak)`, `MissedDeposit(address indexed user)`, `MissionCompleted(address indexed user)`, `Withdrawal(address indexed user, uint256 amount)`

*   **[ ] Task: Implement `RewardDistributor.sol`**
    *   **What**: A contract that calculates and distributes rewards upon mission completion.
    *   **Why**: Separates reward logic from the core deposit pool, making the system modular.
    *   **Acceptance Criteria**: `settleMission` function correctly calculates base yield, squad bonuses, and streak multipliers. Rewards are transferred to users. A fee can be sent to the treasury.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 10 hours
    *   **Dependencies**: `MissionPool.sol`
    *   **Events**: `RewardSettled(address indexed missionPool, address indexed user, uint256 baseReward, uint256 bonusReward)`

*   **[ ] Task: Write Contract Tests (Foundry)**
    *   **What**: Write unit, integration, and fuzz tests for all contracts.
    *   **Why**: To ensure correctness, security, and reliability.
    *   **Acceptance Criteria**: 100% line and branch coverage. Fuzz tests cover deposits, withdrawals, and reward calculations with varied inputs. All state transitions are tested.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 16 hours
    *   **Dependencies**: All contracts implemented.
    *   **Command**: `cd contracts && forge test`

---

## 3) Strategy/Yield Plumbing

**Definition of Done**: A mock yield strategy is integrated, allowing the demo to run reliably. The system is ready for a real yield source to be plugged in later.

### Milestone Tasks

*   **[ ] Task: Define `IYieldStrategy.sol` Interface**
    *   **What**: Create a standard interface for yield-generating strategies.
    *   **Why**: Makes the yield source pluggable (e.g., swap a mock strategy for a real lending pool adapter).
    *   **Acceptance Criteria**: Interface includes `deposit`, `withdraw`, and `getAPR` functions.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 2 hours
    *   **Dependencies**: None

*   **[ ] Task: Implement `MockYieldStrategy.sol`**
    *   **What**: A mock strategy that implements `IYieldStrategy` but just holds funds and returns a fixed, predictable APR.
    *   **Why**: Ensures the hackathon demo is 100% reliable and not dependent on external protocols or market conditions.
    *   **Acceptance Criteria**: The mock contract can receive and send funds. `getAPR` returns a hardcoded value.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 3 hours
    *   **Dependencies**: `IYieldStrategy.sol`

---

## 4) Off-Chain Services

**Definition of Done**: Webhook and scheduler services are running, connected to a queue, and can trigger on-chain transactions and LINE messages.

### Milestone Tasks

*   **[ ] Task: Build LINE Webhook Receiver**
    *   **What**: An Express.js service to receive and verify webhooks from the LINE Messaging API.
    *   **Why**: To process user interactions that happen inside LINE chats (e.g., joining a mission via a message).
    *   **Acceptance Criteria**: Service correctly verifies LINE signatures. It can handle `follow`, `join`, and `message` events and place corresponding jobs in a queue.
    *   **Owner/Role**: Backend Dev
    *   **Est. Time**: 8 hours
    *   **Dependencies**: Monorepo setup.

*   **[ ] Task: Build Scheduler Service**
    *   **What**: A cron job service to handle time-based events.
    *   **Why**: To send deposit reminders, close cadence windows, and trigger mission settlement.
    *   **Acceptance Criteria**: Cron jobs run at the correct intervals. They can read on-chain data (e.g., mission end times) and queue jobs (e.g., `settleMission`).
    *   **Owner/Role**: Backend Dev
    *   **Est. Time**: 8 hours
    *   **Dependencies**: Smart contracts deployed to testnet.

*   **[ ] Task: Integrate a Job Queue**
    *   **What**: Use a lightweight queue (e.g., BullMQ with Redis) to manage tasks between the webhook/scheduler and a transaction processor.
    *   **Why**: Makes the system resilient to failures and separates concerns.
    *   **Acceptance Criteria**: Webhook and scheduler can add jobs. A worker process can consume jobs and execute them (e.g., send a LINE message, call a smart contract).
    *   **Owner/Role**: Backend Dev
    *   **Est. Time**: 6 hours
    *   **Dependencies**: Webhook and Scheduler services.

---

## 5) LINE Mini-Dapp (Frontend)

**Definition of Done**: A user can perform the full lifecycle within the LINE app: log in, bind wallet, create a mission, join a squad, deposit, and see their progress.

### Milestone Tasks

*   **[ ] Task: Set up LIFF and LINE Login**
    *   **What**: Initialize the LIFF SDK in a Next.js app and implement the LINE login flow.
    *   **Why**: This is the entry point for any user of the Mini-dApp.
    *   **Acceptance Criteria**: Users can click a link and open the Mini-dApp inside LINE. The app can retrieve their LINE user profile.
    *   **Owner/Role**: Frontend Dev
    *   **Est. Time**: 6 hours
    *   **Dependencies**: LINE channel created.

*   **[ ] Task: Implement Wallet Binding Flow**
    *   **What**: Create the UI for connecting a Kaia wallet (e.g., via WalletConnect) and binding it to the user's LineID.
    *   **Why**: Links the user's social identity to their on-chain address.
    *   **Acceptance Criteria**:
        1. User logs in with LINE.
        2. App prompts to connect a wallet.
        3. User signs a message containing their `lineId`.
        4. The signed payload is sent to the backend, which calls the `IdentityBinder` contract.
        5. The UI reflects the bound address.
    *   **Owner/Role**: Frontend Dev / Backend Dev
    *   **Est. Time**: 8 hours
    *   **Dependencies**: LIFF Login, `IdentityBinder` contract.

*   **[ ] Task: Build Core Mission Screens**
    *   **What**: Develop the React components and screens for the dApp.
    *   **Why**: This is the main user interface for interacting with the protocol.
    *   **Acceptance Criteria**: The following screens are functional:
        *   **Home**: A feed of active and joinable missions.
        *   **Mission Detail**: Shows progress, streak, squad members, and deposit/withdraw buttons.
        *   **Create Mission**: A form to configure and launch a new mission.
    *   **Owner/Role**: Frontend Dev
    *   **Est. Time**: 16 hours
    *   **Dependencies**: Wallet Binding Flow, Contracts deployed to testnet.

---

## 7) Data & Analytics (Dune)

**Definition of Done**: A public Dune dashboard is live, visualizing the core KPIs of the protocol. A fallback data pipeline is functional.

### Milestone Tasks

*   **[ ] Task: Finalize All Contract Events**
    *   **What**: Review all contracts and ensure they emit rich, indexed events for every important state change.
    *   **Why**: Events are the raw data source for all off-chain analytics.
    *   **Acceptance Criteria**: A document is created listing every event and its fields.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 2 hours
    *   **Dependencies**: All contracts implemented.

*   **[ ] Task: Build Dune Dashboard (Direct Integration Plan)**
    *   **What**: If Dune Analytics supports the Kaia network directly, build queries and visualizations.
    *   **Why**: Provides a live, transparent view of protocol activity.
    *   **Acceptance Criteria**: A dashboard with at least 5 charts (TVL, Active Users, etc.) is created and public.
    *   **Owner/Role**: Data Analyst / Tech Lead
    *   **Est. Time**: 8 hours
    *   **Dependencies**: Contracts deployed to mainnet/testnet.

*   **[ ] Task: Implement Dune CSV Upload Fallback**
    *   **What**: Create a script that fetches events from a Kaia node, decodes them, and formats them as CSV files.
    *   **Why**: A fallback plan if direct Dune integration with Kaia is not available.
    *   **Acceptance Criteria**: An `npm run export:csv` script generates `deposits.csv`, `missions.csv`, etc. Instructions for uploading to Dune are documented.
    *   **Owner/Role**: Backend Dev / Data Analyst
    *   **Est. Time**: 10 hours
    *   **Dependencies**: Finalized contract events.

---

## 8) Security & Compliance

**Definition of Done**: A thorough security review is complete. All identified risks are mitigated, and the system is robust against common attacks.

### Milestone Tasks

*   **[ ] Task: Conduct Threat Modeling**
    *   **What**: Brainstorm potential attack vectors based on the checklist.
    *   **Why**: To proactively identify and mitigate security risks.
    *   **Acceptance Criteria**: A document is created listing threats (e.g., reentrancy on reward claims, admin key compromise, timestamp manipulation) and their mitigations.
    *   **Owner/Role**: Tech Lead / Smart Contract Dev
    *   **Est. Time**: 4 hours
    *   **Dependencies**: All contracts implemented.

*   **[ ] Task: Implement Security Best Practices**
    *   **What**: Implement `Pausable`, `ReentrancyGuard`, and `AccessControl` where appropriate. Use pull-over-push for withdrawals. Add a timelock for critical admin functions.
    *   **Why**: To build a defense-in-depth security posture.
    *   **Acceptance Criteria**: Security patterns are correctly implemented and tested. An emergency-withdraw function exists.
    *   **Owner/Role**: Smart Contract Dev
    *   **Est. Time**: 8 hours
    *   **Dependencies**: All contracts implemented.

---

## 9) Testing Plan

**Definition of Done**: The project is tested end-to-end, from a user action in LINE to a state change on-chain and a corresponding update in the UI.

### Milestone Tasks

*   **[ ] Task: Create Demo Seed Script**
    *   **What**: A script to populate the testnet with realistic demo data.
    *   **Why**: Makes manual testing and video demos much easier and more compelling.
    *   **Acceptance Criteria**: `make demo-data` script creates 5-10 missions, adds a few users, and simulates some deposits and a completed mission.
    *   **Owner/Role**: Backend Dev
    *   **Est. Time**: 6 hours
    *   **Dependencies**: Contracts deployed to testnet.

*   **[ ] Task: Conduct End-to-End User Testing**
    *   **What**: Manually run through the 5 scripted scenarios inside the LINE app on a test device.
    *   **Why**: To catch bugs in the user experience and integration points that automated tests might miss.
    *   **Acceptance Criteria**: All 5 scenarios can be completed without errors. A screen recording is made of a successful run-through.
    *   **Owner/Role**: Product Lead / Whole Team
    *   **Est. Time**: 4 hours
    *   **Dependencies**: Mini-dApp deployed, Demo seed script run.

---

## 10) Deployment

**Definition of Done**: The project is deployed to the Kaia testnet and ready for mainnet. Deployment is repeatable and verified.

### Milestone Tasks

*   **[ ] Task: Deploy and Verify on Testnet**
    *   **What**: Deploy all contracts to the Kaia testnet and verify them on the block explorer.
    *   **Why**: To make the contracts publicly readable and auditable, and to prepare for frontend integration.
    *   **Acceptance Criteria**: `make deploy:testnet` works. All contracts are verified on the Kaia block explorer. Deployed addresses are saved to a config file.
    *   **Owner/Role**: Tech Lead / Smart Contract Dev
    *   **Est. Time**: 3 hours
    *   **Dependencies**: Contract tests passing.

---


## 13) Timeline (7-10 Day Sprint Example)

*   **Day 1-2**:
    *   `[X]` Setup monorepo, tooling, and CI/CD.
    *   `[ ]` Implement `IdentityBinder` and `MissionFactory` contracts and tests.
    *   `[ ]` Scaffold LIFF app and implement LINE login.
*   **Day 3-4**:
    *   `[ ]` Implement `MissionPool` contract and tests.
    *   `[ ]` Implement wallet binding flow (UI + backend).
    *   `[ ]` Build core mission screens (view and create).
*   **Day 5**:
    *   `[ ]` Implement `RewardDistributor` and yield strategy contracts.
    *   `[ ]` Build webhook and scheduler services.
    *   `[ ]` Finalize all contract events for analytics.
*   **Day 6**:
    *   `[ ]` Build Dune dashboard (or CSV export pipeline).
    *   `[ ]` Deploy all contracts to testnet and verify.
*   **Day 7**:
    *   `[ ]` Security hardening and code review.
    *   `[ ]` Create demo seed script.
    *   `[ ]` End-to-end testing and bug fixing.
*   **Buffer (2-3 days)**:
    *   `[ ]` Create pitch deck and record demo video.
    *   `[ ]` Polish UI/UX.
    *   `[ ]` Final submission packaging.

---

## 14) Risk Register & Mitigations

*   **Risk**: Dune does not have (or has unreliable) Kaia chain support.
    *   **Mitigation**: Use the **Dune Uploads (CSV)** fallback plan. The `export:csv` script will be built in parallel.
*   **Risk**: Wallet connection inside LINE's webview is buggy or inconsistent across devices.
    *   **Mitigation**: Provide clear instructions and a "Copy Link" button that allows the user to open the dApp in an external mobile browser (like Chrome or Safari) where WalletConnect is more stable.
*   **Risk**: The chosen underlying yield strategy is unreliable or has oracle risk.
    *   **Mitigation**: For the hackathon, use the `MockYieldStrategy` by default. This guarantees a smooth demo. The real strategy can be integrated post-submission.

---

## 15) Stretch Goals (If Time Permits)

*   **[ ] Squad-vs-Squad Seasons**: Implement a meta-game where squads compete on a leaderboard for a weekly prize pool.
*   **[ ] DID Badges**: Issue soulbound NFTs (ERC-721) as non-transferable badges for achievements like "30-Day Streak" or "Super Saver".
*   **[ ] AI Savings Coach**: Use a simple LLM to send personalized nudges, encouragement, and goal-setting advice to users via LINE messages.

---

https://docs.dappportal.io/lines-mini-dapp-and-dapp-portal/how-to-build-successful-mini-dapp
https://minidapp-demo.dappportal.io/method#account
https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/how-to-get-sdk-authorization
https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/initiate-dappportalsdk
https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/wallet
https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment
https://docs.dappportal.io/mini-dapp/mini-dapp-sdk/payment/settlement