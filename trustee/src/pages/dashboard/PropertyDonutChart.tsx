import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface Props {
  totalAssets: number;
  soldFractions: number;
  availableFractions: number;
}

export default function PropertyDonutChart({ totalAssets, soldFractions, availableFractions }: Props) {
  const data = [
    { name: 'Total Property', value: totalAssets, color: '#FFB816' },
    { name: 'Sold Property', value: soldFractions, color: '#35C7BC' },
    { name: 'Total Fraction', value: availableFractions, color: '#217636' },
  ];

  return (
    <Card className="p-5">
      <div className="flex flex-col items-center gap-6 bg-[#121212] rounded-xl p-4">
        {/* Chart */}
        <div className="w-[180px] aspect-square">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} innerRadius={55} outerRadius={75} paddingAngle={2} dataKey="value">
                {data.map((item, index) => (
                  <Cell key={index} fill={item.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="space-y-3">
          {data.map((item) => (
            <div key={item.name} className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-sm text-white">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
