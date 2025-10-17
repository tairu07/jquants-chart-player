import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Pause,
  Play,
  Settings,
  Volume2,
  VolumeX,
} from "lucide-react";
import { createChart, IChartApi, ISeriesApi, CandlestickData, HistogramData, LineData, LineSeries, HistogramSeries, CandlestickSeries } from "lightweight-charts";
import { Link } from "wouter";

// モックデータ生成関数
function generateMockData(days: number = 200) {
  const data: CandlestickData[] = [];
  const volumeData: HistogramData[] = [];
  let basePrice = 1000 + Math.random() * 4000;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));
    const time = date.toISOString().split('T')[0] as any;
    
    const change = (Math.random() - 0.5) * basePrice * 0.05;
    basePrice = Math.max(100, basePrice + change);
    
    const open = basePrice;
    const close = basePrice + (Math.random() - 0.5) * basePrice * 0.03;
    const high = Math.max(open, close) + Math.random() * basePrice * 0.02;
    const low = Math.min(open, close) - Math.random() * basePrice * 0.02;
    
    data.push({ time, open, high, low, close });
    volumeData.push({
      time,
      value: Math.floor(Math.random() * 10000000) + 1000000,
      color: close >= open ? "#10b98180" : "#ef444480",
    });
  }
  
  return { data, volumeData };
}

// モック銘柄リスト
const mockStocks = [
  { code: "7203", name: "トヨタ自動車", market: "東証プライム", industry: "輸送用機器" },
  { code: "9984", name: "ソフトバンクグループ", market: "東証プライム", industry: "情報・通信業" },
  { code: "6758", name: "ソニーグループ", market: "東証プライム", industry: "電気機器" },
  { code: "9983", name: "ファーストリテイリング", market: "東証プライム", industry: "小売業" },
  { code: "8306", name: "三菱UFJフィナンシャル・グループ", market: "東証プライム", industry: "銀行業" },
];

export default function Player() {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const candlestickSeriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const volumeSeriesRef = useRef<ISeriesApi<"Histogram"> | null>(null);
  const sma1SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma2SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma3SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.0);
  const [showVolume, setShowVolume] = useState(true);
  const [showSMA, setShowSMA] = useState(true);
  const [sma1Period, setSma1Period] = useState(5);
  const [sma2Period, setSma2Period] = useState(25);
  const [sma3Period, setSma3Period] = useState(75);
  const [logScale, setLogScale] = useState(false);

  const currentStock = mockStocks[currentIndex];

  useEffect(() => {
    if (!chartContainerRef.current) return;

    const chart = chartRef.current || createChart(chartContainerRef.current, {
      layout: {
        background: { color: "#0a0a0a" },
        textColor: "#d1d5db",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      width: chartContainerRef.current.clientWidth,
      height: 500,
      rightPriceScale: {
        mode: logScale ? 1 : 0,
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
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!candlestickSeriesRef.current || !volumeSeriesRef.current) return;

    const { data, volumeData } = generateMockData();
    candlestickSeriesRef.current.setData(data);
    volumeSeriesRef.current.setData(volumeData);

    if (showSMA && sma1SeriesRef.current && sma2SeriesRef.current && sma3SeriesRef.current) {
      const sma1Data = calculateSMA(data, sma1Period);
      const sma2Data = calculateSMA(data, sma2Period);
      const sma3Data = calculateSMA(data, sma3Period);
      
      sma1SeriesRef.current.setData(sma1Data);
      sma2SeriesRef.current.setData(sma2Data);
      sma3SeriesRef.current.setData(sma3Data);
    }
  }, [currentIndex, showSMA, sma1Period, sma2Period, sma3Period]);

  useEffect(() => {
    if (volumeSeriesRef.current) {
      volumeSeriesRef.current.applyOptions({
        visible: showVolume,
      });
    }
  }, [showVolume]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.applyOptions({
        rightPriceScale: {
          mode: logScale ? 1 : 0,
        },
      });
    }
  }, [logScale]);

  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % mockStocks.length);
    }, speed * 1000);

    return () => clearInterval(interval);
  }, [isPlaying, speed]);

  const calculateSMA = (data: CandlestickData[], period: number) => {
    const smaData: LineData[] = [];
    for (let i = period - 1; i < data.length; i++) {
      let sum = 0;
      for (let j = 0; j < period; j++) {
        sum += data[i - j].close;
      }
      smaData.push({
        time: data[i].time,
        value: sum / period,
      });
    }
    return smaData;
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + mockStocks.length) % mockStocks.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % mockStocks.length);
  };

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
            <div>
              <h1 className="text-xl font-bold">
                {currentStock.code} - {currentStock.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {currentStock.market} / {currentStock.industry}
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {currentIndex + 1} / {mockStocks.length}
          </div>
        </div>
      </header>

      <main className="flex-1 p-4">
        <div className="container max-w-7xl">
          <div ref={chartContainerRef} className="mb-4 rounded-lg overflow-hidden border border-border" />

          <div className="flex items-center justify-center gap-4 mb-6">
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Settings className="w-5 h-5" />
              <h2 className="text-lg font-semibold">設定</h2>
            </div>

            <div className="space-y-6">
              <div>
                <Label className="mb-2 block">
                  再生速度: {speed.toFixed(1)}秒/銘柄
                </Label>
                <Slider
                  value={[speed]}
                  onValueChange={(v) => setSpeed(v[0])}
                  min={0.2}
                  max={3.0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="volume-toggle" className="flex items-center gap-2">
                  {showVolume ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  出来高表示
                </Label>
                <Switch
                  id="volume-toggle"
                  checked={showVolume}
                  onCheckedChange={setShowVolume}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sma-toggle">移動平均線表示</Label>
                <Switch
                  id="sma-toggle"
                  checked={showSMA}
                  onCheckedChange={setShowSMA}
                />
              </div>

              {showSMA && (
                <div className="space-y-4 pl-4 border-l-2 border-border">
                  <div>
                    <Label className="mb-2 block text-amber-500">
                      SMA1: {sma1Period}日
                    </Label>
                    <Slider
                      value={[sma1Period]}
                      onValueChange={(v) => setSma1Period(v[0])}
                      min={3}
                      max={50}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-blue-500">
                      SMA2: {sma2Period}日
                    </Label>
                    <Slider
                      value={[sma2Period]}
                      onValueChange={(v) => setSma2Period(v[0])}
                      min={10}
                      max={100}
                      step={1}
                    />
                  </div>
                  <div>
                    <Label className="mb-2 block text-purple-500">
                      SMA3: {sma3Period}日
                    </Label>
                    <Slider
                      value={[sma3Period]}
                      onValueChange={(v) => setSma3Period(v[0])}
                      min={20}
                      max={200}
                      step={1}
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between">
                <Label htmlFor="log-scale">対数スケール</Label>
                <Switch
                  id="log-scale"
                  checked={logScale}
                  onCheckedChange={setLogScale}
                />
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
}

