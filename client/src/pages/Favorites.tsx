import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Home, Trash2, Play } from "lucide-react";

export default function Favorites() {
  const { isAuthenticated } = useAuth();
  const { data: favorites = [], isLoading } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const removeFavorite = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const handleRemove = async (code: string) => {
    await removeFavorite.mutateAsync({ code });
    utils.favorites.list.invalidate();
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg mb-4">ログインが必要です</p>
          <Link href="/">
            <Button>ホームに戻る</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">お気に入り銘柄</h1>
          </div>
          <Link href="/player">
            <Button>
              <Play className="w-4 h-4 mr-2" />
              プレイヤー
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="container max-w-4xl">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">読み込み中...</p>
            </div>
          ) : favorites.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground mb-4">
                お気に入り銘柄がありません
              </p>
              <Link href="/player">
                <Button>
                  <Play className="w-4 h-4 mr-2" />
                  プレイヤーで銘柄を追加
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {favorites.map((favorite) => (
                <div
                  key={favorite.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
                >
                  <div>
                    <h3 className="font-semibold">
                      {favorite.code} - {favorite.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {favorite.market} / {favorite.industry}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemove(favorite.code)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

