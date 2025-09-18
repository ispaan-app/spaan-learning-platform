'use client'

import React, { useState, useEffect } from 'react'
import Avatar from 'avataaars'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Sparkles, RefreshCw, Heart, Star, Zap, Award, Target, Brain, Users, Globe, Shield, Crown } from 'lucide-react'

interface CharacterProps {
  size?: number
  interactive?: boolean
  showControls?: boolean
  className?: string
}

interface CharacterConfig {
  avatarStyle: 'Circle' | 'Transparent'
  topType: string
  accessoriesType: string
  hairColor: string
  facialHairType: string
  clotheType: string
  clotheColor: string
  eyeType: string
  eyebrowType: string
  mouthType: string
  skinColor: string
}

const CHARACTER_PRESETS = {
  learner: {
    avatarStyle: 'Circle' as const,
    topType: 'ShortHairDreads01',
    accessoriesType: 'PrescriptionGlasses',
    hairColor: 'Black',
    facialHairType: 'Blank',
    clotheType: 'Hoodie',
    clotheColor: 'Blue01',
    eyeType: 'Happy',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    skinColor: 'DarkBrown'
  },
  admin: {
    avatarStyle: 'Circle' as const,
    topType: 'ShortHairShortFlat',
    accessoriesType: 'Blank',
    hairColor: 'Black',
    facialHairType: 'Blank',
    clotheType: 'BlazerShirt',
    clotheColor: 'Blue01',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Black'
  },
  mentor: {
    avatarStyle: 'Circle' as const,
    topType: 'LongHairFro',
    accessoriesType: 'Blank',
    hairColor: 'Black',
    facialHairType: 'Blank',
    clotheType: 'BlazerShirt',
    clotheColor: 'PastelGreen',
    eyeType: 'Happy',
    eyebrowType: 'Default',
    mouthType: 'Smile',
    skinColor: 'DarkBrown'
  },
  superAdmin: {
    avatarStyle: 'Circle' as const,
    topType: 'ShortHairShortCurly',
    accessoriesType: 'Blank',
    hairColor: 'Black',
    facialHairType: 'BeardMedium',
    clotheType: 'BlazerShirt',
    clotheColor: 'Red',
    eyeType: 'Default',
    eyebrowType: 'Default',
    mouthType: 'Default',
    skinColor: 'Black'
  }
}

const CUSTOMIZATION_OPTIONS = {
  topType: [
    'NoHair', 'Eyepatch', 'Hat', 'Hijab', 'Turban', 'WinterHat1', 'WinterHat2', 'WinterHat3', 'WinterHat4',
    'LongHairBigHair', 'LongHairBob', 'LongHairBun', 'LongHairCurly', 'LongHairCurvy', 'LongHairDreads',
    'LongHairFrida', 'LongHairFro', 'LongHairFroBand', 'LongHairNotTooLong', 'LongHairShavedSides',
    'LongHairMiaWallace', 'LongHairStraight', 'LongHairStraight2', 'LongHairStraightStrand',
    'ShortHairDreads01', 'ShortHairDreads02', 'ShortHairFrizzle', 'ShortHairShaggyMullet',
    'ShortHairShortCurly', 'ShortHairShortFlat', 'ShortHairShortRound', 'ShortHairShortWaved',
    'ShortHairSides', 'ShortHairTheCaesar', 'ShortHairTheCaesarSidePart'
  ],
  accessoriesType: [
    'Blank', 'Kurt', 'PrescriptionGlasses', 'Round', 'Sunglasses', 'Wayfarers'
  ],
  hairColor: [
    'Auburn', 'Black', 'Blonde', 'BlondeGolden', 'Brown', 'BrownDark', 'PastelPink', 'Platinum', 'Red', 'SilverGray'
  ],
  facialHairType: [
    'Blank', 'BeardMedium', 'BeardLight', 'BeardMagestic', 'MoustacheFancy', 'MoustacheMagnum'
  ],
  clotheType: [
    'BlazerShirt', 'BlazerSweater', 'CollarSweater', 'GraphicShirt', 'Hoodie', 'Overall', 'ShirtCrewNeck',
    'ShirtScoopNeck', 'ShirtVNeck'
  ],
  clotheColor: [
    'Black', 'Blue01', 'Blue02', 'Blue03', 'Gray01', 'Gray02', 'Heather', 'PastelBlue', 'PastelGreen',
    'PastelOrange', 'PastelRed', 'PastelYellow', 'Pink', 'Red', 'White'
  ],
  eyeType: [
    'Close', 'Cry', 'Default', 'Dizzy', 'EyeRoll', 'Happy', 'Hearts', 'Side', 'Squint', 'Surprised', 'Wink', 'WinkWacky'
  ],
  eyebrowType: [
    'Angry', 'AngryNatural', 'Default', 'DefaultNatural', 'FlatNatural', 'RaisedExcited', 'RaisedExcitedNatural',
    'SadConcerned', 'SadConcernedNatural', 'UnibrowNatural', 'UpDown', 'UpDownNatural'
  ],
  mouthType: [
    'Concerned', 'Default', 'Disbelief', 'Eating', 'Grimace', 'Sad', 'ScreamOpen', 'Serious', 'Smile', 'Tongue', 'Twinkle', 'Vomit'
  ],
  skinColor: [
    'Tanned', 'Yellow', 'Pale', 'Light', 'Brown', 'DarkBrown', 'Black'
  ]
}

