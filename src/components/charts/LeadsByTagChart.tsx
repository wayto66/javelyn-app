import dynamic from "next/dynamic";
import React from "react";
import { Lead } from "~/types/graphql";
const ReactApexChart = dynamic(() => import("react-apexcharts"), {
  ssr: false,
});
interface IParams {
  leads: Lead[];
}

const LeadsByTagChart = ({ leads }: IParams) => {
  // Extrair tags e contar o número de leads para cada tag
  const tagCounts: Record<string, number> = {};
  leads.forEach((lead) => {
    lead.tags?.forEach((tag) => {
      if (!tag) return;
      if (tagCounts[tag.name]) {
        tagCounts[tag.name]++;
      } else {
        tagCounts[tag.name] = 1;
      }
    });
  });

  // Preparar dados para o gráfico de barras
  const series = [
    {
      data: Object.values(tagCounts),
    },
  ];
  const options: ApexCharts.ApexOptions = {
    chart: {
      type: "bar",
      height: 350,
      toolbar: {
        show: false,
      },
    },
    plotOptions: {
      bar: {
        horizontal: true,
      },
    },
    dataLabels: {
      enabled: false,
    },
    xaxis: {
      categories: Object.keys(tagCounts),
    },
    tooltip: {
      y: {
        formatter: function (val) {
          return val + " leads";
        },
      },
    },
  };
  if (typeof window === "undefined") return <></>;
  return (
    <div>
      <h3>Contagem de Leads por Tag</h3>
      <ReactApexChart
        options={options}
        series={series}
        type="bar"
        height={350}
      />
    </div>
  );
};

export default LeadsByTagChart;
