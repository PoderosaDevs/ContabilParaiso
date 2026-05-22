import { DadoGraficoLinha } from "@/services/dashboard-routes";
import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

interface RevenueChartProps {
  chartData: DadoGraficoLinha[];
}

// Mapeamento estático de cores para os principais players para garantir identidade visual da marca
const CORES_MARKETPLACES: Record<string, string> = {
  "MERCADO LIVRE": "#FFE600",
  "SHOPEE": "#EE4D2D",
  "MAGALU": "#0086FF",
  "AMAZON": "#FF9900",
  "BELEZA NA WEB": "#D9186C",
  "ÉPOCA": "#E5007D",
};

// Cores coringa caso apareça um novo marketplace inesperado
const CORES_FALLBACK = ["#10B981", "#6366F1", "#8B5CF6", "#EC4899", "#F59E0B", "#3B82F6"];

export function RevenueChart({ chartData }: RevenueChartProps) {
  
  const { dadosFormatados, marketplacesUnicos } = useMemo(() => {
    const mesesOrdem = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];
    
    const agrupado = chartData.reduce((acc: any[], curr) => {
      const nomeMktUpper = curr.marketplace.toUpperCase().trim();
      let itemMes = acc.find((i) => i.name === curr.mes);
      if (!itemMes) {
        itemMes = { name: curr.mes };
        acc.push(itemMes);
      }
      itemMes[nomeMktUpper] = curr.valorTotal;
      return acc;
    }, []);

    const ordenados = agrupado.sort((a, b) => mesesOrdem.indexOf(a.name) - mesesOrdem.indexOf(b.name));
    const unicos = Array.from(new Set(chartData.map((c) => c.marketplace.toUpperCase().trim())));

    return { dadosFormatados: ordenados, marketplacesUnicos: unicos };
  }, [chartData]);

  // Formata os números longos do eixo Y para K (Mil) ou M (Milhão) para não apertar o layout
  const formatYAxis = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}K`;
    return `R$ ${value}`;
  };

  return (
    <div className="bg-card rounded-xl border border-border/60 p-6 shadow-sm flex flex-col justify-between h-full min-h-[460px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold tracking-tight text-foreground">
          Vendas por Marketplace
        </h3>
        <p className="text-xs text-muted-foreground">
          Evolução mensal com base no ICMS declarado por canal
        </p>
      </div>

      <div className="h-[320px] w-100 mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={dadosFormatados} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="4 4" stroke="rgba(var(--border), 0.15)" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatYAxis}
              dx={-5}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "10px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)"
              }}
              labelStyle={{ fontWeight: 600, color: "hsl(var(--foreground))", marginBottom: "4px" }}
              formatter={(value: any) => [`R$ ${Number(value).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36} 
              iconType="circle" 
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", paddingTop: "15px" }}
            />
            {marketplacesUnicos.map((mktName, index) => {
              const cor = CORES_MARKETPLACES[mktName] || CORES_FALLBACK[index % CORES_FALLBACK.length];
              return (
                <Line
                  key={mktName}
                  type="monotone"
                  dataKey={mktName}
                  name={mktName}
                  stroke={cor}
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 5, strokeWidth: 0 }}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}