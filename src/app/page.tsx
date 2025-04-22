import Link from "next/link";
import React from "react";

const Home = () => {

  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 text-center">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 font-[family-name:var(--font-playfair-display)]">
          Trading Engine
        </h1>

        <p className="text-xl mb-12 text-gray-400 max-w-2xl mx-auto">
          A high-performance order matching system that processes buy and sell
          orders with price-time priority.
        </p>

        <div className="mb-16 space-y-6">
          <div className="flex flex-col md:flex-row gap-6 justify-center">
            <div className="bg-[#0a1622] p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3">Order Book</h3>
              <p className="text-gray-400 mb-4">
                View the current state of buy and sell orders
              </p>
            </div>

            <div className="bg-[#0a1622] p-6 rounded-lg border border-gray-800">
              <h3 className="text-xl font-semibold mb-3">Executed Trades</h3>
              <p className="text-gray-400 mb-4">
                See all matched trades from order processing
              </p>
            </div>
          </div>
        </div>

        <Link
          href="/trade"
          className="px-8 py-4 bg-[#fb8500] hover:bg-[#7e4300] text-white font-medium rounded-lg text-lg transition-colors"
        >
          Enter Trading Platform
        </Link>
      </main>

      <div className="mt-16 text-gray-500">
        <p>Processes orders using price-time priority matching algorithm</p>
      </div>
    </div>
  );
};

export default Home;
