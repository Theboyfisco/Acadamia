"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

type CountChartProps = {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
};

const CountChart = ({ data }: CountChartProps) => {
  // Filter out zero values for better visualization
  const filteredData = data.filter(item => item.value > 0);

  if (filteredData.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <div className="text-4xl mb-2">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  const COLORS = filteredData.map(item => {
    // Extract color from className (e.g., "bg-blue-500" -> "#3B82F6")
    const colorMap: { [key: string]: string } = {
      'bg-blue-500': '#3B82F6',
      'bg-green-500': '#10B981',
      'bg-purple-500': '#8B5CF6',
      'bg-orange-500': '#F59E0B',
      'bg-red-500': '#EF4444',
      'bg-yellow-500': '#EAB308',
      'bg-pink-500': '#EC4899',
      'bg-indigo-500': '#6366F1',
    };
    return colorMap[item.color] || '#6B7280';
  });

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-md h-72 flex items-center">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Statistics Overview
      </h3>
      <ResponsiveContainer width="70%" height="90%">
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            outerRadius={60}
            fill="#8884d8"
            dataKey="value"
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value: number, name: string) => [value, name]}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #ccc',
              borderRadius: '4px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex-1 flex items-center justify-center h-full">
        <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ paddingLeft: 16 }} />
      </div>
    </div>
  );
};

export default CountChart;
