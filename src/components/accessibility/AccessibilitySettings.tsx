'use client'

import React from 'react'
import { useAccessibility } from './AccessibilityProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { 
  Eye, 
  Type, 
  MousePointer, 
  Keyboard, 
  Monitor, 
  Palette,
  RotateCcw,
  Settings
} from 'lucide-react'

export function AccessibilitySettings() {
  const { settings, updateSetting, resetSettings } = useAccessibility()

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Accessibility Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Visual Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-contrast">High Contrast</Label>
                <p className="text-sm text-muted-foreground">
                  Increase contrast for better visibility
                </p>
              </div>
              <Switch
                id="high-contrast"
                checked={settings.highContrast}
                onCheckedChange={(checked) => updateSetting('highContrast', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="large-text">Large Text</Label>
                <p className="text-sm text-muted-foreground">
                  Increase text size for better readability
                </p>
              </div>
              <Switch
                id="large-text"
                checked={settings.largeText}
                onCheckedChange={(checked) => updateSetting('largeText', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="reduced-motion">Reduced Motion</Label>
                <p className="text-sm text-muted-foreground">
                  Minimize animations and transitions
                </p>
              </div>
              <Switch
                id="reduced-motion"
                checked={settings.reducedMotion}
                onCheckedChange={(checked) => updateSetting('reducedMotion', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="focus-visible">Focus Indicators</Label>
                <p className="text-sm text-muted-foreground">
                  Show focus indicators for keyboard navigation
                </p>
              </div>
              <Switch
                id="focus-visible"
                checked={settings.focusVisible}
                onCheckedChange={(checked) => updateSetting('focusVisible', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Font Size */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Text Size</h3>
          <div className="space-y-2">
            <Label htmlFor="font-size">Font Size</Label>
            <Select
              value={settings.fontSize}
              onValueChange={(value: any) => updateSetting('fontSize', value)}
            >
              <SelectTrigger id="font-size">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="small">Small</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="large">Large</SelectItem>
                <SelectItem value="extra-large">Extra Large</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Separator />

        {/* Color Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Color Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="color-blind-support">Color Blind Support</Label>
              <Select
                value={settings.colorBlindSupport}
                onValueChange={(value: any) => updateSetting('colorBlindSupport', value)}
              >
                <SelectTrigger id="color-blind-support">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="protanopia">Protanopia (Red-blind)</SelectItem>
                  <SelectItem value="deuteranopia">Deuteranopia (Green-blind)</SelectItem>
                  <SelectItem value="tritanopia">Tritanopia (Blue-blind)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select
                value={settings.theme}
                onValueChange={(value: any) => updateSetting('theme', value)}
              >
                <SelectTrigger id="theme">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="auto">Auto (System)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Navigation Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Navigation Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="keyboard-navigation">Keyboard Navigation</Label>
                <p className="text-sm text-muted-foreground">
                  Enhanced keyboard navigation support
                </p>
              </div>
              <Switch
                id="keyboard-navigation"
                checked={settings.keyboardNavigation}
                onCheckedChange={(checked) => updateSetting('keyboardNavigation', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="screen-reader">Screen Reader</Label>
                <p className="text-sm text-muted-foreground">
                  Optimize for screen readers
                </p>
              </div>
              <Switch
                id="screen-reader"
                checked={settings.screenReader}
                onCheckedChange={(checked) => updateSetting('screenReader', checked)}
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={resetSettings}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <div className="text-sm text-muted-foreground">
            Settings are saved automatically
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Quick accessibility toggle component
export function AccessibilityToggle() {
  const { settings, updateSetting } = useAccessibility()

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={settings.highContrast || settings.largeText || settings.reducedMotion}
        onCheckedChange={(checked) => {
          updateSetting('highContrast', checked)
          updateSetting('largeText', checked)
          updateSetting('reducedMotion', checked)
        }}
      />
      <Label className="text-sm">Accessibility Mode</Label>
    </div>
  )
}

// Accessibility announcement component
export function AccessibilityAnnouncement({ message }: { message: string }) {
  const { announceToScreenReader } = useAccessibility()

  React.useEffect(() => {
    if (message) {
      announceToScreenReader(message)
    }
  }, [message, announceToScreenReader])

  return null
}
