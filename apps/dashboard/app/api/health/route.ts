import { NextResponse } from "next/server";

interface HealthStatus {
  status: string;
  timestamp: string;
  services: {
    api: {
      status: string;
    };
  };
}

export async function GET() {
  try {
    // Basic health check implementation
    const healthStatus: HealthStatus = {
      status: "ok",
      timestamp: new Date().toISOString(),
      services: {
        api: {
          status: "operational"
        }
      }
    };

    return NextResponse.json(healthStatus, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: "error",
        message: "Health check failed",
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}