export function CartoonCharacter({ 
  size = 200, 
  interactive = false, 
  showControls = false, 
  className = '' 
}: CharacterProps) {
  const [currentPreset, setCurrentPreset] = useState<keyof typeof CHARACTER_PRESETS>('learner')
  const [characterConfig, setCharacterConfig] = useState<CharacterConfig>(CHARACTER_PRESETS.learner)
  const [isAnimating, setIsAnimating] = useState(false)
  const [showCustomization, setShowCustomization] = useState(false)

  // Auto-cycle through presets for landing page
  useEffect(() => {
    if (!interactive) {
      const interval = setInterval(() => {
        setIsAnimating(true)
        const presets = Object.keys(CHARACTER_PRESETS) as Array<keyof typeof CHARACTER_PRESETS>
        const currentIndex = presets.indexOf(currentPreset)
        const nextIndex = (currentIndex + 1) % presets.length
        const nextPreset = presets[nextIndex]
        
        setTimeout(() => {
          setCurrentPreset(nextPreset)
          setCharacterConfig(CHARACTER_PRESETS[nextPreset])
          setIsAnimating(false)
        }, 300)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [currentPreset, interactive])

  const handlePresetChange = (preset: keyof typeof CHARACTER_PRESETS) => {
    setIsAnimating(true)
    setTimeout(() => {
      setCurrentPreset(preset)
      setCharacterConfig(CHARACTER_PRESETS[preset])
      setIsAnimating(false)
    }, 300)
  }

  const handleCustomizationChange = (key: keyof CharacterConfig, value: string) => {
    setCharacterConfig(prev => ({ ...prev, [key]: value }))
  }

  const randomizeCharacter = () => {
    setIsAnimating(true)
    const newConfig = { ...characterConfig }
    
    Object.keys(CUSTOMIZATION_OPTIONS).forEach(key => {
      const options = CUSTOMIZATION_OPTIONS[key as keyof typeof CUSTOMIZATION_OPTIONS]
      const randomValue = options[Math.floor(Math.random() * options.length)]
      ;(newConfig as any)[key] = randomValue
    })
    
    setTimeout(() => {
      setCharacterConfig(newConfig)
      setIsAnimating(false)
    }, 300)
  }

  return (
    <div className={`flex flex-col items-center space-y-6 ${className}`}>
      {/* Character Display */}
      <div className="relative">
        <div className={`transition-all duration-300 ${isAnimating ? 'scale-110 opacity-70' : 'scale-100 opacity-100'}`}>
          <Avatar
            style={{ width: size, height: size }}
            avatarStyle={characterConfig.avatarStyle}
            topType={characterConfig.topType}
            accessoriesType={characterConfig.accessoriesType}
            hairColor={characterConfig.hairColor}
            facialHairType={characterConfig.facialHairType}
            clotheType={characterConfig.clotheType}
            clotheColor={characterConfig.clotheColor}
            eyeType={characterConfig.eyeType}
            eyebrowType={characterConfig.eyebrowType}
            mouthType={characterConfig.mouthType}
            skinColor={characterConfig.skinColor}
          />
        </div>
        
        {/* Floating Icons */}
        <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center animate-bounce">
          <Star className="w-4 h-4 text-white" />
        </div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-gradient-to-r from-pink-400 to-red-400 rounded-full flex items-center justify-center animate-pulse">
          <Heart className="w-3 h-3 text-white" />
        </div>
      </div>

      {/* Interactive Controls */}
      {interactive && (
        <div className="space-y-4 w-full max-w-md">
          {/* Preset Buttons */}
          <div className="flex flex-wrap gap-2 justify-center">
            {Object.keys(CHARACTER_PRESETS).map((preset) => (
              <Button
                key={preset}
                variant={currentPreset === preset ? 'default' : 'outline'}
                size="sm"
                onClick={() => handlePresetChange(preset as keyof typeof CHARACTER_PRESETS)}
                className="capitalize"
              >
                {preset === 'superAdmin' ? 'Super Admin' : preset}
              </Button>
            ))}
          </div>

          {/* Randomize Button */}
          <div className="flex justify-center">
            <Button
              variant="outline"
              size="sm"
              onClick={randomizeCharacter}
              className="group"
            >
              <RefreshCw className="w-4 h-4 mr-2 group-hover:rotate-180 transition-transform" />
              Randomize
            </Button>
          </div>

          {/* Customization Toggle */}
          {showControls && (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCustomization(!showCustomization)}
              >
                {showCustomization ? 'Hide' : 'Show'} Customization
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Customization Panel */}
      {showCustomization && showControls && (
        <Card className="w-full max-w-2xl">
          <CardContent className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-center mb-4">Customize Character</h3>
            
            {Object.entries(CUSTOMIZATION_OPTIONS).map(([key, options]) => (
              <div key={key} className="space-y-2">
                <label className="text-sm font-medium capitalize">
                  {key.replace(/([A-Z])/g, ' $1').trim()}
                </label>
                <select
                  value={characterConfig[key as keyof CharacterConfig]}
                  onChange={(e) => handleCustomizationChange(key as keyof CharacterConfig, e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Character Description */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold capitalize">
          {currentPreset === 'superAdmin' ? 'Super Admin' : currentPreset} Character
        </h3>
        <p className="text-sm text-gray-600 max-w-xs">
          {currentPreset === 'learner' && 'A young South African ready to build skills and create opportunities in their community.'}
          {currentPreset === 'admin' && 'A dedicated administrator supporting learners across South African townships.'}
          {currentPreset === 'mentor' && 'An experienced mentor empowering young South Africans on their career journey.'}
          {currentPreset === 'superAdmin' && 'A visionary leader transforming education across South African communities.'}
        </p>
      </div>
    </div>
  )
}

// Character Showcase Component for Landing Page
export function CharacterShowcase() {
  const [activeCharacter, setActiveCharacter] = useState(0)
  const characters = ['learner', 'admin', 'mentor', 'superAdmin'] as const

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveCharacter((prev) => (prev + 1) % characters.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Main Character */}
      <div className="relative z-10">
        <CartoonCharacter 
          size={300} 
          interactive={false}
          className="transform hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Floating Background Characters */}
      <div className="absolute inset-0 pointer-events-none">
        {characters.map((character, index) => (
          <div
            key={character}
            className={`absolute transition-all duration-1000 ${
              index === activeCharacter
                ? 'opacity-20 scale-75 -translate-y-4'
                : 'opacity-10 scale-50 translate-y-4'
            }`}
            style={{
              left: `${20 + index * 20}%`,
              top: `${10 + index * 15}%`,
              transform: `rotate(${index * 15}deg)`,
            }}
          >
            <Avatar
              style={{ width: 100, height: 100 }}
              {...CHARACTER_PRESETS[character]}
            />
          </div>
        ))}
      </div>

      {/* Floating Elements */}
      <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl animate-pulse"></div>
      <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl animate-pulse delay-500"></div>
      <div className="absolute top-1/2 -left-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-lg animate-bounce delay-1000"></div>
    </div>
  )
}


