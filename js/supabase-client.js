// ============================================
// SUPABASE CLIENT - SECURE CONFIGURATION
// ============================================

/**
 * Security Notes:
 * - The anon key is safe to expose in client-side code
 * - Row Level Security (RLS) protects all data access
 * - Never expose the service_role key
 * - All API requests are rate-limited by Supabase
 * - HTTPS is enforced automatically
 */

// Import Supabase from CDN (we'll load this in HTML)
// Credentials come from config.js (not committed to git)

let supabaseClient = null;

/**
 * Initialize Supabase client
 * Call this once when the app loads
 */
function initSupabase() {
    if (typeof window.SUPABASE_CONFIG === 'undefined') {
        console.error('Supabase config not loaded. Make sure config.js is included before this script.');
        return null;
    }

    try {
        supabaseClient = supabase.createClient(
            window.SUPABASE_CONFIG.url,
            window.SUPABASE_CONFIG.anonKey
        );
        console.log('Supabase initialized successfully');
        return supabaseClient;
    } catch (error) {
        console.error('Error initializing Supabase:', error);
        return null;
    }
}

/**
 * Get the Supabase client instance
 */
function getSupabase() {
    if (!supabaseClient) {
        console.warn('Supabase not initialized. Call initSupabase() first.');
        return null;
    }
    return supabaseClient;
}

// ============================================
// SECURITY UTILITIES
// ============================================

/**
 * Sanitize user input to prevent XSS attacks
 * Always use this before displaying user-submitted content
 */
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Rate limiting helper for form submissions
 * Prevents spam by limiting submissions per time period
 */
const RateLimiter = {
    attempts: new Map(),
    
    canSubmit(key, maxAttempts = 3, windowMs = 60000) {
        const now = Date.now();
        const attempts = this.attempts.get(key) || [];
        
        // Remove old attempts outside the time window
        const recentAttempts = attempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
            return false;
        }
        
        recentAttempts.push(now);
        this.attempts.set(key, recentAttempts);
        return true;
    }
};

// ============================================
// API WRAPPER FUNCTIONS WITH ERROR HANDLING
// ============================================

/**
 * Fetch all collections
 */
async function getCollections() {
    try {
        const { data, error } = await supabaseClient
            .from('collections')
            .select('*')
            .order('travel_date', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching collections:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Fetch current collection
 */
async function getCurrentCollection() {
    try {
        const { data, error } = await supabaseClient
            .from('collections')
            .select('*')
            .eq('is_current', true)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching current collection:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Fetch collection by slug
 */
async function getCollectionBySlug(slug) {
    try {
        const { data, error } = await supabaseClient
            .from('collections')
            .select('*')
            .eq('slug', slug)
            .single();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching collection:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Fetch items in a collection
 */
async function getItemsByCollection(collectionId) {
    try {
        const { data, error } = await supabaseClient
            .from('items')
            .select('*')
            .eq('collection_id', collectionId)
            .order('featured', { ascending: false })
            .order('created_at', { ascending: false });

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error fetching items:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Fetch blog posts
 */
async function getPosts(limit = null, category = null) {
    // Check if client is initialized
    if (!supabaseClient) {
        console.error('Supabase client not initialized. Call initSupabase() first.');
        return { data: null, error: 'Database not initialized' };
    }

    try {
        console.log('📚 Fetching posts...', { limit, category });
        
        let query = supabaseClient
            .from('posts')
            .select('*')
            .eq('is_published', true)
            .order('published_at', { ascending: false });

        if (category && category !== 'all') {
            query = query.eq('category', category);
        }

        if (limit) {
            query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log(`✅ Fetched ${data?.length || 0} posts`);
        return { data, error: null };
    } catch (error) {
        console.error('💥 Exception fetching posts:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Fetch single post by slug
 */
async function getPostBySlug(slug) {
    // Check if client is initialized
    if (!supabaseClient) {
        console.error('Supabase client not initialized. Call initSupabase() first.');
        return { data: null, error: 'Database not initialized' };
    }

    try {
        console.log('📖 Fetching post with slug:', slug);
        
        const { data, error } = await supabaseClient
            .from('posts')
            .select('*')
            .eq('slug', slug)
            .eq('is_published', true)
            .single();

        if (error) {
            console.error('❌ Supabase error:', error);
            throw error;
        }
        
        console.log('✅ Post found:', data?.title);
        return { data, error: null };
    } catch (error) {
        console.error('💥 Exception fetching post:', error);
        return { data: null, error: error.message };
    }
}

/**
 * Submit a claim (customer interest in an item)
 * Includes rate limiting and validation
 */
async function submitClaim(itemId, name, email, country, message) {
    // Validate inputs
    if (!name || !email || !country) {
        return { data: null, error: 'All fields are required' };
    }

    if (!isValidEmail(email)) {
        return { data: null, error: 'Invalid email address' };
    }

    // Rate limiting (max 3 submissions per minute per email)
    if (!RateLimiter.canSubmit(email, 3, 60000)) {
        return { data: null, error: 'Too many requests. Please wait a moment.' };
    }

    // Sanitize inputs
    const sanitizedData = {
        item_id: itemId,
        customer_name: sanitizeHTML(name),
        customer_email: sanitizeHTML(email),
        shipping_country: sanitizeHTML(country),
        message: message ? sanitizeHTML(message) : null
    };

    try {
        const { data, error } = await supabaseClient
            .from('claims')
            .insert([sanitizedData])
            .select();

        if (error) throw error;
        return { data, error: null };
    } catch (error) {
        console.error('Error submitting claim:', error);
        return { data: null, error: 'Failed to submit. Please try again.' };
    }
}

/**
 * Subscribe to newsletter
 * Includes validation and rate limiting
 */
async function subscribeNewsletter(email, interests = [], source = '') {
    // Validate email
    if (!isValidEmail(email)) {
        return { data: null, error: 'Invalid email address' };
    }

    // Rate limiting (max 3 attempts per minute per email)
    if (!RateLimiter.canSubmit(email, 3, 60000)) {
        return { data: null, error: 'Too many requests. Please wait a moment.' };
    }

    const sanitizedData = {
        email: sanitizeHTML(email.toLowerCase()),
        interests: interests,
        source: source ? sanitizeHTML(source) : null
    };

    try {
        const { data, error } = await supabaseClient
            .from('newsletter')
            .insert([sanitizedData])
            .select();

        if (error) {
            // Check if it's a duplicate email error
            if (error.code === '23505') {
                return { data: null, error: 'This email is already subscribed' };
            }
            throw error;
        }

        return { data, error: null };
    } catch (error) {
        console.error('Error subscribing to newsletter:', error);
        return { data: null, error: 'Failed to subscribe. Please try again.' };
    }
}

// ============================================
// EXPORT FOR USE IN OTHER SCRIPTS
// ============================================

window.CraftCaravanAPI = {
    init: initSupabase,
    get: getSupabase,
    collections: {
        getAll: getCollections,
        getCurrent: getCurrentCollection,
        getBySlug: getCollectionBySlug
    },
    items: {
        getByCollection: getItemsByCollection
    },
    posts: {
        getAll: getPosts,
        getBySlug: getPostBySlug
    },
    claims: {
        submit: submitClaim
    },
    newsletter: {
        subscribe: subscribeNewsletter
    },
    utils: {
        sanitize: sanitizeHTML,
        validateEmail: isValidEmail
    }
};