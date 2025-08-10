'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

interface ChartData {
  date: string
  attendanceRate: number
}

interface AttendanceChartProps {
  data: ChartData[]
}

export function AttendanceChart({ data }: AttendanceChartProps) {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="date" 
            tickFormatter={(date) => format(new Date(date), 'MMM dd')}
          />
          <YAxis 
            domain={[0, 100]}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip 
            labelFormatter={(date) => format(new Date(date), 'MMMM dd, yyyy')}
            formatter={(value: number) => [`${value}%`, 'Attendance Rate']}
          />
          <Line 
            type="monotone" 
            dataKey="attendanceRate" 
            stroke="hsl(var(--primary))" 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}