import { useEffect, useRef } from 'react'
import * as am5 from '@amcharts/amcharts5'
import * as am5percent from '@amcharts/amcharts5/percent'
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type FraudCategoryChartProps = {
  lowCount: number
  mediumCount: number
  highCount: number
}

export function FraudCategoryChart({ lowCount, mediumCount, highCount }: FraudCategoryChartProps) {
  const chartRef = useRef<HTMLDivElement>(null)
  const rootRef = useRef<am5.Root | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Clean up existing root if it exists
    if (rootRef.current) {
      rootRef.current.dispose()
      rootRef.current = null
    }

    const root = am5.Root.new(chartRef.current)
    rootRef.current = root

    root.setThemes([am5themes_Animated.new(root)])

    // Create chart
    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        layout: root.verticalLayout,
        innerRadius: am5.percent(50),
        radius: am5.percent(85),
      })
    )

    // Create series
    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        valueField: 'value',
        categoryField: 'category',
        alignLabels: false,
      })
    )

    // Set data with colors
    series.data.setAll([
      { category: 'Low', value: lowCount, fill: am5.color('#10b981') },
      { category: 'Medium', value: mediumCount, fill: am5.color('#f59e0b') },
      { category: 'High', value: highCount, fill: am5.color('#ef4444') },
    ])

    // Apply colors from data
    series.slices.template.adapters.add('fill', (fill, target) => {
      return target.dataItem?.dataContext?.fill || fill
    })

    // Configure slice appearance
    series.slices.template.setAll({
      stroke: am5.color('#ffffff'),
      strokeWidth: 2,
    })

    // Hide labels on slices
    series.labels.template.setAll({
      forceInactive: true,
      visible: false,
    })

    // Add legend
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.percent(50),
        x: am5.percent(50),
        layout: root.horizontalLayout,
        marginTop: 30,
        marginBottom: 10,
      })
    )

    legend.data.setAll(series.dataItems)

    // Configure legend labels
    legend.labels.template.setAll({
      fontSize: 13,
      fontWeight: '500',
      fill: am5.color('#000000'),
    })

    legend.markers.template.setAll({
      width: 14,
      height: 14,
    })

    // Format legend text with values
    legend.labels.template.adapters.add('text', (text, target) => {
      const dataItem = target.dataItem as any
      if (dataItem?.dataContext) {
        const category = dataItem.dataContext.category
        const value = dataItem.dataContext.value
        const total = lowCount + mediumCount + highCount
        const percentage = total > 0 ? ((value / total) * 100).toFixed(2) : '0.00'
        return `${category}: ${percentage}%`
      }
      return text || ''
    })

    series.appear(1000, 100)

    return () => {
      if (rootRef.current) {
        rootRef.current.dispose()
        rootRef.current = null
      }
    }
  }, [lowCount, mediumCount, highCount])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fraud Category Distribution</CardTitle>
        <CardDescription>Distribution of claims by risk category</CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={chartRef} style={{ width: '100%', height: '400px' }} />
      </CardContent>
    </Card>
  )
}

