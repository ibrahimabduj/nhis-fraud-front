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

type FraudScoreBarChartProps = {
  data: ChartData[]
}

export function FraudScoreBarChart({ data }: FraudScoreBarChartProps) {
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
        paddingLeft: 0,
      })
    )

    const dateAxisRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
    })
    
    dateAxisRenderer.labels.template.setAll({
      fontSize: 11,
      fill: am5.color('#666666'),
    })

    const dateAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'date',
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
      am5xy.ColumnSeries.new(root, {
        name: 'Claims Count',
        xAxis: dateAxis,
        yAxis: valueAxis,
        valueYField: 'count',
        categoryXField: 'date',
        fill: am5.color('#3b82f6'),
      })
    )

    dateAxis.data.setAll(
      data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      }))
    )

    series.data.setAll(
      data.map((item) => ({
        date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        count: item.count,
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
        <CardTitle>Claims by Date</CardTitle>
        <CardDescription>Number of claims per day</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
      </CardContent>
    </Card>
  )
}

