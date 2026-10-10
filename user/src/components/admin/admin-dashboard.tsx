import { useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  Gamepad2,
  Users,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Server,
  Activity,
  RefreshCw
} from "lucide-react";
import { gamesQueryOptions } from "@/hooks/useGame";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";

export function AdminDashboard() {
  const { data: games = [], isLoading, refetch } = useQuery(gamesQueryOptions);

  // Computed states & stats
  const stats = useMemo(() => {
    const total = games.length;
    const active = games.filter((g) => g.isActive).length;
    const inactive = total - active;
    const totalMaxPlayers = games.reduce((acc, g) => acc + (g.maxPlayers || 0), 0);
    const avgPlayersPerGame = total > 0 ? (totalMaxPlayers / total).toFixed(1) : "0";

    return {
      total,
      active,
      inactive,
      totalMaxPlayers,
      avgPlayersPerGame,
      activePercentage: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }, [games]);

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Header Banner - Responsive Stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Admin Dashboard
            </h1>
            <Badge variant="mono" className="text-[10px] sm:text-xs font-mono font-semibold">
              Live
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Real-time status, games overview, and system analytics.
          </p>
        </div>

        {/* Action Buttons - Full width on mobile, auto on desktop */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="flex-1 sm:flex-none border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900 justify-center h-9 sm:h-8"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Link to="/admin/games" className="flex-1 sm:flex-none">
            <Button
              size="sm"
              className="w-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-xs font-medium justify-center h-9 sm:h-8"
            >
              <span>Manage Games</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Mobile-friendly 2-col to 4-col responsive grid) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        
        {/* Total Games */}
        <Card className="border-zinc-200 bg-white p-3 sm:p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Games</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <Gamepad2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {stats.total}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">titles registered</span>
          </div>
        </Card>

        {/* Active Games */}
        <Card className="border-zinc-200 bg-white p-3 sm:p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Active Titles</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {stats.active}
            </span>
            <span className="text-[10px] sm:text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
              {stats.activePercentage}% ready
            </span>
          </div>
        </Card>

        {/* Inactive Games */}
        <Card className="border-zinc-200 bg-white p-3 sm:p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Inactive</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <AlertCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-zinc-400" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {stats.inactive}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">offline</span>
          </div>
        </Card>

        {/* Total Max Player Capacity */}
        <Card className="border-zinc-200 bg-white p-3 sm:p-4 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          <div className="flex items-center justify-between">
            <span className="text-[11px] sm:text-xs font-medium text-zinc-500 dark:text-zinc-400">Max Capacity</span>
            <div className="p-1.5 sm:p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </div>
          </div>
          <div className="mt-1.5 sm:mt-2 flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
            <span className="text-xl sm:text-2xl font-bold text-zinc-950 dark:text-zinc-50">
              {stats.totalMaxPlayers}
            </span>
            <span className="text-[10px] sm:text-[11px] text-zinc-400">
              ({stats.avgPlayersPerGame} avg/game)
            </span>
          </div>
        </Card>

      </div>

      {/* Middle Section: Server & System States + Quick Action */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4">
        
        {/* System Health */}
        <Card className="border-zinc-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950 md:col-span-2">
          <div className="flex items-center justify-between mb-3.5 pb-2 border-b border-zinc-100 dark:border-zinc-900">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Backend Services & States
              </h3>
            </div>
            <Badge variant="mono" className="text-[9px] sm:text-[10px] font-mono">
              ONLINE
            </Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-500">Games Route</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                /api/v1/games
              </p>
              <span className="text-[10px] text-zinc-400">CRUD Endpoints Ready</span>
            </div>

            <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-500">Auth Gateway</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                /api/v1/auth
              </p>
              <span className="text-[10px] text-zinc-400">Session Verified</span>
            </div>

            <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/60 dark:border-zinc-800 dark:bg-zinc-900/60">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-zinc-500">Security State</span>
                <span className="h-2 w-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-xs font-mono font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                RBAC Active
              </p>
              <span className="text-[10px] text-zinc-400">Role: Admin</span>
            </div>
          </div>
        </Card>

        {/* Quick Shortcut Card */}
        <Card className="border-zinc-200 bg-white p-4 sm:p-5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-950 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-zinc-50">
                Games Management
              </h3>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
              Full list, single game details modal, or add, update, and delete titles.
            </p>
          </div>

          <Link to="/admin/games" className="w-full">
            <Button
              className="w-full bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white text-xs font-semibold justify-between h-9"
            >
              <span>Go to Games Section</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </Card>

      </div>

      {/* Snapshot of Games List - Responsive Table Container */}
      <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
        <div className="p-3.5 sm:p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-950 dark:text-zinc-50">
              Recent Games Snapshot
            </h3>
            <p className="text-[10px] sm:text-[11px] text-zinc-500">
              Live overview of registered gaming titles
            </p>
          </div>

          <Link to="/admin/games">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
              <span>View All</span>
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-xs text-zinc-400">Loading games snapshot...</div>
        ) : games.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-400">No games found in the database.</div>
        ) : (
          <div className="overflow-x-auto w-full">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Players</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {games.slice(0, 5).map((game) => (
                  <TableRow key={game.id} className="border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                    <TableCell className="font-semibold text-xs text-zinc-950 dark:text-zinc-50 whitespace-nowrap">
                      {game.name}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-500 font-mono whitespace-nowrap">
                      /{game.slug}
                    </TableCell>
                    <TableCell className="text-xs text-zinc-600 dark:text-zinc-300 whitespace-nowrap">
                      {game.minPlayers} - {game.maxPlayers} players
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {game.isActive ? (
                        <Badge variant="default" className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 gap-1 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="mono" className="border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 gap-1 text-[11px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                          <span>Inactive</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <Link to="/admin/games">
                        <Button variant="ghost" size="sm" className="h-7 text-xs text-zinc-600 hover:text-black dark:text-zinc-400 dark:hover:text-white">
                          Manage
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

    </div>
  );
}
