
import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Check, AlertCircle, RefreshCw, Server, ExternalLink } from 'lucide-react';
import { API_BASE_URL } from '@/lib/db/config';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const ApiStatusCheck = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Checking API connection...');
  const [debugInfo, setDebugInfo] = useState<Record<string, any>>({});
  const [isChecking, setIsChecking] = useState(false);
  const [directEndpointStatus, setDirectEndpointStatus] = useState<Record<string, any>>({});
  
  const checkEndpoint = async (url: string, description: string) => {
    try {
      console.log(`Testing endpoint: ${url}`);
      const response = await fetch(`${url}?_=${Date.now()}`, {
        cache: 'no-cache',
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      console.log(`Response status for ${description}: ${response.status}`);
      
      // Get all headers for debugging
      const headers = Object.fromEntries([...response.headers.entries()]);
      console.log(`Response headers for ${description}:`, headers);
      
      const text = await response.text();
      let data;
      let isJson = false;
      
      try {
        data = JSON.parse(text);
        isJson = true;
      } catch (e) {
        data = text.substring(0, 150) + (text.length > 150 ? '...' : '');
      }
      
      return {
        url,
        status: response.status,
        headers,
        isJson,
        data,
        success: response.ok && isJson
      };
    } catch (error) {
      console.error(`Error checking ${description}:`, error);
      return {
        url,
        error: error.message,
        success: false
      };
    }
  };
  
  const checkApiStatus = async () => {
    setStatus('loading');
    setMessage('Checking API connection...');
    setDebugInfo({});
    setDirectEndpointStatus({});
    setIsChecking(true);
    
    try {
      // First try the proxy API health endpoint
      const proxyHealthUrl = `${API_BASE_URL}/health`;
      const proxyHealthResult = await checkEndpoint(proxyHealthUrl, 'API Proxy Health');
      
      // Also check the frontend health endpoint
      const frontendHealthResult = await checkEndpoint('/health', 'Frontend Health');
      
      // Try direct URLs (these won't work in production but might in development)
      const directResults = {
        proxy: proxyHealthResult,
        frontend: frontendHealthResult
      };
      
      setDirectEndpointStatus(directResults);
      
      if (proxyHealthResult.success) {
        setStatus('success');
        setMessage(`API connected successfully!`);
        setDebugInfo({
          apiUrl: API_BASE_URL,
          healthCheck: proxyHealthResult
        });
      } else {
        setStatus('error');
        setMessage(`API connection failed`);
        
        // Determine if it's an HTML response
        if (typeof proxyHealthResult.data === 'string' && 
            (proxyHealthResult.data.includes('<!DOCTYPE html>') || 
             proxyHealthResult.data.includes('<html'))) {
          setDebugInfo({
            apiUrl: API_BASE_URL,
            error: 'Received HTML instead of JSON - API proxy misconfiguration',
            headers: proxyHealthResult.headers,
            responseUrl: proxyHealthResult.url,
            body: proxyHealthResult.data.substring(0, 150) + '...',
            contentType: proxyHealthResult.headers?.['content-type'],
            possibleFixes: [
              'Check nginx.conf location blocks - API routes should be matched before static files',
              'Verify backend service is running (check Docker logs)',
              'Ensure backend container is healthy in docker-compose',
              'Check backend service port (3001) is accessible',
              'Verify Nginx proxy_pass directive is correct',
              'Check if backend service is properly handling /health endpoint'
            ],
            nextSteps: [
              '1. In production: The Lovable preview environment may handle Docker differently than local builds',
              '2. In development: Try accessing http://localhost:3001/health directly to check if backend is running',
              '3. Check backend logs with docker-compose logs backend',
              '4. Verify backend container is running with docker-compose ps',
              '5. Check if backend has the correct CORS settings for the environment'
            ]
          });
        } else {
          setDebugInfo({
            apiUrl: API_BASE_URL,
            error: proxyHealthResult.error || 'Unknown error occurred',
            status: proxyHealthResult.status,
            headers: proxyHealthResult.headers,
            data: proxyHealthResult.data
          });
        }
      }
    } catch (error) {
      console.error('API check error:', error);
      setStatus('error');
      setMessage(`API connection failed: ${error.message}`);
      setDebugInfo({ error: error.message });
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
        <p>Health Check URL: {`${API_BASE_URL}/health`}</p>
        
        {Object.keys(debugInfo).length > 0 && (
          <Tabs defaultValue="debug" className="mt-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="debug">Debug Info</TabsTrigger>
              <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
              <TabsTrigger value="solution">Solution</TabsTrigger>
            </TabsList>
            
            <TabsContent value="debug" className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-60">
              <p className="font-semibold">Debug Information:</p>
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(debugInfo, null, 2)}</pre>
            </TabsContent>
            
            <TabsContent value="endpoints" className="p-2 bg-gray-100 dark:bg-gray-800 rounded overflow-auto max-h-60">
              <p className="font-semibold">Endpoint Test Results:</p>
              <pre className="whitespace-pre-wrap text-xs">{JSON.stringify(directEndpointStatus, null, 2)}</pre>
            </TabsContent>
            
            <TabsContent value="solution" className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
              <p className="font-semibold">Environment Differences:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>The Lovable preview environment might handle Docker networking differently than local builds</li>
                <li>The backend container might not be starting properly in the preview environment</li>
                <li>CORS settings might be different between environments</li>
              </ul>
              
              <p className="font-semibold mt-2">Recommended Fix:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Deploy to a production environment where you have full control over the Docker setup</li>
                <li>Consider alternative API routes that don't rely on Docker networking in preview</li>
                <li>Add direct API URL configuration option for different environments</li>
              </ul>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
};

export default ApiStatusCheck;
