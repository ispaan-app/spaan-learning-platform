# 🤖 AI Features Setup Guide

This guide helps you enable and configure AI features in the iSpaan App.

## 🚀 Quick Start

```bash
# Enable all AI features
npm run enable:ai

# Complete setup (Firebase + AI)
npm run setup:complete

# Start development server with AI features
npm run dev
```

## 📋 Prerequisites

1. **Google AI API Key** - Required for AI functionality
2. **Firebase Project** - Already configured
3. **Internet Connection** - AI features require online access

## 🔑 Getting Your Google AI API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key
5. Replace `your-google-ai-api-key` in `.env.local`

## ⚙️ AI Features Enabled

### Core AI Features
- ✅ **AI Chat System** - Intelligent chat assistance
- ✅ **AI Announcements** - Automated announcement generation
- ✅ **AI Placement Matching** - Smart candidate matching
- ✅ **AI Dropout Analysis** - Risk prediction and prevention
- ✅ **AI Career Mentoring** - Personalized career guidance
- ✅ **AI Image Generation** - Dynamic image creation
- ✅ **AI Document Analysis** - Document insights and processing
- ✅ **AI Support Chat** - Automated support assistance

### Configuration Options

| Feature | Environment Variable | Default | Description |
|---------|---------------------|---------|-------------|
| AI Chat | `ENABLE_AI_CHAT` | `true` | Enable AI chat functionality |
| Announcements | `ENABLE_AI_ANNOUNCEMENTS` | `true` | AI-powered announcement generation |
| Placement Matching | `ENABLE_AI_PLACEMENT_MATCHING` | `true` | Smart placement recommendations |
| Dropout Analysis | `ENABLE_AI_DROPOUT_ANALYSIS` | `true` | Risk prediction and analysis |
| Career Mentoring | `ENABLE_AI_CAREER_MENTORING` | `true` | Personalized career guidance |
| Image Generation | `ENABLE_AI_IMAGE_GENERATION` | `true` | AI-powered image creation |
| Document Analysis | `ENABLE_AI_DOCUMENT_ANALYSIS` | `true` | Document processing and insights |
| Support Chat | `ENABLE_AI_SUPPORT_CHAT` | `true` | Automated support assistance |

## 🔧 Advanced Configuration

### AI Model Settings
```bash
# Model Configuration
AI_MODEL=gemini-1.5-flash          # AI model to use
AI_MAX_TOKENS=4096                 # Maximum response length
AI_TEMPERATURE=0.7                 # Creativity level (0-1)
AI_TOP_P=0.9                       # Nucleus sampling parameter
AI_TOP_K=40                        # Top-k sampling parameter
```

### Performance Settings
```bash
# Performance Configuration
AI_RESPONSE_CACHE_TTL=3600         # Cache responses for 1 hour
AI_MAX_CONCURRENT_REQUESTS=10      # Max simultaneous requests
AI_RATE_LIMIT_PER_MINUTE=60        # Rate limiting
```

### Security Settings
```bash
# Security Configuration
AI_CONTENT_FILTERING=true          # Enable content filtering
AI_SAFETY_THRESHOLD=0.8            # Safety threshold (0-1)
AI_TOXICITY_THRESHOLD=0.7          # Toxicity threshold (0-1)
```

## 🧪 Testing AI Features

### 1. Test AI Chat
```bash
# Start the development server
npm run dev

# Navigate to any page with AI chat
# Look for the AI chat icon in the bottom right
```

### 2. Test AI Announcements
```bash
# Go to Admin Dashboard > Announcements
# Click "Generate with AI" button
# Test different announcement types
```

### 3. Test AI Placement Matching
```bash
# Go to Admin Dashboard > Placements
# Use the AI-powered matching feature
# Test with different candidate profiles
```

### 4. Test AI Support Chat
```bash
# Look for the support chat icon
# Ask questions about the platform
# Test different support scenarios
```

## 🐛 Troubleshooting

### Common Issues

**1. "AI features disabled" error**
```bash
# Solution: Enable AI features
npm run enable:ai
```

**2. "Invalid API key" error**
```bash
# Solution: Check your Google AI API key
# 1. Verify the key in .env.local
# 2. Ensure it's not expired
# 3. Check API key permissions
```

**3. "Rate limit exceeded" error**
```bash
# Solution: Adjust rate limiting
# Update AI_RATE_LIMIT_PER_MINUTE in .env.local
```

**4. "AI service unavailable" error**
```bash
# Solution: Check internet connection
# Verify Google AI services are accessible
```

### Debug Mode

Enable AI debug mode for detailed logging:
```bash
# In .env.local
AI_DEBUG_MODE=true
AI_LOG_LEVEL=debug
```

## 📊 Monitoring AI Usage

### Check AI Logs
```bash
# View AI-related logs in console
# Look for messages starting with [AI]
```

### Monitor Performance
```bash
# Check response times
# Monitor API usage
# Track error rates
```

## 🔒 Security Considerations

1. **API Key Security**
   - Never commit API keys to version control
   - Use environment variables only
   - Rotate keys regularly

2. **Content Filtering**
   - AI responses are filtered for safety
   - Inappropriate content is blocked
   - User inputs are sanitized

3. **Rate Limiting**
   - Prevents API abuse
   - Protects against excessive usage
   - Maintains service availability

## 🚀 Production Deployment

### Environment Variables
Ensure these are set in production:
```bash
ENABLE_AI_FEATURES=true
GOOGLE_AI_API_KEY=your-production-api-key
AI_SERVICE_ENABLED=true
AI_CONTENT_FILTERING=true
```

### Performance Optimization
```bash
# Production settings
AI_RESPONSE_CACHE_TTL=7200        # 2 hours
AI_MAX_CONCURRENT_REQUESTS=20     # Higher limit
AI_RATE_LIMIT_PER_MINUTE=120      # Higher rate limit
```

## 📚 Additional Resources

- [Google AI Documentation](https://ai.google.dev/docs)
- [Firebase AI Integration](https://firebase.google.com/docs/ai)
- [Genkit AI Framework](https://firebase.google.com/docs/genkit)

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review the console logs for AI errors
3. Verify your API key and permissions
4. Test with a simple AI request first

---

**Need help?** Check the logs, verify your configuration, and ensure your Google AI API key is valid and active.








