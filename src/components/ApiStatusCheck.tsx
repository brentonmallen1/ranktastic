
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Check, AlertCircle, RefreshCw, Server } from 'lucide-react';
import { API_BASE_URL } from '@/lib/db/config';

const ApiStatusCheck = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking API connection...');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [isChecking, setIsChecking] = useState(false);
  
  const checkApiStatus = async () => {
    setStatus('loading');
    setMessage('Checking API connection...');
    setDebugInfo({});
    setIsChecking(true);
    
    try {
      // Test a direct ping to the backend port to see if it's accessible
      const testDirectBackend = async () => {
        try {
          // We can't actually do this from the browser due to CORS
          // But we'll log it for information
          console.log(`Note: Direct backend check at http://backend:3001/health isn't possible from browser`);
          return false;
        } catch (error) {
          console.log('Direct backend test error:', error);
          return false;
        }
      };
      
      const healthEndpoint = `${API_BASE_URL}/health`;
      console.log(`Testing API connection at: ${healthEndpoint}`);
      
      // Prevent caching
      const response = await fetch(healthEndpoint, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`API health response status: ${response.status}`);
      
      // Get all headers for debugging
      const headers = Object.fromEntries([...response.headers.entries()]);
      console.log(`Response headers:`, headers);
      setDebugInfo(prev => ({ ...prev, headers }));
      
      // Check URL that was accessed
      console.log(`Response URL: ${response.url}`);
      setDebugInfo(prev => ({ ...prev, responseUrl: response.url }));
      
      // Check content-type and body
      const contentType = response.headers.get('content-type');
      console.log(`Content-Type: ${contentType}`);
      
      const text = await response.text();
      console.log(`Response body: ${text}`);
      
      // Store response snippet for debugging
      setDebugInfo(prev => ({ 
        ...prev, 
        body: text.substring(0, 150) + (text.length > 150 ? '...' : ''),
        contentType
      }));
      
      // Check if it's HTML (error case)
      if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
        await testDirectBackend();
        
        setStatus('error');
        setMessage('Received HTML instead of JSON - API routing misconfiguration in Nginx');
        setDebugInfo(prev => ({ 
          ...prev, 
          error: 'Nginx is serving frontend HTML instead of routing to backend API',
          possibleFixes: [
            'Check nginx.conf location blocks - API routes should be matched before static files',
            'Verify backend service is running (check Docker logs)',
            'Ensure backend container is healthy in docker-compose',
            'Check backend service port (3001) is accessible',
            'Verify Nginx proxy_pass directive is correct'
          ]
        }));
        throw new Error('Received HTML instead of JSON - API proxy misconfiguration');
      }
      
      // Try to parse as JSON if possible
      try {
        const data = JSON.parse(text);
        setStatus('success');
        setMessage(`API connected successfully! Response: ${JSON.stringify(data)}`);
        setDebugInfo(prev => ({ ...prev, jsonData: data }));
      } catch (e) {
        // Non-JSON response
        setStatus('error');
        setMessage(`API returned non-JSON response: ${text.substring(0, 100)}`);
      }
    } catch (error) {
      console.error('API check error:', error);
      setStatus('error');
      setMessage(`API connection failed: ${error.message}`);
      setDebugInfo(prev => ({ ...prev, error: error.message }));
    } finally {
      setIsChecking(false);
    }
  };
  
  useEffect(() => {
    checkApiStatus();
  }, []);
  
  return (
    <div className="space-y-4 max-w-lg mx-auto my-4 p-4 border rounded-lg shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">API Connection Status</h2>
        <Server className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <Alert variant={status === 'success' ? "default" : "destructive"}>
        {status === 'success' ? (
          <Check className="h-4 w-4" />
        ) : (
          <AlertCircle className="h-4 w-4" />
        )}
        <AlertTitle>
          {status === 'loading' ? 'Checking API...' : 
           status === 'success' ? 'API Connected' : 'API Connection Error'}
        </AlertTitle>
        <AlertDescription>
          {message}
        </AlertDescription>
      </Alert>
      
      <Button 
        onClick={checkApiStatus} 
        disabled={isChecking}
        className="w-full"
      >
        {isChecking ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Checking API...
          </>
        ) : (
          'Recheck API Connection'
        )}
      </Button>
      
      <div className="text-xs text-muted-foreground">
        <p>API URL: {API_BASE_URL}</p>
        <p>Request URL: {`${API_BASE_URL}/health`}</p>
        
        {Object.keys(debugInfo).length > 0 && (
          <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-60">
            <p className="font-semibold">Debug Information:</p>
            <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApiStatusCheck;
