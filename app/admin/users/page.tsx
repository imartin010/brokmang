/**
 * Admin Users Management Page
 * View and manage all users in the system
 */

"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase-browser";
import {
  Users,
  Search,
  Loader2,
  Shield,
  User,
  TrendingUp,
  Mail,
  Calendar,
  Filter,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface UserProfile {
  user_id: string;
  full_name: string | null;
  user_type: string;
  created_at: string;
  email?: string;
  agent_count?: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "admin" | "ceo" | "team_leader">("all");
  const [changingUser, setChangingUser] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [filterType]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Add timeout to prevent infinite loading
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      // Use API route to fetch all users (bypasses RLS using service role)
      const response = await fetch(`/api/admin/users?filter=${filterType}`, {
        credentials: 'include', // Include cookies in the request
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: `HTTP ${response.status}: ${response.statusText}`,
        }));
        throw new Error(errorData.error || "Failed to load users");
      }

      const { users } = await response.json();
      setUsers(users || []);
    } catch (error: any) {
      console.error("[Admin Users] Failed to load users:", error);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        setError("Request timed out. Please check your connection and try again.");
      } else {
        setError(error instanceof Error ? error.message : "Failed to load users");
      }
      
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((user) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      user.full_name?.toLowerCase().includes(query) ||
      user.user_id.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  const handleChangeUserType = async (userId: string, newType: string) => {
    if (changingUser) return;

    try {
      setChangingUser(userId);
      setError(null); // Clear previous errors

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch("/api/admin/change-user-type", {
        method: "POST",
        credentials: 'include', // Include cookies in the request
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId,
          new_user_type: newType,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to change user type");
      }

      // Reload users to reflect the change
      await loadUsers();
    } catch (error: any) {
      console.error("[Admin Users] Error changing user type:", error);
      
      // Handle timeout errors
      if (error.name === 'AbortError') {
        setError("Request timed out. Please try again.");
      } else {
        setError(error.message || "Failed to change user type");
      }
    } finally {
      setChangingUser(null);
    }
  };

  const getUserTypeBadgeColor = (type: string) => {
    switch (type) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "ceo":
        return "bg-blue-100 text-blue-800";
      case "team_leader":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const userTypeStats = {
    all: users.length,
    admin: users.filter((u) => u.user_type === "admin").length,
    ceo: users.filter((u) => u.user_type === "ceo").length,
    team_leader: users.filter((u) => u.user_type === "team_leader").length,
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Users Management</h1>
        <p className="text-muted-foreground">
          View and manage all users in the system
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400">
          <p className="font-medium">Error: {error}</p>
          <Button
            variant="outline"
            size="sm"
            className="mt-2"
            onClick={() => {
              setError(null);
              loadUsers();
            }}
          >
            Retry
          </Button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{userTypeStats.all}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{userTypeStats.admin}</p>
              </div>
              <Shield className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CEOs</p>
                <p className="text-2xl font-bold">{userTypeStats.ceo}</p>
              </div>
              <User className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Leaders</p>
                <p className="text-2xl font-bold">{userTypeStats.team_leader}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All
              </Button>
              <Button
                variant={filterType === "admin" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("admin")}
              >
                Admins
              </Button>
              <Button
                variant={filterType === "ceo" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("ceo")}
              >
                CEOs
              </Button>
              <Button
                variant={filterType === "team_leader" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("team_leader")}
              >
                Team Leaders
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users List */}
      {filteredUsers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Users Found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? "Try adjusting your search query"
                : "No users match this filter"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((user) => (
            <Card key={user.user_id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-primary/10 rounded-full">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold">
                          {user.full_name || "Unnamed User"}
                        </h3>
                        <span
                          className={`px-2 py-1 text-xs rounded-full capitalize ${getUserTypeBadgeColor(
                            user.user_type
                          )}`}
                        >
                          {user.user_type.replace("_", " ")}
                        </span>
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          <span className="font-mono text-xs">
                            {user.user_id.slice(0, 8)}...
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>
                            Joined {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                          </span>
                        </div>
                        {user.user_type === "team_leader" && (
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4" />
                            <span>{user.agent_count || 0} agents</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Change User Type Dropdown - Only show for non-admin users */}
                  {user.user_type !== "admin" && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={changingUser === user.user_id}
                        >
                          {changingUser === user.user_id ? (
                            <>
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              Changing...
                            </>
                          ) : (
                            <>
                              Change Type
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </>
                          )}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {user.user_type !== "ceo" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeUserType(user.user_id, "ceo")}
                            className="cursor-pointer"
                          >
                            <User className="h-4 w-4 mr-2 text-blue-600" />
                            Change to CEO
                          </DropdownMenuItem>
                        )}
                        {user.user_type !== "team_leader" && (
                          <DropdownMenuItem
                            onClick={() => handleChangeUserType(user.user_id, "team_leader")}
                            className="cursor-pointer"
                          >
                            <TrendingUp className="h-4 w-4 mr-2 text-green-600" />
                            Change to Team Leader
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
