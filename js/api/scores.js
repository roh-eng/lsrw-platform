/**
 * Scores API — save/fetch scores, then trigger streak + badge updates.
 */

import { supabase }              from './supabase.js';
import { updateStreak }          from './streaks.js';
import { checkAndAwardBadges }   from './badges.js';

/**
 * Save a module score, update the streak, check for new badges.
 * Returns { data, newBadges }
 */
export async function saveScore(moduleType, scoreAchieved, totalScore) {
    if (!supabase) return { error: 'Supabase not initialized' };

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'No authenticated user' };

    const { data, error } = await supabase
        .from('scores')
        .insert([{ user_id: user.id, module_type: moduleType, score_achieved: scoreAchieved, total_score: totalScore }]);

    if (error) { console.error('Error saving score:', error.message); return { error }; }

    /* Update streak and check badges in the background (don't block UI) */
    const [, newBadges] = await Promise.all([
        updateStreak(),
        checkAndAwardBadges(),
    ]);

    /* Show badge toast for each newly-earned badge */
    if (Array.isArray(newBadges) && newBadges.length > 0) {
        newBadges.forEach((id, i) => {
            /* stagger toasts by 600 ms each so they don't all stack at once */
            setTimeout(() => window.__lsrwBadgeToast?.(id), i * 600);
        });
    }

    return { data, newBadges: newBadges || [] };
}

/**
 * Fetch recent scores for the current user.
 */
export async function getRecentScores(limit = 5) {
    if (!supabase) return [];

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
        .from('scores')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

    if (error) { console.error('Error fetching scores:', error.message); return []; }
    return data;
}
