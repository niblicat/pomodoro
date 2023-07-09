<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types'
    import { enhance            } from '$app/forms'
    import { fade, fly          } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
	import { error } from '@sveltejs/kit';

    export let data: PageData
    export let form: ActionData

    interface TimeElement {
        type: string,
        value: number
    }

    // Counts down each time segment
    // Processes a length of time in deciseconds (10^-1 seconds)
    // Countdown method of 1 is a countdown, 0 is a countup

    let endTime: number = 200;
    let timeElement: TimeElement[] = [];
    let timerInProgress: boolean = false;
    let interval: number = 0;

    function timerActiveCount() {
        interval = setInterval(() => {
            endTime -= 1;
                timeElement = [
                {
                    type: 'seconds',
                    value: endTime
                }
            ]
            console.log(Math.ceil(endTime / 10));
            if (endTime < 0) {
                clearInterval(interval);
            }
        }, 100);
    }
    async function startTimer() {
        if (timerInProgress === true) throw new Error('Timer has already started.');
        timerInProgress = true;
        timerActiveCount();
    }
    async function getCurrentTime(): Promise<number> {
        if (endTime === null) return 0;
        return endTime;
    }
        async function stopTimer() {
        clearInterval(interval);
        console.log(interval);
    }
    async function setTime(timetoSet: number) {
        timerInProgress = false;
        endTime = timetoSet;
        timeElement = [
            {
                type: 'seconds',
                value: endTime
            }
        ]
    }
    setTime(200);
    async function clearTimer() {
        await stopTimer();
        await setTime(0);
    }

    let mouseHasMoved: number = 0;
    let loading: boolean = false;
    let loadingDelayIsActive: boolean = true;
    let loadingIcon: HTMLElement;
    let m = { x: 0, y: 0};
    let loadingStatus: boolean;

    // updates the internal cursor position based off the actual cursor
    // changes loading icon's position to relative if user is using mouse
    function handleMouseMove(event: MouseEvent) {
        m.x = event.clientX;
        m.y = event.clientY;
    }

    // used to show loading spinner if it takes more than 150 ms for update
    const actionLoad: SubmitFunction = (input) => {
        loadingDelayIsActive = true;
        setTimeout(() => {
            if (loadingDelayIsActive) loading = true;
        }, 150)

        return async ({ update }) => {
            await update();
            loadingDelayIsActive = false;
            loading = false;
        }

    }

    onMount(() => {
        document.body.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    });
    
    beforeUpdate(() => {
        loadingStatus = loadingIcon !== null; // make sure loadingIcon exists on the page before changing it
    })

    // moves loading spinner to cursor's position
    function loadingElementToCursor() {
        if (mouseHasMoved > 1) {
            loadingIcon.style.top = m.y - 20 + 'px';
            loadingIcon.style.left = m.x - 20 + 'px';
        }
        else if (mouseHasMoved === 1) {
            loadingIcon.style.margin = '0px';
            loadingIcon.style.position = "absolute";  
        }
        mouseHasMoved++;
    }

    afterUpdate(() => {
        if (loadingStatus === true) loadingElementToCursor();
    })

    // currently unused, might remove at later time
    onDestroy(() => {
    });


</script>

<html lang="en">
<body>
<div class="background">
    <h1>Welcome to SvelteKit</h1>
    <p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>
    <div class="timer center">
        <h2>Timer</h2>
        {#each timeElement as e (e.type)}
            <p class="numbersTime">time left: {e.value}<p>
        {/each}
        <div class="buttons">
            <form
            method="POST"
            action=?/startTime
            use:enhance={actionLoad}
            >
                <button
                on:click={startTimer}
                on:keydown={startTimer}
                title="Start"
                >
                    Start
                </button>
            </form>
            <form
            method="POST"
            action=?/endTime
            use:enhance={actionLoad}
            >
                <button
                >
                    Pause
                </button>
            </form>
        </div>
    </div>

    <div 
    id={loading === true ? "loadingIcon" : "noID"}
    class="center"
    bind:this={loadingIcon}
    />
    <p>{m.x}, {m.y}</p>
</div>
</body>
</html>

<style>
    html, body {
        margin: 0px;
        padding: 0px;
    }
    body {
        height: 100vh;
        width: 100vw;
    }
    * {
        box-sizing: border-box;
    }
    .center {
        justify-content: center;
        text-align: center;
    }
    .background {
        height: 100%;
        width: 100%;
        padding: 10px;
    }
    .timer {
        justify-content: center;
        text-align: center;
        /* will actually add unique elements here later */
    }
    .timer .buttons form {
        display:inline;
    }
    #loadingIcon {
        margin: 8px calc(50vw - 30px) 8px calc(50vw - 30px);
        border: 4px solid #f3f3f3;
        border-top: 4px solid #3073BA;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 0.5s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>