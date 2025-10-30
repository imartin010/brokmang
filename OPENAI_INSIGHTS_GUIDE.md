# 🤖 OpenAI Smart Insights Guide

## Overview

The Smart Insights feature uses OpenAI GPT-4o-mini to analyze your organization's performance data and provide actionable AI-generated recommendations.

---

## 🚀 Quick Setup

### Step 1: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-...`)

### Step 2: Add to Environment Variables

**For Local Development:**
Create or update `.env.local`:
```bash
OPENAI_API_KEY=sk-your-actual-key-here
```

**For Vercel Production:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add new variable:
   - **Name**: `OPENAI_API_KEY`
   - **Value**: `sk-your-actual-key-here`
   - **Environments**: Production, Preview, Development
3. Click "Save"
4. Redeploy your application

---

## ✨ How It Works

### Data Collection
The system automatically fetches:
- **Agent Performance**: Current and previous month scores
- **Daily Activity**: Last 30 days of logs (calls, meetings, sales)
- **Trends**: Month-over-month comparisons
- **Financial Context**: Org targets and costs
- **Top/Bottom Performers**: Ranked by score

### AI Analysis
OpenAI GPT-4o-mini analyzes the data and generates:
- **3-5 Key Insights** per analysis
- **Confidence Scores** (0-100%) based on data quality
- **Specific Reasons** with evidence from your data
- **Actionable Recommendations** with relevant links

### Insight Types
- `performance_drop` - Declining metrics
- `performance_improvement` - Positive trends
- `break_even_warning` - Financial risk alerts
- `target_exceeded` - Goals surpassed
- `top_performer` - Recognition opportunities
- `underperformer` - Support needed
- `trend_alert` - Notable patterns
- `recommendation` - General advice

---

## 🎯 Using the Feature

### Access Smart Insights
1. Go to https://brokmang.com/insights
2. Select your organization (if not already selected)
3. Click "Refresh Insights" or wait for auto-load
4. AI will analyze your data (takes 3-10 seconds)
5. View personalized insights with confidence scores

### Understanding Insights

Each insight shows:
- **Title**: Clear, attention-grabbing summary
- **Description**: Brief explanation
- **AI Confidence**: How certain the AI is (higher = more reliable)
- **Key Factors**: 2-4 specific evidence points
- **Action Button**: Link to relevant page

### Confidence Levels
- **80-100%**: High confidence (strong data, clear patterns)
- **60-79%**: Medium confidence (sufficient evidence)
- **Below 60%**: Low confidence (limited data, weak signals)

---

## 📊 Sample Insights

### Example 1: Performance Drop
```
Title: "Calls Volume Decreased"
Description: "Average daily calls dropped by 15% compared to last month"
Confidence: 85%
Key Factors:
  • Ahmed Hassan: 30 calls/day → 18 calls/day
  • Team Beta showed 20% decrease in calls
  • Trend started 2 weeks ago
Action: View Dashboard →
```

### Example 2: Top Performer
```
Title: "Star Performer Identified"
Description: "Fatma Ibrahim consistently outperforming targets"
Confidence: 95%
Key Factors:
  • Score: 94.5%
  • 140 calls/day average (target: 120)
  • 3.2M EGP sales this month
Action: View Dashboard →
```

### Example 3: Break-Even Warning
```
Title: "Break-Even Risk Detected"
Description: "Current sales pace suggests potential deficit this month"
Confidence: 72%
Key Factors:
  • Sales at 60% of monthly target
  • 10 days remaining in month
  • Average daily sales below required pace
Action: Run Analysis →
```

---

## ⚙️ Technical Details

### API Endpoint
```
POST /api/insights/generate
```

### Request Body
```json
{
  "org_id": "uuid-string",
  "user_id": "uuid-string (optional)"
}
```

### Response
```json
{
  "success": true,
  "insights": [
    {
      "type": "performance_drop",
      "title": "Calls Volume Decreased",
      "description": "Average daily calls dropped by 15%",
      "confidence": 85,
      "reasons": ["...", "...", "..."],
      "action_url": "/dashboard",
      "icon": "TrendingDown",
      "color": "from-yellow-500 to-orange-500"
    }
  ],
  "generated_at": "2024-11-01T10:30:00.000Z"
}
```

### OpenAI Model
- **Model**: `gpt-4o-mini`
- **Temperature**: 0.7 (balanced creativity/consistency)
- **Max Tokens**: 2000
- **Cost**: ~$0.01 per analysis (very affordable!)

---

