import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { IconTrendingUp, IconTrendingDown, IconFileAnalytics, IconCalendar } from '@tabler/icons-react'
import { getJson } from '@/lib/api'
import { FraudCategoryChart } from '@/components/charts/FraudCategoryChart'
import { FraudScoreBarChart } from '@/components/charts/FraudScoreBarChart'
import { FraudScoreLineChart } from '@/components/charts/FraudScoreLineChart'
import { FraudAmountAreaChart } from '@/components/charts/FraudAmountAreaChart'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'

type MetricsDto = {
  totalClaims: number
  averageAmount: number
  highRiskCount: number
  highRiskPercent: number
  lowCount: number
  mediumCount: number
  highCount: number
}

type ChartDataDto = {
  date: string
  count: number
  averageScore: number
  totalAmount: number
  lowCount: number
  mediumCount: number
  highCount: number
}

export function DashboardPage() {
  const [metrics, setMetrics] = useState<MetricsDto | null>(null)
  const [chartData, setChartData] = useState<ChartDataDto[]>([])
  const [error, setError] = useState<string | null>(null)
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  useEffect(() => {
    document.title = 'Dashboard - NHIS Fraud Auditor'
  }, [])

  useEffect(() => {
    getJson<MetricsDto>('/api/v1/metrics')
      .then(setMetrics)
      .catch((e) => setError(e.message))
  }, [])

  useEffect(() => {
    const params = new URLSearchParams()
    if (startDate) params.append('startDate', startDate)
    if (endDate) params.append('endDate', endDate)
    
    const url = `/api/v1/metrics/chart-data${params.toString() ? '?' + params.toString() : ''}`
    
    getJson<ChartDataDto[]>(url)
      .then((data) => {
        console.log('Chart data loaded:', data.length, 'data points')
        setChartData(data)
      })
      .catch((e) => {
        console.error('Failed to load chart data:', e)
        setChartData([])
      })
  }, [startDate, endDate])

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="grid gap-4 p-4 lg:gap-6 lg:p-6 overflow-visible" style={{ overflow: 'visible' }}>
          {error && <div className="text-destructive">{error}</div>}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-lg font-semibold leading-none">Dashboard</h1>
              <p className="text-muted-foreground text-sm">Overview of claims and fraud analytics</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <IconCalendar className="size-4 text-muted-foreground" />
                <Label htmlFor="startDate" className="text-sm">From:</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-40"
                />
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="endDate" className="text-sm">To:</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-40"
                />
              </div>
              {(startDate || endDate) && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setStartDate('')
                    setEndDate('')
                  }}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <MetricCard
              title="Total Claims"
              value={metrics ? metrics.totalClaims.toLocaleString() : '—'}
              Icon={IconFileAnalytics}
            />
            <MetricCard
              title="Average Amount"
              value={metrics ? `$${metrics.averageAmount.toFixed(2)}` : '—'}
              Icon={IconTrendingUp}
            />
            <MetricCard
              title="High Risk"
              value={metrics ? `${metrics.highRiskCount.toLocaleString()} (${metrics.highRiskPercent.toFixed(1)}%)` : '—'}
              Icon={IconTrendingDown}
            />
          </div>
          {metrics && (
            <div className="flex justify-center overflow-visible" style={{ overflow: 'visible' }}>
              <div className="w-full max-w-2xl overflow-visible" style={{ overflow: 'visible' }}>
                <FraudCategoryChart
                  lowCount={metrics.lowCount}
                  mediumCount={metrics.mediumCount}
                  highCount={metrics.highCount}
                />
              </div>
            </div>
          )}
          {chartData.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <FraudScoreBarChart data={chartData} />
                <FraudScoreLineChart data={chartData} />
              </div>
              <div className="grid grid-cols-1 gap-4">
                <FraudAmountAreaChart data={chartData} />
              </div>
            </>
          ) : (
            metrics && metrics.totalClaims > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>No Chart Data Available</CardTitle>
                  <CardDescription>
                    Chart data requires claims with encounter dates. Please ensure your data includes valid encounter dates.
                  </CardDescription>
                </CardHeader>
              </Card>
            )
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

type MetricCardProps = {
  title: string
  value: string
  deltaValue?: string
  deltaLabel?: string
  positive?: boolean
  Icon: React.ComponentType<{ className?: string }>
}

function MetricCard({ title, value, deltaValue, deltaLabel, positive = true, Icon }: MetricCardProps) {
  return (
    <Card className="relative">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
          </div>
          <div className="bg-primary/15 text-primary grid size-9 place-items-center rounded-xl">
            <Icon className="size-5" />
          </div>
        </div>
        {(deltaValue || deltaLabel) && (
          <CardDescription className="mt-3 flex items-center gap-2 text-[13px]">
            <span
              className={
                positive
                  ? 'bg-teal-500 inline-block size-3 rounded-sm'
                  : 'bg-red-500 inline-block size-3 rounded-sm'
              }
            />
            <span className={positive ? 'text-teal-600 font-semibold' : 'text-red-600 font-semibold'}>
              {deltaValue}
            </span>
            <span className="text-muted-foreground">{deltaLabel}</span>
          </CardDescription>
        )}
      </CardHeader>
    </Card>
  )
}

