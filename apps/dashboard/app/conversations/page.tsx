'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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
import { Input } from "@/components/ui/input";
import { format } from 'date-fns';
import { Trash2, Eye, Loader2 } from 'lucide-react';
import Link from 'next/link';

// --- Interfaces (same as before) ---
interface Conversation {
  id: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalConversations: number;
  itemsPerPage: number;
}

// --- Debounce Hook ---
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

// --- Conversations Page Component ---
export default function ConversationsPage() {
  // Conversations state
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [pagination, setPagination] = useState<PaginationData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [convosLoading, setConvosLoading] = useState(true);
  const [convosError, setConvosError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  // Filter state
  const [filterText, setFilterText] = useState('');
  const debouncedFilterText = useDebounce(filterText, 500); // Debounce filter input by 500ms

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedFilterText]);

  // Fetch conversations function (updated for filter)
  const fetchConversations = useCallback(async () => {
    setConvosLoading(true);
    setConvosError(null);
    try {
      // Construct the API URL with page and debounced filter
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      if (debouncedFilterText) {
        params.append('filter', debouncedFilterText);
      }
      const apiUrl = `/api/conversations?${params.toString()}`;
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data.conversations);
      setPagination(data.pagination);

      // Handle empty page (no change needed here)
      if (data.conversations.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      setConvosError(error instanceof Error ? error.message : "An unknown error occurred");
      setConversations([]);
      setPagination(null);
    } finally {
      setConvosLoading(false);
    }
  // Dependencies now include currentPage and debouncedFilterText
  }, [currentPage, debouncedFilterText]); 

  // Fetch conversations initially and when page or filter changes
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]); // Relies on the useCallback dependencies

  const handlePrevPage = () => {
    if (pagination && pagination.currentPage > 1) {
      setCurrentPage(pagination.currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination && pagination.currentPage < pagination.totalPages) {
      setCurrentPage(pagination.currentPage + 1);
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    if (!window.confirm("Are you sure?")) return;
    setDeletingId(conversationId);
    try {
      const response = await fetch(`/api/conversations/${conversationId}`, { method: 'DELETE' });
      if (!response.ok) {
        let errorMsg = "Failed to delete conversation";
        try { const errorData = await response.json(); errorMsg = errorData.error || errorMsg; } catch {} 
        throw new Error(errorMsg);
      }
      fetchConversations(); // Refresh list
    } catch (error) {
      console.error("Error deleting conversation:", error);
      alert(`Deletion failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle>Conversations</CardTitle>
              <CardDescription>Browse, filter, and manage conversations.</CardDescription>
            </div>
            {/* Filter Input */}
            <div className="w-full sm:w-auto">
              <Input 
                placeholder="Filter by Session ID..." 
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="max-w-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {convosLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /> 
            </div>
          ) : convosError ? (
            <p className="text-red-600 text-center py-4">Error: {convosError}</p>
          ) : conversations.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              {debouncedFilterText ? `No conversations found matching "${debouncedFilterText}".` : "No conversations found."}
            </p>
          ) : (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b-0">
                      <TableHead className="w-[280px] px-4 py-3 text-muted-foreground font-medium">Session ID</TableHead>
                      <TableHead className="px-4 py-3 text-muted-foreground font-medium">Started</TableHead>
                      <TableHead className="px-4 py-3 text-muted-foreground font-medium">Last Activity</TableHead>
                      <TableHead className="text-right px-4 py-3 text-muted-foreground font-medium">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="[&>*:nth-child(odd)]:bg-muted/50">
                    {conversations.map((convo) => (
                      <TableRow key={convo.id} className="hover:bg-muted/80 border-b">
                        <TableCell className="font-medium truncate px-4 py-3">{convo.sessionId}</TableCell>
                        <TableCell className="px-4 py-3">{format(new Date(convo.createdAt), 'Pp')}</TableCell>
                        <TableCell className="px-4 py-3">{format(new Date(convo.updatedAt), 'Pp')}</TableCell>
                        <TableCell className="text-right px-4 py-3 space-x-1">
                          <Button asChild variant="ghost" size="icon" aria-label="View conversation">
                            <Link href={`/conversations/${convo.id}`}>
                              <Eye className="h-4 w-4 text-muted-foreground hover:text-primary" />
                            </Link>
                          </Button>
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
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 pt-4">
                  <span className="text-sm text-muted-foreground">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePrevPage}
                    disabled={pagination.currentPage === 1}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleNextPage}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
} 