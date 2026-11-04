import { Card, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

type ChartData = {
  name: string;
  value: number;
  color: string;
};

const data: ChartData[] = [
  { name: 'Pending', value: 70, color: '#FFC21C' },
  { name: 'Rejected', value: 15, color: '#9ADFFF' },
  { name: 'Approved', value: 15, color: '#6A4CFF' },
];

// Label inside slices (dark theme)
const renderLabel = ({ cx, cy, midAngle, outerRadius, name }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="#ffffff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={12}
      fontWeight={500}
    >
      {name}
    </text>
  );
};

export default function StatusPieChart() {
  return (
    <Card className="p-5">
      <CardTitle>All Request Graph</CardTitle>

      <div className="flex items-center justify-center mt-4">
        <div className="w-[200px] sm:w-[240px] md:w-[280px] aspect-square bg-[#121212] rounded-xl p-3">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                cx="50%"
                cy="50%"
                outerRadius="80%"
                label={renderLabel}
                labelLine={false}
                isAnimationActive
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}
