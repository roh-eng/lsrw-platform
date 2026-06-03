import { supabase, initSupabase } from '../api/supabase.js';

export async function initAuth() {
    const client = initSupabase();
    if (!client) return null;

    const { data: { session }, error } = await client.auth.getSession();
    if (error) { console.error('Auth init error:', error.message); return null; }
    return session ? session.user : null;
}

export async function login(email, password) {
    if (!supabase) throw new Error('Supabase not initialized. Check your credentials in js/config.js');

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data.user;
}

/**
 * Creates a new account.
 * gender: 'male' | 'female'
 * Supabase trigger (handle_new_user) auto-inserts the profiles row using
 * the metadata we pass here — but we also do a client-side upsert as a fallback.
 */
export async function signup(email, password, fullName, gender = 'male') {
    if (!supabase) throw new Error('Supabase not initialized.');

    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: { full_name: fullName, gender },
            emailRedirectTo: window.location.origin,
        },
    });

    if (error) throw error;

    /* Fallback profile upsert in case the DB trigger hasn't fired yet */
    if (data.user) {
        await supabase.from('profiles').upsert(
            { id: data.user.id, full_name: fullName, gender },
            { onConflict: 'id', ignoreDuplicates: true }
        );
    }

    /*
     * Return both the user and whether they are already logged in.
     * - needsVerification = true  → "Confirm email" is ON; user must click the email link.
     * - needsVerification = false → user has an active session; log straight in.
     *
     * Note: Supabase also returns a user object (with an empty identities array)
     * when the email is ALREADY registered, to prevent email enumeration.
     */
    const alreadyRegistered =
        data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0;

    if (alreadyRegistered) {
        throw new Error('This email is already registered. Please sign in instead.');
    }

    return {
        user: data.user,
        session: data.session,
        needsVerification: !data.session,
    };
}

export async function logout() {
    if (supabase) await supabase.auth.signOut();
    window.location.reload();
}

export async function updatePassword(newPassword) {
    if (!supabase) throw new Error('Supabase not initialized.');
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
}

/**
 * Sends a password-reset email. The link in the email returns the user to the
 * app with a recovery session; main.js detects that and shows the reset form.
 */
export async function sendPasswordReset(email) {
    if (!supabase) throw new Error('Supabase not initialized.');
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
    });
    if (error) throw error;
    return true;
}

/** Fetch the full profile record for the current user */
export async function getProfile() {
    if (!supabase) return null;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return data;
}
