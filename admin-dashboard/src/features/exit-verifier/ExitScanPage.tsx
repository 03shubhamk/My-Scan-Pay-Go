import React, { useState, useEffect } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { QrCode, ShieldAlert, RefreshCw, Lock, Zap, CheckCircle2, User, Package } from 'lucide-react';
import { apiClient } from '../../services/apiClient';

interface VerificationLog {
  id: string;
  token: string;
  orderNumber: string;
  itemCount: number;
  totalAmount: number;
  status: 'VERIFIED' | 'FAILED' | 'PENDING';
  verifiedAt: string;
  verifier: string;
}

interface ItemDetail {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface VerificationResult {
  success: boolean;
  message: string;
  orderId?: string;
  orderNumber?: string;
  customerName?: string;
  customerEmail?: string;
  totalAmount?: number;
  itemCount?: number;
  items?: ItemDetail[];
  verifiedAt?: string;
  rejectionReason?: string;
}

export const ExitScanPage: React.FC = () => {
  const [inputToken, setInputToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [fetchingLogs, setFetchingLogs] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const [logs, setLogs] = useState<VerificationLog[]>([
    {
      id: 'log-1',
      token: 'SPG-EXIT-A1000001-VERIFIED',
      orderNumber: 'ORD-A1000001',
      itemCount: 2,
      totalAmount: 47.00,
      status: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      verifier: 'Gate Terminal #01',
    },
  ]);

  const loadLogs = async () => {
    setFetchingLogs(true);
    try {
      const response = await apiClient.get('/exit-verification/logs');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        setLogs(response.data.data);
      }
    } catch (err) {
      console.warn('Could not fetch live logs from backend, retaining fallback logs:', err);
    } finally {
      setFetchingLogs(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tokenToVerify = inputToken.trim();
    if (!tokenToVerify) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await apiClient.post('/exit-verification/verify', {
        token: tokenToVerify,
        verifierNode: 'Gate Terminal #01',
      });

      if (response.data && response.data.success) {
        const data = response.data.data;
        setResult({
          success: true,
          message: '✓ Verified — Customer items matched authoritative DB payment signature. Gate turnstile open.',
          orderId: data?.orderId,
          orderNumber: data?.orderNumber || `ORD-${tokenToVerify.substring(0, 8)}`,
          customerName: data?.customerName || 'Verified Shopper',
          customerEmail: data?.customerEmail || 'customer@scanpaygo.com',
          itemCount: data?.itemCount || 1,
          totalAmount: data?.totalAmount || 0,
          items: data?.items || [],
          verifiedAt: data?.verifiedAt || new Date().toISOString(),
        });

        // Reload logs to reflect new verification
        loadLogs();
      } else {
        throw new Error(response.data?.message || 'Verification rejected by gate server');
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message ||
        err.message ||
        '✗ Invalid exit pass. Order unpaid, already verified, or signature expired.';
      
      setResult({
        success: false,
        message: `✗ Invalid — ${errorMsg}`,
        rejectionReason: errorMsg,
      });

      loadLogs();
    } finally {
      setVerifying(false);
    }
  };

  const fillSampleToken = (sample: string) => {
    setInputToken(sample);
  };

  return (
    <MainLayout pageTitle="Exit Gate Verifier">
      <div className="space-y-6">
        {/* Banner Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-blue-600/30 border border-blue-400/30 rounded-xl text-blue-400">
                <QrCode className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-xl font-black">Turnstile Exit Pass Verifier</h2>
                <p className="text-xs text-slate-300">
                  Scan customer digital Exit QR or input verification token to unlock store exit gate.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    placeholder="Scan exit QR code or type token (e.g. SPG-EXIT-A1000001-...)..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="bg-white text-slate-900 border-none placeholder:text-slate-400 font-mono text-sm"
                  />
                </div>
                <Button type="submit" isLoading={verifying} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                  <Zap className="w-4 h-4 mr-1.5" />
                  Validate Pass
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                <span>Quick Test Tokens:</span>
                <button
                  type="button"
                  onClick={() => fillSampleToken('SPG-EXIT-A1000001-AUTH-VALID')}
                  className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-blue-300 font-mono"
                >
                  SPG-EXIT-A1000001 (Valid Order)
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleToken('SPG-EXIT-EXPIRED-TEST-TOKEN')}
                  className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-amber-300 font-mono"
                >
                  EXPIRED-TOKEN (Fail)
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleToken('INVALID-FORGED-QR-TOKEN')}
                  className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-red-300 font-mono"
                >
                  FORGED-QR (Invalid)
                </button>
              </div>
            </form>
          </Card>

          <Card className="p-6 flex flex-col justify-between border-2 border-blue-100">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Gate Status</p>
                <Badge variant="success">OPERATIONAL</Badge>
              </div>
              <h3 className="text-2xl font-black text-slate-900 mt-2">Gate #01 Optical Scanner</h3>
              <p className="text-xs text-slate-500 mt-1">Single-Use Anti-Passback & HMAC Verification Active</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center"><Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Auto-Lock Active</span>
              <span className="font-mono text-xs bg-slate-100 px-2 py-0.5 rounded text-slate-700">Turnstile 1.0</span>
            </div>
          </Card>
        </div>

        {/* Live Verification Result Output Banner */}
        {result && (
          <Card
            className={`p-6 border-2 transition-all ${
              result.success
                ? 'bg-emerald-50/90 border-emerald-400 text-emerald-950'
                : 'bg-red-50/90 border-red-400 text-red-950'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-2xl shrink-0 ${
                  result.success ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-red-600 text-white shadow-lg shadow-red-200'
                }`}
              >
                {result.success ? <CheckCircle2 className="w-9 h-9" /> : <ShieldAlert className="w-9 h-9" />}
              </div>
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-black flex items-center gap-2">
                    {result.success ? '✓ VERIFIED — ACCESS GRANTED' : '✗ INVALID — GATE LOCKED'}
                  </h3>
                  <Badge variant={result.success ? 'success' : 'danger'}>
                    {result.success ? 'PASS (GATE OPEN)' : 'REJECTED (GATE CLOSED)'}
                  </Badge>
                </div>
                <p className="text-sm font-semibold">{result.message}</p>

                {result.success && (
                  <div className="pt-3 mt-3 border-t border-emerald-200 space-y-3">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                      <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <Package className="w-3.5 h-3.5" /> Order Number
                        </span>
                        <p className="font-mono font-black text-emerald-950 text-sm mt-0.5">{result.orderNumber}</p>
                      </div>
                      <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <User className="w-3.5 h-3.5" /> Customer
                        </span>
                        <p className="font-extrabold text-emerald-950 text-sm mt-0.5 truncate">{result.customerName}</p>
                      </div>
                      <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-bold">Items In Bag</span>
                        <p className="font-extrabold text-emerald-950 text-sm mt-0.5">{result.itemCount} items verified</p>
                      </div>
                      <div className="bg-white/70 p-2.5 rounded-lg border border-emerald-100">
                        <span className="text-emerald-700 font-bold">Total Paid</span>
                        <p className="font-extrabold text-emerald-950 text-sm mt-0.5">₹{result.totalAmount?.toFixed(2)}</p>
                      </div>
                    </div>

                    {result.items && result.items.length > 0 && (
                      <div className="bg-white/80 rounded-lg p-3 border border-emerald-100">
                        <p className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-2">Item Manifest for Bag Check:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                          {result.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between py-1 border-b border-emerald-100 last:border-none">
                              <span className="font-medium text-slate-800">{item.productName} <span className="font-bold text-emerald-700">×{item.quantity}</span></span>
                              <span className="font-mono text-slate-600">₹{item.subtotal.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Turnstile Verification Logs Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">Live Turnstile Security Logs</h3>
              <p className="text-xs text-slate-500">Real-time gate pass verification audit trail</p>
            </div>
            <Button variant="secondary" size="sm" onClick={loadLogs} isLoading={fetchingLogs}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh Logs
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gate Timestamp</TableHead>
                <TableHead>Verification Token</TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Gate Result</TableHead>
                <TableHead className="text-right">Verifier Node</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50">
                  <TableCell className="text-xs text-slate-500 font-mono">
                    {new Date(log.verifiedAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-slate-700">
                    {log.token.length > 25 ? `${log.token.substring(0, 25)}...` : log.token}
                  </TableCell>
                  <TableCell className="font-extrabold text-blue-600">{log.orderNumber}</TableCell>
                  <TableCell className="font-semibold">{log.itemCount} items</TableCell>
                  <TableCell className="font-bold">₹{log.totalAmount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={log.status === 'VERIFIED' ? 'success' : 'danger'}>
                      {log.status === 'VERIFIED' ? '✓ VERIFIED' : '✗ REJECTED'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right text-xs text-slate-500">{log.verifier}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>
    </MainLayout>
  );
};
