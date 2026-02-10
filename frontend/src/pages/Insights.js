import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Building2, Layers, TrendingUp, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Insights() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/analytics/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to load insights');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-zinc-600">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2" data-testid="insights-title">
            Research Insights
          </h1>
          <p className="text-zinc-600">Analytics and trends from your document collection</p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-zinc-200" data-testid="insight-total-documents">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">{stats?.total_documents || 0}</div>
              <p className="text-xs text-zinc-600 mt-1">In your library</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200" data-testid="insight-total-pages">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Layers className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">
                {stats?.total_pages?.toLocaleString() || 0}
              </div>
              <p className="text-xs text-zinc-600 mt-1">Across all documents</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200" data-testid="insight-companies">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">{stats?.total_companies || 0}</div>
              <p className="text-xs text-zinc-600 mt-1">Being tracked</p>
            </CardContent>
          </Card>

          <Card className="border-zinc-200" data-testid="insight-ai-queries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono text-primary">{stats?.total_queries || 0}</div>
              <p className="text-xs text-zinc-600 mt-1">Questions asked</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Companies Tracked */}
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Companies Tracked</CardTitle>
              <CardDescription>Companies in your document library</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.companies || stats.companies.length === 0 ? (
                <div className="text-center py-8" data-testid="no-companies">
                  <Building2 className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm">No companies tagged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.companies.map((company, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:border-primary/50 transition-colors"
                      data-testid={`company-item-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Building2 className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-zinc-950">{company}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Industries */}
          <Card className="border-zinc-200">
            <CardHeader>
              <CardTitle>Industries</CardTitle>
              <CardDescription>Industry sectors in your research</CardDescription>
            </CardHeader>
            <CardContent>
              {!stats?.industries || stats.industries.length === 0 ? (
                <div className="text-center py-8" data-testid="no-industries">
                  <Layers className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-600 text-sm">No industries tagged yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {stats.industries.map((industry, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 border border-zinc-200 rounded-lg hover:border-primary/50 transition-colors"
                      data-testid={`industry-item-${idx}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
                          <Layers className="w-4 h-4 text-primary" />
                        </div>
                        <span className="font-medium text-zinc-950">{industry}</span>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-zinc-400" />
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Call to Action */}
        {stats?.total_documents === 0 && (
          <Card className="border-primary/50 mt-8 bg-primary/5">
            <CardHeader>
              <CardTitle>Get Started with Your Research</CardTitle>
              <CardDescription>Upload documents to start seeing insights</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => navigate('/library')}
                className="bg-primary hover:bg-primary/90"
                data-testid="get-started-btn"
              >
                Upload Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}