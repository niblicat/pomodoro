<script lang="ts" context="module">
    import { writable, type Writable } from 'svelte/store';

    interface TimeElement {
        type: string,
        value: number
    }

    // Counts down each time segment
    // Processes a length of time in deciseconds (10^-1 seconds)

    export let endTime: number = 200;
    export let timeElement: Writable<TimeElement[]> = writable([]);
    let timerInProgress: boolean = false;
    let interval: number = 0;

    async function formatTime(time: number) {
        let hours = Math.floor(time / 36000);
        let minutes = Math.floor((time - 36000 * hours) / 600);
        let seconds = Math.floor((time - 36000 * hours - 600 * minutes) / 10);

        timeElement.set([
                {
                    type: 'hours',
                    value: hours
                },
                {
                    type: 'minutes',
                    value: minutes
                },
                {
                    type: 'seconds',
                    value: seconds
                }
            ]);
    }

    function timerActiveCount() {
        interval = setInterval(() => {
            endTime -= 1;
            formatTime(endTime);
            console.log(Math.ceil(endTime / 10));
            if (endTime <= 0) {
                clearInterval(interval);
            }
        }, 100);
    }
    export async function startTimer() {
        if (timerInProgress === true) throw new Error('Timer has already started.');
        timerInProgress = true;
        timerActiveCount();
    }
    export async function getCurrentTime(): Promise<number> {
        if (endTime === null) return 0;
        return endTime;
    }
    export async function stopTimer() {
        timerInProgress = false;
        clearInterval(interval);
        console.log(interval);
    }
    export async function setTime(timetoSet: number) {
        timerInProgress = false;
        endTime = timetoSet;
        formatTime(timetoSet);
    }

    export async function clearTimer() {
        await stopTimer();
        await setTime(0);
    }
</script>