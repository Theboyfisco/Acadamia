"use client";
import Image from "next/image";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
} from "recharts";

const CountChart = ({ boys, girls }: { boys: number; girls: number }) => {
  const data = [
    {
      name: "Total",
      count: boys+girls,
      fill: "#374151",
    },
    {
      name: "Girls",
      count: girls,
      fill: "#F87171",
    },
    {
      name: "Boys",
      count: boys,
      fill: "#60A5FA",
    },
  ];
  return (
    <div className="relative w-full h-[75%]">
      <ResponsiveContainer>
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="40%"
          outerRadius="100%"
          barSize={32}
          data={data}
        >
          <RadialBar background dataKey="count" />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <Image
          src="/maleFemale.png"
          alt=""
          width={50}
          height={50}
          className="opacity-90 brightness-110 [filter:hue-rotate(180deg)_saturate(200%)]"
        />
      </div>
    </div>
  );
};

export default CountChart;
