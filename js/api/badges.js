/**
 * Badge System
 * BADGE_DEFS defines every badge.
 * checkAndAwardBadges() runs after any score save and returns newly-earned badge IDs.
 */

import { supabase } from './supabase.js';

export const BADGE_DEFS = {
    first_steps:   { name: 'First Steps',     icon: '🎯', color: '#22d18b', desc: 'Complete your very first module.' },
    streak_3:      { name: 'On a Roll',        icon: '🔥', color: '#fbbf24', desc: 'Maintain a 3-day streak.' },
    streak_7:      { name: 'Week Warrior',      icon: '⚡', color: '#7263f3', desc: 'Maintain a 7-day streak.' },
    streak_30:     { name: 'Monthly Master',    icon: '🌙', color: '#22d3ee', desc: 'Maintain a 30-day streak.' },
    streak_50:     { name: 'Unstoppable',       icon: '💫', color: '#f87171', desc: 'Maintain a 50-day streak.' },
    streak_100:    { name: 'Legendary',         icon: '👑', color: '#ffd700', desc: 'Maintain a 100-day streak.' },
    all_rounder:   { name: 'All-Rounder',       icon: '🌟', color: '#a855f7', desc: 'Attempt all 4 LSRW modules.' },
    perfect_score: { name: 'Perfectionist',     icon: '💯', color: '#22d18b', desc: 'Score 100% on any module.' },
    dedicated:     { name: 'Dedicated',         icon: '💎', color: '#22d3ee', desc: 'Complete 50 total attempts.' },
    master:        { name: 'Master',            icon: '🏆', color: '#ffd700', desc: 'Complete 100 total attempts.' },
    speed_reader:  { name: 'Speed Reader',      icon: '📚', color: '#7263f3', desc: 'Complete 10 Reading sessions.' },
    orator:        { name: 'Orator',            icon: '🎤', color: '#fbbf24', desc: 'Complete 10 Speaking sessions.' },
    sharp_ear:     { name: 'Sharp Ear',         icon: '👂', color: '#22d18b', desc: 'Complete 10 Listening sessions.' },
    wordsmith:     { name: 'Wordsmith',         icon: '✍️', color: '#f87171', desc: 'Complete 10 Writing sessions.' },
};

/**
 * Check which badges the current user has newly earned, insert them, and return the list.
 * @returns {Promise<string[]>} array of newly awarded badge_ids
 */
export async function checkAndAwardBadges() {
    if (!supabase) return [];

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];

        /* Load current data in parallel */
        const [profileRes, badgesRes, scoresRes] = await Promise.all([
            supabase.from('profiles').select('current_streak, total_attempts').eq('id', user.id).single(),
            supabase.from('badges').select('badge_id').eq('user_id', user.id),
            supabase.from('scores').select('module_type, score_achieved, total_score').eq('user_id', user.id),
        ]);

        const profile = profileRes.data || {};
        const earned  = new Set((badgesRes.data || []).map(b => b.badge_id));
        const scores  = scoresRes.data || [];

        const streak  = profile.current_streak  || 0;
        const total   = profile.total_attempts  || 0;

        const modCounts = { listening: 0, speaking: 0, reading: 0, writing: 0 };
        scores.forEach(s => { if (modCounts[s.module_type] !== undefined) modCounts[s.module_type]++; });
        const moduleTypes = Object.keys(modCounts).filter(m => modCounts[m] > 0);
        const hasPerfect  = scores.some(s => s.total_score > 0 && s.score_achieved >= s.total_score);

        const toAward = [];
        const maybe = (id, condition) => { if (condition && !earned.has(id)) toAward.push(id); };

        maybe('first_steps',   scores.length >= 1);
        maybe('streak_3',      streak >= 3);
        maybe('streak_7',      streak >= 7);
        maybe('streak_30',     streak >= 30);
        maybe('streak_50',     streak >= 50);
        maybe('streak_100',    streak >= 100);
        maybe('all_rounder',   moduleTypes.length >= 4);
        maybe('perfect_score', hasPerfect);
        maybe('dedicated',     total >= 50);
        maybe('master',        total >= 100);
        maybe('speed_reader',  modCounts.reading   >= 10);
        maybe('orator',        modCounts.speaking  >= 10);
        maybe('sharp_ear',     modCounts.listening >= 10);
        maybe('wordsmith',     modCounts.writing   >= 10);

        if (toAward.length > 0) {
            await supabase.from('badges').insert(
                toAward.map(badge_id => ({ user_id: user.id, badge_id }))
            );
        }

        return toAward;
    } catch (err) {
        console.error('Badge check error:', err);
        return [];
    }
}

/** Fetch all badges the current user has earned */
export async function getUserBadges() {
    if (!supabase) return [];
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return [];
        const { data } = await supabase.from('badges').select('badge_id, earned_at').eq('user_id', user.id).order('earned_at', { ascending: false });
        return (data || []).map(b => ({ ...BADGE_DEFS[b.badge_id], id: b.badge_id, earned_at: b.earned_at })).filter(b => b.name);
    } catch {
        return [];
    }
}
