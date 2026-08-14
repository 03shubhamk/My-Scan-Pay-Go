import React, { useState } from 'react';
import { MainLayout } from '../../components/MainLayout';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { QrCode, ShieldCheck, ShieldAlert, RefreshCw, Lock, Zap } from 'lucide-react';
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

export const ExitScanPage: React.FC = () => {
  const [inputToken, setInputToken] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    orderNumber?: string;
    itemCount?: number;
    totalAmount?: number;
  } | null>(null);

  const [logs, setLogs] = useState<VerificationLog[]>([
    {
      id: 'log-1',
      token: 'HMAC-890123-VERIFIED',
      orderNumber: 'ORD-89102001',
      itemCount: 5,
      totalAmount: 147.00,
      status: 'VERIFIED',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      verifier: 'Gate Terminal #01',
    },
    {
      id: 'log-2',
      token: 'HMAC-449102-FAILED',
      orderNumber: 'ORD-89102003',
      itemCount: 2,
      totalAmount: 54.00,
      status: 'FAILED',
      verifiedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
      verifier: 'Gate Terminal #01',
    },
  ]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputToken.trim()) return;

    setVerifying(true);
    setResult(null);

    try {
      const response = await apiClient.post('/exit-verification/verify', { token: inputToken.trim() });
      if (response.data && response.data.success) {
        setResult({
          success: true,
          message: 'Exit Token Verified! Customer items matched authoritative DB purchase signature.',
          orderNumber: response.data.data?.orderNumber || 'ORD-89102001',
          itemCount: response.data.data?.itemCount || 5,
          totalAmount: response.data.data?.totalAmount || 147.00,
        });

        setLogs((prev) => [
          {
            id: `log-${Date.now()}`,
            token: inputToken,
            orderNumber: response.data.data?.orderNumber || 'ORD-89102001',
            itemCount: response.data.data?.itemCount || 5,
            totalAmount: response.data.data?.totalAmount || 147.00,
            status: 'VERIFIED',
            verifiedAt: new Date().toISOString(),
            verifier: 'Gate Terminal #01',
          },
          ...prev,
        ]);
      } else {
        throw new Error(response.data?.message || 'Invalid or expired exit token');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || 'Token verification failed. Unpaid or spoofed receipt.';
      setResult({
        success: false,
        message: errorMsg,
      });

      setLogs((prev) => [
        {
          id: `log-${Date.now()}`,
          token: inputToken,
          orderNumber: 'UNKNOWN',
          itemCount: 0,
          totalAmount: 0.00,
          status: 'FAILED',
          verifiedAt: new Date().toISOString(),
          verifier: 'Gate Terminal #01',
        },
        ...prev,
      ]);
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
                <h2 className="text-xl font-black">Gate Exit Security & QR Verifier</h2>
                <p className="text-xs text-slate-300">
                  Scan customer digital exit pass or enter HMAC token to unlock automatic exit turnstiles.
                </p>
              </div>
            </div>

            <form onSubmit={handleVerify} className="space-y-3">
              <div className="flex space-x-3">
                <div className="flex-1">
                  <Input
                    placeholder="Scan exit QR code or type token (e.g. HMAC-890123-VERIFIED)..."
                    value={inputToken}
                    onChange={(e) => setInputToken(e.target.value)}
                    className="bg-white text-slate-900 border-none placeholder:text-slate-400 font-mono text-sm"
                  />
                </div>
                <Button type="submit" isLoading={verifying} className="bg-blue-600 hover:bg-blue-700 font-bold px-6">
                  <Zap className="w-4 h-4 mr-1.5" />
                  Verify Token
                </Button>
              </div>
              <div className="flex items-center space-x-2 text-xs text-slate-400">
                <span>Quick Test Fill:</span>
                <button
                  type="button"
                  onClick={() => fillSampleToken('HMAC-890123-VERIFIED')}
                  className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-blue-300 font-mono"
                >
                  HMAC-890123-VERIFIED (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => fillSampleToken('INVALID-TOKEN-999')}
                  className="px-2 py-1 bg-slate-700/60 hover:bg-slate-700 rounded text-red-300 font-mono"
                >
                  INVALID-TOKEN-999 (Fail)
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
              <h3 className="text-2xl font-black text-slate-900 mt-2">Gate #01 Connected</h3>
              <p className="text-xs text-slate-500 mt-1">HMAC-SHA256 Cryptographic Signature Verifier Active</p>
            </div>
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
              <span className="flex items-center"><Lock className="w-3.5 h-3.5 mr-1 text-emerald-600" /> Auto-Lock On</span>
              <span className="font-mono">Port 5000 API</span>
            </div>
          </Card>
        </div>

        {/* Live Verification Result Output */}
        {result && (
          <Card
            className={`p-6 border-2 transition-all ${
              result.success
                ? 'bg-emerald-50/70 border-emerald-300 text-emerald-950'
                : 'bg-red-50/70 border-red-300 text-red-950'
            }`}
          >
            <div className="flex items-start space-x-4">
              <div
                className={`p-3 rounded-2xl ${
                  result.success ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                }`}
              >
                {result.success ? <ShieldCheck className="w-8 h-8" /> : <ShieldAlert className="w-8 h-8" />}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black">
                    {result.success ? 'GATE UNLOCKED — EXIT GRANTED' : 'GATE LOCKED — VERIFICATION FAILED'}
                  </h3>
                  <Badge variant={result.success ? 'success' : 'danger'}>
                    {result.success ? 'PASS' : 'REJECTED'}
                  </Badge>
                </div>
                <p className="text-sm font-medium">{result.message}</p>

                {result.success && (
                  <div className="grid grid-cols-3 gap-4 pt-3 mt-3 border-t border-emerald-200/80 text-xs">
                    <div>
                      <span className="text-emerald-700 font-semibold">Order Number</span>
                      <p className="font-extrabold text-emerald-900 text-sm mt-0.5">{result.orderNumber}</p>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-semibold">Item Count Check</span>
                      <p className="font-extrabold text-emerald-900 text-sm mt-0.5">{result.itemCount} items verified</p>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-semibold">Authorized Amount</span>
                      <p className="font-extrabold text-emerald-900 text-sm mt-0.5">₹{result.totalAmount?.toFixed(2)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Verification Logs Table */}
        <Card className="overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">Recent Exit Turnstile Activity</h3>
            <Button variant="secondary" size="sm" onClick={() => setLogs([...logs])}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Refresh Activity
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gate Timestamp</TableHead>
                <TableHead>Verification Token</TableHead>
                <TableHead>Order Number</TableHead>
                <TableHead>Items Verified</TableHead>
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
                      {log.status}
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
