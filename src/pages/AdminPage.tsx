import { useEffect, useState } from 'react'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { SiteHeader } from '@/components/site-header'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { getJson, postMultipart, putJson } from '@/lib/api'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type IngestResult = { total: number; inserted: number; skipped: number }

type ScoringConfig = {
  zeroAmountWeight: number
  ratioHighThreshold: number
  ratioHighWeight: number
  ratioMedThreshold: number
  ratioMedWeight: number
  infertilityWeight: number
  cyesisWeight: number
  dentalWeight: number
  osteoWeight: number
  pediatricHtnWeight: number
  missingEncounterWeight: number
  dischargeBeforeEncounterWeight: number
  lowMax: number
  mediumMax: number
}

export function AdminPage() {
  const [file, setFile] = useState<File | null>(null)
  const [result, setResult] = useState<IngestResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [savingCfg, setSavingCfg] = useState(false)

  useEffect(() => {
    document.title = 'Admin - NHIS Fraud Auditor'
  }, [])

  const [cfg, setCfg] = useState<ScoringConfig | null>(null)
  const [cfgError, setCfgError] = useState<string | null>(null)

  useEffect(() => {
    getJson<ScoringConfig>('/api/v1/admin/scoring-config')
      .then(setCfg)
      .catch((e) => setCfgError(e.message))
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!file) return
    setLoading(true)
    setError(null)
    setResult(null)
    const form = new FormData()
    form.append('file', file)
    try {
      const res = await postMultipart<IngestResult>('/api/v1/admin/ingest', form)
      setResult(res)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader />
        <div className="grid gap-4 p-4 lg:gap-6 lg:p-6">
          <div>
            <h1 className="text-lg font-semibold leading-none">Admin</h1>
            <p className="text-muted-foreground text-sm">Upload CSV to ingest claims</p>
          </div>
          <Tabs defaultValue="ingest" className="w-full">
            <TabsList>
              <TabsTrigger value="ingest">CSV Ingestion</TabsTrigger>
              <TabsTrigger value="scoring">Scoring Configuration</TabsTrigger>
            </TabsList>
            <TabsContent value="ingest">
              <Card className="max-w-xl">
                <CardHeader>
                  <CardTitle>CSV Ingestion</CardTitle>
                  <CardDescription>Upload a CSV file to ingest claims.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="csv">CSV File</Label>
                      <Input id="csv" type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                    </div>
                    <Button type="submit" disabled={!file || loading}>{loading ? 'Uploading...' : 'Upload'}</Button>
                  </form>
                  {error && <div className="text-destructive mt-4">{error}</div>}
                  {result && (
                    <div className="mt-4 text-sm">
                      <div>Total: {result.total}</div>
                      <div>Inserted: {result.inserted}</div>
                      <div>Skipped: {result.skipped}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="scoring">
              <Card className="max-w-3xl">
                <CardHeader>
                  <CardTitle>Fraud Scoring Configuration</CardTitle>
                  <CardDescription>Adjust scoring weights and thresholds</CardDescription>
                </CardHeader>
                <CardContent>
                  {cfgError && <div className="text-destructive mb-4">{cfgError}</div>}
                  {!cfg && !cfgError && <div>Loading...</div>}
                  {cfg && (
                    <form
                      className="grid grid-cols-1 gap-4 md:grid-cols-3"
                      onSubmit={async (e) => {
                        e.preventDefault()
                        setSavingCfg(true)
                        try {
                          await putJson<void>('/api/v1/admin/scoring-config', cfg)
                        } catch (e: any) {
                          setCfgError(e.message)
                        } finally {
                          setSavingCfg(false)
                        }
                      }}
                    >
                      {(
                        [
                          ['zeroAmountWeight', 'Zero amount weight'],
                          ['ratioHighThreshold', 'Ratio high threshold'],
                          ['ratioHighWeight', 'Ratio high weight'],
                          ['ratioMedThreshold', 'Ratio medium threshold'],
                          ['ratioMedWeight', 'Ratio medium weight'],
                          ['infertilityWeight', 'Infertility weight'],
                          ['cyesisWeight', 'Cyesis weight'],
                          ['dentalWeight', 'Dental weight'],
                          ['osteoWeight', 'Osteo weight'],
                          ['pediatricHtnWeight', 'Pediatric HTN weight'],
                          ['missingEncounterWeight', 'Missing encounter weight'],
                          ['dischargeBeforeEncounterWeight', 'Discharge<Encounter weight'],
                          ['lowMax', 'LOW max'],
                          ['mediumMax', 'MEDIUM max'],
                        ] as const
                      ).map(([key, label]) => (
                        <div className="grid gap-2" key={key}>
                          <Label htmlFor={key}>{label}</Label>
                          <Input
                            id={key}
                            type="number"
                            step={key.includes('Threshold') ? '0.1' : '1'}
                            value={(cfg as any)[key]}
                            onChange={(e) => setCfg({ ...(cfg as any), [key]: Number(e.target.value) } as ScoringConfig)}
                          />
                        </div>
                      ))}
                      <div className="md:col-span-3">
                        <Button type="submit" disabled={savingCfg}>{savingCfg ? 'Saving...' : 'Save Configuration'}</Button>
                      </div>
                    </form>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

