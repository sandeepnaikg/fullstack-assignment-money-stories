import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, Upload, Search, Trash2, Eye } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DocumentLibrary() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState([]);
  const [filteredDocs, setFilteredDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    company: '',
    industry: ''
  });
  
  const [searchQuery, setSearchQuery] = useState('');
  const [companyFilter, setCompanyFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  useEffect(() => {
    filterDocuments();
  }, [documents, searchQuery, companyFilter, industryFilter]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const filterDocuments = () => {
    let filtered = [...documents];

    if (searchQuery) {
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.company?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (companyFilter !== 'all') {
      filtered = filtered.filter(doc => doc.company === companyFilter);
    }

    if (industryFilter !== 'all') {
      filtered = filtered.filter(doc => doc.industry === industryFilter);
    }

    setFilteredDocs(filtered);
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadData(prev => ({
        ...prev,
        file,
        title: prev.title || file.name
      }));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxFiles: 1
  });

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadData.file) {
      toast.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', uploadData.file);
      formData.append('title', uploadData.title);
      formData.append('company', uploadData.company);
      formData.append('industry', uploadData.industry);

      await axios.post(`${API}/documents/upload`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast.success('Document uploaded successfully!');
      setUploadOpen(false);
      setUploadData({ file: null, title: '', company: '', industry: '' });
      fetchDocuments();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId, docTitle) => {
    if (!window.confirm(`Delete "${docTitle}"?`)) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API}/documents/${docId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Document deleted');
      fetchDocuments();
    } catch (error) {
      toast.error('Failed to delete document');
    }
  };

  const companies = [...new Set(documents.filter(d => d.company).map(d => d.company))];
  const industries = [...new Set(documents.filter(d => d.industry).map(d => d.industry))];

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-zinc-600">Loading library...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2" data-testid="library-title">
              Document Library
            </h1>
            <p className="text-zinc-600">{documents.length} documents in your collection</p>
          </div>
          <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 gap-2" data-testid="upload-document-btn">
                <Upload className="w-4 h-4" />
                Upload Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Upload Document</DialogTitle>
                <DialogDescription>Add a new document to your library</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive ? 'border-primary bg-primary/5' : 'border-zinc-300 hover:border-primary/50'
                  }`}
                  data-testid="file-dropzone"
                >
                  <input {...getInputProps()} />
                  <Upload className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
                  {uploadData.file ? (
                    <p className="text-zinc-950 font-medium">{uploadData.file.name}</p>
                  ) : (
                    <div>
                      <p className="text-zinc-950 mb-1">Drop PDF here or click to browse</p>
                      <p className="text-sm text-zinc-600">PDF files only</p>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-title">Title</Label>
                  <Input
                    id="doc-title"
                    placeholder="Document title"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    required
                    data-testid="upload-title-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-company">Company (Optional)</Label>
                  <Input
                    id="doc-company"
                    placeholder="e.g., Apple Inc."
                    value={uploadData.company}
                    onChange={(e) => setUploadData({ ...uploadData, company: e.target.value })}
                    data-testid="upload-company-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doc-industry">Industry (Optional)</Label>
                  <Input
                    id="doc-industry"
                    placeholder="e.g., Technology"
                    value={uploadData.industry}
                    onChange={(e) => setUploadData({ ...uploadData, industry: e.target.value })}
                    data-testid="upload-industry-input"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-primary/90"
                  disabled={uploading}
                  data-testid="upload-submit-btn"
                >
                  {uploading ? 'Uploading...' : 'Upload'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card className="border-zinc-200 mb-8">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-400" />
                  <Input
                    id="search"
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                    data-testid="search-input"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-filter">Company</Label>
                <Select value={companyFilter} onValueChange={setCompanyFilter}>
                  <SelectTrigger id="company-filter" data-testid="company-filter">
                    <SelectValue placeholder="All companies" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All companies</SelectItem>
                    {companies.map(company => (
                      <SelectItem key={company} value={company}>{company}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry-filter">Industry</Label>
                <Select value={industryFilter} onValueChange={setIndustryFilter}>
                  <SelectTrigger id="industry-filter" data-testid="industry-filter">
                    <SelectValue placeholder="All industries" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All industries</SelectItem>
                    {industries.map(industry => (
                      <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Documents Grid */}
        {filteredDocs.length === 0 ? (
          <div className="text-center py-16" data-testid="no-documents">
            <FileText className="h-16 w-16 text-zinc-300 mx-auto mb-4" />
            <h3 className="font-serif text-xl font-bold text-zinc-950 mb-2">No documents found</h3>
            <p className="text-zinc-600 mb-6">Upload your first document to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDocs.map((doc) => (
              <Card
                key={doc.id}
                className="border-zinc-200 hover:border-primary/50 transition-all group"
                data-testid={`document-card-${doc.id}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center mb-3">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => navigate(`/document/${doc.id}`)}
                        data-testid={`view-doc-${doc.id}`}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleDelete(doc.id, doc.title)}
                        data-testid={`delete-doc-${doc.id}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="line-clamp-2">{doc.title}</CardTitle>
                  <CardDescription className="space-y-1">
                    {doc.company && <div className="text-xs">Company: {doc.company}</div>}
                    {doc.industry && <div className="text-xs">Industry: {doc.industry}</div>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-zinc-600">
                    <span className="font-mono">{doc.page_count} pages</span>
                    <span className="font-mono">{(doc.file_size / 1024 / 1024).toFixed(1)} MB</span>
                  </div>
                  <div className="mt-2 text-xs text-zinc-500 font-mono">
                    {new Date(doc.upload_date).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}