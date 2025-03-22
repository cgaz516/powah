import { NextResponse } from 'next/server';
import { getContract } from '~~/utils/scaffold-eth/contract';

export async function GET() {
  try {
    const contract = getContract({
      contractName: 'YourContractName'
    });

    if (!contract) {
      throw new Error('Contract not found');
    }

    // Get the market price
    const marketPrice = await contract.read.getMarketPrice();
    const formattedPrice = Number(marketPrice) / 10**18;
    
    // Get additional price-related data (if available on your contract)
    // Adjust these function calls to match your contract's actual functions
    const timestamp = await contract.read.getLastPriceUpdateTimestamp?.() || Math.floor(Date.now() / 1000);
    const priceChangePercent = await contract.read.get24HourPriceChangePercent?.() || null;
    const dailyVolume = await contract.read.getDailyVolume?.() || null;
    const highPrice = await contract.read.getDailyHighPrice?.() || null;
    const lowPrice = await contract.read.getDailyLowPrice?.() || null;
    
    // Get the current block number for reference
    const blockNumber = await contract.client.getBlockNumber();

    return NextResponse.json({
      success: true,
      data: {
        price: formattedPrice,
        currency: "kWh", // Update with your actual unit
        timestamp: timestamp, // Unix timestamp of when price was last updated
        blockNumber: blockNumber.toString(),
        priceMetrics: {
          change24h: priceChangePercent !== null ? Number(priceChangePercent) / 100 : null, // Assuming stored as percentage * 100
          dailyVolume: dailyVolume !== null ? Number(dailyVolume) / 10**18 : null,
          dailyHigh: highPrice !== null ? Number(highPrice) / 10**18 : null,
          dailyLow: lowPrice !== null ? Number(lowPrice) / 10**18 : null
        },
        meta: {
          contractAddress: contract.address,
          networkId: contract.client.chain.id
        }
      },
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to fetch market price:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market price from blockchain'
      },
      { status: 500 }
    );
  }
}