import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  getUserFavorites, 
  addFavorite, 
  removeFavorite,
  getUserSettings,
  upsertUserSettings 
} from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  jquants: router({
    // 銘柄リスト取得（モックデータ）
    getUniverse: publicProcedure
      .input(z.object({
        markets: z.array(z.string()).optional(),
        industries: z.array(z.string()).optional(),
      }).optional())
      .query(async ({ input }) => {
        // 実際のJ-Quants APIを呼び出す代わりに、モックデータを返す
        // 本番環境では、J-Quants APIの /listed/info エンドポイントを呼び出す
        const mockData = generateMockUniverse();
        return mockData;
      }),

    // 株価データ取得（モックデータ）
    getCandles: publicProcedure
      .input(z.object({
        code: z.string(),
        from: z.string().optional(),
        to: z.string().optional(),
      }))
      .query(async ({ input }) => {
        // 実際のJ-Quants APIを呼び出す代わりに、モックデータを返す
        // 本番環境では、J-Quants APIの /prices/daily_quotes エンドポイントを呼び出す
        const mockData = generateMockCandles(input.code);
        return mockData;
      }),

    // バッチ株価データ取得（モックデータ）
    getBatchCandles: publicProcedure
      .input(z.object({
        codes: z.array(z.string()),
        limit: z.number().optional(),
      }))
      .query(async ({ input }) => {
        const result: Record<string, any[]> = {};
        for (const code of input.codes) {
          result[code] = generateMockCandles(code);
        }
        return result;
      }),
  }),

  favorites: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getUserFavorites(ctx.user.id);
    }),

    add: protectedProcedure
      .input(z.object({
        code: z.string(),
        name: z.string().optional(),
        market: z.string().optional(),
        industry: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        await addFavorite({
          userId: ctx.user.id,
          code: input.code,
          name: input.name,
          market: input.market,
          industry: input.industry,
        });
        return { success: true };
      }),

    remove: protectedProcedure
      .input(z.object({
        code: z.string(),
      }))
      .mutation(async ({ ctx, input }) => {
        await removeFavorite(ctx.user.id, input.code);
        return { success: true };
      }),
  }),

  settings: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      const settings = await getUserSettings(ctx.user.id);
      return settings || {
        sma1: 5,
        sma2: 25,
        sma3: 75,
        playbackSpeed: 1000,
        showVolume: true,
        logScale: false,
        theme: "dark",
      };
    }),

    update: protectedProcedure
      .input(z.object({
        sma1: z.number().optional(),
        sma2: z.number().optional(),
        sma3: z.number().optional(),
        playbackSpeed: z.number().optional(),
        showVolume: z.boolean().optional(),
        logScale: z.boolean().optional(),
        theme: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const currentSettings = await getUserSettings(ctx.user.id);
        await upsertUserSettings({
          userId: ctx.user.id,
          sma1: input.sma1 ?? currentSettings?.sma1 ?? 5,
          sma2: input.sma2 ?? currentSettings?.sma2 ?? 25,
          sma3: input.sma3 ?? currentSettings?.sma3 ?? 75,
          playbackSpeed: input.playbackSpeed ?? currentSettings?.playbackSpeed ?? 1000,
          showVolume: input.showVolume ?? currentSettings?.showVolume ?? true,
          logScale: input.logScale ?? currentSettings?.logScale ?? false,
          theme: input.theme ?? currentSettings?.theme ?? "dark",
        });
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;

// モックデータ生成関数
function generateMockUniverse() {
  const markets = ["Prime", "Standard", "Growth"];
  const industries = [
    "水産・農林業", "鉱業", "建設業", "食料品", "繊維製品", 
    "パルプ・紙", "化学", "医薬品", "石油・石炭製品", "ゴム製品",
    "ガラス・土石製品", "鉄鋼", "非鉄金属", "金属製品", "機械",
    "電気機器", "輸送用機器", "精密機器", "その他製品", "電気・ガス業",
    "陸運業", "海運業", "空運業", "倉庫・運輸関連業", "情報・通信業",
    "卸売業", "小売業", "銀行業", "証券、商品先物取引業", "保険業",
    "その他金融業", "不動産業", "サービス業"
  ];

  const universe = [];
  for (let i = 1301; i <= 9999; i += 10) {
    const code = i.toString();
    universe.push({
      code,
      name: `銘柄${code}`,
      market: markets[Math.floor(Math.random() * markets.length)],
      industry: industries[Math.floor(Math.random() * industries.length)],
    });
  }
  
  return universe;
}

function generateMockCandles(code: string) {
  const candles = [];
  const basePrice = 1000 + Math.random() * 4000;
  const startDate = new Date("2020-01-01");
  const endDate = new Date();
  
  let currentPrice = basePrice;
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    // 土日をスキップ
    if (d.getDay() === 0 || d.getDay() === 6) continue;
    
    const change = (Math.random() - 0.5) * currentPrice * 0.05;
    currentPrice += change;
    
    const open = currentPrice;
    const high = open + Math.random() * open * 0.03;
    const low = open - Math.random() * open * 0.03;
    const close = low + Math.random() * (high - low);
    const volume = Math.floor(Math.random() * 1000000) + 10000;
    
    candles.push({
      date: d.toISOString().split('T')[0],
      open: Math.round(open * 100) / 100,
      high: Math.round(high * 100) / 100,
      low: Math.round(low * 100) / 100,
      close: Math.round(close * 100) / 100,
      volume,
    });
    
    currentPrice = close;
  }
  
  return candles;
}

