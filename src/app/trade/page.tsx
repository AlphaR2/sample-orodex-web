"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ConfirmationModal, Toast } from "../../components/side";
import {
  OperationType,
  OrderBook,
  OrderSide,
  Trade,
} from "../../../types/type";

// icons
import {
  IoMdCheckmarkCircleOutline,
  IoMdInformationCircleOutline,
  IoMdArrowForward,
  IoMdBonfire,
} from "react-icons/io";

const API_URL = "http://localhost:3001/api";

const TradePage = () => {
  // State for the multi-stage UI flow
  const [stage, setStage] = useState<"explanation" | "trading">("explanation");
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error";
  }>({
    show: false,
    message: "",
    type: "success",
  });
  const [activeView, setActiveView] = useState<"orderbook" | "trades">(
    "orderbook"
  );

  // Trading state
  const [orderBook, setOrderBook] = useState<OrderBook>({ bids: [], asks: [] });
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Form state
  const [newOrder, setNewOrder] = useState({
    type_op: OperationType.CREATE,
    account_id: "",
    amount: "",
    order_id: Date.now().toString(),
    pair: "BTC/USDC",
    limit_price: "",
    side: OrderSide.BUY,
  });

  // Stats
  const [pairStats, setPairStats] = useState({
    price: 0,
    change: 0,
    high: 0,
    low: 0,
    volumeBTC: 0,
    volumeUSDC: 0,
  });

  // Fetch data from the backend
  const fetchData = async () => {
    setLoading(true);

    try {
      const [orderBookRes, tradesRes] = await Promise.all([
        fetch(`${API_URL}/orderbook`),
        fetch(`${API_URL}/trades`),
      ]);

      if (!orderBookRes.ok || !tradesRes.ok) {
        throw new Error("Failed to fetch data");
      }

      const orderBookData = await orderBookRes.json();
      const tradesData = await tradesRes.json();

      setOrderBook(orderBookData);
      setTrades(tradesData.trades || []);

      // Calculate stats from the fetched data
      if (tradesData.trades && tradesData.trades.length > 0) {
        const tradesList = tradesData.trades;
        const prices = tradesList.map((trade: Trade) => trade.price);
        const volumes = tradesList.map(
          (trade: Trade) => trade.amount * trade.price
        );
        const totalVolumeBTC = tradesList.reduce(
          (sum: number, trade: Trade) => sum + trade.amount,
          0
        );
        const totalVolumeUSDC = volumes.reduce(
          (sum: number, vol: number) => sum + vol,
          0
        );

        setPairStats({
          price: prices[0] || 0,
          change: 0.2, //just a placeholder
          high: Math.max(...prices),
          low: Math.min(...prices),
          volumeBTC: totalVolumeBTC,
          volumeUSDC: totalVolumeUSDC,
        });
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setToast({
        show: true,
        message: "Failed to fetch data from the server",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const processOrders = async () => {
    setLoading(true);

    try {
      // Send request to process the orders file
      const response = await fetch(`${API_URL}/process-orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to process orders");
      }

      const result = await response.json();

      if (result.success) {
        // Set the stage to trading and show success toast
        setStage("trading");
        setToast({
          show: true,
          message: "Order processing complete! Trading engine is ready.",
          type: "success",
        });

        // Fetch the updated order book and trades
        await fetchData();
      } else {
        throw new Error(result.error || "Unknown error");
      }
    } catch (error) {
      console.error("Error processing orders:", error);
      setToast({
        show: true,
        message:
          error instanceof Error
            ? error.message
            : "Failed to connect to the server. Is it running?",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStartTrading = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmStart = () => {
    setShowConfirmModal(false);
    processOrders();
  };

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      // Create a complete order object
      const orderToSubmit = {
        ...newOrder,
        order_id: Date.now().toString(),
      };

      // Send the order to the backend
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderToSubmit),
      });

      if (!response.ok) {
        throw new Error("Failed to submit order");
      }

      const result = await response.json();

      if (result.success) {
        // Show success toast
        setToast({
          show: true,
          message: "Order submitted successfully!",
          type: "success",
        });

        // Update the order book and trades
        if (result.orderBook) setOrderBook(result.orderBook);
        if (result.trades) setTrades((prev) => [...prev, ...result.trades]);

        // Reset form
        setNewOrder({
          ...newOrder,
          account_id: "",
          amount: "",
          order_id: Date.now().toString(),
          limit_price: "",
        });
      } else {
        throw new Error(result.error || "Order submission failed");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      setToast({
        show: true,
        message:
          error instanceof Error ? error.message : "Failed to submit order",
        type: "error",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewOrder({
      ...newOrder,
      [name]: value,
    });
  };

  const closeToast = () => {
    setToast({ ...toast, show: false });
  };

  // Fetch data when we first enter trading stage
  useEffect(() => {
    if (stage === "trading") {
      fetchData();
    }
  }, [stage]);

  // Explanation Screen
  if (stage === "explanation") {
    return (
      <div className="min-h-screen bg-black text-gray-300 flex flex-col">
        {/* Navigation */}
        <header className="border-b border-gray-800 px-6 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">
              Trading Engine Demo
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </header>

        {/* Explanation Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-4xl mx-auto bg-[#060e16] border border-gray-800 rounded-lg shadow-xl p-8">
            <h2 className="text-3xl font-bold text-white mb-6">
              How the Trading Engine Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
              <div>
                <h3 className="text-xl font-semibold text-[#fb8500] mb-4">
                  Order Matching
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex  items-center">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Orders are matched based on price-time priority
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Buy orders match with the lowest-priced sell orders
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Sell orders match with the highest-priced buy orders
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Matches occur when buy price ≥ sell price
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-[#fb8500] mb-4">
                  Order Processing
                </h3>
                <ul className="space-y-3 text-gray-300">
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Orders are processed sequentially from the file
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Partial fills are supported when order sizes differ
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Order cancellations are handled with DELETE operations
                  </li>
                  <li className="flex items-start">
                    <IoMdCheckmarkCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Final order book and trades are saved to output files
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-[#060e16] border border-[#7e4300] p-4 rounded-lg mb-8">
              <h3 className="text-lg font-semibold text-[#fb8500] mb-2">
                What This Demo Will Show
              </h3>
              <p className="text-gray-300">
                This demo will process a sample set of orders from{" "}
                <code className="bg-gray-800 px-1 rounded">orders.json</code>,
                match them according to the trading rules, and visualize both
                the resulting order book and the executed trades. You can also
                place additional orders and see how they would interact with the
                current state of the order book.
              </p>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartTrading}
                disabled={loading}
                className="px-8 py-4 bg-[#fb8500] hover:bg-[#7e4300] text-white text-lg font-bold rounded-lg transition-colors flex items-center"
              >
                {loading ? (
                  <>
                    <IoMdBonfire className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    Processing...
                  </>
                ) : (
                  <>Start Trading Engine</>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmModal}
          onClose={() => setShowConfirmModal(false)}
          onConfirm={handleConfirmStart}
        />

        {/* Toast Notification */}
        {toast.show && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </div>
    );
  }
  // Trading Screen
  return (
    <div className="min-h-screen bg-[#060e16] text-gray-300 flex flex-col">
      {/* Navigation */}
      <header className="border-b border-gray-800 px-6 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-bold text-white">Trading Engine</h1>
            <div className="flex items-center space-x-2">
              <span className="text-white font-medium">BTC/USDC</span>
              <span className="text-white font-medium">
                ${pairStats.price.toFixed(2)}
              </span>
              <span
                className={`ml-1 ${
                  pairStats.change >= 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {pairStats.change >= 0 ? "+" : ""}
                {pairStats.change}%
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={fetchData}
              className="px-4 py-2 text-sm bg-[#fb860069] hover:bg-[#7e4300] text-white rounded transition-colors"
            >
              Refresh Data
            </button>
            <Link
              href="/"
              className="px-4 py-2 text-sm bg-gray-800 hover:bg-gray-700 text-white rounded transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Stats Bar */}
      <div className="border-b border-gray-800 px-6 py-2 bg-[#060e16]">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-5 gap-4">
          <div>
            <span className="text-gray-500 text-sm">24h High</span>
            <div className="font-medium">${pairStats.high.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">24h Low</span>
            <div className="font-medium">${pairStats.low.toFixed(2)}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">24h Volume (BTC)</span>
            <div className="font-medium">{pairStats.volumeBTC.toFixed(5)}</div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">24h Volume (USDC)</span>
            <div className="font-medium">
              ${pairStats.volumeUSDC.toFixed(2)}
            </div>
          </div>
          <div>
            <span className="text-gray-500 text-sm">Trades</span>
            <div className="font-medium">{trades.length}</div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#fb8500] mb-4"></div>
            <p className="text-gray-400">Loading data...</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 max-w-7xl mx-auto w-full px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Panel - Order Book/Trades Toggle */}
            <div className="lg:col-span-2">
              <div className="bg-[#060e16] rounded-lg border border-gray-800 shadow-lg overflow-hidden">
                {/* Toggle Header */}
                <div className="flex border-b border-gray-800">
                  <button
                    className={`px-6 py-3 font-medium ${
                      activeView === "orderbook"
                        ? "bg-[#0c1b29] text-white"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveView("orderbook")}
                  >
                    Order Book
                  </button>
                  <button
                    className={`px-6 py-3 font-medium ${
                      activeView === "trades"
                        ? "bg-[#0c1b29] text-white"
                        : "text-gray-400 hover:text-gray-300"
                    }`}
                    onClick={() => setActiveView("trades")}
                  >
                    Trade History
                  </button>
                </div>

                {/* Order Book View */}
                {activeView === "orderbook" && (
                  <div className="overflow-hidden">
                    <div className="px-4 py-2 bg-[#0c1b29] text-gray-400 text-xs grid grid-cols-3">
                      <div>Price (USDC)</div>
                      <div className="text-center">Size (BTC)</div>
                      <div className="text-right">Total (USDC)</div>
                    </div>

                    {/* Asks (sell orders) */}

                    {/* here we want to only show the price levels for the orderbook, meaning instead of individual trades, we put them with the price levels*/}
                    <div className="max-h-[300px] overflow-y-auto">
                      {orderBook.asks && orderBook.asks.length > 0 ? (
                        orderBook.asks
                          .map((level) => {
                            const totalAmount = level.orders.reduce(
                              (sum, order) => sum + order.amount,
                              0
                            );
                            return (
                              <div
                                key={level.price}
                                className="px-4 py-1.5 border-b border-gray-800/30 grid grid-cols-3 text-sm"
                              >
                                <div className="text-red-500">
                                  {level.price.toFixed(2)}
                                </div>
                                <div className="text-center">
                                  {totalAmount.toFixed(5)}
                                </div>
                                <div className="text-right">
                                  {(level.price * totalAmount).toFixed(2)}
                                </div>
                              </div>
                            );
                          })
                          .reverse()
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No sell orders
                        </div>
                      )}
                    </div>

                    {/* Current price indicator */}
                    <div className="px-4 py-2 bg-[#0a1622] text-white border-y border-gray-700">
                      <div className="grid grid-cols-3 text-sm">
                        <div className="font-semibold">
                          ${pairStats.price.toFixed(2)}
                        </div>
                        <div className="text-center text-gray-400 flex items-center justify-center">
                          {orderBook.asks &&
                          orderBook.asks[0] &&
                          orderBook.bids &&
                          orderBook.bids[0] ? (
                            <>
                              Spread: $
                              {(
                                orderBook.asks[0].price -
                                orderBook.bids[0].price
                              ).toFixed(2)}
                              (
                              {(
                                ((orderBook.asks[0].price -
                                  orderBook.bids[0].price) /
                                  orderBook.bids[0].price) *
                                100
                              ).toFixed(2)}
                              %)
                              <div className="relative group ml-1">
                                <IoMdInformationCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block w-64 p-2 bg-[#0c1b29] text-xs text-gray-300 rounded shadow-lg border border-gray-700 z-10">
                                  <p className="font-medium text-white mb-1">
                                    What is Spread?
                                  </p>
                                  <p className="mb-1 font-bold">
                                    The spread is the difference between the
                                    lowest asking price (sell order) and the
                                    highest bid price (buy order).
                                  </p>

                                  <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-[#0c1b29] border-r border-b border-gray-700"></div>
                                </div>
                              </div>
                            </>
                          ) : (
                            "No spread data"
                          )}
                        </div>
                        <div className="text-right text-gray-400"></div>
                      </div>
                    </div>

                    {/* Bids (buy orders) */}
                    <div className="max-h-[300px] overflow-y-auto">
                      {orderBook.bids && orderBook.bids.length > 0 ? (
                        orderBook.bids.map((level) => {
                          const totalAmount = level.orders.reduce(
                            (sum, order) => sum + order.amount,
                            0
                          );
                          return (
                            <div
                              key={level.price}
                              className="px-4 py-1.5 border-b border-gray-800/30 grid grid-cols-3 text-sm"
                            >
                              <div className="text-green-500">
                                {level.price.toFixed(2)}
                              </div>
                              <div className="text-center">
                                {totalAmount.toFixed(5)}
                              </div>
                              <div className="text-right">
                                {(level.price * totalAmount).toFixed(2)}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No buy orders
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Trade History View */}
                {activeView === "trades" && (
                  <div className="overflow-hidden">
                    <div className="px-4 py-2 bg-[#0c1b29] text-gray-400 text-xs grid grid-cols-5">
                      <div>Trade ID</div>
                      <div>Price (USDC)</div>
                      <div className="text-center">Amount (BTC)</div>
                      <div className="text-center">Type</div>
                      <div className="text-right">Buy/Sell Orders</div>
                    </div>

                    <div className="max-h-[600px] overflow-y-auto">
                      {trades && trades.length > 0 ? (
                        trades.map((trade) => (
                          <div
                            key={trade.tradeId}
                            className="px-4 py-1.5 border-b border-gray-800/30 grid grid-cols-5 text-sm"
                          >
                            <div className="text-gray-400">
                              #{trade.tradeId}
                            </div>
                            <div
                              className={`${
                                trade.buyerAccountId === "1"
                                  ? "text-green-500"
                                  : "text-red-500"
                              }`}
                            >
                              {trade.price.toFixed(2)}
                            </div>
                            <div className="text-center">
                              {trade.amount.toFixed(5)}
                            </div>
                            <div className="text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs ${
                                  trade.buyerAccountId === "1"
                                    ? "bg-green-500/20 text-green-400"
                                    : "bg-red-500/20 text-red-400"
                                }`}
                              >
                                {trade.buyerAccountId === "1" ? "Buy" : "Sell"}
                              </span>
                            </div>
                            <div className="text-right text-gray-500">
                              {trade.buyOrderId}/{trade.sellOrderId}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-center text-gray-500">
                          No trades executed yet
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <div className="max-w-7xl  w-full px-4 mt-6 mb-10">
                <div className="bg-[#0a1622] border border-gray-800 rounded-lg shadow-lg p-5">
                  <div className="flex items-center mb-3">
                    <IoMdInformationCircleOutline className="w-5 h-5 text-[#7e4300] mr-2 mt-0.5" />
                    <h2 className="text-lg font-bold text-white">
                      Disclaimer & Usage Guidelines
                    </h2>
                  </div>
                  <div className="text-sm text-gray-400 mb-4">
                    This is an assignment demo trading platform that simulates
                    market matching with no real liquidity. All transactions are
                    simulated and no actual assets are exchanged.
                  </div>

                  <h3 className="text-sm font-semibold text-white mb-2">
                    Key Information:
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 mb-3 ml-2">
                    <li>
                      The engine processes orders from a pre-defined JSON file
                      using price-time priority rules
                    </li>
                    <li>
                      You can add custom trades that will be processed against
                      the current order book
                    </li>
                    <li>
                      New trades are shown in the UI but not saved to the output
                      JSON files
                    </li>
                    <li>
                      All prices and volumes are simulated and have no relation
                      to real markets
                    </li>
                  </ol>

                  <h3 className="text-sm font-semibold text-white mb-2">
                    Usage Instructions:
                  </h3>
                  <ol className="list-decimal list-inside text-sm text-gray-400 space-y-1 ml-2">
                    <li>
                      Review the order book to see current buy/sell orders
                    </li>
                    <li>View trade history to see matched transactions</li>
                    <li>Place test orders using the order form</li>
                    <li>
                      Observe how your orders interact with existing market
                      orders
                    </li>
                  </ol>
                </div>
              </div>
            </div>

            {/* Right Panel - Order Form */}
            <div className="bg-[#0a1622] rounded-lg border border-gray-800 shadow-lg overflow-hidden p-6">
              <h2 className="text-xl font-bold text-white mb-6">Place Order</h2>

              <form onSubmit={handleSubmitOrder}>
                <div className="mb-6">
                  <div className="flex mb-3">
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-l ${
                        newOrder.side === "BUY"
                          ? "bg-green-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      } font-medium`}
                      onClick={() =>
                        setNewOrder({ ...newOrder, side: OrderSide.BUY })
                      }
                    >
                      Buy BTC
                    </button>
                    <button
                      type="button"
                      className={`flex-1 py-3 px-4 rounded-r ${
                        newOrder.side === "SELL"
                          ? "bg-red-600 text-white"
                          : "bg-gray-800 text-gray-400"
                      } font-medium`}
                      onClick={() =>
                        setNewOrder({ ...newOrder, side: OrderSide.SELL })
                      }
                    >
                      Sell BTC
                    </button>
                  </div>
                  <div className="mb-5">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Account ID
                    </label>
                    <input
                      type="text"
                      name="account_id"
                      value={newOrder.account_id}
                      onChange={handleInputChange}
                      placeholder="Enter your account ID"
                      className="w-full p-3 rounded bg-[#081320] border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                      required
                    />
                  </div>

                  <div className="mb-5">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Limit Price (USDC)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="limit_price"
                        value={newOrder.limit_price}
                        onChange={handleInputChange}
                        placeholder="0.00"
                        className="w-full p-3 rounded bg-[#081320] border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                        required
                      />
                      <div className="absolute right-3 top-3 text-gray-500">
                        USDC
                      </div>
                    </div>
                  </div>

                  <div className="mb-6">
                    <label className="block text-gray-300 mb-2 text-sm font-medium">
                      Amount (BTC)
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="amount"
                        value={newOrder.amount}
                        onChange={handleInputChange}
                        placeholder="0.00000"
                        className="w-full p-3 rounded bg-[#081320] border border-gray-700 focus:border-blue-500 focus:outline-none text-white"
                        required
                      />
                      <div className="absolute right-3 top-3 text-gray-500">
                        BTC
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-400">Total</span>
                      <span className="text-white font-medium">
                        {newOrder.amount && newOrder.limit_price
                          ? `$${(
                              parseFloat(newOrder.amount || "0") *
                              parseFloat(newOrder.limit_price || "0")
                            ).toFixed(2)}`
                          : "$0.00"}{" "}
                        USDC
                      </span>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full py-4 rounded font-bold text-white text-lg ${
                      newOrder.side === "BUY"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-red-600 hover:bg-red-700"
                    } transition-colors shadow-lg`}
                  >
                    {newOrder.side === "BUY" ? "Buy BTC" : "Sell BTC"}
                  </button>
                </div>
              </form>

              {/* Order Tips */}
              <div className="mt-6 p-3 bg-[#081320] rounded-lg border border-gray-800">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">
                  Trading Tips
                </h3>
                <ul className="text-xs text-gray-400 space-y-1">
                  <li>
                    • Limit orders execute at your specified price or better
                  </li>
                  <li>• Orders are matched based on price-time priority</li>
                  <li>
                    • Partial fills will occur when your order size exceeds
                    available liquidity
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}
    </div>
  );
};

export default TradePage;
