import { useEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import * as am5xy from '@amcharts/amcharts5/xy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type FraudScoreChartProps = {
  data: Array<{ date: string; score: number; amount: number }>
}

export function FraudScoreChart({ data }: FraudScoreChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<am5.Root | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    const root = am5.Root.new(chartRef.current)
    rootRef.current = root

    root.setThemes([am5themes_Animated.new(root)])

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: 'panX',
        wheelY: 'zoomX',
        pinchZoomX: true,
        paddingLeft: 0,
      })
    )

    const dateAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {}),
      })
    )

    const valueAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    )

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Fraud Score',
        xAxis: dateAxis,
        yAxis: valueAxis,
        valueYField: 'score',
        valueXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: '{valueY}',
        }),
      })
    )

    series.data.setAll(
      data.map((item) => ({
        date: new Date(item.date).getTime(),
        score: item.score,
      }))
    )

    series.appear(1000)
    chart.appear(1000, 100)

    return () => {
      root.dispose()
    }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Score Trends</CardTitle>
        <CardDescription>Average fraud score over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
      </CardContent>
    </Card>
  )
}

