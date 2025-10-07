# 🛒 Shopping Agent Application

A modern AI-powered shopping assistant that helps users find products with intelligent filtering and recommendations.

## 🌐 Application URLs

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🚀 Quick Start

### 1. Start the Backend Server

```bash
cd my-shopping-agent-backend
uvicorn main:app --reload
```

The backend will be available at: **http://localhost:8000**

### 2. Start the Frontend

```bash
cd my-shopping-agent
npm install  # Only needed first time
npm start
```

The frontend will be available at: **http://localhost:3000**

## 🎯 How to Use

1. **Open your browser** and go to http://localhost:3000
2. **Choose Demo Mode** by clicking "🚀 Try Demo Mode" button (no authentication required)
3. **Select a product category** (e.g., Electronics, Clothing, etc.)
4. **Add filters** like budget, brands, or use case
5. **Click "Find Products"** to start the AI search
6. **View results** with product comparisons, ratings, and direct purchase links

## 🔧 Database Setup

The application uses Supabase as the database. To set up:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the SQL script from `complete_database_schema.sql`

## 🐛 Troubleshooting

### Backend Issues
- Check if `.env` file exists with proper Supabase credentials
- Verify Gemini API key is valid
- Check database connection at http://localhost:8000/health

### Frontend Issues
- Run `npm install` if packages are missing
- Clear browser cache and localStorage
- Try Demo Mode if authentication fails

### Database Issues
- Ensure Supabase database schema is created
- Check Row Level Security (RLS) policies
- Verify API keys have proper permissions

## 📊 Features

- ✅ AI-powered product search
- ✅ Intelligent filtering (price, brand, category)
- ✅ Multi-source product comparison
- ✅ Real-time search progress tracking
- ✅ Product ratings and reviews
- ✅ Direct purchase links
- ✅ Demo mode for testing
- ✅ Responsive UI design

## 🛠 Tech Stack

**Frontend:**
- React 19
- Tailwind CSS
- Framer Motion
- Heroicons
- React Hot Toast

**Backend:**
- FastAPI
- Python 3.11+
- CrewAI for agent orchestration
- Supabase for database
- Gemini AI for product analysis

## 📝 Environment Variables

Create `.env` file in `my-shopping-agent-backend/`:

```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
GEMINI_API_KEY=your_gemini_api_key
GOOGLE_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-pro
FRONTEND_URL=http://localhost:3000
```

## 🚦 Status Check

Run this to check if everything is working:

```bash
# Check backend
curl http://localhost:8000/health

# Check frontend (should return HTML)
curl http://localhost:3000
```

## 📞 Support

If you encounter issues:

1. Check the console logs in browser developer tools
2. Check backend logs in terminal
3. Verify all services are running on correct ports
4. Try Demo Mode for testing without authentication
