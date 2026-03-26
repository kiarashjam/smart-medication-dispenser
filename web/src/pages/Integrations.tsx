import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { Plus, Trash2, Key, Globe, Copy, Loader2 } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/app/components/ui/alert-dialog';
import { devicesApi, integrationsApi, type DeviceDto, type WebhookEndpointDto, type DeviceApiKeyDto } from '@/api/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { isCaregiverRole } from '@/lib/roles';
import { appPath } from '@/lib/appRoutes';

export default function Integrations() {
  const { user } = useAuth();
  const [devices, setDevices] = useState<DeviceDto[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookEndpointDto[]>([]);
  const [apiKeys, setApiKeys] = useState<Record<string, DeviceApiKeyDto[]>>({});
  const [loading, setLoading] = useState(true);
  const [webhookFormOpen, setWebhookFormOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookDesc, setWebhookDesc] = useState('');
  const [webhookSecret, setWebhookSecret] = useState('');
  const [deleteWebhookId, setDeleteWebhookId] = useState<string | null>(null);
  const [newApiKey, setNewApiKey] = useState<string | null>(null);
  const [selectedDeviceForKey, setSelectedDeviceForKey] = useState('');
  const [apiKeyName, setApiKeyName] = useState('');
  const [activeTab, setActiveTab] = useState<'webhooks' | 'apikeys'>('webhooks');

  const load = async () => {
    try {
      const [devRes, whRes] = await Promise.all([devicesApi.list(), integrationsApi.getWebhooks()]);
      setDevices(devRes.data);
      setWebhooks(whRes.data);
      if (devRes.data.length > 0) {
        setSelectedDeviceForKey(devRes.data[0].id);
        const keysMap: Record<string, DeviceApiKeyDto[]> = {};
        await Promise.all(devRes.data.map(async (d) => {
          try { const res = await integrationsApi.getDeviceApiKeys(d.id); keysMap[d.id] = res.data; } catch { keysMap[d.id] = []; }
        }));
        setApiKeys(keysMap);
      }
    } catch { toast.error('Failed to load integrations'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleCreateWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await integrationsApi.createWebhook({ url: webhookUrl, secret: webhookSecret || undefined, description: webhookDesc || undefined });
      toast.success('Webhook created');
      setWebhookFormOpen(false);
      setWebhookUrl(''); setWebhookDesc(''); setWebhookSecret('');
      load();
    } catch { toast.error('Failed to create webhook'); }
  };

  const handleDeleteWebhook = async (id: string) => {
    try { await integrationsApi.deleteWebhook(id); toast.success('Webhook deleted'); setDeleteWebhookId(null); load(); }
    catch { toast.error('Failed to delete'); }
  };

  const handleCreateApiKey = async () => {
    if (!selectedDeviceForKey) return;
    try {
      const res = await integrationsApi.createDeviceApiKey(selectedDeviceForKey, { name: apiKeyName || undefined });
      setNewApiKey(res.data.plainKey);
      setApiKeyName('');
      toast.success('API key created - copy it now!');
      load();
    } catch { toast.error('Failed to create API key'); }
  };

  const handleDeleteApiKey = async (deviceId: string, keyId: string) => {
    try { await integrationsApi.deleteDeviceApiKey(deviceId, keyId); toast.success('API key revoked'); load(); }
    catch { toast.error('Failed to revoke'); }
  };

  if (!isCaregiverRole(user?.role)) return <Navigate to={appPath()} replace />;

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Integrations</h1>
        <p className="text-sm text-gray-500 mt-1">Webhooks & API Keys</p>
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
        <button
          onClick={() => setActiveTab('webhooks')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'webhooks' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Globe className="w-4 h-4 inline mr-2" />Webhooks
        </button>
        <button
          onClick={() => setActiveTab('apikeys')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            activeTab === 'apikeys' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Key className="w-4 h-4 inline mr-2" />API Keys
        </button>
      </div>

      {activeTab === 'webhooks' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setWebhookFormOpen(true)} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              <Plus className="w-4 h-4 mr-2" />Add Webhook
            </Button>
          </div>
          {webhooks.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-medium text-gray-900 mt-3">No webhooks</p>
              <p className="text-sm text-gray-500 mt-1">Create your first webhook endpoint</p>
            </div>
          ) : (
            <div className="space-y-4">
              {webhooks.map((wh) => (
                <div key={wh.id} className="bg-white rounded-xl border border-gray-200 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{wh.url}</p>
                      {wh.description && <p className="text-sm text-gray-600 mt-1">{wh.description}</p>}
                      <div className="flex items-center gap-3 mt-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${wh.isActive ? 'bg-success-50 text-success-700' : 'bg-gray-50 text-gray-600'}`}>
                          {wh.isActive ? 'Active' : 'Inactive'}
                        </span>
                        {wh.lastTriggeredAtUtc && <span className="text-xs text-gray-500">Last: {new Date(wh.lastTriggeredAtUtc).toLocaleString()}</span>}
                        {wh.lastStatus && <span className="text-xs text-gray-500">Status: {wh.lastStatus}</span>}
                      </div>
                    </div>
                    <Button onClick={() => setDeleteWebhookId(wh.id)} variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-red-600 hover:border-red-200 flex-shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'apikeys' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create API Key</h3>
            <div className="flex flex-wrap gap-3 items-end">
              {devices.length > 0 && (
                <div className="flex-1 min-w-[200px]">
                  <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Device</Label>
                  <select value={selectedDeviceForKey} onChange={(e) => setSelectedDeviceForKey(e.target.value)} className="mt-2 block w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500">
                    {devices.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div className="flex-1 min-w-[200px]">
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Name (optional)</Label>
                <Input value={apiKeyName} onChange={(e) => setApiKeyName(e.target.value)} className="mt-2" placeholder="e.g. CI/CD Key" />
              </div>
              <Button onClick={handleCreateApiKey} className="bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
                <Plus className="w-4 h-4 mr-2" />Create Key
              </Button>
            </div>
            {newApiKey && (
              <div className="mt-4 bg-success-50 border border-success-200 rounded-lg p-4">
                <p className="text-sm text-success-800 font-medium mb-2">API Key (copy now - won't be shown again!):</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 font-mono text-sm bg-gray-50 px-3 py-2 rounded-lg border border-gray-200 break-all">{newApiKey}</code>
                  <Button onClick={() => { navigator.clipboard.writeText(newApiKey); toast.success('Copied!'); }} variant="outline" size="icon" className="border-gray-200 hover:bg-gray-50">
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {devices.map((device) => {
            const keys = apiKeys[device.id] || [];
            if (keys.length === 0) return null;
            return (
              <div key={device.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">{device.name}</h4>
                <div className="space-y-2">
                  {keys.map((key) => (
                    <div key={key.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{key.name || 'Unnamed Key'}</p>
                        <p className="text-xs text-gray-500">Created: {new Date(key.createdAtUtc).toLocaleDateString()}{key.lastUsedAtUtc && ` - Last used: ${new Date(key.lastUsedAtUtc).toLocaleDateString()}`}</p>
                      </div>
                      <Button onClick={() => handleDeleteApiKey(device.id, key.id)} variant="outline" size="sm" className="border-gray-200 hover:bg-gray-50 text-gray-700 hover:text-red-600 hover:border-red-200 text-sm">
                        <Trash2 className="w-4 h-4 mr-1" />Revoke
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {webhookFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setWebhookFormOpen(false)}>
          <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Add Webhook</h2>
              <p className="text-sm text-gray-500 mt-1">Create a new webhook endpoint to receive notifications</p>
            </div>
            <form onSubmit={handleCreateWebhook} className="space-y-4">
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">URL</Label>
                <Input value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} required className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="https://example.com/webhook" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Description (optional)</Label>
                <Input value={webhookDesc} onChange={(e) => setWebhookDesc(e.target.value)} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" />
              </div>
              <div>
                <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Secret (optional)</Label>
                <Input value={webhookSecret} onChange={(e) => setWebhookSecret(e.target.value)} className="mt-2 w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500" placeholder="HMAC signing secret" />
              </div>
              <Button type="submit" className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Create Webhook</Button>
            </form>
          </div>
        </div>
      )}

      <AlertDialog open={deleteWebhookId !== null} onOpenChange={() => setDeleteWebhookId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Webhook</AlertDialogTitle>
            <AlertDialogDescription>Are you sure?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => deleteWebhookId && handleDeleteWebhook(deleteWebhookId)} className="bg-red-600 hover:bg-red-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
}
