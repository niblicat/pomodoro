<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types'
    import { enhance            } from '$app/forms'
    import { fade, fly          } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
	import { error } from '@sveltejs/kit';
    import * as timer from './timer.svelte';
    import { timeElement } from './timer.svelte';

    export let data: PageData
    export let form: ActionData

    const debug: boolean = false;

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
            loadingIcon.style.top = m.y - 15 + 'px';
            loadingIcon.style.left = m.x - 15 + 'px';
            loadingIcon.style.position = "absolute";  
            loadingIcon.style.margin = '0px';
        }
        mouseHasMoved++;
    }

    afterUpdate(() => {
        if (loadingStatus === true) loadingElementToCursor();
    })

    onDestroy(() => {
        timer.clearTimer();
    });

    timer.clearTimer(); // initialise timer to 0 seconds

</script>

<html lang="en">
<body>
<div class="background">
    <div class="wrapper center">
    <div class="timer center">
        <div class="timerTitle">Timer</div>
        <p class="numbersTime fade" transition:fade>
            {#each $timeElement as e (e.type)}
                {#if !((e.type === 'hours') && (e.value <= 0))}
                    {#if ((e.type !== 'hours') && (e.value <= 10))}0{/if}{e.value}{#if (e.type !== 'seconds')}:{/if}
                {/if}
            {/each}
        </p>
        <button
        class="fade"
        on:click={timer.timerState === timer.TimerStates.Pomodoro ? timer.pomodoroActive : timer.startTimer}
        title="Start"
        id="start"
        >
        
        start
        </button>
        <button
        class="fade"
        on:click={timer.stopTimer}
        title="Pause"
        id="pause"
        >
            pause
        </button>
    </div>
    </div>
    <div 
    id={loading === true ? "loadingIcon" : "noID"}
    class="center"
    bind:this={loadingIcon}
    />
    {#if debug}
        <p>{m.x}, {m.y}</p>
    {/if}

</div>
</body>
</html>

<style>
    html, body {
        background-color: #22FFE9;
        margin: 0px;
        padding: 0px;
    }

    body {
        height: 100vh;
        width: 100vw;
    }

    * {
        box-sizing: border-box;
        font-family: Arial, Helvetica, sans-serif;
    }

    button {
        border-radius: 25px;
        min-width: 60px;
        border: 2px solid #14FF63;
        background-color: white;
        font-size: 20px;
    }

    button:hover {
        background-color: #1499FF;
        border: 2px solid white;
        transform: scale(1.1);
    }

    button:active {
        transform: scale(0.9);
    }

    .center {
        display: flex;
        justify-content: center;
        align-items: center;
        text-align: center;
    }

    .background {
        height: 100%;
        width: 100%;
        padding: 10px;
    }

    .wrapper {
        height: 80%;
        width: 100%;
    }

    .timer {
        width: 80%;
        max-width: 380px;
        height: 100%;
        max-height: 235px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 30% 30% 30% 10%;
        grid-gap: 10px;
        border-radius: 25px;
        background-color: #13E896;
        margin: auto;
        font-size: 20px;
    }

    .timer > * {
        display: flex;
        justify-self: center;
        align-self: center;
        justify-content: center;
        align-items: center;
    }

    .timer .timerTitle {
        font-size: 25px;
        grid-row: 1;
        grid-column: span 2;
    }

    .timer .numbersTime {
        font-size: 48px;
        grid-row: 2;
        grid-column: span 2;
    }

    .timer button {
        grid-row: 3;
        display: grid;
        min-width: 60px;
        width: 80%;
    }

    .timer button#start {
    grid-column: 1;
    }

    .timer button#pause {
    grid-column: 2;
    }

    #loadingIcon {
        margin: 8px calc(50vw - 30px) 8px calc(50vw - 30px);
        border: 4px solid white;
        border-top: 4px solid #13C4E8;
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 0.5s linear infinite;
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .fade {
        transition: all .2s ease-in-out;
        animation: fadeIn .5s;
        -webkit-animation: fadeIn .5s;
        -moz-animation: fadeIn .5s;
        -o-animation: fadeIn .5s;
        -ms-animation: fadeIn .5s;
    }
</style>