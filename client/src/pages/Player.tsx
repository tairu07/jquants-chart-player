import { useEffect, useRef, useState, useMemo } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  Star,
  Home,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, LineSeries, HistogramSeries, CandlestickSeries } from "lightweight-charts";

export default function Player() {
  const { user, isAuthenticated } = useAuth();
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma1SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma2SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma3SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1000);
  const [showVolume, setShowVolume] = useState(true);

  const { data: universe = [] } = trpc.jquants.getUniverse.useQuery();
  const { data: settings } = trpc.settings.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });
  const { data: favorites = [] } = trpc.favorites.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const currentSymbol = universe[currentIndex];
  const { data: candles = [] } = trpc.jquants.getCandles.useQuery(
    { code: currentSymbol?.code || "" },
    { enabled: !!currentSymbol }
  );

  const addFavorite = trpc.favorites.add.useMutation();
  const removeFavorite = trpc.favorites.remove.useMutation();
  const utils = trpc.useUtils();

  const isFavorite = useMemo(() => {
    return favorites.some(f => f.code === currentSymbol?.code);
  }, [favorites, currentSymbol]);

  // チャート初期化
  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { color: "transparent" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#374151" },
        horzLines: { color: "#374151" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    chartRef.current = chart;

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#10b981",
      downColor: "#ef4444",
      borderUpColor: "#10b981",
      borderDownColor: "#ef4444",
      wickUpColor: "#10b981",
      wickDownColor: "#ef4444",
    });
    candlestickSeriesRef.current = candlestickSeries;

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#6366f1",
      priceFormat: {
        type: "volume",
      },
      priceScaleId: "volume",
    });
    volumeSeriesRef.current = volumeSeries;

    chart.priceScale("volume").applyOptions({
      scaleMargins: {
        top: 0.8,
        bottom: 0,
      },
    });

    sma1SeriesRef.current = chart.addSeries(LineSeries, {
      color: "#f59e0b",
      lineWidth: 1,
    });

    sma2SeriesRef.current = chart.addSeries(LineSeries, {
      color: "#3b82f6",
      lineWidth: 1,
    });

    sma3SeriesRef.current = chart.addSeries(LineSeries, {
      color: "#8b5cf6",
      lineWidth: 1,
    });

    const handleResize = () => {
      if (chartContainerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: chartContainerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.remove();
    };
  }, []);

  // チャートデータ更新
  useEffect(() => {
    if (!candles.length || !candlestickSeriesRef.current) return;

    const candleData: CandlestickData[] = candles.map((c: any) => ({
      time: c.date,
      open: c.open,
      high: c.high,
      low: c.low,
      close: c.close,
    }));

    const volumeData: HistogramData[] = candles.map((c: any) => ({
      time: c.date,
      value: c.volume,
      color: c.close >= c.open ? "#10b98180" : "#ef444480",
    }));

    candlestickSeriesRef.current.setData(candleData);
    if (volumeSeriesRef.current && showVolume) {
      volumeSeriesRef.current.setData(volumeData);
    }

    // SMA計算
    const sma1Period = settings?.sma1 || 5;
    const sma2Period = settings?.sma2 || 25;
    const sma3Period = settings?.sma3 || 75;

    const calculateSMA = (data: any[], period: number) => {
      const result = [];
      for (let i = period - 1; i < data.length; i++) {
        const sum = data.slice(i - period + 1, i + 1).reduce((acc, val) => acc + val.close, 0);
        result.push({
          time: data[i].date,
          value: sum / period,
        });
      }
      return result;
    };

    if (sma1SeriesRef.current) {
      sma1SeriesRef.current.setData(calculateSMA(candles, sma1Period));
    }
    if (sma2SeriesRef.current) {
      sma2SeriesRef.current.setData(calculateSMA(candles, sma2Period));
    }
    if (sma3SeriesRef.current) {
      sma3SeriesRef.current.setData(calculateSMA(candles, sma3Period));
    }

    chartRef.current?.timeScale().fitContent();
  }, [candles, showVolume, settings]);

  // 自動再生
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        if (prev >= universe.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, universe.length]);

  // キーボードショートカット
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying((prev) => !prev);
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentIndex((prev) => Math.min(prev + 1, universe.length - 1));
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentIndex((prev) => Math.max(prev - 1, 0));
          break;
        case "ArrowUp":
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.max(prev - 200, 200));
          break;
        case "ArrowDown":
          e.preventDefault();
          setPlaybackSpeed((prev) => Math.min(prev + 200, 3000));
          break;
        case "v":
        case "V":
          e.preventDefault();
          setShowVolume((prev) => !prev);
          break;
        case "*":
          e.preventDefault();
          handleToggleFavorite();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [universe.length, isFavorite, currentSymbol]);

  const handleToggleFavorite = async () => {
    if (!currentSymbol || !isAuthenticated) return;

    if (isFavorite) {
      await removeFavorite.mutateAsync({ code: currentSymbol.code });
    } else {
      await addFavorite.mutateAsync({
        code: currentSymbol.code,
        name: currentSymbol.name,
        market: currentSymbol.market,
        industry: currentSymbol.industry,
      });
    }
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
        <div className="container py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <Home className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h2 className="text-lg font-semibold">
                {currentSymbol?.code} - {currentSymbol?.name}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentSymbol?.market} / {currentSymbol?.industry}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={isFavorite ? "default" : "outline"}
              size="sm"
              onClick={handleToggleFavorite}
            >
              <Star className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`} />
            </Button>
            <Link href="/favorites">
              <Button variant="outline" size="sm">
                お気に入り
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="container max-w-7xl">
          <div ref={chartContainerRef} className="mb-4 rounded-lg border border-border" />

          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border border-border bg-card">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
                disabled={currentIndex === 0}
              >
                <SkipBack className="w-4 h-4" />
              </Button>
              <Button
                variant={isPlaying ? "secondary" : "default"}
                size="sm"
                onClick={() => setIsPlaying((prev) => !prev)}
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentIndex((prev) => Math.min(prev + 1, universe.length - 1))}
                disabled={currentIndex === universe.length - 1}
              >
                <SkipForward className="w-4 h-4" />
              </Button>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-sm">
                {currentIndex + 1} / {universe.length}
              </div>
              <div className="text-sm">
                速度: {(playbackSpeed / 1000).toFixed(1)}秒
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowVolume((prev) => !prev)}
              >
                {showVolume ? (
                  <Volume2 className="w-4 h-4" />
                ) : (
                  <VolumeX className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-lg border border-border bg-card">
            <h3 className="text-sm font-semibold mb-2">キーボードショートカット</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-muted-foreground">
              <div><kbd className="px-1 py-0.5 bg-muted rounded">Space</kbd> 再生/停止</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded">→</kbd> 次へ</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded">←</kbd> 前へ</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded">↑/↓</kbd> 速度調整</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded">V</kbd> 出来高表示</div>
              <div><kbd className="px-1 py-0.5 bg-muted rounded">*</kbd> お気に入り</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

