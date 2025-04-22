# Orodex Trading Engine Web Client

A Next.js frontend interface for the Trading Engine system, providing visualization of order books, trade history, and interactive placement of orders.

## Overview

This web client interfaces with the Trading Engine backend to provide a real-time trading experience. It allows users to:

- View the current state of the order book (bids and asks)
- See executed trades
- Place new orders
- Process the sample orders.json file

## Technology Stack

- **Framework:** Next.js
- **Language:** TypeScript
- **Styling:** Tailwind CSS

## Features

- **Dual-view interface** - Toggle between Order Book and Trade History
- **Real-time statistics** - Shows market data such as high, low, and volume
- **Interactive ordering** - Form for placing buy and sell orders
- **Order processing** - Process orders.json through the backend

## Project Structure

```
src/
├── app/                     # Next.js app directory
│   ├── page.tsx             # Landing page
│   ├── trade/               # Trading interface
│   │   └── page.tsx         # Main trading page
│   └── layout.tsx           # Root layout
├── components/              # Reusable components
│   └── side/                # Common UI components
│       ├── Toast.tsx        # Notification component
│       └── ConfirmationModal.tsx  # Confirmation dialogs
├── types/                   # TypeScript types
│   └── type.ts              # Shared types with backend
└── ...
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Trading Engine backend running on http://localhost:3001

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/trading-engine.git
   cd trading-engine/frontend
   ```

2. Install dependencies

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Connecting to the Backend

The web client expects the Trading Engine backend to be running on `http://localhost:3001`. Make sure the backend server is running before using the trading features.

## Usage

1. Visit the landing page to learn about the trading engine
2. Click "Start Trading Engine" to process the orders.json file
3. View the order book and executed trades
4. Place new orders using the order form
5. Toggle between Order Book and Trade History views

## API Integration

The web client interacts with the following backend API endpoints:

- `GET /api/orderbook` - Fetches the current order book
- `GET /api/trades` - Retrieves trade history
- `POST /api/orders` - Submits a new order
- `POST /api/process-file` - Processes the orders.json file

## Acknowledgements

- This project was built as part of a trading engine implementation challenge
- Design inspired by modern cryptocurrency exchanges

---

**Note:** This is a demo application and does not involve real assets or financial transactions. All trades and orders are simulated.
