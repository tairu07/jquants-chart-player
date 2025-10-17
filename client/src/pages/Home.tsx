import { Button } from "@/components/ui/button";
import { BarChart3, Play } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border">
        <div className="container py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold">J-Quants Chart Player</h1>
          </div>
          <Link href="/player">
            <Button>
              <Play className="w-4 h-4 mr-2" />
              プレイヤー
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="max-w-4xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-bold">
              日本株チャート巡回ツール
            </h2>
            <p className="text-xl text-muted-foreground">
              東証上場全銘柄の日足チャートを自動再生で巡回。出来高と移動平均線を
              <br />
              重ねて高速レビュー。
            </p>
          </div>

          <Link href="/player">
            <Button size="lg" className="text-lg px-8 py-6">
              <Play className="w-5 h-5 mr-2" />
              チャートプレイヤーを開く
            </Button>
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">高速巡回</h3>
              <p className="text-muted-foreground">
                1秒/銘柄で全銘柄を自動再生。速度調整も自由自在。
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">キーボード操作</h3>
              <p className="text-muted-foreground">
                マウス不要。キーボードだけでテンポよく操作可能。
              </p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card">
              <h3 className="text-lg font-semibold mb-2">カスタマイズ</h3>
              <p className="text-muted-foreground">
                SMA期間、出来高表示、対数スケールなど自由に設定。
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="container text-center text-sm text-muted-foreground">
          © 2025 J-Quants Chart Player. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

