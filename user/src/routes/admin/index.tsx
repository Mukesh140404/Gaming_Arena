import { createFileRoute } from '@tanstack/react-router';
import { GamesManagement } from '@/components/admin/games-management';

export const Route = createFileRoute('/admin/')({
  component: GamesManagement,
});
