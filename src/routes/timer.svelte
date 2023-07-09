<script lang="ts" context="module">
    // Counts down each time segment
    // Processes a length of time in deciseconds (10^-1 seconds)

    import { writable, type Writable } from 'svelte/store';

    interface TimeElement {
        type: string,
        value: number
    }

    export let goalTime: number = 0;
    let currentTime: number = Date.now();
    let endTime: number = currentTime + 100 * goalTime;


    export let timeElement: Writable<TimeElement[]> = writable([]);
    let timerInProgress: boolean = false;
    let interval: number = 0;

    // formats the time that is displayed on screen
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
    // modifies the change in time between now and the end time every decisecond
    function timerActiveCount() {
        currentTime = Date.now();
        endTime = currentTime + 100 * goalTime;
        interval = setInterval(() => {
            currentTime = Date.now();
            formatTime((endTime - currentTime) / 100);
            if (endTime <= 0) {
                clearInterval(interval);
            }
        }, 100);
    }
    // called when the start button is pressed
    export async function startTimer() {
        if (timerInProgress === true) throw new Error('Timer has already started.');
        timerInProgress = true;
        timerActiveCount();
    }
    // currently unused
    export async function getCurrentTime(): Promise<number> {
        if (goalTime === null) return 0;
        return goalTime;
    }
    // changes the goal time from current and end time values
    async function updateGoalTime() {
        goalTime = (endTime - currentTime) / 100;
    }
    // pauses the timer and stops the time updater from looping
    export async function stopTimer() {
        timerInProgress = false;
        await updateGoalTime();
        clearInterval(interval);
        console.log(interval);
    }
    // sets the time based on deciseconds
    export async function setTime(timetoSet: number) {
        timerInProgress = false;
        goalTime = timetoSet;
        currentTime = Date.now();
        endTime = currentTime + 100 * goalTime;
        formatTime(timetoSet);
    }
    // completely resets the timer to 0 deciseconds
    export async function clearTimer() {
        await stopTimer();
        await setTime(0);
    }
</script>