<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types';
    import { enhance } from '$app/forms';
    import { fade, slide } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';
    import * as timer from './timer.svelte';
    import { timeElement, timerInProgress, timerState, bell, timerSubtitle } from './timer.svelte';
    import ImageSVG from './images.svelte';
    import * as themes from './themes.svelte'
    import { styles } from './themes.svelte';
    import { bellSound, storeLocalAudio, Sounds } from './bell.svelte';

    export let data: PageData
    export let form: ActionData

    const debug: boolean = false;

    let mouseHasMoved: number = 0;
    let loading: boolean = false;
    let loadingDelayIsActive: boolean = true;
    let loadingIcon: HTMLElement;
    let menu: HTMLElement;
    let menuVisible: boolean = false;
    let m = { x: 0, y: 0};
    let loadingStatus: boolean;
    

    // TODO: fix this hover
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
        timer.changeLongSession(pomoLongPhase);
        themes.changeTheme(themes.Themes.Aurora); // change theme using this

        storeLocalAudio(Sounds.Squeaky);
        
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
    let sageWork: number = 50;
    let sageBreak: number = 10;
    let sageDescend: number = 10;
    
    $: mobileMode = innerWidth <= 720;
    $: extraThin = innerWidth <= 415;
    $: landscapeMode = innerHeight <= 500;

    $: cssVarStyles = Object.entries($styles)
		.map(([key, value]) => `--${key}:${value}`)
		.join(';');

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
<body style={cssVarStyles}>
<link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/exo-2-new" type="text/css"/> 
<div class="background">
    {#if $bell}
        <audio 
            on:ended={async () => {
                timer.muteBell();
            }}
            autoplay
        >
            <source src={bellSound} type="audio/mp3">
        </audio>
    {/if}
    <div class="menuWrapper" bind:this={menu} transition:slide|global>
        <div 
            class="menu {mobileMode ? "mobile" : ""}"
            id={menuVisible ? "visible" : "invisible"}
        >
            <!-- TODO: move or delete debug style tags -->
            {#if ((!mobileMode) || currentModePage === ModePage.Options)}
                <div class="modes {mobileMode ? "span2" : ""}" style={debug ? 'background-color: #cc0000;' : ''}>
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Pomodoro ? "selectedOption" : "unselectedOption"}"
                        id="Pomodoro"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Pomodoro);
                        }}
                    >
                        Pomo&shy;doro
                    </button>
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Sage ? "selectedOption" : "unselectedOption"}"
                        id="Sage"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Sage)
                        }}
                    >
                        Descend
                    </button>
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Standard ? "selectedOption" : "unselectedOption"}"
                        id="{!mobileMode ? "Standard" : "StandardMobile"}"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Standard);
                        }}
                    >
                        Stan&shy;dard
                    </button>
                    {#if mobileMode}
                        <button
                            class="fade alt unselectedOption"
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
                        {#if $timerState === timer.TimerStates.Pomodoro}
                            <div class="optionsInputsContainer span2 alttext {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="workInput">work</label>
                                    <div class="pillButtonContainer alt"> 
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
                                    <div class="pillButtonContainer alt"> 
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
                                    <div class="pillButtonContainer alt"> 
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

                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="longSession">long-short repetitions</label>
                                    <div class="pillButtonContainer alt"> 
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
                                    class="optionsButton fade bounce alt"
                                    on:click={async () => {
                                        await timer.changeLongSession(pomoLongPhase);
                                        await timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
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

                        {:else if $timerState === timer.TimerStates.Sage}
                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="workInput">work</label>
                                    <div class="pillButtonContainer alt"> 
                                        <button
                                            class="left fade"
                                            title="Decrement work time"
                                            on:click={() => {
                                                if (sageWork > 1) sageWork--;
                                            }}
                                        />
                                        <input
                                            type="number"
                                            id="workInput"
                                            title="Set work time"
                                            bind:value={sageWork}
                                            min="1"
                                            step="1"
                                        />
                                        <button 
                                            class="right fade"
                                            title="Increment work time"
                                            on:click={() => {
                                                sageWork++;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div class="labelPillBinder">
                                    <label for="breakInput">break</label>
                                    <div class="pillButtonContainer alt"> 
                                        <button
                                            class="left fade"
                                            title="Decrement break time"
                                            on:click={() => {
                                                if (sageBreak > 1) sageBreak--;
                                            }}
                                        />
                                        <input
                                            type="number"
                                            id="breakInput"
                                            title="Set break time"
                                            bind:value={sageBreak}
                                            min="1"
                                            step="1"
                                        />
                                        <button 
                                            class="right fade"
                                            title="Increment break time"
                                            on:click={() => {
                                                sageBreak++;
                                            }}
                                        />
                                    </div>
                                </div>
                                <div class="labelPillBinder">
                                    <label for="descendInput">descend</label>
                                    <div class="pillButtonContainer alt"> 
                                        <button
                                            class="left fade"
                                            title="Decrement descend time"
                                            on:click={() => {
                                                if (sageDescend > 0) sageDescend--;
                                            }}
                                        />
                                        <input
                                            type="number"
                                            id="descendInput"
                                            title="Set descend time"
                                            bind:value={sageDescend}
                                            min="0"
                                            step="1"
                                        />
                                        <button 
                                            class="right fade"
                                            title="Increment descend time"
                                            on:click={() => {
                                                sageDescend++;
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div class="optionsButtonsContainer span2">
                                <button 
                                    class="optionsButton fade bounce alt"
                                    on:click={async () => {
                                        await timer.modifySageTimes(sageWork, sageBreak, sageDescend);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
                                    on:click={async () => {
                                        sageWork = 0.10;
                                        sageBreak = 0.05;
                                        sageDescend = 0.01;
                                        await timer.modifySageTimes(sageWork, sageBreak, sageDescend);
                                    }}
                                >
                                    reset values
                                </button>
                            </div>
                        {:else if $timerState === timer.TimerStates.Standard}
                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <div class="labelPillBinder">
                                    <label for="hourInput">hours</label>
                                    <div class="pillButtonContainer alt"> 
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
                                    <div class="pillButtonContainer alt"> 
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
                                
                                {#if !extraThin}
                                    <div class="labelPillBinder">
                                        <label for="secondInput">seconds</label>
                                        <div class="pillButtonContainer alt"> 
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
                                {/if}
                            </div>
                            {#if extraThin}
                                <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                    <div class="labelPillBinder">
                                        <label for="secondInput">seconds</label>
                                        <div class="pillButtonContainer alt"> 
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
                            {/if}
                            <div class="optionsButtonsContainer span2">
                                <button 
                                    class="optionsButton fade bounce alt"
                                    on:click={async () => {
                                        await timer.modifyStandardTimes(hours, minutes, seconds);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
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
                            class="fade bounce alt"
                            on:click={() => {
                                currentModePage = ModePage.Options;
                            }}
                        >
                            <ImageSVG colour={$styles.alttext} type="SettingsIcon"/>
                        </button>
                    {/if}
                    <button
                        id="CloseMenu"
                        class="fade bounce alt"
                        on:click={closeSettings}
                    >
                        <ImageSVG colour={$styles.alttext} type="CloseIcon"/>
                    </button>
                </div>

                <div class="profile" style={debug ? 'background-color: #cc00cc;' : ''}>

                </div>
            {/if}
        </div>
        
        <div class="optionsPadding">
            <button 
                class="fade regular"
                id="hanging"
                on:click={menuVisible ? closeSettings : openSettings}
            >
                settings
            </button>
        </div>
    </div>
    <div class="wrapper center {landscapeMode ? "landscape" : ""}">
        <div class="timer center regulartext">
            <div class="em1"/>
            <div class="timerTitle">
                {#if $timerState === timer.TimerStates.Pomodoro}
                    Pomodoro Timer
                {:else if $timerState === timer.TimerStates.Sage}
                    Descend Timer
                {:else}
                    Timer
                {/if}
            </div>
            <div class="timerSubtitle">
                {$timerSubtitle}
            </div>
            <p class="numbersTime fade" transition:fade>
                {#each $timeElement as e (e.type)}
                    {#if !((e.type === 'hours') && (e.value <= 0))}
                        {#if ((e.type !== 'hours') && (e.value < 10))}0{/if}{e.value}{#if (e.type !== 'seconds')}:{/if}
                    {/if}
                {/each}
            </p>
            <button
            class="bounce fade regular {buttonEnabled ? '' : 'disabled'}"
                on:click={() => {
                    if ($timerInProgress) timer.stopTimer();
                    else {
                        switch ($timerState) {
                        case timer.TimerStates.Pomodoro: 
                            timer.pomodoroActive();
                            break;
                        case timer.TimerStates.Sage: 
                            timer.sageActive();
                            break;
                        case timer.TimerStates.Standard: 
                            timer.standardStartTimer()
                            break;
                        }
                    }
                    disableButtons();
                }}
                title={!$timerInProgress ? 'Start' : 'Pause'}
                id={!$timerInProgress ? 'Start' : 'Pause'}
                disabled={!buttonEnabled}
            >
                {!$timerInProgress ? 'start' : 'pause'}
            </button>
            <button
                class="bounce fade regular"
                on:click={timer.clearTimer}
                title="Clear"
                id="Clear"
            >
                clear
            </button>
            <div class="em2"/>
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
                        alert($timerInProgress);
                    }}
                >
                    timer in progress: {$timerInProgress}
                </button>
                <button
                    on:click={() => {
                        alert($timerState.toString());
                    }}
                >
                    state: {$timerState.toString()}
                </button>
                <button
                    on:click={() => {
                        alert(innerWidth + 'x' + innerHeight);
                    }}
                >
                    dim: {innerWidth + 'x' + innerHeight}
                </button>
                <button
                    on:click={() => {
                        alert(mobileMode);
                    }}
                >
                    mobileMode: {mobileMode}
                </button>
                <button
                    on:click={() => {
                        alert(buttonEnabled);
                    }}
                >
                    buttonEnabled: {buttonEnabled}
                </button>
                <button
                    on:click={() => {
                        themes.changeTheme(themes.Themes.Funky)
                    }}
                >
                    funkytime
                </button>
                <button
                    on:click={() => {
                        alert($bell);
                    }}
                >
                    bell: {$bell}
                </button>
            </div>
        {/if}
    </div>

</div>
</body>
</html>

<style>
    html, body {
        background-image: linear-gradient(to bottom right, var(--background), var(--accent2));
        margin: 0px;
        padding: 0px;
        --fontsize: 20px;
    }

    body {
        color: var(--neutralheavy);
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
        font-size: var(--fontsize);
        line-height: 24px;
        text-align: center;
        cursor: pointer;
        pointer-events: auto;
    }

    .regular, .regular > * {
        color: var(--text);
        background-color: var(--input);
    }

    .regulartxt, .regulartext > * {
        color: var(--text);
    }
    
    .alttext, .alttext > * {
        color: var(--alttext);
    }

    .alt, .alt > * {
        color: var(--alttext);
        background-color: var(--altinput);
    }

    button:disabled {
        color: var(--neutraldark);
    }

    button:not(:focus-visible) {
        border: 2px solid var(--divback);
    }

    button.regular:not(:focus-visible) {
        background-color: var(--input);
    }

    button.alt:not(:focus-visible) {
        background-color: var(--altinput);
    }

    @media(hover: hover) {
        button.regular:hover, button.regular:focus-visible {
            background-color: var(--accent2);
            border: 2px solid var(--input);
        }
    }
    
    @media(hover: hover) {
        button.alt:hover, button.alt:focus-visible {
            background-color: var(--accent2);
            border: 2px solid var(--contrast);
        }
    }
    
    @media(hover: hover) {
        button.bounce:hover, button.bounce:focus-visible {
            transform: scale(1.1);
            -webkit-transform: scale(1.1);
            -moz-transform: scale(1.1);
            -o-transform: scale(1.1);
            -ms-transform: scale(1.1);
        }
    }
    
    @media(hover: hover) {
        button.disabled:hover, button.disabled:focus-visible {
            border: 2px solid var(--divback) !important;
            background-color: var(--input) !important;
            transform: none !important;
            -webkit-transform: none !important;
            -moz-transform: none !important;
            -o-transform: none !important;
            -ms-transform: none !important;
        }
    }

    button.bounce:active {
        transform: scale(0.9);
        -webkit-transform: scale(0.9);
        -moz-transform: scale(0.9);
        -o-transform: scale(0.9);
        -ms-transform: scale(0.9);
    }

    input {
        color: var(--neutralheavy)
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
        position: relative;
        overflow: hidden;
    }

    .wrapper {
        display: grid;
        grid-template: 25% 40% 10% 25% / 1fr;
        transition: grid-template 0.5s ease;
        vertical-align: middle;
        text-align: center;
        height: 100%;
        width: 100%;
        transition: 0.5s;
    }

    .wrapper.landscape {
        grid-template: 20% 60% 10% 10% / 1fr;
        transition: 0.5s;
    }
    
    .timer {
        grid-row: 2;
        width: 80%;
        max-width: 380px;
        height: 100%;
        max-height: 235px;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: 5% 15% 5% 50% 20% 5%;
        grid-gap: 0px;
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
        grid-row: 2;
        grid-column: span 2;
    }

    .timer .timerSubtitle {
        align-self: baseline;
        font-size: 16px;
        grid-row: 3;
        grid-column: span 2;
    }

    .timer .numbersTime {
        font-size: 48px;
        grid-row: 4;
        grid-column: span 2;
        font-family: ExoExtraLight, Arial, Helvetica, sans-serif;
    }

    .timer button {
        align-self: baseline;
        grid-row: 5;
        display: grid;
        min-width: 60px;
        width: 80%;
    }

    .timer button#Start, .timer button#Pause {
        grid-column: 1;
    }
    
    @media(hover: hover)  {
        .timer button#Pause:hover {
            background-color: var(--complement);
        }
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

    @media(hover: hover) {
        button#hanging:hover {
            border-top: 0px;
        }
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
        font-size: min(var(--fontsize), 3.54vw);
    }

    .unselectedOption {
        background-color: var(--neutral) !important;
    }

    @media(hover: hover) {
        .selectedOption, .selectedOption:hover {
            cursor: unset;
            background-color: var(--altinput) !important;
            border-color: var(--divback) !important;
            border-bottom: 0px !important;
        }
    }

    @media(hover: hover) {
        .unselectedOption:hover {
            background-color: var(--accent2) !important;
            border: 2px solid var(--input);
            border-bottom: 0px !important;
        }
    }

    @media(hover: hover) {
        .selectedOption:hover {
            background-color: var(--input);
            border: 2px solid var(--divback);
            border-bottom: 0px;
        }
    }

    .modesOptionsPadding {
        display: flex;
        padding: 0px 4px 4px 4px;
    }

    .modesOptions {
        background-color: var(--altinput);
        border: 2px solid var(--divback);
        display: grid;
        grid-template: 1fr 1fr 1fr 1fr / 1fr 1fr;
        grid-auto-flow: column;
        justify-content: center;
        align-items: center;
        overflow: auto;
        border-radius: 0px 25px 25px 25px;
        height: 100%;
        width: 100%;
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
        margin-left: 2vw;
        margin-right: 2vw;
    }

    .optionsInputsContainer {
        display: flex;
        align-items: center;
        justify-content: space-around;
    }

    .labelPillBinder {
        display: flex;
        align-items: center;
    }

    .labelPillBinder label {
        margin-right:  4px;
        font-size: min(16px, 3.54vw);
    }

    .pillButtonContainer input[type="number"] {
        background-color: transparent;
        height: 24px;
        width: 33.33%;
        width: calc(100%/3);
        border: solid var(--divback);
        border-width: 0 2px;
        padding: 2px;
        text-align: center;
        appearance: textfield;
        font-size: min(14px, 3.15vw);
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
        border: 2px solid var(--divback);
        border-radius: 25px; 
        display: inline-flex;
        width: min(81px, 20vw);
    }
    .pillButtonContainer,
    .pillButtonContainer * {
        box-sizing: border-box;
    }
    

    .pillButtonContainer button {
        background-color: transparent;
        width: 33.33%;
        width: calc(100%/3);
        min-width: 33.33%;
        min-width: calc(100%/3);
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
    @media(hover: hover) {
        .pillButtonContainer button:hover {
            background-color: var(--accent2);
            border: 0px;
        }
    }

    .pillButtonContainer button:after {
        display: inline-block;
        position: absolute;
        font-size: min(16px, 4vw);
        transition: all .2s ease-in-out;
        transform: translate(-50%, -50%);
        -webkit-transform: translate(-50%, -50%);
        -moz-transform: translate(-50%, -50%);
        -o-transform: translate(-50%, -50%);
        -ms-transform: translate(-50%, -50%);
    }
    .pillButtonContainer button:active:after {
        transition: all .2s ease-in-out;
        transform: translate(-50%, -50%) scale(0.5);
        -webkit-transform: translate(-50%, -50%) scale(0.5);
        -moz-transform: translate(-50%, -50%) scale(0.5);
        -o-transform: translate(-50%, -50%) scale(0.5);
        -ms-transform: translate(-50%, -50%) scale(0.5);
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
        pointer-events: none;
        cursor: unset;
        z-index: 9;
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