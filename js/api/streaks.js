/**
 * Streak System
 * Compares today's date against last_active_date in profiles.
 * - Same day  → only total_attempts++
 * - Next day  → streak++ (consecutive)
 * - Gap ≥ 2d  → streak resets to 1
 */

import { supabase } from './supabase.js';

export async function updateStreak() {
    if (!supabase) return null;

    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;

        const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

        const { data: profile, error } = await supabase
            .from('profiles')
            .select('current_streak, longest_streak, last_active_date, total_attempts')
            .eq('id', user.id)
            .single();

        if (error) { console.error('Streak fetch error:', error); return null; }

        const currentStreak = profile?.current_streak  || 0;
        const longestStreak = profile?.longest_streak  || 0;
        const lastDate      = profile?.last_active_date || null;
        const totalAttempts = profile?.total_attempts   || 0;

        let newStreak = currentStreak;

        if (!lastDate) {
            /* Very first attempt */
            newStreak = 1;
        } else {
            const diffMs   = new Date(today) - new Date(lastDate);
            const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
                /* Same day — don't change streak, just bump attempts */
                await supabase.from('profiles').update({
                    total_attempts: totalAttempts + 1,
                }).eq('id', user.id);
                return { current_streak: currentStreak, longest_streak: longestStreak };
            } else if (diffDays === 1) {
                newStreak = currentStreak + 1;
            } else {
                newStreak = 1; /* streak broken */
            }
        }

        const newLongest = Math.max(newStreak, longestStreak);

        await supabase.from('profiles').update({
            current_streak:   newStreak,
            longest_streak:   newLongest,
            last_active_date: today,
            total_attempts:   totalAttempts + 1,
        }).eq('id', user.id);

        /* Request browser notification permission for daily reminders */
        requestDailyReminderPermission();

        return { current_streak: newStreak, longest_streak: newLongest };
    } catch (err) {
        console.error('Streak update error:', err);
        return null;
    }
}

/** Get streak data for current user */
export async function getStreakData() {
    if (!supabase) return null;
    try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        const { data } = await supabase
            .from('profiles')
            .select('current_streak, longest_streak, last_active_date, total_attempts')
            .eq('id', user.id)
            .single();
        return data;
    } catch {
        return null;
    }
}

/** Ask for browser notification permission (used as daily reminder fallback) */
function requestDailyReminderPermission() {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(perm => {
            if (perm === 'granted') scheduleReminderNotification();
        });
    } else if (Notification.permission === 'granted') {
        scheduleReminderNotification();
    }
}

/** Schedule a browser push notification for ~24 h later as a streak reminder */
function scheduleReminderNotification() {
    /* Only schedule if user is likely to still have the tab open —
       localStorage tracks last reminder so we don't spam. */
    const REMINDER_KEY = 'lsrw_reminder_ts';
    const last = parseInt(localStorage.getItem(REMINDER_KEY) || '0', 10);
    const now  = Date.now();
    const TWENTY_HOURS = 20 * 60 * 60 * 1000;

    if (now - last < TWENTY_HOURS) return; /* too soon */

    localStorage.setItem(REMINDER_KEY, String(now));

    setTimeout(() => {
        if (Notification.permission === 'granted') {
            new Notification('🔥 Keep your LSRW streak alive!', {
                body: 'You haven\'t attempted a module today. Log in and maintain your streak!',
                icon: 'favicon.svg',
            });
        }
    }, TWENTY_HOURS);
}
