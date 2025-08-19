import { FC, memo, useState, useEffect, useCallback } from "react";
import { Cell, Legend, Pie, PieChart, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts";

export interface CategoryData {
  name: string;
  value: number;
}

const categoryData: CategoryData[] = [
  { name: "Anime & Manga", value: 35 },
  { name: "Video Games", value: 25 },
  { name: "Movies & TV", value: 15 },
  { name: "Comics & Superheroes", value: 12 },
  { name: "Traditional Filipino", value: 6 },
  { name: "Original Designs", value: 4 },
  { name: "Vtubers", value: 2 },
  { name: "K/J-pop", value: 1 },
];

const COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEEAD', '#FF9F9F', '#A8E6CF', '#DCD3FF'
];

interface ChartDimensions {
  width: number;
  height: number;
}

const CategoryPieChart: FC = memo(() => {
  const [dimensions, setDimensions] = useState<ChartDimensions>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: 400
  });

  const handleResize = useCallback(() => {
    setDimensions({
      width: window.innerWidth,
      height: window.innerWidth < 640 ? 300 :
        window.innerWidth < 1024 ? 350 : 400
    });
  }, []);

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const isMobile = dimensions.width < 640;
  /*   const isTablet = dimensions.width < 1024;
   */
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for small segments

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fontSize: isMobile ? '10px' : '12px' }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="w-full min-h-[250px]">
      <ResponsiveContainer width="100%" height={dimensions.height}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={isMobile ? 40 : 60}
            outerRadius={isMobile ? 70 : 100}
            fill="#8884d8"
            paddingAngle={4}
            dataKey="value"
            labelLine={false}
            label={renderCustomizedLabel}
          >
            {categoryData.map((_, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Legend
            layout={isMobile ? "horizontal" : "vertical"}
            align={isMobile ? "center" : "right"}
            verticalAlign={isMobile ? "bottom" : "middle"}
            iconSize={isMobile ? 8 : 10}
            wrapperStyle={{
              fontSize: isMobile ? '10px' : '12px',
              padding: isMobile ? '10px 0' : '0 0 0 20px',
              width: isMobile ? '100%' : 'auto',
              maxHeight: isMobile ? '100px' : undefined,
              overflowY: isMobile ? 'auto' : undefined
            }}
          />
          <RechartsTooltip
            formatter={(value: number, name: string) => [
              `${value} rentals`,
              name
            ]}
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #f1f5f9",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
              fontSize: isMobile ? '11px' : '12px',
              padding: '8px 12px'
            }}
            wrapperStyle={{ outline: 'none' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
});

CategoryPieChart.displayName = 'CategoryPieChart';

export default CategoryPieChart;