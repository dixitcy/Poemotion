import React, { PureComponent } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// Assign specific colors to each emotion
const emotionColors = {
  anger: "#FF6347", // tomato
  disgust: "#9ACD32", // yellow green
  fear: "#9400D3", // dark violet
  joy: "#FFD700", // gold
  sadness: "#1E90FF", // dodger blue
  surprise: "#FFA07A" // light salmon (add a color for 'surprise')
};

// Helper function to parse the emotion data
const parseEmotionData = (emotionData) => {
  if (!emotionData || typeof emotionData.emotions_normalized !== 'object') {
    console.error('Invalid emotion data:', emotionData);
    return [];
  }

  return Object.keys(emotionData.emotions_normalized).map(emotion => ({
    name: emotion,
    value: emotionData.emotions_normalized[emotion],
  }));
};

const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
  if (value === 0) {
    return null;
  }

  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 1.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {name} ({(percent * 100).toFixed(0)}%)
    </text>
  );
};

export default class EmotionPiechart extends PureComponent {
  render() {
    const { emotionData } = this.props;

    // Convert emotionData to an array suitable for the PieChart
    const chartData = parseEmotionData(emotionData);

    return (
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            dataKey="value"
            isAnimationActive={false}
            data={chartData}
            cx="50%"
            cy="50%"
            outerRadius={80}
            label={CustomLabel}
          >
            {
              chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={emotionColors[entry.name] || "#8884d8"} />
              ))
            }
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    );
  }
}