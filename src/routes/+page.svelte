<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types';
    import { enhance } from '$app/forms';
    import { fade, slide } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
    import * as timer from './timer.svelte';
    import { timeElement, timerInProgressRead, timerStateRead } from './timer.svelte';

    export let data: PageData
    export let form: ActionData

    const debug: boolean = true;

    let mouseHasMoved: number = 0;
    let loading: boolean = false;
    let loadingDelayIsActive: boolean = true;
    let loadingIcon: HTMLElement;
    let menu: HTMLElement;
    let menuVisible: boolean = false;
    let m = { x: 0, y: 0};
    let loadingStatus: boolean;
    let allowHover: boolean = true; // to prevent settings button from having hover effect after click

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
        timer.clearTimer(); // initialise timer to 0 seconds
        openSettings();
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
        if (mouseHasMoved > 3) {
            loadingIcon.style.top = m.y - 15 + 'px';
            loadingIcon.style.left = m.x - 15 + 'px';
            loadingIcon.style.position = 'absolute';  
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

    // closes preference menu
    function closeSettings() {
        allowHover = false;
        menu.style.top = -260 + 'px';
        setTimeout(() => {
            menuVisible = false;
            allowHover = true;
        }, 200);
    }

    // opens preference menu
    function openSettings() {
        allowHover = false;
        menuVisible = true;
        menu.style.top = 0 + 'px';
        setTimeout(() => {
            allowHover = true;
        }, 200);
    }

</script>

<html lang="en">
<body>
<link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/exo-2-new" type="text/css"/> 
<div class="background">
    <div class="menuWrapper" bind:this={menu} transition:slide|global>
        <div 
        class="menu"
        id={menuVisible ? "visible" : "invisible"}
        >
            <div class="modes" style="background-color: #cc0000;">
                <button
                class='fade {$timerStateRead === timer.TimerStates.Pomodoro ? 'selectedOption' : 'unselectedOption'}'
                id="Pomodoro"
                on:click={() => {
                    timer.switchTimerMode(timer.TimerStates.Pomodoro);
                }}
                >
                Pomodoro
                </button>
                <button
                class='fade {$timerStateRead === timer.TimerStates.Sage ? 'selectedOption' : 'unselectedOption'}'
                id="Sage"
                on:click={() => {
                    timer.switchTimerMode(timer.TimerStates.Sage);
                }}
                >
                Coming Soon
                </button>
                <button
                class='fade {$timerStateRead === timer.TimerStates.Standard ? 'selectedOption' : 'unselectedOption'}'
                id="Standard"
                on:click={() => {
                    timer.switchTimerMode(timer.TimerStates.Standard);
                }}
                >
                Standard
                </button>

            </div>
            <div class="statsHead" style="background-color: #00cc00;">

            </div>
            <div class="close" style="background-color: #0000cc;">

            </div>
            <div class="modesOptionsPadding" style="background-color: #cccc00;">
                <div class="modesOptions">
                    {#if $timerStateRead === timer.TimerStates.Standard}
                        meow meow standr

                    {:else if $timerStateRead === timer.TimerStates.Pomodoro}
                        meow meow pomo

                    {/if}
                </div>

            </div>
            <div class="stats" style="background-color: #00cccc;">

            </div>
            <div class="profile" style="background-color: #cc00cc;">

            </div>
        </div>
        
        <div class="optionsPadding">
            <button 
            class={allowHover ? "fade hoverable" : "fade unhoverable"}
            id="hanging"
            on:click={menuVisible ? closeSettings : openSettings}
            >
                settings
            </button>
        </div>
    </div>
    <div class="wrapper center">
        <div class="timer center">
            <div class="timerTitle">{$timerStateRead === timer.TimerStates.Pomodoro ? 'Pomodoro Timer' : 'Timer'}</div>
            <p class="numbersTime fade" transition:fade>
                {#each $timeElement as e (e.type)}
                    {#if !((e.type === 'hours') && (e.value <= 0))}
                        {#if ((e.type !== 'hours') && (e.value < 10))}0{/if}{e.value}{#if (e.type !== 'seconds')}:{/if}
                    {/if}
                {/each}
            </p>
            {#if !$timerInProgressRead}
                <button
                class="fade"
                on:click={$timerStateRead === timer.TimerStates.Pomodoro ? timer.pomodoroActive : timer.startTimer}
                title="Start"
                id="start"
                >
                start
                </button>
            {:else}
                <button
                class="fade"
                on:click={timer.stopTimer}
                title="Pause"
                id="pause"
                >
                pause
                </button>
            {/if}
            <button
            class="fade"
            on:click={timer.clearTimer}
            title="Clear"
            id="clear"
            >
            clear
            </button>
        </div>
        <div 
        id={loading === true ? "loadingIcon" : "noID"}
        class="center"
        bind:this={loadingIcon}
        />
        {#if debug}
            <div class="debug">
                <p>{m.x}, {m.y}</p>
                <button
                on:click={() => {
                    alert($timerInProgressRead);
                }}>
                    timer in progress = {$timerInProgressRead}
                </button>
                <button
                on:click={() => {
                    alert($timerStateRead.toString());
                }}>
                    state = {$timerStateRead.toString()}
                </button>
            </div>
        {/if}
    </div>

</div>
</body>
</html>

<style>
    :root {
        --background: #22FFE9;
        --divback: #14FF63;
        --accent1: #13E896;
        --accent2: #13C4E8;
        --contrast: #1499FF;
        --complement: #FF14B0;
        --neutral: #bcc6c0;
        --neutralbright: #feffff;
        --neutraldark: #e3eaea;
    }

    html, body {
        /* background-color: var(--background); */
        background-image: linear-gradient(to bottom right, var(--background), var(--accent2));
        margin: 0px;
        padding: 0px;
    }

    body {
        height: 100vh;
        width: 100vw;
    }

    * {
        box-sizing: border-box;
        font-family: ExoRegular, Arial, Helvetica, sans-serif;
    }

    button {
        border-radius: 25px;
        min-width: 60px;
        border: 2px solid var(--divback);
        background-color: var(--neutralbright);
        font-size: 20px;
    }

    button:hover {
        background-color: var(--accent2);
        border: 2px solid var(--neutralbright);
        transform: scale(1.1);
        -webkit-transform : scale(1.1);
        -moz-transform : scale(1.1);
        -o-transform : scale(1.1);
        -ms-transform : scale(1.1);
    }

    button:active {
        transform: scale(0.9);
        -webkit-transform : scale(0.9);
        -moz-transform : scale(0.9);
        -o-transform : scale(0.9);
        -ms-transform : scale(0.9);
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
    }

    .wrapper {
        display: grid;
        grid-template: 30% 30% 10% 20% / 1fr;
        vertical-align: middle;
        text-align: center;
        height: 100%;
        width: 100%;
    }

    
    .timer {
        grid-row: 2;
        width: 80%;
        max-width: 380px;
        height: 100%;
        max-height: 235px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 30% 30% 30% 10%;
        grid-gap: 10px;
        border-radius: 25px;
        background-color: var(--divback);
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
        font-family: ExoExtraLight, Arial, Helvetica, sans-serif;
    }

    .timer button {
        grid-row: 3;
        display: grid;
        min-width: 60px;
        width: 80%;
    }

    .timer button#start, .timer button#pause {
        grid-column: 1;
    }
    
    .timer button#pause:hover {
        background-color: var(--complement);
    }

    .timer button#clear {
        grid-column: 2;
    }

    .menu {
        width: 100%;
        height: 100%;
        background-color: var(--neutralbright);
        overflow: auto;
        display: grid;
        grid-template: 25% 75% / 60% 25% 15%;
        border-bottom: 2px solid var(--divback);
    }

    .menuWrapper {
        transition: all 200ms ease-out;
        top: -260px;
        width: 100%;
        height: 296px;
        display: grid;
        position: absolute;
        grid-template: 1fr 36px / 1fr;
        text-align: center;
        z-index: 3;
    }
    
    .optionsPadding {
        display: flex;
        justify-content: end;
        padding-right: 20px;
        padding-left: 20px;
        order: 2;
    }

    .debug {
        grid-row: 4;
    }

    button#hanging {
        margin-top: -1px;
        min-width: 120px;
        width: 120px;
        border-radius: 0px 0px 25px 25px;
        border-top: 0px;
        z-index: 2;
        transform-origin : 50% 0px;
        -webkit-transform-origin: 50% 0px;
        -moz-transform-origin: 50% 0px;
        -o-transform-origin: 50% 0px;
        -ms-transform-origin: 50% 0px;
    }

    button#hanging.hoverable:hover {
        border-top: 0px;
        transform: none;
        -webkit-transform: none;
        -moz-transform: none;
        -o-transform: none;
        -ms-transform: none;
    }

    button#hanging:active {
        transform: scale(1);
        -webkit-transform: scale(1);
        -moz-transform: scale(1);
        -o-transform: scale(1);
        -ms-transform: scale(1);
    }
    
    .modes {
        padding-left: 4px;
        display: flex;
        align-items: end;
        justify-content: baseline;
    }

    .modes button {
        margin-bottom: -2px;
        border-bottom: 0px;
        border-radius: 25px 25px 0px 0px;
        width: 25%;
        height: 80%;
        z-index: 2;
    }

    .modes button:hover {
        transform: none;
        -webkit-transform: none;
        -moz-transform: none;
        -o-transform: none;
        -ms-transform: none;
    }

    .modes button#Pomodoro {
        border-radius: 25px 0px 0px 0px;
        border-right: 0px;
    }

    .modes button#Sage {
        background-color: var(--neutraldark);
        border-radius: 0px 0px 0px 0px;
        border-left: 0px;
        border-right: 0px;
    }

    .modes button#Standard {
        border-radius: 0px 25px 0px 0px;
        border-left: 0px;
    }

    .unselectedOption {
        background-color: var(--neutral);
    }

    .unselectedOption:hover {
        background-color: var(--accent2);
        border: 2px solid var(--neutralbright);
        border-bottom: 0px;
    }
    .selectedOption:hover {
        background-color: var(--neutralbright);
        border: 2px solid var(--divback);
        border-bottom: 0px;
    }

    .modesOptionsPadding {
        display: flex;
        padding: 0px 4px 4px 4px;
    }

    .modesOptions {
        display: grid;
        border-radius: 0px 25px 25px 25px;
        height: 100%;
        width: 100%;
        background-color: var(--neutralbright);
        border: 2px solid var(--divback);
    }

    #closeMenu {
        padding: 4px;
        align-self: baseline;
        justify-self: end;
    }

    #invisible {
        visibility: hidden;
    }

    #loadingIcon {
        grid-row: 3;
        justify-self: center;
        border: 4px solid var(--neutral);
        border-top: 4px solid var(--contrast);
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