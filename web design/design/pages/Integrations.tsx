import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plug, Plus, Trash2, Key, Copy, CheckCircle, X, Code } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { Card } from '@/app/components/ui/card';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { mockWebhooks as initialWebhooks, mockApiKeys as initialApiKeys, mockDevices } from '@/lib/mockData';
import { toast } from 'sonner';

export default function Integrations() {
  const [webhooks, setWebhooks] = useState(initialWebhooks);
  const [apiKeys, setApiKeys] = useState(initialApiKeys);
  const [isWebhookFormOpen, setIsWebhookFormOpen] = useState(false);
  const [isApiKeyFormOpen, setIsApiKeyFormOpen] = useState(false);
  const [newWebhook, setNewWebhook] = useState({ url: '', secret: '', description: '' });
  const [newApiKey, setNewApiKey] = useState({ deviceId: '', name: '' });
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);

  const handleAddWebhook = (e: React.FormEvent) => {
    e.preventDefault();
    const webhook = {
      id: Math.max(...webhooks.map((w) => w.id), 0) + 1,
      userId: 1,
      url: newWebhook.url,
      secret: newWebhook.secret || undefined,
      description: newWebhook.description,
      lastTriggered: null,
      status: 'pending',
    };
    setWebhooks((prev) => [...prev, webhook]);
    setIsWebhookFormOpen(false);
    setNewWebhook({ url: '', secret: '', description: '' });
    toast.success('Webhook added successfully');
  };

  const handleDeleteWebhook = (id: number) => {
    setWebhooks((prev) => prev.filter((w) => w.id !== id));
    toast.success('Webhook removed');
  };

  const handleCreateApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    const key = `sk_${Math.random().toString(36).substr(2, 24)}`;
    const apiKey = {
      id: Math.max(...apiKeys.map((k) => k.id), 0) + 1,
      userId: 1,
      deviceId: Number(newApiKey.deviceId),
      name: newApiKey.name || 'API Key',
      keyPreview: `sk_...${key.slice(-6)}`,
      createdAt: new Date().toISOString(),
      lastUsed: null,
    };
    setApiKeys((prev) => [...prev, apiKey]);
    setGeneratedKey(key);
    setNewApiKey({ deviceId: '', name: '' });
    toast.success('API key created successfully');
  };

  const handleRevokeApiKey = (id: number) => {
    setApiKeys((prev) => prev.filter((k) => k.id !== id));
    toast.success('API key revoked');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const getTimeSince = (timestamp: string | null) => {
    if (!timestamp) return 'Never';
    const now = new Date();
    const then = new Date(timestamp);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Integrations
        </h1>
        <p className="text-gray-600 mt-1">Connect external services and manage API access</p>
      </motion.div>

      <Tabs defaultValue="webhooks" className="space-y-6">
        <TabsList className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg p-1">
          <TabsTrigger value="webhooks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            Webhooks
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            API Keys
          </TabsTrigger>
          <TabsTrigger value="docs" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white">
            API Reference
          </TabsTrigger>
        </TabsList>

        <TabsContent value="webhooks" className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Outgoing Webhooks</h2>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsWebhookFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Webhook
                  </Button>
                </motion.div>
              </div>

              {webhooks.length === 0 ? (
                <div className="text-center py-8">
                  <Plug className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No webhooks configured</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {webhooks.map((webhook, index) => (
                    <motion.div
                      key={webhook.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800">{webhook.url}</h3>
                            {webhook.status && (
                              <Badge variant={webhook.status === 'success' ? 'default' : 'secondary'}>
                                {webhook.status}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">{webhook.description}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            Last triggered: {getTimeSince(webhook.lastTriggered)}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            onClick={() => handleDeleteWebhook(webhook.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="api-keys" className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Device API Keys</h2>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    onClick={() => setIsApiKeyFormOpen(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create API Key
                  </Button>
                </motion.div>
              </div>

              {apiKeys.length === 0 ? (
                <div className="text-center py-8">
                  <Key className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No API keys created</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {apiKeys.map((key, index) => (
                    <motion.div
                      key={key.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Key className="w-4 h-4 text-purple-600" />
                            <h3 className="font-semibold text-gray-800">{key.name}</h3>
                          </div>
                          <p className="text-sm text-gray-600 font-mono mb-1">{key.keyPreview}</p>
                          <p className="text-xs text-gray-500">
                            Device: {mockDevices.find((d) => d.id === key.deviceId)?.name || 'Unknown'}
                          </p>
                          <p className="text-xs text-gray-500">
                            Created: {new Date(key.createdAt).toLocaleDateString()} • Last used: {getTimeSince(key.lastUsed)}
                          </p>
                        </div>
                        <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                          <Button
                            onClick={() => handleRevokeApiKey(key.id)}
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </motion.div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="docs" className="space-y-4">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="bg-white/80 backdrop-blur-xl border-white/20 shadow-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Code className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold text-gray-800">API Reference</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Incoming Webhook</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Send dispense confirmations or updates to your device
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-green-400">POST /api/webhook/incoming</div>
                    <div className="text-gray-400">{'{'}</div>
                    <div className="ml-4">
                      <span className="text-blue-400">"deviceId"</span>: <span className="text-yellow-400">"device-123"</span>,
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"event"</span>: <span className="text-yellow-400">"dispense_confirmed"</span>,
                    </div>
                    <div className="ml-4">
                      <span className="text-blue-400">"timestamp"</span>: <span className="text-yellow-400">"2026-02-03T10:00:00Z"</span>
                    </div>
                    <div className="text-gray-400">{'}'}</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Sync Schedule</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Sync medication schedules with your device
                  </p>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-sm overflow-x-auto">
                    <div className="mb-2 text-green-400">GET /api/sync/schedule?deviceId=123</div>
                    <div className="text-gray-400">Authorization: Bearer YOUR_API_KEY</div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <p className="text-sm text-gray-700">
                    <strong>Note:</strong> This is a simplified API reference. In production, you would have detailed documentation with authentication flows, error codes, and example responses.
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>

      {/* Add Webhook Modal */}
      <AnimatePresence>
        {isWebhookFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setIsWebhookFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Add Webhook
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsWebhookFormOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </motion.button>
              </div>

              <form onSubmit={handleAddWebhook} className="space-y-4">
                <div>
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    value={newWebhook.url}
                    onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                    placeholder="https://example.com/webhook"
                    required
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="secret">Secret (optional)</Label>
                  <Input
                    id="secret"
                    value={newWebhook.secret}
                    onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                    placeholder="webhook_secret_key"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newWebhook.description}
                    onChange={(e) => setNewWebhook({ ...newWebhook, description: e.target.value })}
                    placeholder="What this webhook does..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
                >
                  Add Webhook
                </Button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create API Key Modal */}
      <AnimatePresence>
        {(isApiKeyFormOpen || generatedKey) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => {
              setIsApiKeyFormOpen(false);
              setGeneratedKey(null);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full"
            >
              {generatedKey ? (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="w-8 h-8 text-green-500" />
                      <h2 className="text-2xl font-bold text-gray-800">API Key Created!</h2>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-4">
                    <p className="text-sm text-yellow-800 font-semibold mb-2">⚠️ Save this key now!</p>
                    <p className="text-xs text-yellow-700">
                      This is the only time you'll see the full key. Store it securely.
                    </p>
                  </div>

                  <div className="bg-gray-900 p-4 rounded-xl mb-4">
                    <p className="text-green-400 font-mono text-sm break-all">{generatedKey}</p>
                  </div>

                  <Button
                    onClick={() => copyToClipboard(generatedKey)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white mb-2"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy to Clipboard
                  </Button>

                  <Button
                    onClick={() => setGeneratedKey(null)}
                    variant="outline"
                    className="w-full"
                  >
                    Done
                  </Button>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Create API Key
                    </h2>
                    <motion.button
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setIsApiKeyFormOpen(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-6 h-6" />
                    </motion.button>
                  </div>

                  <form onSubmit={handleCreateApiKey} className="space-y-4">
                    <div>
                      <Label htmlFor="device">Device</Label>
                      <Select value={newApiKey.deviceId} onValueChange={(val) => setNewApiKey({ ...newApiKey, deviceId: val })}>
                        <SelectTrigger className="mt-2">
                          <SelectValue placeholder="Select device" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockDevices.map((device) => (
                            <SelectItem key={device.id} value={device.id.toString()}>
                              {device.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="keyName">Key Name (optional)</Label>
                      <Input
                        id="keyName"
                        value={newApiKey.name}
                        onChange={(e) => setNewApiKey({ ...newApiKey, name: e.target.value })}
                        placeholder="My Integration Key"
                        className="mt-2"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={!newApiKey.deviceId}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-6"
                    >
                      Create API Key
                    </Button>
                  </form>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
