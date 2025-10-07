-- Complete database schema for Shopping Agent
-- Run this in your Supabase SQL editor to create all necessary tables

-- Users table (might already exist with Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search queries table
CREATE TABLE IF NOT EXISTS public.search_queries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    query_text TEXT NOT NULL,
    original_query TEXT,
    num_products_requested INTEGER DEFAULT 10,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    applied_filters JSONB,
    search_strategy TEXT,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product results table
CREATE TABLE IF NOT EXISTS public.product_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    search_query_id UUID REFERENCES public.search_queries(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    image_url TEXT,
    current_price VARCHAR(100),
    price_numeric DECIMAL(10,2),
    brand VARCHAR(255),
    rating VARCHAR(50),
    rating_numeric DECIMAL(3,2),
    reviews TEXT,
    summary TEXT,
    key_specifications JSONB,
    pros_cons JSONB,
    availability VARCHAR(100),
    product_url TEXT,
    category VARCHAR(100),
    match_score DECIMAL(3,2),
    position_in_results INTEGER,
    source VARCHAR(50), -- 'amazon', 'flipkart', etc.
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping sessions table
CREATE TABLE IF NOT EXISTS public.scraping_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) UNIQUE NOT NULL,
    search_query TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'initiated', -- 'initiated', 'scraping_amazon', 'scraping_flipkart', 'processing', 'completed', 'failed'
    current_source VARCHAR(50), -- 'amazon', 'flipkart', 'processing'
    products_found INTEGER DEFAULT 0,
    amazon_products INTEGER DEFAULT 0,
    flipkart_products INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraped products table
CREATE TABLE IF NOT EXISTS public.scraped_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id VARCHAR(255) REFERENCES public.scraping_sessions(session_id),
    product_name TEXT NOT NULL,
    product_url TEXT,
    image_url TEXT,
    current_price DECIMAL(10,2),
    price_text VARCHAR(100),
    source VARCHAR(50) NOT NULL, -- 'amazon' or 'flipkart'
    specifications JSONB,
    summary TEXT,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Product clicks tracking table
CREATE TABLE IF NOT EXISTS public.product_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    product_name TEXT NOT NULL,
    source VARCHAR(50),
    clicked_url TEXT,
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_search_queries_user_id ON public.search_queries(user_id);
CREATE INDEX IF NOT EXISTS idx_search_queries_status ON public.search_queries(status);
CREATE INDEX IF NOT EXISTS idx_search_queries_created_at ON public.search_queries(created_at);

CREATE INDEX IF NOT EXISTS idx_product_results_search_query_id ON public.product_results(search_query_id);
CREATE INDEX IF NOT EXISTS idx_product_results_match_score ON public.product_results(match_score);
CREATE INDEX IF NOT EXISTS idx_product_results_position ON public.product_results(position_in_results);

CREATE INDEX IF NOT EXISTS idx_scraping_sessions_session_id ON public.scraping_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_scraping_sessions_status ON public.scraping_sessions(status);

CREATE INDEX IF NOT EXISTS idx_scraped_products_session_id ON public.scraped_products(session_id);
CREATE INDEX IF NOT EXISTS idx_scraped_products_source ON public.scraped_products(source);

CREATE INDEX IF NOT EXISTS idx_product_clicks_user_id ON public.product_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_product_clicks_source ON public.product_clicks(source);

-- Enable Row Level Security (RLS)
ALTER TABLE public.search_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_clicks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own search queries
CREATE POLICY "Users can view own search queries" ON public.search_queries
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own search queries" ON public.search_queries
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own search queries" ON public.search_queries
    FOR UPDATE USING (auth.uid() = user_id);

-- Users can see product results for their own queries
CREATE POLICY "Users can view own product results" ON public.product_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.search_queries sq 
            WHERE sq.id = search_query_id AND sq.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert product results" ON public.product_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.search_queries sq 
            WHERE sq.id = search_query_id AND sq.user_id = auth.uid()
        )
    );

-- Users can track their own clicks
CREATE POLICY "Users can view own clicks" ON public.product_clicks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own clicks" ON public.product_clicks
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow public access to scraping tables for the backend service
ALTER TABLE public.scraping_sessions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraped_products DISABLE ROW LEVEL SECURITY;

-- User wishlist table
CREATE TABLE IF NOT EXISTS public.user_wishlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    current_price TEXT,
    original_price TEXT,
    image_url TEXT,
    product_url TEXT,
    source TEXT,
    rating TEXT,
    product_data JSONB DEFAULT '{}',
    notes TEXT,
    is_purchased BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User feedback table
CREATE TABLE IF NOT EXISTS public.user_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    search_id UUID REFERENCES public.search_queries(id) ON DELETE SET NULL,
    search_query TEXT,
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    purchase_status JSONB DEFAULT '{}',
    detailed_feedback TEXT,
    helpful_results JSONB DEFAULT '[]',
    result_count INTEGER DEFAULT 0,
    feedback_timestamp TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for new tables
CREATE INDEX IF NOT EXISTS idx_user_wishlist_user_id ON public.user_wishlist(user_id);
CREATE INDEX IF NOT EXISTS idx_user_feedback_user_id ON public.user_feedback(user_id);

-- Enable RLS for new tables
ALTER TABLE public.user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_wishlist
CREATE POLICY "Users can view own wishlist" ON public.user_wishlist
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own wishlist items" ON public.user_wishlist
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own wishlist items" ON public.user_wishlist
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own wishlist items" ON public.user_wishlist
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_feedback
CREATE POLICY "Users can view own feedback" ON public.user_feedback
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Trigger for wishlist updated_at
CREATE TRIGGER handle_user_wishlist_updated_at
    BEFORE UPDATE ON public.user_wishlist
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();