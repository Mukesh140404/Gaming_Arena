import { useState, useMemo, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  LayoutGrid, 
  List, 
  CheckCircle2, 
  AlertCircle, 
  Users, 
  DollarSign, 
  RefreshCw
} from "lucide-react";
import { gamesQueryOptions, useAddGameMutation, useUpdateGameMutation, useDeleteGameMutation } from "@/api/game.queries";
import type { Game, AddGameInput } from "@/types/game.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

// Image presets for quick selection
const COVER_PRESETS = [
  { label: "Shooter / Tactical", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80" },
  { label: "Cyberpunk / Sci-Fi", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80" },
  { label: "Sports / Football", url: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=800&q=80" },
  { label: "Fighting / Arcade", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80" },
  { label: "Racing / Drift", url: "https://images.unsplash.com/photo-1547394765-185e1e68f34e?auto=format&fit=crop&w=800&q=80" },
  { label: "Action / War", url: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=800&q=80" },
];

export function GamesManagement() {
  const { data: games = [], isLoading, refetch } = useQuery(gamesQueryOptions);
  const addMutation = useAddGameMutation();
  const updateMutation = useUpdateGameMutation();
  const deleteMutation = useDeleteGameMutation();

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "active" | "inactive">("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Game | null>(null);

  // Form State for Add
  const [addForm, setAddForm] = useState<AddGameInput>({
    name: "",
    category: "Action",
    description: "",
    minPlayers: 1,
    maxPlayers: 4,
    hourlyRate: 150,
    isActive: true,
    coverImage: COVER_PRESETS[0].url,
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState<Partial<Game>>({});

  // Filtered games
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const matchSearch =
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (g.description && g.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchStatus =
        filterStatus === "all"
          ? true
          : filterStatus === "active"
          ? g.isActive
          : !g.isActive;

      return matchSearch && matchStatus;
    });
  }, [games, searchQuery, filterStatus]);

  // Statistics
  const stats = useMemo(() => {
    const total = games.length;
    const active = games.filter((g) => g.isActive).length;
    const inactive = total - active;
    const avgRate = total > 0 ? Math.round(games.reduce((acc, g) => acc + (g.hourlyRate || 100), 0) / total) : 0;
    return { total, active, inactive, avgRate };
  }, [games]);

  // Handlers
  const handleOpenAdd = () => {
    setAddForm({
      name: "",
      category: "Action",
      description: "",
      minPlayers: 1,
      maxPlayers: 4,
      hourlyRate: 150,
      isActive: true,
      coverImage: COVER_PRESETS[0].url,
    });
    setIsAddOpen(true);
  };

  const handleSubmitAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    await addMutation.mutateAsync({
      ...addForm,
      minPlayers: Number(addForm.minPlayers),
      maxPlayers: Number(addForm.maxPlayers),
      hourlyRate: Number(addForm.hourlyRate),
    });
    setIsAddOpen(false);
  };

  const handleOpenEdit = (game: Game) => {
    setEditGame(game);
    setEditForm({
      name: game.name,
      category: game.category || "Action",
      description: game.description || "",
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      hourlyRate: game.hourlyRate || 150,
      isActive: game.isActive,
      coverImage: game.coverImage || COVER_PRESETS[0].url,
    });
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editGame || !editForm.name?.trim()) return;

    await updateMutation.mutateAsync({
      id: editGame.id,
      name: editForm.name,
      category: editForm.category,
      description: editForm.description || undefined,
      minPlayers: Number(editForm.minPlayers),
      maxPlayers: Number(editForm.maxPlayers),
      hourlyRate: Number(editForm.hourlyRate),
      isActive: editForm.isActive,
      coverImage: editForm.coverImage,
    });
    setEditGame(null);
  };

  const handleToggleStatus = async (game: Game) => {
    await updateMutation.mutateAsync({
      id: game.id,
      isActive: !game.isActive,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    await deleteMutation.mutateAsync(deleteCandidate.id);
    setDeleteCandidate(null);
  };

  return (
    <div className="space-y-6">

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Games Management
            </h1>
            <Badge variant="mono" className="text-xs font-mono font-semibold">
              {games.length} total
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            Configure arena titles, player capacity limits, hourly rates, and active booking availability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="border-zinc-200 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1.5" />
            <span>Refresh</span>
          </Button>

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-xs cursor-pointer font-medium"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Game</span>
          </Button>
        </div>
      </div>

      {/* KPI Cards Row (White/Gray/Black Monochrome Aesthetic) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Games */}
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Total Library</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <Gamepad2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{stats.total}</span>
            <span className="text-[11px] text-zinc-400">titles registered</span>
          </div>
        </Card>

        {/* Active Games */}
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Available to Play</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{stats.active}</span>
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Ready</span>
          </div>
        </Card>

        {/* In Maintenance */}
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Disabled / Offline</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <AlertCircle className="h-4 w-4 text-zinc-400" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">{stats.inactive}</span>
            <span className="text-[11px] text-zinc-400">Maintenance</span>
          </div>
        </Card>

        {/* Average Hourly Rate */}
        <Card className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Avg Hourly Rate</span>
            <div className="p-2 rounded-lg bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-zinc-950 dark:text-zinc-50">₹{stats.avgRate}</span>
            <span className="text-[11px] text-zinc-400">/hr per station</span>
          </div>
        </Card>

      </div>

      {/* Filter & Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by game title, category, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          
          {/* Status Buttons */}
          <div className="flex items-center p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 text-xs">
            <button
              onClick={() => setFilterStatus("all")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterStatus === "all"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              All ({games.length})
            </button>
            <button
              onClick={() => setFilterStatus("active")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterStatus === "active"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setFilterStatus("inactive")}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterStatus === "inactive"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white"
              }`}
            >
              Inactive ({stats.inactive})
            </button>
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-1 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
            <button
              onClick={() => setViewMode("table")}
              title="Table View"
              className={`p-1.5 rounded-md transition ${
                viewMode === "table"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              title="Grid View"
              className={`p-1.5 rounded-md transition ${
                viewMode === "grid"
                  ? "bg-white text-zinc-950 shadow-2xs dark:bg-zinc-800 dark:text-white"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-16 border border-zinc-200 rounded-xl bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <RefreshCw className="h-6 w-6 text-zinc-400 animate-spin mb-3" />
          <p className="text-sm text-zinc-500 font-medium">Loading gaming library...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 border border-zinc-200 border-dashed rounded-xl bg-white text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-3 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 mb-3">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No games found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            {searchQuery
              ? `No games matched your query "${searchQuery}". Try a different keyword.`
              : "Your games library is currently empty. Add your first gaming title to get started!"}
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="bg-zinc-950 text-white dark:bg-white dark:text-black">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Game Now
          </Button>
        </div>
      ) : viewMode === "table" ? (

        /* Table View */
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                <TableHead className="w-[300px]">Game Title</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Players</TableHead>
                <TableHead>Rate / Hr</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredGames.map((game) => (
                <TableRow key={game.id} className="border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                  
                  {/* Game & Cover */}
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <img
                        src={game.coverImage || COVER_PRESETS[0].url}
                        alt={game.name}
                        className="h-11 w-14 rounded-lg object-cover border border-zinc-200 bg-zinc-100 dark:border-zinc-800"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = COVER_PRESETS[0].url;
                        }}
                      />
                      <div className="flex flex-col">
                        <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">
                          {game.name}
                        </span>
                        <span className="text-[11px] text-zinc-400 font-mono">
                          /{game.slug}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  {/* Category */}
                  <TableCell>
                    <Badge variant="secondary" className="text-[11px] font-normal border-zinc-200 bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                      {game.category || "General"}
                    </Badge>
                  </TableCell>

                  {/* Players */}
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                      <Users className="h-3.5 w-3.5 text-zinc-400" />
                      <span>{game.minPlayers} - {game.maxPlayers} players</span>
                    </div>
                  </TableCell>

                  {/* Hourly Rate */}
                  <TableCell>
                    <span className="font-semibold text-xs text-zinc-900 dark:text-zinc-100">
                      ₹{game.hourlyRate || 150}/hr
                    </span>
                  </TableCell>

                  {/* Status */}
                  <TableCell>
                    <button
                      type="button"
                      onClick={() => handleToggleStatus(game)}
                      className="cursor-pointer group flex items-center"
                      title="Click to toggle status"
                    >
                      {game.isActive ? (
                        <Badge variant="default" className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 gap-1 hover:bg-zinc-800 transition">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                          <span>Active</span>
                        </Badge>
                      ) : (
                        <Badge variant="mono" className="border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 inline-block" />
                          <span>Disabled</span>
                        </Badge>
                      )}
                    </button>
                  </TableCell>

                  {/* Actions (Update, Delete) */}
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenEdit(game)}
                        className="h-8 px-2.5 text-xs text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
                        title="Edit Game"
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1" />
                        <span>Edit</span>
                      </Button>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteCandidate(game)}
                        className="h-8 px-2.5 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                        title="Delete Game"
                      >
                        <Trash2 className="h-3.5 w-3.5 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>

                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

      ) : (

        /* Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGames.map((game) => (
            <Card
              key={game.id}
              className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 overflow-hidden shadow-2xs hover:border-zinc-300 dark:hover:border-zinc-700 transition group flex flex-col justify-between"
            >
              <div>
                {/* Cover Image banner */}
                <div className="relative h-40 w-full overflow-hidden bg-zinc-100 dark:bg-zinc-900">
                  <img
                    src={game.coverImage || COVER_PRESETS[0].url}
                    alt={game.name}
                    className="h-full w-full object-cover group-hover:scale-105 transition duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = COVER_PRESETS[0].url;
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/20 to-transparent" />
                  
                  {/* Status Badge in top corner */}
                  <div className="absolute top-2.5 left-2.5">
                    {game.isActive ? (
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-950/90 text-white border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-md bg-zinc-900/90 text-zinc-300 border border-zinc-700/60 px-2 py-0.5 text-[10px] font-semibold backdrop-blur-xs">
                        <span className="h-1.5 w-1.5 rounded-full bg-zinc-400" />
                        Disabled
                      </span>
                    )}
                  </div>

                  {/* Hourly Rate badge */}
                  <div className="absolute top-2.5 right-2.5">
                    <span className="inline-flex items-center rounded-md bg-white/95 text-zinc-950 px-2 py-0.5 text-[11px] font-bold shadow-xs">
                      ₹{game.hourlyRate || 150}/hr
                    </span>
                  </div>

                  {/* Bottom overlay title */}
                  <div className="absolute bottom-2.5 left-3 right-3 text-white">
                    <h3 className="font-bold text-sm tracking-tight drop-shadow-xs truncate">
                      {game.name}
                    </h3>
                    <span className="text-[10px] text-zinc-300 uppercase tracking-wider font-mono">
                      {game.category || "General"} &bull; {game.minPlayers}-{game.maxPlayers} Players
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-4">
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 min-h-8">
                    {game.description || "No description provided for this game."}
                  </p>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="px-4 py-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/40 flex items-center justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleToggleStatus(game)}
                  className="h-7 text-[11px] border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300"
                >
                  {game.isActive ? "Deactivate" : "Activate"}
                </Button>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleOpenEdit(game)}
                    className="h-7 px-2 text-xs text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white"
                  >
                    <Pencil className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDeleteCandidate(game)}
                    className="h-7 px-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

            </Card>
          ))}
        </div>
      )}

      {/* ========================================================================= */}
      {/* ADD GAME MODAL DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <DialogTitle>Add New Game</DialogTitle>
            </div>
            <DialogDescription>
              Register a new game title to your arena library. Fields can be modified later anytime.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-4">
            
            {/* Game Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Game Title *
              </label>
              <Input
                required
                placeholder="e.g. Counter-Strike 2, Valorant"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            {/* Category & Hourly Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Genre / Category
                </label>
                <Input
                  placeholder="e.g. Tactical Shooter, RPG"
                  value={addForm.category}
                  onChange={(e) => setAddForm({ ...addForm, category: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Hourly Rate (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={addForm.hourlyRate}
                  onChange={(e) => setAddForm({ ...addForm, hourlyRate: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Min and Max Players */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Min Players
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={addForm.minPlayers}
                  onChange={(e) => setAddForm({ ...addForm, minPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Max Players
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={addForm.maxPlayers}
                  onChange={(e) => setAddForm({ ...addForm, maxPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Cover Image URL & Presets */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Cover Image URL
              </label>
              <Input
                placeholder="https://images.unsplash.com/..."
                value={addForm.coverImage}
                onChange={(e) => setAddForm({ ...addForm, coverImage: e.target.value })}
                className="h-9 text-xs font-mono"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-zinc-400 self-center mr-1">Presets:</span>
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAddForm({ ...addForm, coverImage: preset.url })}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description / Overview
              </label>
              <Textarea
                placeholder="Brief summary of the game, features, and target hardware..."
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                className="text-xs min-h-16"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Available for Booking Immediately
                </span>
                <span className="text-[11px] text-zinc-500">
                  Allow players to choose this game during slot reservations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={addForm.isActive}
                onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-950 dark:accent-white cursor-pointer"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="border-zinc-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addMutation.isPending}
                className="bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {addMutation.isPending ? "Adding..." : "Save Game"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* EDIT / UPDATE GAME MODAL DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={!!editGame} onOpenChange={(open) => !open && setEditGame(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Pencil className="h-4 w-4" />
              </div>
              <DialogTitle>Edit Game</DialogTitle>
            </div>
            <DialogDescription>
              Update game title, parameters, player limits, or active status.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-4">
            
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Game Title *
              </label>
              <Input
                required
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            {/* Category & Hourly Rate */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Genre / Category
                </label>
                <Input
                  value={editForm.category || ""}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Hourly Rate (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={editForm.hourlyRate || 0}
                  onChange={(e) => setEditForm({ ...editForm, hourlyRate: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Min and Max Players */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Min Players
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.minPlayers || 1}
                  onChange={(e) => setEditForm({ ...editForm, minPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Max Players
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={editForm.maxPlayers || 4}
                  onChange={(e) => setEditForm({ ...editForm, maxPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Cover Image URL */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Cover Image URL
              </label>
              <Input
                value={editForm.coverImage || ""}
                onChange={(e) => setEditForm({ ...editForm, coverImage: e.target.value })}
                className="h-9 text-xs font-mono"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                <span className="text-[10px] text-zinc-400 self-center mr-1">Presets:</span>
                {COVER_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setEditForm({ ...editForm, coverImage: preset.url })}
                    className="text-[10px] px-2 py-0.5 rounded-md border border-zinc-200 bg-zinc-50 text-zinc-700 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description / Overview
              </label>
              <Textarea
                value={editForm.description || ""}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="text-xs min-h-16"
              />
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Game Active & Playable
                </span>
                <span className="text-[11px] text-zinc-500">
                  Toggle off to temporarily disable slot reservations.
                </span>
              </div>
              <input
                type="checkbox"
                checked={editForm.isActive ?? true}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-950 dark:accent-white cursor-pointer"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditGame(null)}
                className="border-zinc-200 dark:border-zinc-800"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950"
              >
                {updateMutation.isPending ? "Updating..." : "Update Game"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* DELETE CONFIRMATION MODAL DIALOG */}
      {/* ========================================================================= */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <DialogTitle>Confirm Game Deletion</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to permanently delete{" "}
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">
                "{deleteCandidate?.name}"
              </strong>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              className="border-zinc-200 dark:border-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
