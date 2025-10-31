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

type FraudAmountAreaChartProps = {
  data: ChartData[]
}

export function FraudAmountAreaChart({ data }: FraudAmountAreaChartProps) {
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
      am5xy.SmoothedXLineSeries.new(root, {
        name: 'Total Amount',
        xAxis: dateAxis,
        yAxis: valueAxis,
        valueYField: 'totalAmount',
        valueXField: 'date',
        tooltip: am5.Tooltip.new(root, {
          labelText: 'Amount: {valueY}',
        }),
        fill: am5.color('#10b981'),
        stroke: am5.color('#10b981'),
      })
    )

    series.fills.template.setAll({
      fillOpacity: 0.5,
      visible: true,
    })

    series.data.setAll(
      data.map((item) => ({
        date: new Date(item.date).getTime(),
        totalAmount: typeof item.totalAmount === 'number' ? item.totalAmount : (typeof item.totalAmount === 'string' ? parseFloat(item.totalAmount) : 0),
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
        <CardTitle>Total Amount Trend</CardTitle>
        <CardDescription>Total amount billed over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: '350px' }} />
      </CardContent>
    </Card>
  )
}

