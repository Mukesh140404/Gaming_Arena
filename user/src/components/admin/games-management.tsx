import { useState, useMemo, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { 
  Gamepad2, 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Eye, 
  RefreshCw,
  Users,
  CheckCircle2,
  XCircle,
  Hash,
  Clock
} from "lucide-react";
import { 
  gamesQueryOptions, 
  useAddGameMutation, 
  useUpdateGameMutation, 
  useDeleteGameMutation 
} from "@/api/game.queries";
import { fetchGameById } from "@/api/game";
import type { Game, AddGameInput } from "@/types/game.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, 
  DialogFooter 
} from "@/components/ui/dialog";

export function GamesManagement() {
  // 1. All List (GET /games)
  const { data: games = [], isLoading, refetch } = useQuery(gamesQueryOptions);
  
  const addMutation = useAddGameMutation();
  const updateMutation = useUpdateGameMutation();
  const deleteMutation = useDeleteGameMutation();

  // Search filter for all list
  const [searchQuery, setSearchQuery] = useState("");

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [singleGame, setSingleGame] = useState<Game | null>(null);
  const [isSingleLoading, setIsSingleLoading] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [deleteCandidate, setDeleteCandidate] = useState<Game | null>(null);

  // Form State for Add Game (matching server: name, description, minPlayers, maxPlayers, isActive)
  const [addForm, setAddForm] = useState<AddGameInput>({
    name: "",
    description: "",
    minPlayers: 1,
    maxPlayers: 4,
    isActive: true,
  });

  // Form State for Update Game
  const [editForm, setEditForm] = useState<{
    name: string;
    description: string;
    minPlayers: number;
    maxPlayers: number;
    isActive: boolean;
  }>({
    name: "",
    description: "",
    minPlayers: 1,
    maxPlayers: 4,
    isActive: true,
  });

  // Filtered list
  const filteredGames = useMemo(() => {
    return games.filter((g) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return true;
      return (
        g.name.toLowerCase().includes(q) ||
        g.slug.toLowerCase().includes(q) ||
        (g.description && g.description.toLowerCase().includes(q))
      );
    });
  }, [games, searchQuery]);

  // 2. Single List / Item Handler (GET /games/:id)
  const handleViewSingle = async (game: Game) => {
    setIsSingleLoading(true);
    setSingleGame(game);
    try {
      const fetched = await fetchGameById(game.id);
      if (fetched) {
        setSingleGame(fetched);
      }
    } finally {
      setIsSingleLoading(false);
    }
  };

  // 3. Add Game Handler (POST /games)
  const handleOpenAdd = () => {
    setAddForm({
      name: "",
      description: "",
      minPlayers: 1,
      maxPlayers: 4,
      isActive: true,
    });
    setIsAddOpen(true);
  };

  const handleSubmitAdd = async (e: FormEvent) => {
    e.preventDefault();
    if (!addForm.name.trim()) return;

    await addMutation.mutateAsync({
      name: addForm.name.trim(),
      description: addForm.description?.trim() || "",
      minPlayers: Number(addForm.minPlayers),
      maxPlayers: Number(addForm.maxPlayers),
      isActive: addForm.isActive,
    });
    setIsAddOpen(false);
  };

  // 4. Update Game Handler (PATCH/PUT /games/:id)
  const handleOpenEdit = (game: Game) => {
    setEditGame(game);
    setEditForm({
      name: game.name,
      description: game.description || "",
      minPlayers: game.minPlayers,
      maxPlayers: game.maxPlayers,
      isActive: game.isActive,
    });
  };

  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editGame || !editForm.name.trim()) return;

    await updateMutation.mutateAsync({
      id: editGame.id,
      name: editForm.name.trim(),
      description: editForm.description.trim() || undefined,
      minPlayers: Number(editForm.minPlayers),
      maxPlayers: Number(editForm.maxPlayers),
      isActive: editForm.isActive,
    });
    setEditGame(null);
  };

  // 5. Delete Game Handler (DELETE /games/:id)
  const handleDeleteConfirm = async () => {
    if (!deleteCandidate) return;
    await deleteMutation.mutateAsync(deleteCandidate.id);
    setDeleteCandidate(null);
    if (singleGame?.id === deleteCandidate.id) {
      setSingleGame(null);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">

      {/* Header Banner - Responsive Stacking */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
              Games Management
            </h1>
            <Badge variant="mono" className="text-[10px] sm:text-xs font-mono font-semibold">
              {games.length} total
            </Badge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 sm:mt-1">
            Server API CRUD management for Games (All List, Single View, Add, Update, and Delete).
          </p>
        </div>

        {/* Action Buttons - Full width on mobile */}
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

          <Button
            size="sm"
            onClick={handleOpenAdd}
            className="flex-1 sm:flex-none bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white shadow-xs font-medium cursor-pointer justify-center h-9 sm:h-8"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            <span>Add Game</span>
          </Button>
        </div>
      </div>

      {/* Search Bar - Responsive */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-3 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by title, slug, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-xs border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 w-full"
          />
        </div>

        <div className="text-[11px] sm:text-xs font-mono text-zinc-500 text-right sm:text-left">
          Showing {filteredGames.length} of {games.length} titles
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-12 sm:p-16 border border-zinc-200 rounded-xl bg-white dark:border-zinc-800 dark:bg-zinc-950">
          <RefreshCw className="h-6 w-6 text-zinc-400 animate-spin mb-3" />
          <p className="text-sm text-zinc-500 font-medium">Loading games list from server...</p>
        </div>
      ) : filteredGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-10 sm:p-16 border border-zinc-200 border-dashed rounded-xl bg-white text-center dark:border-zinc-800 dark:bg-zinc-950">
          <div className="p-3 rounded-full bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400 mb-3">
            <Gamepad2 className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">No games found</h3>
          <p className="text-xs text-zinc-500 max-w-sm mt-1 mb-4">
            {searchQuery
              ? `No games matched "${searchQuery}". Try a different keyword.`
              : "No games in the database yet. Click below to add a game."}
          </p>
          <Button size="sm" onClick={handleOpenAdd} className="bg-zinc-950 text-white dark:bg-white dark:text-black">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Game Now
          </Button>
        </div>
      ) : (
        <>
          {/* ========================================================================= */}
          {/* MOBILE VIEW: Touch-friendly Card List (Hidden on desktop md:) */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredGames.map((game) => (
              <Card
                key={game.id}
                className="border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 p-4 shadow-2xs space-y-3"
              >
                {/* Header: Title, Slug & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <h3 className="font-bold text-sm text-zinc-950 dark:text-zinc-50 truncate">
                      {game.name}
                    </h3>
                    <span className="text-[11px] text-zinc-400 font-mono truncate">
                      /{game.slug}
                    </span>
                  </div>

                  {game.isActive ? (
                    <Badge variant="default" className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 gap-1 text-[10px] shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                      <span>Active</span>
                    </Badge>
                  ) : (
                    <Badge variant="mono" className="border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 gap-1 text-[10px] shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 inline-block" />
                      <span>Inactive</span>
                    </Badge>
                  )}
                </div>

                {/* Details: Players & Description */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                    <Users className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                    <span>{game.minPlayers} - {game.maxPlayers} players</span>
                  </div>

                  {game.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2">
                      {game.description}
                    </p>
                  )}
                </div>

                {/* Mobile Action Buttons Bar */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleViewSingle(game)}
                    className="h-8 text-xs border-zinc-200 dark:border-zinc-800 justify-center text-zinc-700 dark:text-zinc-300"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    <span>View</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEdit(game)}
                    className="h-8 text-xs border-zinc-200 dark:border-zinc-800 justify-center text-zinc-700 dark:text-zinc-300"
                  >
                    <Pencil className="h-3.5 w-3.5 mr-1" />
                    <span>Edit</span>
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDeleteCandidate(game)}
                    className="h-8 text-xs border-red-200 dark:border-red-900/40 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 justify-center"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    <span>Delete</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          {/* ========================================================================= */}
          {/* DESKTOP VIEW: Data Table (Hidden on mobile, visible on md: screens) */}
          {/* ========================================================================= */}
          <div className="hidden md:block rounded-xl border border-zinc-200 bg-white overflow-hidden shadow-2xs dark:border-zinc-800 dark:bg-zinc-950">
            <div className="overflow-x-auto w-full">
              <Table className="min-w-[700px]">
                <TableHeader>
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50">
                    <TableHead className="w-[260px]">Name & Slug</TableHead>
                    <TableHead>Players</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="max-w-[320px]">Description</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGames.map((game) => (
                    <TableRow key={game.id} className="border-b border-zinc-200/60 dark:border-zinc-800/60 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/60">
                      
                      {/* Name & Slug */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-xs text-zinc-950 dark:text-zinc-50">
                            {game.name}
                          </span>
                          <span className="text-[11px] text-zinc-400 font-mono">
                            /{game.slug}
                          </span>
                        </div>
                      </TableCell>

                      {/* Min - Max Players */}
                      <TableCell className="whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-zinc-300">
                          <Users className="h-3.5 w-3.5 text-zinc-400" />
                          <span>{game.minPlayers} - {game.maxPlayers} players</span>
                        </div>
                      </TableCell>

                      {/* Status (isActive) */}
                      <TableCell className="whitespace-nowrap">
                        {game.isActive ? (
                          <Badge variant="default" className="bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 gap-1 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 inline-block" />
                            <span>Active</span>
                          </Badge>
                        ) : (
                          <Badge variant="mono" className="border-zinc-300 bg-zinc-100 text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400 gap-1 text-[11px]">
                            <span className="h-1.5 w-1.5 rounded-full bg-zinc-400 inline-block" />
                            <span>Inactive</span>
                          </Badge>
                        )}
                      </TableCell>

                      {/* Description */}
                      <TableCell className="max-w-[320px]">
                        <p className="text-xs text-zinc-500 truncate">
                          {game.description || <span className="italic text-zinc-400">No description</span>}
                        </p>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewSingle(game)}
                            className="h-8 px-2 text-xs text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
                            title="View Single Game Details"
                          >
                            <Eye className="h-3.5 w-3.5 mr-1" />
                            <span>View</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenEdit(game)}
                            className="h-8 px-2 text-xs text-zinc-700 hover:text-black hover:bg-zinc-100 dark:text-zinc-300 dark:hover:text-white dark:hover:bg-zinc-800"
                            title="Edit Game"
                          >
                            <Pencil className="h-3.5 w-3.5 mr-1" />
                            <span>Edit</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteCandidate(game)}
                            className="h-8 px-2 text-xs text-zinc-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
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
          </div>
        </>
      )}

      {/* ========================================================================= */}
      {/* 2. SINGLE GAME DETAILS MODAL (GET /games/:id) */}
      {/* ========================================================================= */}
      <Dialog open={!!singleGame} onOpenChange={(open) => !open && setSingleGame(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Gamepad2 className="h-4 w-4" />
              </div>
              <DialogTitle>Game Details</DialogTitle>
            </div>
            <DialogDescription>
              Single game record from server (<code className="font-mono text-xs">GET /games/:id</code>).
            </DialogDescription>
          </DialogHeader>

          {isSingleLoading ? (
            <div className="py-6 text-center text-xs text-zinc-400">Loading single game details...</div>
          ) : singleGame && (
            <div className="space-y-3.5">
              {/* Name & Slug */}
              <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/80 dark:border-zinc-800 dark:bg-zinc-900/80">
                <span className="text-[10px] uppercase font-bold tracking-wider text-zinc-400 block mb-0.5">
                  Title & Slug
                </span>
                <h3 className="text-base font-bold text-zinc-950 dark:text-zinc-50">
                  {singleGame.name}
                </h3>
                <span className="text-xs font-mono text-zinc-500">
                  slug: /{singleGame.slug}
                </span>
              </div>

              {/* Grid of properties */}
              <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
                <div className="p-3 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                    <Users className="h-3 w-3" /> Player Capacity
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {singleGame.minPlayers} - {singleGame.maxPlayers} players
                  </span>
                </div>

                <div className="p-3 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                  <span className="text-[10px] uppercase font-bold text-zinc-400 flex items-center gap-1 mb-1">
                    {singleGame.isActive ? <CheckCircle2 className="h-3 w-3 text-emerald-500" /> : <XCircle className="h-3 w-3 text-zinc-400" />}
                    Status
                  </span>
                  <Badge variant={singleGame.isActive ? "default" : "mono"} className="text-[11px]">
                    {singleGame.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              <div className="p-3 rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
                <span className="text-[10px] uppercase font-bold text-zinc-400 block mb-1">
                  Description
                </span>
                <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {singleGame.description || "No description provided."}
                </p>
              </div>

              {/* Metadata */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 gap-1 px-1">
                <span className="flex items-center gap-1 font-mono truncate">
                  <Hash className="h-3 w-3 shrink-0" /> ID: {singleGame.id}
                </span>
                {singleGame.createdAt && (
                  <span className="flex items-center gap-1 shrink-0">
                    <Clock className="h-3 w-3 shrink-0" /> {new Date(singleGame.createdAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="mt-4 flex flex-col-reverse sm:flex-row gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSingleGame(null)}
              className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 justify-center h-9 sm:h-8"
            >
              Close
            </Button>
            {singleGame && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  const target = singleGame;
                  setSingleGame(null);
                  handleOpenEdit(target);
                }}
                className="w-full sm:w-auto bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 justify-center h-9 sm:h-8"
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit This Game
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 3. ADD GAME MODAL (POST /games) */}
      {/* ========================================================================= */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Plus className="h-4 w-4" />
              </div>
              <DialogTitle>Add Game</DialogTitle>
            </div>
            <DialogDescription>
              Create a new game in server database (<code className="font-mono text-xs">POST /games</code>).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitAdd} className="space-y-3.5">
            
            {/* Name */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Game Name *
              </label>
              <Input
                required
                placeholder="e.g. Counter-Strike 2, Valorant"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="h-9 sm:h-9 text-xs"
              />
            </div>

            {/* Min and Max Players */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Min Players *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={addForm.minPlayers}
                  onChange={(e) => setAddForm({ ...addForm, minPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Max Players *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={addForm.maxPlayers}
                  onChange={(e) => setAddForm({ ...addForm, maxPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description
              </label>
              <Textarea
                placeholder="Game overview and player notes..."
                value={addForm.description}
                onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                className="text-xs min-h-20"
              />
            </div>

            {/* Active Switch */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 gap-2">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Active Status (<code className="font-mono text-[11px]">isActive</code>)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Allow bookings and game sessions immediately.
                </span>
              </div>
              <input
                type="checkbox"
                checked={addForm.isActive}
                onChange={(e) => setAddForm({ ...addForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-950 dark:accent-white cursor-pointer shrink-0"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAddOpen(false)}
                className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 justify-center h-9 sm:h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={addMutation.isPending}
                className="w-full sm:w-auto bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 justify-center h-9 sm:h-8"
              >
                {addMutation.isPending ? "Adding..." : "Add Game"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 4. UPDATE GAME MODAL (PUT/PATCH /games/:id) */}
      {/* ========================================================================= */}
      <Dialog open={!!editGame} onOpenChange={(open) => !open && setEditGame(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-zinc-950 text-white dark:bg-white dark:text-black">
                <Pencil className="h-4 w-4" />
              </div>
              <DialogTitle>Update Game</DialogTitle>
            </div>
            <DialogDescription>
              Update game record on server (<code className="font-mono text-xs">PATCH /games/:id</code>).
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitEdit} className="space-y-3.5">
            
            {/* Title */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Game Name *
              </label>
              <Input
                required
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="h-9 text-xs"
              />
            </div>

            {/* Min and Max Players */}
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Min Players *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={editForm.minPlayers}
                  onChange={(e) => setEditForm({ ...editForm, minPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                  Max Players *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={editForm.maxPlayers}
                  onChange={(e) => setEditForm({ ...editForm, maxPlayers: Number(e.target.value) })}
                  className="h-9 text-xs"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block mb-1">
                Description
              </label>
              <Textarea
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                className="text-xs min-h-20"
              />
            </div>

            {/* Status Checkbox */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 gap-2">
              <div>
                <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100 block">
                  Active Status (<code className="font-mono text-[11px]">isActive</code>)
                </span>
                <span className="text-[11px] text-zinc-500">
                  Toggle whether this title is currently playable.
                </span>
              </div>
              <input
                type="checkbox"
                checked={editForm.isActive}
                onChange={(e) => setEditForm({ ...editForm, isActive: e.target.checked })}
                className="h-4 w-4 rounded border-zinc-300 accent-zinc-950 dark:accent-white cursor-pointer shrink-0"
              />
            </div>

            <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditGame(null)}
                className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 justify-center h-9 sm:h-8"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateMutation.isPending}
                className="w-full sm:w-auto bg-zinc-950 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 justify-center h-9 sm:h-8"
              >
                {updateMutation.isPending ? "Updating..." : "Update Game"}
              </Button>
            </DialogFooter>

          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================================= */}
      {/* 5. DELETE GAME CONFIRMATION MODAL (DELETE /games/:id) */}
      {/* ========================================================================= */}
      <Dialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <DialogContent className="max-w-md w-full">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-md bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400">
                <Trash2 className="h-4 w-4" />
              </div>
              <DialogTitle>Delete Game</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to delete{" "}
              <strong className="text-zinc-950 dark:text-zinc-100 font-semibold">
                "{deleteCandidate?.name}"
              </strong>
              ? (<code className="font-mono text-xs">DELETE /games/{deleteCandidate?.id}</code>).
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-0 mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeleteCandidate(null)}
              className="w-full sm:w-auto border-zinc-200 dark:border-zinc-800 justify-center h-9 sm:h-8"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className="w-full sm:w-auto bg-red-600 text-white hover:bg-red-700 justify-center h-9 sm:h-8"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete Permanently"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
