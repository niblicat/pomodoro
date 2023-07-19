<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types';
    import { enhance } from '$app/forms';
    import { fade, slide } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
    import Timer, * as timer from './timer.svelte';
    import { timeElement, timerInProgressRead, timerStateRead, timerNumberVisibility } from './timer.svelte';
    import ImageSVG from './images.svelte'

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

    let innerWidth: number = 0;
    let innerHeight: number = 0;

    const ModePage = {
        Options: Symbol('Options'),
        Stats: Symbol('Stats'),
    }

    let currentModePage: Symbol;

    // updates the internal cursor position based off the actual cursor
    // changes loading icon's position to relative if user is using mouse
    function handleMouseMove(event: MouseEvent) {
        m.x = event.clientX;
        m.y = event.clientY;
    }

    let escapeButtonHeld: boolean = false;
    function handleKeyDown(event: KeyboardEvent) {
        if (menuVisible) 
            if (event.key === "Escape") closeSettings();
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
        currentModePage = ModePage.Options;
        if (debug) openSettings(); //temporary 
        document.body.addEventListener('mousemove', handleMouseMove);
        document.body.addEventListener('keydown', handleKeyDown);
        timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
        
        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
            document.body.removeEventListener('keydown', handleKeyDown);
        };
    });
    
    beforeUpdate(() => {
        loadingStatus = loadingIcon !== null; // make sure loadingIcon exists on the page before changing it
    })

    // moves loading spinner to cursor's position
    function loadingElementToCursor() {
        if (mouseHasMoved > 3) {
            // move loadingIcon to mouse cursor plus some offset so it's centered
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

    let hours: number = 0;
    let minutes: number = 5;
    let seconds: number = 0;
    let pomoWork: number = 25;
    let pomoShort: number = 5;
    let pomoLong: number = 15;
    let pomoLongPhase: number = 4;
    
    $: mobileMode = innerWidth <= 720;

    // $: cssVarStyles = Object.entries(styles)  // for later
	// 	.map(([key, value]) => `--${key}:${value}`)
	// 	.join(';');

    // handles button disable to prevent timer bug from spam
    // could better be handled with a scheduler so buttons are responsive
    let buttonEnabled: boolean = true;
    function disableButtons() {
        buttonEnabled = false;
        setTimeout(() => {
            buttonEnabled = true;
        }, 250);
    }

</script>

<svelte:window bind:innerWidth bind:innerHeight />
<html lang="en">
<body>
<link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/exo-2-new" type="text/css"/> 
<div class="background">
    <div class="menuWrapper" bind:this={menu} transition:slide|global>
        <div 
        class="menu {mobileMode ? "mobile" : ""}"
        id={menuVisible ? "visible" : "invisible"}
        >
        <!-- TODO: move or delete debug style tags -->
            {#if ((!mobileMode) || currentModePage === ModePage.Options)}
                <div class="modes {mobileMode ? "span2" : ""}" style={debug ? 'background-color: #cc0000;' : ''}>
                    <button
                    class="fade {$timerStateRead === timer.TimerStates.Pomodoro ? "selectedOption" : "unselectedOption"}"
                    id="Pomodoro"
                    on:click={() => {
                        timer.switchTimerMode(timer.TimerStates.Pomodoro);
                    }}
                    >
                    Pomo&shy;doro
                    </button>
                    <button
                    class="fade {$timerStateRead === timer.TimerStates.Sage ? "selectedOption" : "unselectedOption"}"
                    id="Sage"
                    on:click={() => {
                        alert('This feature is not yet available.');
                        // timer.switchTimerMode(timer.TimerStates.Sage);
                    }}
                    >
                    Coming Soon
                    </button>
                    <button
                    class="fade {$timerStateRead === timer.TimerStates.Standard ? "selectedOption" : "unselectedOption"}"
                    id="{!mobileMode ? "Standard" : "StandardMobile"}"
                    on:click={() => {
                        timer.switchTimerMode(timer.TimerStates.Standard);
                    }}
                    >
                    Stan&shy;dard
                    </button>
                    {#if mobileMode}
                        <button
                        class="fade unselectedOption"
                        id="Statistics"
                        on:click={() => {
                            currentModePage = ModePage.Stats;
                        }}
                        >
                            Stat&shy;istics
                        </button>
                    {/if}

                
                </div>
                <div class="modesOptionsPadding {mobileMode ? "span2" : ""}" style={debug ? 'background-color: #cccc00;' : ''}>
                    <div class="modesOptions {mobileMode ? "mobile" : ""}">
                        {#if $timerStateRead === timer.TimerStates.Pomodoro}
                            <div class="optionsInputsContainer span2 {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="workInput">work</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement work time"
                                        on:click={() => {
                                            if (pomoWork > 1) pomoWork--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="workInput"
                                        title="Set work time"
                                        bind:value={pomoWork}
                                        min="1"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment work time"
                                        on:click={() => {
                                            pomoWork++;
                                        }}
                                        />
                                    </div>
                                </div>

                                <div class="labelPillBinder">
                                    <label for="shortInput">short</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement short time"
                                        on:click={() => {
                                            if (pomoShort > 0) pomoShort--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="shortInput"
                                        title="Set short time"
                                        bind:value={pomoShort}
                                        min="1"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment short time"
                                        on:click={() => {
                                            pomoShort++;
                                        }}
                                        />
                                    </div>
                                </div>

                                <div class="labelPillBinder">
                                    <label for="longInput">long</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement long time"
                                        on:click={() => {
                                            if (pomoLong > 0) pomoLong--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="longInput"
                                        title="Set long time"
                                        bind:value={pomoLong}
                                        min="0"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment long time"
                                        on:click={() => {
                                            pomoLong++;
                                        }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="span2 optionsInputsContainer {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="longSession">long-short repetitions</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement long-short repetitions"
                                        on:click={() => {
                                            if (pomoLongPhase > 0) pomoLongPhase--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="longInput"
                                        title="Set long-short repetitions"
                                        bind:value={pomoLongPhase}
                                        min="0"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="long-short repetitions"
                                        on:click={() => {
                                            pomoLongPhase++;
                                        }}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div class="optionsButtonsContainer span2">
                                <button 
                                class="optionsButton fade bounce"
                                on:click={async () => {
                                    await timer.changeLongSession(pomoLongPhase);
                                    await timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
                                }}
                                >
                                    set times
                                </button>
                                <button 
                                class="optionsButton fade bounce"
                                on:click={async () => {
                                    pomoLongPhase = 4;
                                    pomoWork = 25;
                                    pomoShort = 5;
                                    pomoLong = 15;
                                    await timer.changeLongSession(pomoLongPhase);
                                    await timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
                                }}
                                >
                                    reset values
                                </button>
                            </div>

                        {:else if $timerStateRead === timer.TimerStates.Standard}
                            <div class="span2 optionsInputsContainer {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="hourInput">hours</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement hours"
                                        on:click={() => {
                                            if (hours > 0) hours--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="shortInput"
                                        title="Set hours"
                                        bind:value={hours}
                                        min="0"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment hours"
                                        on:click={() => {
                                            hours++;
                                        }}
                                        />
                                    </div>
                                </div>

                                <div class="labelPillBinder">
                                    <label for="minuteInput">minutes</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement minutes"
                                        on:click={() => {
                                            if (minutes > 0) minutes--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="minuteInput"
                                        title="Set minutes"
                                        bind:value={minutes}
                                        min="0"
                                        max="59"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment minutes"
                                        on:click={() => {
                                            if (minutes < 59) minutes++;
                                        }}
                                        />
                                    </div>
                                </div>

                                <div class="labelPillBinder">
                                    <label for="secondInput">seconds</label>
                                    <div class="pillButtonContainer"> 
                                        <button 
                                        class="left fade"
                                        title="Decrement seconds"
                                        on:click={() => {
                                            if (seconds > 0) seconds--;
                                        }}
                                        />
                                        <input
                                        type="number"
                                        id="secondInput"
                                        title="Set seconds"
                                        bind:value={seconds}
                                        min="0"
                                        max="59"
                                        step="1"
                                        />
                                        <button 
                                        class="right fade"
                                        title="Increment seconds"
                                        on:click={() => {
                                            if (seconds < 59) seconds++;
                                        }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="optionsButtonsContainer span2">
                                <button 
                                class="optionsButton fade bounce"
                                on:click={async () => {
                                    await timer.modifyStandardTimes(hours, minutes, seconds);
                                }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce"
                                    on:click={async () => {
                                        hours = 0;
                                        minutes = 5
                                        seconds = 0;
                                        await timer.modifyStandardTimes(hours, minutes, seconds);
                                    }}
                                >
                                    reset values
                                </button>
                            </div>
                        {/if}
                    </div>
                </div>
            {/if}
            {#if ((!mobileMode) || currentModePage === ModePage.Stats)}
                <div class="statsHead" style={debug ? 'background-color: #00cc00;' : ''}>

                </div>
                <div class="stats" style={debug ? 'background-color: #00cccc;' : ''}>

                </div>
                <div class="close" style={debug ? 'background-color: #0000cc;' : ''}>
                    {#if mobileMode}
                        <button
                        id="Settings"
                        class="fade bounce"
                        on:click={() => {
                            currentModePage = ModePage.Options;
                        }}
                        >
                        <ImageSVG colour="#000" type="SettingsIcon"/>
                        </button>
                    {/if}
                    <button
                    id="CloseMenu"
                    class="fade bounce"
                    on:click={closeSettings}
                    >
                    <ImageSVG colour="#000" type="CloseIcon"/>
                    </button>
                </div>

                <div class="profile" style={debug ? 'background-color: #cc00cc;' : ''}>

                </div>
            {/if}
        </div>
        
        <div class="optionsPadding">
            <button 
            class="fade"
            id="hanging"
            on:click={menuVisible ? closeSettings : openSettings}
            >
                settings
            </button>
        </div>
    </div>
    <div class="wrapper center">
        <div class="timer center">
            <div class="timerTitle">{($timerStateRead === timer.TimerStates.Pomodoro ? "Pomodoro Timer" : "Timer")}</div>
                <p class="numbersTime fade" transition:fade>
                    {#each $timeElement as e (e.type)}
                        {#if !((e.type === 'hours') && (e.value <= 0))}
                            {#if ((e.type !== 'hours') && (e.value < 10))}0{/if}{e.value}{#if (e.type !== 'seconds')}:{/if}
                        {/if}
                    {/each}
                </p>
                <button
                class="bounce fade {buttonEnabled ? '' : 'disabled'}"
                on:click={() => {
                    if ($timerInProgressRead) timer.stopTimer();
                    else {
                        switch ($timerStateRead) {
                        case timer.TimerStates.Pomodoro: 
                            timer.pomodoroActive();
                            break;
                        case timer.TimerStates.Sage: 
                            // call Sage mode
                            alert('No implementation');
                            break;
                        case timer.TimerStates.Sage: 
                            timer.standardStartTimer()
                            break;
                        }
                    }
                    disableButtons();
                }}
                title={!$timerInProgressRead ? 'Start' : 'Pause'}
                id={!$timerInProgressRead ? 'Start' : 'Pause'}
                disabled={!buttonEnabled}
                >
                {!$timerInProgressRead ? 'start' : 'pause'}
                </button>
                <button
                class="bounce fade"
                on:click={timer.clearTimer}
                title="Clear"
                id="Clear"
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
                    timer in progress: {$timerInProgressRead}
                </button>
                <button
                on:click={() => {
                    alert($timerStateRead.toString());
                }}>
                    state: {$timerStateRead.toString()}
                </button>
                <button
                on:click={() => {
                    alert(innerWidth + 'x' + innerHeight);
                }}>
                    dim: {innerWidth + 'x' + innerHeight}
                </button>
                <button
                on:click={() => {
                    alert(mobileMode);
                }}>
                    mobileMode: {mobileMode}
                </button>
                <button
                on:click={() => {
                    alert(buttonEnabled);
                }}>
                    buttonEnabled: {buttonEnabled}
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
        --neutraldark: #bcc6c0;
        --neutralbright: #feffff;
        --neutral: #e3eaea;
    }

    html, body {
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
        line-height: 24px;
        text-align: center;
        cursor: pointer;
        pointer-events: auto;
    }

    button:disabled {
        color: var(--neutraldark);
    }

    button:not(:focus-visible) {
        border: 2px solid var(--divback);
        background-color: var(--neutralbright);
    }

    button:hover, button:focus-visible {
        background-color: var(--accent2);
        border: 2px solid var(--neutralbright);
    }

    button.bounce:hover, button.bounce:focus-visible {
        transform: scale(1.1);
        -webkit-transform: scale(1.1);
        -moz-transform: scale(1.1);
        -o-transform: scale(1.1);
        -ms-transform: scale(1.1);
    }
    
    button.disabled:hover, button.disabled:focus-visible {
        border: 2px solid var(--divback) !important;
        background-color: var(--neutralbright) !important;
        transform: none !important;
        -webkit-transform: none !important;
        -moz-transform: none !important;
        -o-transform: none !important;
        -ms-transform: none !important;
    }

    button.bounce:active {
        transform: scale(0.9);
        -webkit-transform: scale(0.9);
        -moz-transform: scale(0.9);
        -o-transform: scale(0.9);
        -ms-transform: scale(0.9);
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
        border: 2px solid var(--neutralbright);
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

    .timer button#Start, .timer button#Pause {
        grid-column: 1;
    }
    
    .timer button#Pause:hover {
        background-color: var(--complement);
    }

    .timer button#Clear {
        grid-column: 2;
    }

    .menu {
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to bottom, var(--accent1), var(--neutralbright));
        overflow: auto;
        display: grid;
        grid-auto-flow: column;
        grid-template: 25% 75% / 60% 25% 15%;
        border-bottom: 2px solid var(--divback);
        pointer-events: auto;
    }

    .menu.mobile {
        grid-template: 25% 75% / 75% 25%;
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
        pointer-events: none;
    }
    
    .optionsPadding {
        display: flex;
        justify-content: end;
        padding-right: 20px;
        padding-left: 20px;
        order: 2;
        pointer-events: none;
    }

    .debug {
        grid-row: 4;
    }

    button#hanging {
        margin-top: -2px;
        min-width: 120px;
        width: 120px;
        border-radius: 0px 0px 25px 25px;
        border-top: 0px;
        z-index: 2;
    }

    button#hanging:hover {
        border-top: 0px;
    }
    
    .modes {
        padding-left: 4px;
        padding-right: 4px;
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

    .modes button#StandardMobile {
        border-radius: 0px 0px 0px 0px;
        border-right: 0px;
        border-left: 0px;
    }

    .modes button#Statistics {
        border-radius: 0px 25px 0px 0px;
        border-left: 0px;
    }

    button#CloseMenu {
        min-width: 30px;
    }
    button#Settings {
        min-width: 30px;
    }

    .selectedOption, .unselectedOption {
        align-content: space-around;
        flex-wrap: auto;
        hyphens: auto;
    }

    .unselectedOption {
        background-color: var(--neutral);
    }

    .selectedOption {
        cursor: unset;
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
        grid-template: 1fr 1fr 1fr 1fr / 1fr 1fr;
        grid-auto-flow: column;
        justify-content: center;
        align-items: center;
        overflow: auto;
        border-radius: 0px 25px 25px 25px;
        height: 100%;
        width: 100%;
        background-color: var(--neutralbright);
        border: 2px solid var(--divback);
    }

    .modesOptions.mobile {
        border-radius: 0px 0px 25px 25px;
    }

    .modesOptions * {
        font-size: 16px;
    }

    button.optionsButton {
        min-width: 120px;
        width: 100%;
        margin-left: 12px;
        margin-right: 12px;
    }

    .optionsInputsContainer {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    .optionsInputsContainer.mobile {
        justify-content: left;
    }

    .labelPillBinder {
        display: flex;
        align-items: center;
    }

    .labelPillBinder label {
        margin-right:  4px;
    }

    .pillButtonContainer input[type="number"] {
        background-color: transparent;
        height: 24px;
        width: 26px;
        border: solid var(--divback);
        border-width: 0 2px;
        padding: 2px;
        text-align: center;
        appearance: textfield;
        -webkit-appearance: textfield;
        -moz-appearance: textfield;
    }

    .close {
        display: flex;
        justify-content: end;
        align-items: baseline;
        flex-wrap: wrap;
        padding: 4px;
    }

    .pillButtonContainer input[type=number]::-webkit-inner-spin-button,
    .pillButtonContainer input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }
    .pillButtonContainer input[type="number"]:focus {
        outline: none;
    }

    .pillButtonContainer {
        background-color: var(--neutralbright);
        border: 2px solid var(--divback);
        border-radius: 25px; 
        display: inline-flex;
        width: 81px;
    }
    .pillButtonContainer,
    .pillButtonContainer * {
        box-sizing: border-box;
    }
    

    .pillButtonContainer button {
        background-color: transparent;
        width: 26px;
        min-width: 26px;
        outline: none;
        border: none;
        appearance: none;
        -webkit-appearance: none;
        -moz-appearance: none;
        align-items: center;
        justify-content: center;
        margin: 0px;
        position: relative;
    }
    .pillButtonContainer button:hover {
        background-color: var(--accent2);
        border: 0px;
    }

    .pillButtonContainer button:after {
        display: inline-block;
        position: absolute;
        content: '-';
        transform: translate(-50%, -50%);
        -webkit-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
    }

    .pillButtonContainer button.left {
        border-radius: 25px 0px 0px 25px;
    }
    .pillButtonContainer button.left:after {
        content: '-';
    }

    .pillButtonContainer button.right {
        border-radius: 0px 25px 25px 0px;
    }

    .pillButtonContainer button.right:after {
        content: '+';
    }

    .span2 {
        grid-column: span 2;
    }

    .span3 {
        grid-column: span 3;
    }

    .optionsButtonsContainer {
        display: flex;
        justify-content: space-around;
        box-sizing: border-box;
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