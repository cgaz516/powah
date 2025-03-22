import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const timeframe = searchParams.get('timeframe') || '24hr';
  
  // Validate timeframe
  if (!['24hr', 'week', 'month'].includes(timeframe)) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Invalid timeframe. Use 24hr, week, or month' 
      },
      { status: 400 }
    );
  }
  
  const priceData = generatePriceData(timeframe);
  
  return NextResponse.json({
    success: true,
    data: {
      timeframe,
      currency: "kWh",
      dataPoints: priceData.length,
      prices: priceData
    },
    updatedAt: new Date().toISOString()
  });
}

function generatePriceData(timeframe: string) {
  const now = new Date();
  const basePrice = 0.27;
  const data = [];
  
  switch (timeframe) {
    case '24hr': {
      // Generate hourly data for the past 24 hours
      for (let i = 24; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        
        // Price fluctuation based on time of day
        let priceFactor = 1.0;
        
        // Early morning (midnight to 6am): slightly below average
        if (hour >= 0 && hour < 6) {
          priceFactor = 0.85 + (Math.random() * 0.1);
        }
        // Morning to afternoon (6am to 2pm): lowest due to solar generation
        else if (hour >= 6 && hour < 14) {
          priceFactor = 0.7 + (Math.random() * 0.15);
        }
        // Afternoon (2pm to 5pm): rising again
        else if (hour >= 14 && hour < 17) {
          priceFactor = 0.9 + (Math.random() * 0.15);
        }
        // Evening peak (5pm to 9pm): highest demand
        else if (hour >= 17 && hour < 21) {
          priceFactor = 1.3 + (Math.random() * 0.2);
        }
        // Late evening (9pm to midnight): tapering off
        else {
          priceFactor = 1.1 + (Math.random() * 0.1);
        }
        
        // Small random noise
        priceFactor += (Math.random() * 0.04) - 0.02;
        
        data.push({
          timestamp: timestamp.toISOString(),
          unixTime: Math.floor(timestamp.getTime() / 1000),
          price: +(basePrice * priceFactor).toFixed(4)
        });
      }
      break;
    }
    
    case 'week': {
      // Generate data every 4 hours for the past week
      for (let i = 42; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 4 * 60 * 60 * 1000);
        const hour = timestamp.getHours();
        const day = timestamp.getDay(); // 0 = Sunday, 6 = Saturday
        
        // Base time-of-day factor (similar to 24hr case)
        let priceFactor = 1.0;
        
        // Apply time-of-day fluctuations
        if (hour >= 0 && hour < 6) {
          priceFactor = 0.85 + (Math.random() * 0.1);
        } else if (hour >= 6 && hour < 14) {
          priceFactor = 0.7 + (Math.random() * 0.15);
        } else if (hour >= 14 && hour < 17) {
          priceFactor = 0.9 + (Math.random() * 0.15);
        } else if (hour >= 17 && hour < 21) {
          priceFactor = 1.3 + (Math.random() * 0.2);
        } else {
          priceFactor = 1.1 + (Math.random() * 0.1);
        }
        
        // Weekend vs weekday adjustment (lower demand on weekends)
        if (day === 0 || day === 6) {
          priceFactor *= 0.85;
        }
        
        // Additional noise
        priceFactor += (Math.random() * 0.06) - 0.03;
        
        data.push({
          timestamp: timestamp.toISOString(),
          unixTime: Math.floor(timestamp.getTime() / 1000),
          price: +(basePrice * priceFactor).toFixed(4)
        });
      }
      break;
    }
    
    case 'month': {
      // Generate daily data for the past month
      for (let i = 30; i >= 0; i--) {
        const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
        const day = timestamp.getDay();
        
        // Base price factor (weekend vs weekday)
        let priceFactor = 1.0;
        
        // Weekend adjustment
        if (day === 0 || day === 6) {
          priceFactor = 0.85;
        }
        
        // Weekly pattern - slight rise mid-week
        if (day === 2 || day === 3) {
          priceFactor *= 1.08;
        }
        
        // Monthly pattern - higher in first week
        if (i >= 23) {
          priceFactor *= 1.1;
        }
        // Lower in third week
        else if (i >= 7 && i < 15) {
          priceFactor *= 0.95;
        }
        
        // Weather/demand variation
        priceFactor += (Math.random() * 0.2) - 0.1;
        
        data.push({
          timestamp: timestamp.toISOString(),
          unixTime: Math.floor(timestamp.getTime() / 1000),
          price: +(basePrice * priceFactor).toFixed(4),
          dayOfWeek: day
        });
      }
      break;
    }
  }
  
  return data;
}