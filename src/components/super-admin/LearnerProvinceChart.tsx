'use client'

import React from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

interface LearnerProvinceData {
  province: string
  count: number
}

interface LearnerProvinceChartProps {
  data: LearnerProvinceData[]
}

export function LearnerProvinceChart({ data }: LearnerProvinceChartProps) {
  const colors = {
    'Western Cape': '#3B82F6',
    'Gauteng': '#10B981',
    'KwaZulu-Natal': '#F59E0B',
    'Eastern Cape': '#EF4444',
    'Free State': '#8B5CF6',
    'Limpopo': '#06B6D4',
    'Mpumalanga': '#F97316',
    'North West': '#84CC16',
    'Northern Cape': '#EC4899',
    'Other': '#6B7280'
  }

  const chartData = data.map(item => ({
    ...item,
    color: colors[item.province as keyof typeof colors] || '#6B7280'
  }))

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      const total = chartData.reduce((sum, item) => sum + item.count, 0)
      const percentage = ((data.value / total) * 100).toFixed(1)
      
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{data.name}</p>
          <p className="text-sm text-gray-600">
            Learners: <span className="font-semibold">{data.value}</span>
          </p>
          <p className="text-xs text-gray-500">
            {percentage}% of total
          </p>
        </div>
      )
    }
    return null
  }

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-gray-600">
              {entry.value} ({entry.payload.value})
            </span>
          </div>
        ))}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <p className="text-sm">No geographic distribution data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="count"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

