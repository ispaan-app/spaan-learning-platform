'use client'

import { useState } from 'react'
import { Button } from './button'
import { Input } from './input'
import { Label } from './label'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface QRCodeGeneratorProps {
  onGenerate: (data: string) => void
  className?: string
}

export function QRCodeGenerator({ onGenerate, className }: QRCodeGeneratorProps) {
  const [qrData, setQrData] = useState('')

  const handleGenerate = () => {
    if (qrData.trim()) {
      onGenerate(qrData.trim())
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Generate QR Code for Testing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="qr-data">QR Code Data</Label>
          <Input
            id="qr-data"
            value={qrData}
            onChange={(e) => setQrData(e.target.value)}
            placeholder="Enter data for QR code"
          />
        </div>
        <Button onClick={handleGenerate} disabled={!qrData.trim()}>
          Generate QR Code
        </Button>
        {qrData && (
          <div className="p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">QR Code Data:</p>
            <code className="text-sm font-mono">{qrData}</code>
          </div>
        )}
      </CardContent>
    </Card>
  )
}



