import React, { useRef, useState } from 'react';
import { QrCode, Camera, Check } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';

export interface BarcodeScannerInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}

export const BarcodeScannerInput: React.FC<BarcodeScannerInputProps> = ({
  value,
  onChange,
  error,
  required = true,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isWebcamModalOpen, setIsWebcamModalOpen] = useState(false);
  const [scannedFeedback, setScannedFeedback] = useState<string | null>(null);

  // USB Barcode Scanner Keyboard Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // USB Barcode scanners typically emit an Enter keypress after barcode scanning
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent accidental form submission on USB scan
      if (inputRef.current) {
        inputRef.current.blur();
      }
      setScannedFeedback('Barcode captured from scanner!');
      setTimeout(() => setScannedFeedback(null), 3000);
    }
  };

  const handleGenerateRandomBarcode = () => {
    const randomCode = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
    onChange(randomCode);
    setScannedFeedback('Generated sample barcode');
    setTimeout(() => setScannedFeedback(null), 3000);
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Input
            ref={inputRef}
            label="Product Barcode (EAN/UPC)"
            placeholder="Scan USB barcode or type code..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            error={error}
            required={required}
            leftIcon={<QrCode className="w-4 h-4 text-primary" />}
            helperText="USB Barcode Scanner supported. Point scanner & trigger scan."
          />
        </div>

        {/* Action Buttons: Sample Generator & Webcam Extension */}
        <div className="flex items-center gap-1.5 pb-[2px]">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleGenerateRandomBarcode}
            title="Generate Sample EAN-13 Barcode"
            className="h-10 text-xs"
          >
            Auto Code
          </Button>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsWebcamModalOpen(true)}
            leftIcon={<Camera className="w-4 h-4" />}
            title="Open Webcam Camera Barcode Scanner"
            className="h-10 text-xs"
          >
            Camera Scan
          </Button>
        </div>
      </div>

      {/* Visual Feedback Banner */}
      {scannedFeedback && (
        <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-xs text-emerald-700 flex items-center gap-1.5 animate-in fade-in duration-150">
          <Check className="w-3.5 h-3.5 text-emerald-600" />
          <span>{scannedFeedback}</span>
        </div>
      )}

      {/* Extension Point: Webcam Scanner Modal */}
      <Modal
        isOpen={isWebcamModalOpen}
        onClose={() => setIsWebcamModalOpen(false)}
        title="Webcam Barcode Scanner Extension"
        maxWidth="md"
        footer={
          <Button variant="secondary" onClick={() => setIsWebcamModalOpen(false)}>
            Close Scanner
          </Button>
        }
      >
        <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
          <div className="w-48 h-48 border-2 border-dashed border-primary rounded-xl flex items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-x-0 top-1/2 h-0.5 bg-red-500 animate-pulse" />
            <Camera className="w-12 h-12 text-slate-400" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-text-primary">Camera Barcode Scanner Extension</h4>
            <p className="text-xs text-text-secondary">
              Point your webcam or USB camera at a product barcode.
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              const mockScan = `890${Math.floor(1000000000 + Math.random() * 9000000000)}`;
              onChange(mockScan);
              setIsWebcamModalOpen(false);
              setScannedFeedback(`Webcam scanned code: ${mockScan}`);
              setTimeout(() => setScannedFeedback(null), 3000);
            }}
          >
            Simulate Camera Barcode Detection
          </Button>
        </div>
      </Modal>
    </div>
  );
};