## 🔒 Security & Privacy

### Data Handling
- ✅ Data sent to OpenAI is **anonymized** (no personally identifiable information)
- ✅ Only **aggregated metrics** are included (no raw logs)
- ✅ OpenAI **doesn't store** data after processing (per API agreement)
- ✅ API calls use **HTTPS** encryption
- ✅ Service role key keeps data **server-side only**

### What's Shared with OpenAI
- Agent names (first names only in summary)
- Performance scores and KPIs
- Aggregated activity metrics
- Month-over-month trends

### What's NOT Shared
- User emails or contact info
- Raw daily logs or timestamps
- Customer/client data
- Financial account details
- Authentication credentials

---

## 💰 Pricing

### OpenAI Costs
- **Input**: ~$0.15 per 1M tokens
- **Output**: ~$0.60 per 1M tokens
- **Average Analysis**: ~500 input tokens + 500 output tokens = **~$0.0005** (half a cent!)
- **Monthly Estimate**: 100 analyses/month = **~$0.05/month**

**Very affordable for the value provided!**

### Vercel Costs
- API route execution: Included in free tier (up to 100GB-hrs)
- Most organizations will stay well within free limits

---

## 🐛 Troubleshooting

### Error: "OpenAI API key not configured"
**Solution**: Add `OPENAI_API_KEY` to your environment variables (see Step 2)

### Error: "Failed to generate insights"
**Possible Causes**:
1. OpenAI API key invalid → Check key in dashboard
2. OpenAI rate limit reached → Wait a minute and retry
3. No data available → Add agents and daily logs first

### Insights seem generic or inaccurate
**Solution**:
- Ensure you have at least 1 month of data
- Add more daily logs for better trends
- Make sure agent scores are calculated
- Try again after adding more data

### Loading takes too long (>30 seconds)
**Possible Causes**:
1. Large dataset → Normal for 50+ agents
2. OpenAI API slow → Retry later
3. Network issues → Check connection

---

## 🎨 Customization

### Modify AI Prompt
Edit `/app/api/insights/generate/route.ts`, find the `prompt` variable:

```typescript
const prompt = `You are an AI business analyst...

**Your Task:**
...

**Guidelines:**
- Focus on [your priority]
- Highlight [specific metrics]
...
`;
```

### Change OpenAI Model
Replace `gpt-4o-mini` with:
- `gpt-3.5-turbo` - Faster, cheaper
- `gpt-4o` - More powerful (but more expensive)
- `gpt-4-turbo` - Balanced option

### Add Custom Insight Types
1. Add type to `getIconForType()` function
2. Add color to `getColorForType()` function
3. Update prompt to include new type
4. Update frontend `iconMap` with icon

---

## 📈 Best Practices

### For Best Results
1. **Regular Data**: Add daily logs consistently
2. **Calculate Scores**: Run monthly score calculations
3. **Refresh Often**: Generate insights weekly or bi-weekly
4. **Act on Insights**: Follow through on recommendations
5. **Track Changes**: Monitor trends over time

### When to Generate Insights
- ✅ End of each week (review week's performance)
- ✅ End of each month (comprehensive analysis)
- ✅ Before team meetings (data-driven discussions)
- ✅ When performance changes (investigate drops/spikes)
- ✅ Before setting new targets (informed goal-setting)

---

## 🚀 Advanced Features (Coming Soon)

### Scheduled Insights
Auto-generate insights daily/weekly via cron job

### Email Notifications
Send critical insights to managers via email

### Historical Tracking
Store insights in database to track AI accuracy over time

### Custom Metrics
Define organization-specific KPIs for analysis

### Multilingual Support
Generate insights in Arabic or other languages

---

## ✅ Success Checklist

- [ ] OpenAI API key configured in Vercel
- [ ] Environment variable added to production
- [ ] Application redeployed (if needed)
- [ ] Visited `/insights` page
- [ ] Selected organization
- [ ] Clicked "Refresh Insights"
- [ ] Viewed AI-generated recommendations
- [ ] Acted on at least one insight
- [ ] Scheduled regular insight reviews

---

## 🎉 You're Ready!

Your Smart Insights feature is now powered by cutting-edge AI. OpenAI will analyze your data and provide actionable recommendations to help you:
- Identify problems early
- Recognize top performers
- Support struggling agents
- Optimize team performance
- Make data-driven decisions

**Refresh insights regularly and watch your performance improve!** 🚀

---

*Generated: October 30, 2025*
*Brokmang. v1.1 - OpenAI Integration*

