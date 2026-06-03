/**
 * Supabase Client Configuration
 * Replace the placeholder values with your project credentials
 */

import { config } from '../config.js';

// We'll use the CDN version for now to keep it simple without a build step
// In a real production app, you'd use npm and a bundler like Vite.

const SUPABASE_URL = config.SUPABASE_URL;
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY;
export let supabase = null;

export function initSupabase() {
    if (typeof window.supabase === 'undefined') {
        console.warn("Supabase library not loaded yet.");
        return null;
    }

    if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
        console.error("Please set your Supabase URL and Anon Key in js/api/supabase.js");
        return null;
    }

    supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return supabase;
}
