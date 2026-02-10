import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Send, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function DocumentViewer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [document, setDocument] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(true);
  const [asking, setAsking] = useState(false);

  useEffect(() => {
    fetchDocument();
    fetchChatHistory();
  }, [id]);

  const fetchDocument = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/documents/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocument(response.data);
    } catch (error) {
      toast.error('Failed to load document');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const fetchChatHistory = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API}/chat/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChatHistory(response.data);
    } catch (error) {
      console.error('Failed to load chat history');
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question;
    setQuestion('');
    setAsking(true);

    // Add user message to UI immediately
    setChatHistory(prev => [...prev, {
      role: 'user',
      content: userQuestion,
      timestamp: new Date().toISOString()
    }]);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${API}/chat/ask`,
        { document_id: id, question: userQuestion },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Add assistant response
      setChatHistory(prev => [...prev, {
        role: 'assistant',
        content: response.data.answer,
        timestamp: new Date().toISOString()
      }]);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to get answer');
      // Remove the optimistic user message on error
      setChatHistory(prev => prev.slice(0, -1));
    } finally {
      setAsking(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50">
        <Navbar />
        <div className="flex items-center justify-center h-[calc(100vh-64px)]">
          <p className="text-zinc-600">Loading document...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-12">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/library')}
            className="mb-4"
            data-testid="back-to-library-btn"
          >
            ← Back to Library
          </Button>
          <h1 className="font-serif text-4xl font-bold text-zinc-950 mb-2" data-testid="document-title">
            {document?.title}
          </h1>
          <div className="flex items-center gap-4 text-sm text-zinc-600">
            {document?.company && <span>Company: {document.company}</span>}
            {document?.industry && <span>• Industry: {document.industry}</span>}
            <span>• {document?.page_count} pages</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Document Info */}
          <div className="lg:col-span-1">
            <Card className="border-zinc-200">
              <CardHeader>
                <CardTitle>Document Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-primary/5 rounded-lg">
                  <FileText className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-zinc-950">PDF Document</p>
                    <p className="text-sm text-zinc-600 font-mono">
                      {(document?.file_size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Pages:</span>
                    <span className="font-mono font-medium">{document?.page_count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-zinc-600">Uploaded:</span>
                    <span className="font-mono text-xs">
                      {new Date(document?.upload_date).toLocaleDateString()}
                    </span>
                  </div>
                  {document?.company && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Company:</span>
                      <span className="font-medium">{document.company}</span>
                    </div>
                  )}
                  {document?.industry && (
                    <div className="flex justify-between text-sm">
                      <span className="text-zinc-600">Industry:</span>
                      <span className="font-medium">{document.industry}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat */}
          <div className="lg:col-span-2">
            <Card className="border-zinc-200 h-[calc(100vh-280px)]">
              <CardHeader>
                <CardTitle>Ask AI About This Document</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-[calc(100%-80px)]">
                <ScrollArea className="flex-1 pr-4 mb-4" data-testid="chat-history">
                  {chatHistory.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                        <FileText className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-zinc-600 mb-2">No questions asked yet</p>
                      <p className="text-sm text-zinc-500">Ask a question to get insights from this document</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {chatHistory.map((msg, idx) => (
                        <div
                          key={idx}
                          className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          data-testid={`chat-message-${msg.role}-${idx}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg p-4 ${
                              msg.role === 'user'
                                ? 'bg-primary text-white'
                                : 'bg-zinc-100 text-zinc-950'
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                            <p className="text-xs opacity-70 mt-2 font-mono">
                              {new Date(msg.timestamp).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {asking && (
                        <div className="flex justify-start">
                          <div className="bg-zinc-100 rounded-lg p-4">
                            <Loader2 className="w-5 h-5 animate-spin text-primary" />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <Input
                    placeholder="Ask a question about this document..."
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    disabled={asking}
                    data-testid="question-input"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={asking || !question.trim()}
                    className="bg-primary hover:bg-primary/90"
                    data-testid="ask-question-btn"
                  >
                    {asking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}