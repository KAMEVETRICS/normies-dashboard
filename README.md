# Normies Analytics Dashboard

A comprehensive, real-time analytics and tracking dashboard for the [Normies](https://normies.art) NFT collection on Ethereum. Built to provide deep insights into rarity, holder distributions, canvas activity, and deflationary burn mechanics.

## 🌟 Key Features

* **Live OpenRarity Tracking**: Fully synchronized with the OpenRarity standard via the OpenSea API. Individual Normie pages fetch rarity instantly, while collection-wide data is synced hourly.
* **Canvas Activity Metrics**: Real-time integration with the official Normies API to track customized attributes, Level progressions, Action Points, and version histories.
* **Trait Explorer**: Interactive filtering to visualize the distribution of all 12 metadata traits across the 10,000 supply.
* **Deflationary Burns Analytics**: Visual timeline and trait distribution charts of burned tokens, tracking the active reduction in supply.
* **Holder Portfolios**: Deep-dive analytics into individual wallets, calculating portfolio values, average rarity ranks, and customized participation rates.
* **Automated Data Pipelines**: GitHub Actions workflow that incrementally syncs the latest on-chain data and metadata changes every hour without manual intervention.

## 🛠 Tech Stack

* **Framework**: Next.js 16 (App Router, Server Components)
* **Styling**: Tailwind CSS (Custom minimalist monochrome design system)
* **Charts & Data Viz**: Recharts
* **Data Sources**: OpenSea API, Normies Official API, Dune Analytics
* **Automation**: GitHub Actions

## 🚀 Getting Started

### Prerequisites

You will need Node.js (v20+) and an OpenSea API Key.

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/KAMEVETRICS/normies-dashboard.git
   cd normies-dashboard
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment variables:
   Create a `.env.local` file in the root directory and add your API key:
   ```env
   OPENSEA_API_KEY=your_opensea_api_key_here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) with your browser to see the dashboard.

## 🔄 Automated Data Sync

The dashboard relies on local static JSON files for high-performance bulk analytics (like the global Trait Explorer). These files are updated automatically:
- A GitHub Action runs `npm run update-data` at the top of every hour.
- It fetches new Burns, updates modified Traits from the Canvas, and incrementally pulls shifted OpenRarity ranks.
- Changes are automatically committed back to the repository.

To run the data sync manually:
```bash
npm run update-data
```

## 📄 License

This project is open-source and available under the MIT License.
