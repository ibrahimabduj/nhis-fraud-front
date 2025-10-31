import { useEffect, useMemo, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { getJson } from '@/lib/api'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { IconEye } from '@tabler/icons-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ClaimsFilters } from '@/components/ClaimsFilters'
import { Badge } from '@/components/ui/badge'

type ScoreCategory = 'LOW' | 'MEDIUM' | 'HIGH'

type ClaimResponseDto = {
  id: string
  patientId: string
  age: number | null
  gender: string | null
  encounterDate: string | null
  dischargeDate: string | null
  amountBilled: string | number | null
  diagnosis: string | null
  fraudType: string | null
  fraudScore: number | null
  scoreCategory: ScoreCategory | null
  scoreReasons: string | null
}

type Page<T> = {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function ClaimsPage() {
  const [pageIndex, setPageIndex] = useState(0)
  const [page, setPage] = useState<Page<ClaimResponseDto> | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [size, setSize] = useState(15)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState({
    patientId: '',
    gender: '',
    diagnosis: '',
    minScore: '',
    maxScore: '',
    scoreCategory: '',
    startDate: '',
    endDate: '',
  })

  useEffect(() => {
    document.title = 'Claims Review - NHIS Fraud Auditor'
  }, [])

  useEffect(() => {
    setPageIndex(0)
  }, [filters, searchQuery])

  useEffect(() => {
    const params = new URLSearchParams({ 
      page: String(pageIndex), 
      size: String(size), 
      sort: 'fraudScore,desc' 
    })

    if (filters.patientId) params.append('patientId', filters.patientId)
    if (filters.gender) params.append('gender', filters.gender)
    if (searchQuery) params.append('diagnosis', searchQuery)
    else if (filters.diagnosis) params.append('diagnosis', filters.diagnosis)
    if (filters.minScore) params.append('minScore', filters.minScore)
    if (filters.maxScore) params.append('maxScore', filters.maxScore)
    if (filters.startDate) params.append('startDate', filters.startDate)
    if (filters.endDate) params.append('endDate', filters.endDate)

    getJson<Page<ClaimResponseDto>>(`/api/v1/claims?${params.toString()}`)
      .then(setPage)
      .catch((e) => setError(e.message))
  }, [pageIndex, size, filters, searchQuery])

  function handleClearFilters() {
    setFilters({
      patientId: '',
      gender: '',
      diagnosis: '',
      minScore: '',
      maxScore: '',
      scoreCategory: '',
      startDate: '',
      endDate: '',
    })
    setSearchQuery('')
  }

  const canPrev = pageIndex > 0
  const canNext = useMemo(() => (page ? page.number + 1 < page.totalPages : false), [page])

  function getCategoryColor(category: ScoreCategory | null): string {
    switch (category) {
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  function getRowBgColor(category: ScoreCategory | null): string {
    switch (category) {
      case 'LOW':
        return 'bg-green-50/30 hover:bg-green-50/50'
      case 'MEDIUM':
        return 'bg-yellow-50/30 hover:bg-yellow-50/50'
      case 'HIGH':
        return 'bg-red-50/30 hover:bg-red-50/50'
      default:
        return ''
    }
  }

  function getScoreColor(score: number | null): string {
    if (score === null) return 'text-gray-500'
    if (score >= 76) return 'text-red-600 font-semibold'
    if (score >= 26) return 'text-yellow-600 font-semibold'
    return 'text-green-600 font-semibold'
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="grid gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold leading-none">Claims</h1>
                <p className="text-muted-foreground text-sm">Manage health insurance claims</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <Input 
                    placeholder="Search by diagnosis..." 
                    className="w-64"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <ClaimsFilters
                  filters={filters}
                  onFiltersChange={setFilters}
                  onClear={handleClearFilters}
                />
              </div>
            </div>
          </div>
          {error && <div className="text-destructive">{error}</div>}
          {!page && !error && <div>Loading...</div>}
          {page && (
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Registration Number</TableHead>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Sex</TableHead>
                    <TableHead>Encounter</TableHead>
                    <TableHead>Diagnosis</TableHead>
                    <TableHead>Score</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.content.map((c) => (
                    <TableRow 
                      key={c.id}
                      className={getRowBgColor(c.scoreCategory)}
                    >
                      <TableCell className="font-medium">{c.patientId}</TableCell>
                      <TableCell>{/* Placeholder full name */}</TableCell>
                      <TableCell>{c.gender ?? ''}</TableCell>
                      <TableCell>{c.encounterDate ?? ''}</TableCell>
                      <TableCell className="max-w-[24rem] truncate" title={c.diagnosis ?? ''}>{c.diagnosis ?? ''}</TableCell>
                      <TableCell>
                        <span className={getScoreColor(c.fraudScore)}>
                          {c.fraudScore !== null ? c.fraudScore.toFixed(1) : '—'}
                        </span>
                      </TableCell>
                      <TableCell>
                        {c.scoreCategory ? (
                          <Badge 
                            variant="outline" 
                            className={getCategoryColor(c.scoreCategory)}
                          >
                            {c.scoreCategory}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button size="icon" variant="ghost" className="size-7">
                          <IconEye />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex items-center justify-between p-2">
                <div className="flex items-center gap-3 text-sm">
                  <span>Rows per page</span>
                  <Select value={String(size)} onValueChange={(v) => { setPageIndex(0); setSize(Number(v)) }}>
                    <SelectTrigger className="w-24" size="sm">
                      <SelectValue placeholder="Rows" />
                    </SelectTrigger>
                    <SelectContent side="top">
                      {[10, 15, 25, 50, 100].map((s) => (
                        <SelectItem key={s} value={String(s)}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <span>
                    Page {page.number + 1} of {page.totalPages}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled={!canPrev} onClick={() => setPageIndex(0)}>First</Button>
                  <Button variant="outline" disabled={!canPrev} onClick={() => setPageIndex((i) => Math.max(0, i - 1))}>Prev</Button>
                  <Button variant="outline" disabled={!canNext} onClick={() => setPageIndex((i) => i + 1)}>Next</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

