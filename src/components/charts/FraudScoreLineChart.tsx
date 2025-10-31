import { useEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import * as am5xy from '@amcharts/amcharts5/xy'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type ChartData = {
  date: string
  count: number
  averageScore: number
  totalAmount: number
  lowCount: number
  mediumCount: number
  highCount: number
}

type FraudScoreLineChartProps = {
  data: ChartData[]
}

export function FraudScoreLineChart({ data }: FraudScoreLineChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<am5.Root | null>(null)

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return

    // Clean up existing root if it exists
    if (rootRef.current) {
      rootRef.current.dispose()
      rootRef.current = null
    }

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

    const dateAxisRenderer = am5xy.AxisRendererX.new(root, {})
    
    dateAxisRenderer.labels.template.setAll({
      fontSize: 11,
      fill: am5.color('#666666'),
    })

    const dateAxis = chart.xAxes.push(
      am5xy.DateAxis.new(root, {
        baseInterval: { timeUnit: 'day', count: 1 },
        renderer: dateAxisRenderer,
      })
    )

    const valueAxisRenderer = am5xy.AxisRendererY.new(root, {})
    
    valueAxisRenderer.labels.template.setAll({
      fontSize: 11,
      fill: am5.color('#666666'),
    })

    const valueAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: valueAxisRenderer,
      })
    )

    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: 'Average Fraud Score',
        xAxis: dateAxis,
        yAxis: valueAxis,
        valueYField: 'averageScore',
        valueXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: 'Score: {valueY}',
        }),
        stroke: am5.color('#8b5cf6'),
      })
    )

    series.data.setAll(
      data.map((item) => ({
        date: new Date(item.date).getTime(),
        averageScore: item.averageScore,
      }))
    )

    series.appear(1000)
    chart.appear(1000, 100)

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose()
        rootRef.current = null
      }
    }
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Average Fraud Score Trend</CardTitle>
        <CardDescription>Average fraud score over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
      </CardContent>
    </Card>
  )
}

