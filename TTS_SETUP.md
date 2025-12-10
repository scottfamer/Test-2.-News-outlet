# 🎙️ TTS Feature - Quick Setup Guide

## ✅ What Was Implemented

Your news application now has **automatic text-to-speech playback** that reads articles aloud as you scroll through the feed!

## 🚀 How to Test It

### 1. Start the Development Server

```bash
npm run dev
```

### 2. Ensure OpenAI API Key is Set

Make sure your `.env` file has:
```env
OPENAI_API_KEY=your_actual_key_here
```

### 3. Open the App

Navigate to http://localhost:5173

### 4. Scroll Through Articles

- Swipe/scroll to an article
- Audio will automatically start playing within 1-2 seconds
- Purple speaker button (🔊) shows audio is playing
- Click the speaker button to mute/unmute
- Swipe to next article → audio stops and new audio starts

## 🎯 Key Features Implemented

### Backend
✅ **TTS API Endpoint**: `GET /api/news/:id/tts`  
✅ **OpenAI TTS Integration**: Uses `tts-1` model with "alloy" voice  
✅ **Smart Caching**: Audio files cached in `data/tts-cache/`  
✅ **Cost Optimization**: Each article generated once, then cached forever  

### Frontend
✅ **useTTS Hook**: Manages audio loading, playback, and cleanup  
✅ **Intersection Observer**: Detects when article is >50% visible  
✅ **Auto-Play**: Starts immediately when article becomes active  
✅ **Instant Stop**: Cleans up audio when swiping away  
✅ **Mute Control**: Purple button with visual feedback  

## 📁 Files Created/Modified

### New Files
- `server/services/tts.ts` - TTS generation and caching service
- `src/hooks/useTTS.ts` - Audio playback management hook
- `TTS_FEATURE.md` - Comprehensive feature documentation
- `TTS_SETUP.md` - This file

### Modified Files
- `server/routes/news.ts` - Added `/api/news/:id/tts` endpoint
- `src/components/ReelsContainer.tsx` - Added intersection observer
- `src/components/ReelCard.tsx` - Integrated TTS controls
- `src/api.ts` - Added `fetchTTS()` function
- `.env.example` - Documented TTS requirements
- `README.md` - Added TTS to features list

## 🔧 Configuration Options

### Change Voice
Edit `server/services/tts.ts` line 46:
```typescript
voice: 'alloy'  // Options: alloy, echo, fable, onyx, nova, shimmer
```

### Change Model Quality
```typescript
model: 'tts-1'  // or 'tts-1-hd' for higher quality (2x cost)
```

### Adjust Speed
```typescript
speed: 1.0  // Range: 0.25 to 4.0
```

### Change Auto-Play Threshold
Edit `src/components/ReelsContainer.tsx` line 28:
```typescript
threshold: [0, 0.5, 1]  // 0.5 = 50% visible
```

## 💰 Cost Estimates

OpenAI TTS costs **$15 per 1M characters** (tts-1 model).

Example costs:
- 500-word article (~3000 chars): **$0.045**
- 100 articles: **$4.50**
- Daily with 20 new articles: **$0.90/day** = **$27/month**

**With caching**: Pay once per article, zero cost on repeat views! 🎉

## 🐛 Troubleshooting

### Audio Doesn't Play
1. Check browser console for errors
2. Verify `OPENAI_API_KEY` is set
3. Check browser allows auto-play (some browsers block it)
4. Try clicking the speaker button manually

### "Failed to load audio" Error
- Check server logs for TTS generation errors
- Verify OpenAI API quota/credits
- Check network tab for 500 errors

### Audio Keeps Playing After Swipe
- This shouldn't happen! Check console for errors
- Verify `isActive` prop is changing correctly

### High Costs
- Verify caching is working: Check `data/tts-cache/` directory
- Should see `.mp3` files named `article-{id}.mp3`
- Each article should only call OpenAI API once

## 🎨 UI Controls

### Speaker Button Colors
- 🟣 Purple = TTS controls
- 🔵 Blue = "Read Full Story" button
- ⚫ Gray = "Source" link button

### Speaker Button Icons
- 🔊 `Volume2` = Audio playing
- 🔇 `VolumeX` = Audio muted
- ⏳ `Loader` (spinning) = Loading audio

## 📊 Testing Checklist

- [ ] Audio plays when scrolling to first article
- [ ] Audio stops when swiping to second article
- [ ] Second article audio starts automatically
- [ ] Clicking speaker button mutes audio
- [ ] Clicking again unmutes and resumes
- [ ] Fast swiping doesn't cause audio overlap
- [ ] Cache files appear in `data/tts-cache/`
- [ ] Second view of article uses cached audio (no API call)

## 🚀 Next Steps

### Optional Enhancements
1. **Add progress bar**: Show audio playback progress
2. **Skip controls**: Jump forward/backward 10 seconds
3. **Speed controls**: Adjust playback speed (0.5x, 1x, 1.5x, 2x)
4. **Download option**: Let users save audio files
5. **Playlist mode**: Continue to next article automatically
6. **Background playback**: Keep playing when app is backgrounded

### Production Deployment
Before deploying, ensure:
- [ ] OpenAI API key is in environment variables (not hardcoded)
- [ ] `data/tts-cache/` directory is writable
- [ ] Set up disk persistence for cache (Render/Railway/Fly.io)
- [ ] Monitor OpenAI API usage/costs
- [ ] Consider CDN for audio files if high traffic

## 📚 Documentation

- **Full Feature Docs**: See `TTS_FEATURE.md`
- **API Reference**: See `README.md` → API Endpoints
- **OpenAI TTS Docs**: https://platform.openai.com/docs/guides/text-to-speech

---

**Enjoy your voice-powered news feed! 🎙️📰**
