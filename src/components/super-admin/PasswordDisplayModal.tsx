'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Copy, 
  Check, 
  Eye, 
  EyeOff, 
  Key, 
  AlertTriangle,
  CheckCircle,
  RefreshCw
} from 'lucide-react'

interface PasswordDisplayModalProps {
  password: string
  userEmail: string
  isCustomPassword?: boolean
  onClose: () => void
  onResetPassword?: () => void
  isPasswordReset?: boolean
  title?: string
  description?: string
}

export function PasswordDisplayModal({ 
  password, 
  userEmail, 
  isCustomPassword = false,
  onClose, 
  onResetPassword,
  isPasswordReset = false,
  title,
  description
}: PasswordDisplayModalProps) {
  const [copied, setCopied] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy password:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-md mx-auto my-4">
        <Card className="w-full shadow-2xl max-h-[90vh] overflow-y-auto">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <CardTitle className="text-lg sm:text-xl text-gray-900 leading-tight">
              {title || (isPasswordReset ? 'Password Reset Successfully!' : 'User Created Successfully!')}
            </CardTitle>
            <p className="text-xs sm:text-sm text-gray-600 mt-2 px-2">
              {description || (isPasswordReset 
                ? 'The user password has been reset. Here are the new credentials:'
                : 'A new user account has been created with the following credentials:'
              )}
            </p>
          </CardHeader>
        
          <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6 pb-6">
            {/* User Info */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-gray-700">Email Address</Label>
              <div className="p-2 sm:p-3 bg-gray-50 rounded-md border">
                <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">{userEmail}</p>
              </div>
            </div>

            {/* Password Display */}
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm font-medium text-gray-700">
                {isCustomPassword ? 'Custom Password' : 'Generated Password'}
              </Label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                <div className="flex-1 p-2 sm:p-3 bg-gray-50 rounded-md border">
                  <p className="text-xs sm:text-sm font-mono text-gray-900 break-all">
                    {showPassword ? password : '••••••••••••'}
                  </p>
                </div>
                <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowPassword(!showPassword)}
                    className="h-8 sm:h-10 flex-1 sm:flex-none"
                  >
                    {showPassword ? <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" /> : <Eye className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="ml-1 sm:hidden text-xs">
                      {showPassword ? 'Hide' : 'Show'}
                    </span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopyPassword}
                    className="h-8 sm:h-10 flex-1 sm:flex-none"
                  >
                    {copied ? <Check className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" /> : <Copy className="w-3 h-3 sm:w-4 sm:h-4" />}
                    <span className="ml-1 sm:hidden text-xs">
                      {copied ? 'Copied!' : 'Copy'}
                    </span>
                  </Button>
                </div>
              </div>
            </div>

            {/* Security Warning */}
            <Alert className="text-xs sm:text-sm">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0 mt-0.5" />
              <AlertDescription className="text-xs sm:text-sm">
                <strong>Important:</strong> Please save this password securely. It will not be shown again.
                {!isCustomPassword && " The user should change their password after first login."}
              </AlertDescription>
            </Alert>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 sm:p-4">
              <h4 className="font-medium text-blue-900 mb-2 text-sm sm:text-base">Next Steps:</h4>
              <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                {isPasswordReset ? (
                  <>
                    <li>• Share the new password with the user securely</li>
                    <li>• User should login with the new password</li>
                    <li>• User should change their password after login</li>
                  </>
                ) : (
                  <>
                    <li>• Share these credentials with the user securely</li>
                    {!isCustomPassword && <li>• User should login and change their password</li>}
                    <li>• User may need to verify their email address</li>
                  </>
                )}
              </ul>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCopyPassword}
                className="flex-1 h-10 sm:h-auto"
              >
                {copied ? (
                  <>
                    <Check className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="text-xs sm:text-sm">Copy Password</span>
                  </>
                )}
              </Button>
              <Button
                onClick={onClose}
                className="flex-1 h-10 sm:h-auto bg-green-600 hover:bg-green-700"
              >
                <span className="text-xs sm:text-sm">Done</span>
              </Button>
            </div>

            {/* Additional Actions */}
            {onResetPassword && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetPassword}
                  className="text-gray-600 hover:text-gray-900 h-8 text-xs sm:text-sm"
                >
                  <RefreshCw className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                  {isPasswordReset ? 'Generate New Password' : 'Generate New Password'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
