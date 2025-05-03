import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { Server as ServerIO } from "socket.io"; // Import ServerIO type

// Helper function to safely access the global IO instance
const getIoInstance = (): ServerIO | undefined => {
  // Access the global variable where the io instance is stored in socket.ts
  return (globalThis as any).io; 
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // 1. Get Active Connections
    const io = getIoInstance();
    // Use io.engine.clientsCount for a more accurate count of underlying connections
    const activeConnections = io ? io.engine.clientsCount : 0; 

    // 2. Get Total Conversations
    const totalConversations = await db.conversation.count();

    // 3. Calculate Average Messages
    const totalMessages = await db.message.count();
    const averageMessages = totalConversations > 0 
      ? parseFloat((totalMessages / totalConversations).toFixed(2)) // Calculate avg, limit to 2 decimal places
      : 0; // Avoid division by zero

    // Return all stats
    res.status(200).json({ activeConnections, totalConversations, averageMessages });

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
} 