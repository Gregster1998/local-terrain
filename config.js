// ============================================
// CONFIGURATION FILE
// ============================================
// 
// This file works in two modes:
// 1. LOCAL: Use hardcoded values for local development
// 2. RENDER: Use environment variables injected at build time
// 
// SECURITY WARNING:
// Never commit config.js with real credentials to git!
// Add "config.js" to your .gitignore file
// ============================================

// Check if we're on Render (environment variables will be injected)
const isRenderProduction = window.location.hostname !== 'localhost' && 
                           window.location.hostname !== '127.0.0.1';

window.SUPABASE_CONFIG = {
    // Your Supabase project URL
    // Found in: Project Settings > API > Project URL
    url: isRenderProduction 
        ? '{{ SUPABASE_URL }}' // Render will inject this
        : 'https://khxmzezupbsgmspauqdv.supabase.co', // Replace for local development
    
    // Your Supabase anon/public key
    // Found in: Project Settings > API > Project API keys > anon/public
    // NOTE: This key is SAFE to expose in client-side code
    // Row Level Security (RLS) protects your data
    anonKey: isRenderProduction
        ? '{{ SUPABASE_ANON_KEY }}' // Render will inject this
        : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoeG16ZXp1cGJzZ21zcGF1cWR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA1Mzk2MzMsImV4cCI6MjA4NjExNTYzM30.lPKrtOKFcVnERdkReja-RaqAhNTxhSmGhg1xGzF0IKs' // Replace for local development
};

// ============================================
// SETUP INSTRUCTIONS:
// ============================================
// 
// 1. Go to https://supabase.com and create a free account
// 2. Create a new project
// 3. Wait for project to finish setting up (~2 minutes)
// 4. Go to Project Settings > API
// 5. Copy your "Project URL" and paste it above
// 6. Copy your "anon public" key and paste it above
// 7. Go to SQL Editor and run the supabase-schema.sql file
// 8. Done! Your database is secure and ready
// 
// IMPORTANT:
// - Never commit this file with real values
// - The anon key is safe for client-side use
// - Never use the service_role key in client code
// - Supabase automatically handles rate limiting
// - All data access is protected by Row Level Security
// ============================================