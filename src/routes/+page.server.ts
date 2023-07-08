import { fail, type Actions } from '@sveltejs/kit';
import type { PageServerLoad } from './$types.js';
import type Page from './+page.svelte';

// Counts down each time segment
// Processes a length of time in deciseconds (10^-1 seconds)
// Countdown method of 1 is a countdown, 0 is a countup

async function getPreferences(): Promise<any> {
    // TODO: change promise to be specific
}

export const actions: Actions = {
    startTime: async () => {
        return { success: true };
    },
    endTime: async () => {
        return { success: true };
    },
    pauseTime: async () => {
        return { success: true };
    },
    setTime: async ({ request }) => {
        const formData = await request.formData();

        if (!formData) {
            return fail(400, { request, missing: true});
        }
        return { success: true };
    }

}

export const load: PageServerLoad = async () => {
    let preferences = await getPreferences();

    return {
        preferences: preferences
    };
}