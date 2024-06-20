import dynamic from "next/dynamic";
import React, { useState, useEffect } from "react";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
import { Lead } from "~/types/graphql";

export interface ILeadsByDayChartParams {
  leads: Lead[];
  viewType: "daily" | "weekly" | "monthly";
  className?: string;
}

interface IChartData {
  series: ApexAxisChartSeries | ApexNonAxisChartSeries;
  categories: ApexXAxis["categories"];
}

export const LeadsByDayChart = ({
  leads,
  viewType,
  className,
}: ILeadsByDayChartParams) => {
  const [chartData, setChartData] = useState<IChartData>({
    series: [],
    categories: [],
  });

  useEffect(() => {
    // Função para agrupar leads por dia, semana ou mês
    const groupLeadsByDate = () => {
      const leadsByDate: Record<string, number> = {};
      leads.forEach((lead) => {
        let createdAt;
        switch (viewType) {
          case "daily":
            createdAt = new Date(lead.createdAt).toLocaleDateString();
            break;
          case "weekly":
            const weekStart = new Date(lead.createdAt);
            weekStart.setHours(0, 0, 0, 0);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay());
            createdAt = weekStart.toLocaleDateString();
            break;
          case "monthly":
            createdAt = new Date(lead.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
            });
            break;
          default:
            createdAt = new Date(lead.createdAt).toLocaleDateString();
            break;
        }

        if (leadsByDate[createdAt]) {
          leadsByDate[createdAt]++;
        } else {
          leadsByDate[createdAt] = 1;
        }
      });

      // Ordenar as datas, se necessário
      const sortedDates = Object.keys(leadsByDate).sort((a, b) => {
        const dateA = new Date(a);
        const dateB = new Date(b);
        return dateA.getTime() - dateB.getTime();
      });

      // Preparar séries e categorias para o gráfico
      const series = [
        {
          name: "Leads",
          data: sortedDates.map((date) => leadsByDate[date] ?? null),
        },
      ];
      const categories = sortedDates;

      return { series, categories };
    };

    // Atualizar state com os dados do gráfico
    setChartData(groupLeadsByDate());
  }, [leads, viewType]);

  const { series, categories } = chartData;

  // Opções do gráfico
  const options: ApexCharts.ApexOptions = {
    chart: {
      height: 350,
      type: "line",
      toolbar: {
        show: false,
      },
    },
    xaxis: {
      categories: categories,
    },
    yaxis: {
      title: {
        text: "Número de Leads",
      },
    },
    tooltip: {
      x: {
        format: viewType === "monthly" ? undefined : "dd/MM/yyyy",
      },
    },
  };

  if (typeof window === "undefined") return <></>;
  return (
    <div className={className}>
      <h3>
        Contagem de Leads por{" "}
        {viewType === "monthly"
          ? "Mês"
          : viewType === "weekly"
          ? "Semana"
          : "Dia"}
      </h3>
      <ReactApexChart
        options={options}
        series={series}
        type="line"
        height={350}
      />
    </div>
  );
};
