-- Fix for demo user RLS policy violation
-- Run this in your Supabase SQL editor

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Users can insert own search queries" ON public.search_queries;
DROP POLICY IF EXISTS "Users can view own search queries" ON public.search_queries;
DROP POLICY IF EXISTS "Users can update own search queries" ON public.search_queries;

-- Create new policies that handle demo users
CREATE POLICY "Users can view own search queries" ON public.search_queries
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can insert own search queries" ON public.search_queries
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can update own search queries" ON public.search_queries
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

-- Similarly for product_results
DROP POLICY IF EXISTS "Users can view own product results" ON public.product_results;
DROP POLICY IF EXISTS "Users can insert product results" ON public.product_results;

CREATE POLICY "Users can view own product results" ON public.product_results
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.search_queries sq 
            WHERE sq.id = search_query_id AND (sq.user_id = auth.uid() OR sq.user_id = 'demo-user')
        )
    );

CREATE POLICY "Users can insert product results" ON public.product_results
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.search_queries sq 
            WHERE sq.id = search_query_id AND (sq.user_id = auth.uid() OR sq.user_id = 'demo-user')
        )
    );

-- For product_clicks
DROP POLICY IF EXISTS "Users can view own clicks" ON public.product_clicks;
DROP POLICY IF EXISTS "Users can insert own clicks" ON public.product_clicks;

CREATE POLICY "Users can view own clicks" ON public.product_clicks
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can insert own clicks" ON public.product_clicks
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

-- For user_wishlist
DROP POLICY IF EXISTS "Users can view own wishlist" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can insert own wishlist items" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can update own wishlist items" ON public.user_wishlist;
DROP POLICY IF EXISTS "Users can delete own wishlist items" ON public.user_wishlist;

CREATE POLICY "Users can view own wishlist" ON public.user_wishlist
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can insert own wishlist items" ON public.user_wishlist
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can update own wishlist items" ON public.user_wishlist
    FOR UPDATE USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can delete own wishlist items" ON public.user_wishlist
    FOR DELETE USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

-- For user_feedback
DROP POLICY IF EXISTS "Users can view own feedback" ON public.user_feedback;
DROP POLICY IF EXISTS "Users can insert own feedback" ON public.user_feedback;

CREATE POLICY "Users can view own feedback" ON public.user_feedback
    FOR SELECT USING (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );

CREATE POLICY "Users can insert own feedback" ON public.user_feedback
    FOR INSERT WITH CHECK (
        auth.uid() = user_id OR 
        user_id = 'demo-user'
    );