import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, Layers, Building2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [statsRes, recentRes] = await Promise.all([
        axios.get(`${API}/analytics/stats`, { headers }),
        axios.get(`${API}/analytics/recent`, { headers })
      ]);

      setStats(statsRes.data);
      setRecentActivity(recentRes.data.recent_documents);
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-zinc-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2" data-testid="dashboard-title">
            Dashboard
          </h1>
          <p className="text-zinc-600">Welcome back! Here's your research overview</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="border-zinc-200 hover:border-primary/50 transition-colors" data-testid="stat-documents">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
              <FileText className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_documents || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 hover:border-primary/50 transition-colors" data-testid="stat-pages">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
              <Layers className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_pages?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 hover:border-primary/50 transition-colors" data-testid="stat-companies">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Companies</CardTitle>
              <Building2 className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_companies || 0}</div>
            </CardContent>
          </Card>

          <Card className="border-zinc-200 hover:border-primary/50 transition-colors" data-testid="stat-queries">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">AI Queries</CardTitle>
              <TrendingUp className="h-4 w-4 text-zinc-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold font-mono">{stats?.total_queries || 0}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="border-zinc-200">
          <CardHeader>
            <CardTitle>Recent Documents</CardTitle>
            <CardDescription>Your recently uploaded documents</CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <div className="text-center py-12" data-testid="no-documents-message">
                <FileText className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
                <p className="text-zinc-600 mb-4">No documents yet</p>
                <Button
                  onClick={() => navigate('/library')}
                  className="bg-primary hover:bg-primary/90"
                  data-testid="upload-first-document-btn"
                >
                  Upload Your First Document
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((doc) => (
                  <div
                    key={doc.upload_date}
                    className="flex items-center justify-between p-4 border border-zinc-200 rounded-lg hover:border-primary/50 transition-colors cursor-pointer"
                    data-testid={`recent-doc-${doc.title}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-950">{doc.title}</p>
                        <p className="text-sm text-zinc-600">
                          {doc.page_count} pages • {doc.company || 'No company'}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 font-mono">
                      {new Date(doc.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        {stats?.total_documents > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => navigate('/library')}
              data-testid="quick-action-library"
            >
              <FileText className="w-6 h-6" />
              <span>View All Documents</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2"
              onClick={() => navigate('/insights')}
              data-testid="quick-action-insights"
            >
              <TrendingUp className="w-6 h-6" />
              <span>View Insights</span>
            </Button>
            <Button
              variant="outline"
              className="h-auto py-6 flex flex-col items-center gap-2 border-primary/50"
              onClick={() => navigate('/library')}
              data-testid="quick-action-upload"
            >
              <FileText className="w-6 h-6" />
              <span>Upload Document</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}