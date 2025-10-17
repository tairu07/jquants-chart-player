import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { APP_TITLE, getLoginUrl } from "@/const";
import { Link } from "wouter";
import { Play, Star, BarChart3 } from "lucide-react";

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">{APP_TITLE}</h1>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-muted-foreground">
                  {user?.name || user?.email}
                </span>
                <Link href="/player">
                  <Button variant="default">
                    <Play className="w-4 h-4 mr-2" />
                    プレイヤー
                  </Button>
                </Link>
                <Link href="/favorites">
                  <Button variant="outline">
                    <Star className="w-4 h-4 mr-2" />
                    お気に入り
                  </Button>
                </Link>
              </>
            ) : (
              <Button asChild>
                <a href={getLoginUrl()}>ログイン</a>
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="container max-w-4xl text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-5xl font-bold tracking-tight">
              日本株チャート巡回ツール
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              東証上場全銘柄の日足チャートを自動再生で巡回。
              出来高と移動平均線を重ねて高速レビュー。
            </p>
          </div>

          <div className="flex items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link href="/player">
                <Button size="lg" className="text-lg px-8 py-6">
                  <Play className="w-5 h-5 mr-2" />
                  チャートプレイヤーを開く
                </Button>
              </Link>
            ) : (
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <a href={getLoginUrl()}>
                  今すぐ始める
                </a>
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">高速巡回</h3>
              <p className="text-sm text-muted-foreground">
                1秒/銘柄で全銘柄を自動再生。速度調整も自由自在。
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">キーボード操作</h3>
              <p className="text-sm text-muted-foreground">
                マウス不要。キーボードだけでテンポよく操作可能。
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">カスタマイズ</h3>
              <p className="text-sm text-muted-foreground">
                SMA期間、出来高表示、対数スケールなど自由に設定。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          <p>© 2025 J-Quants Chart Player. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

