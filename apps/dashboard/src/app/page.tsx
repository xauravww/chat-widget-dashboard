'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from "@/components/Layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

// Updated interface for stats data
interface DashboardStats {
  activeConnections: number;
  totalConversations: number; // Added totalConversations
  averageMessages: number;
}

// Re-add RecentConversation interface
interface RecentConversation {
  id: string;
  sessionId: string;
  updatedAt: string; 
}

export default function HomePage() {
  // Combined state for all stats and loading status
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  
  // Re-add state for recent conversations
  const [recentConversations, setRecentConversations] = useState<RecentConversation[]>([]);
  const [recentLoading, setRecentLoading] = useState(true);
  const [recentError, setRecentError] = useState<string | null>(null);

  // Re-add state for deleting
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all stats from API endpoint
  useEffect(() => {
    async function fetchStats() {
      setStatsLoading(true);
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }
        const data: DashboardStats = await response.json();
        setStats(data);
      } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        setStats(null); 
      } finally {
        setStatsLoading(false);
      }
    }

    fetchStats();
    // Optional: Set up an interval to periodically refresh stats
    // const intervalId = setInterval(fetchStats, 15000);
    // return () => clearInterval(intervalId);

  }, []); 
  
  // Fetch recent conversations (wrapped in useCallback)
  const fetchRecentConversations = useCallback(async () => {
    setRecentLoading(true);
    setRecentError(null);
    try {
      const response = await fetch('/api/conversations?limit=5'); 
      if (!response.ok) throw new Error('Failed to fetch recent conversations');
      const data = await response.json();
      setRecentConversations(data.conversations || []);
    } catch (error) {
      console.error("Error fetching recent conversations:", error);
      setRecentError(error instanceof Error ? error.message : "An unknown error occurred");
      setRecentConversations([]);
    } finally {
      setRecentLoading(false);
    }
  }, []); // Empty dependency array, fetch only once unless manually called

  // Fetch recent conversations initially
  useEffect(() => {
    fetchRecentConversations();
  }, [fetchRecentConversations]);

  // Re-add handle conversation deletion
  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm("Are you sure you want to delete this conversation?")) return;
    setDeletingId(conversationId);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorMsg = "Failed to delete conversation";
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      // Refresh the list after successful deletion
      fetchRecentConversations(); 
      // Also refetch stats to update total count
      // Note: Re-fetching stats requires wrapping fetchStats in useCallback too if needed elsewhere
      fetch('/api/stats').then(res => res.json()).then(data => setStats(data)).catch(err => console.error("Failed to refetch stats after delete", err));

    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert(`Deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Conversations Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Conversations
            </CardTitle>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <span className="text-muted-foreground text-sm">Loading...</span> 
              ) : (stats ? stats.totalConversations : "Error")}
            </div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        {/* Active Now Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
         </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <span className="text-muted-foreground text-sm">Loading...</span>
              ) : (stats ? stats.activeConnections : "Error")}
            </div>
            <p className="text-xs text-muted-foreground">Currently connected users</p>
          </CardContent>
        </Card>

         {/* Avg Messages Card */}
         <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
             <CardTitle className="text-sm font-medium">Avg Messages</CardTitle>
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" className="h-4 w-4 text-muted-foreground"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/></svg>
         </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {statsLoading ? (
                <span className="text-muted-foreground text-sm">Loading...</span>
              ) : (stats ? stats.averageMessages : "Error")}
            </div>
             <p className="text-xs text-muted-foreground">Per conversation (all time)</p>
         </CardContent>
        </Card>

         {/* Placeholder Card */}
         <Card><CardHeader><CardTitle>Placeholder</CardTitle></CardHeader><CardContent>TBD</CardContent></Card>
        </div>

        {/* Re-add Recent Conversations Table Section */}
        <div className="mt-6">
          <Card>
             <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest 5 conversations based on recent activity.</CardDescription>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="flex justify-center items-center py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : recentError ? (
                <p className="text-red-600 text-center py-4">Error: {recentError}</p>
              ) : recentConversations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No conversations found yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Session ID</TableHead>
                      <TableHead>Last Activity</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recentConversations.map((convo) => (
                      <TableRow key={convo.id}>
                        <TableCell className="font-medium truncate" title={convo.sessionId}>{convo.sessionId}</TableCell>
                        <TableCell>{format(new Date(convo.updatedAt), 'Pp')}</TableCell>
                        <TableCell className="text-right space-x-1">
                          {/* View Button */}
                          <Button asChild variant="ghost" size="icon" aria-label="View conversation">
                             <Link href={`/conversations/${convo.id}`}> 
                               <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                             </Link>
                          </Button>
                          {/* Delete Button */}
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleDeleteConversation(convo.id)}
                            disabled={deletingId === convo.id} 
                            aria-label="Delete conversation"
                          >
                            {deletingId === convo.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" /> 
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500 hover:text-red-700" /> 
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
      </div>
    </DashboardLayout>
  );
}
