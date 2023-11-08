<script lang="ts">
    import { fade, slide } from 'svelte/transition';
    import { onMount } from 'svelte';
    import * as timer from './timer.svelte';
    import { timeElement, timerInProgress, timerState, bell, timerTitle, timerSubtitle } from './timer.svelte';
    import ImageSVG from './images.svelte';
    import * as themes from './themes.svelte'
    import { styles } from './themes.svelte';
    import { bellSound, storeLocalAudio, Sounds } from './bell.svelte';
    import * as vibrate from './vibrate';
    import PillButton from './pillbutton.svelte'

    let debug: boolean = false;

    let loading: boolean = false;
    let loadingIcon: HTMLElement;
    let menu: HTMLElement;
    let menuVisible: boolean = false;
    let m = { x: 0, y: 0};
    
    let innerWidth: number;
    let innerHeight: number;

    const ModePage = {
        Options: Symbol('Options'),
        Stats: Symbol('Stats'),
    }

    let currentModePage: Symbol;

    function handleKeyDown(event: KeyboardEvent) {
        if (menuVisible) 
            if (event.key === "Escape") closeSettings();
    }

    onMount(() => {
        currentModePage = ModePage.Options;
        document.body.addEventListener('keydown', handleKeyDown);
        timer.setTime(timer.convertTimeToDecisecondsSync(0, pomoWork, 0));

        storeLocalAudio(Sounds.Squeaky);

        return () => {
            document.body.removeEventListener('keydown', handleKeyDown);
            timer.clearTimer();
        };
    });

    // closes preference menu
    function closeSettings() {
        menu.style.top = -260 + 'px';
        setTimeout(() => {
            menuVisible = false;
        }, 200);
    }

    // opens preference menu
    function openSettings() {
        menuVisible = true;
        menu.style.top = 0 + 'px';
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

    let debugCount = 0;
    function triggerDebug() {
        debugCount++;
        if (debugCount > 7) {
            debug = true;
        }
        if (debugCount <= 0) {
            setTimeout(() => {
                debugCount = 0;
            }, 1000);
        }
    }

    let boundValue = 3;
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<svelte:head>
    <link rel="stylesheet" media="screen" href="https://fontlibrary.org//face/exo-2-new" type="text/css"/> 
    <title>
        {$timerTitle}
    </title>
</svelte:head>
<html lang="en">
<body class={$styles.hasgradient === false ? "nogradient" : ""} style={cssVarStyles}>
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
    <div
    class="menuWrapper"
    bind:this={menu}
    transition:slide|global
    >
        <div 
            class="menu {mobileMode ? "mobile" : ""}"
            id={menuVisible ? "visible" : "invisible"}
        >
            {#if ((!mobileMode) || currentModePage === ModePage.Options)}
                <div class="modes {mobileMode ? "span2" : ""} {debug ? "db1" : ""}">
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Pomodoro ? "selectedOption" : "unselectedOption"}"
                        id="Pomodoro"
                        title="Pomodoro Timer"
                        type="button"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Pomodoro);
                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                        }}
                    >
                        Pomo&shy;doro
                    </button>
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Sage ? "selectedOption" : "unselectedOption"}"
                        id="Sage"
                        title="Descend Timer"
                        type="button"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Sage);
                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                        }}
                    >
                        De&shy;scend
                    </button>
                    <button
                        class="fade alt {$timerState === timer.TimerStates.Standard ? "selectedOption" : "unselectedOption"}"
                        id="{(!mobileMode || !debug) ? "Standard" : "StandardMobile"}"
                        title="Standard Timer"
                        type="button"
                        on:click={() => {
                            timer.switchTimerMode(timer.TimerStates.Standard);
                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                        }}
                    >
                        Stan&shy;dard
                    </button>
                    {#if (mobileMode && debug)}
                        <button
                            class="fade alt unselectedOption"
                            id="Statistics"
                            type="button"
                            on:click={() => {
                                currentModePage = ModePage.Stats;
                                vibrate.vibrateAction(vibrate.VibrateType.Standard);
                            }}
                        >
                            Stat&shy;istics
                        </button>
                    {/if}

                
                </div>
                <div class="modesOptionsPadding {mobileMode ? "span2" : ""} {debug ? "db2" : ""}">
                    <div class="modesOptions {mobileMode ? "mobile" : ""}">
                        {#if $timerState === timer.TimerStates.Pomodoro}
                            <div class="optionsInputsContainer span2 alttext {mobileMode ? "mobile" : ""}">
                                <PillButton
                                    bind={pomoWork}
                                    label="work"
                                    titleDescription="work time"
                                    id="workInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (pomoWork > 1) pomoWork--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        pomoWork++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />

                                <PillButton
                                    bind={pomoShort}
                                    label="short"
                                    titleDescription="short break time"
                                    id="shortInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (pomoShort > 0) pomoShort--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        pomoShort++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />

                                <PillButton
                                    bind={pomoLong}
                                    label="short"
                                    titleDescription="long break time"
                                    id="longInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (pomoLong > 0) pomoLong--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        pomoLong++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                            </div>
                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <PillButton
                                    bind={pomoLongPhase}
                                    label="long-short repetitions"
                                    titleDescription="long-short repetitions"
                                    id="longSession"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (pomoLongPhase > 0) pomoLongPhase--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        pomoLongPhase++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                            </div>

                            <div class="optionsButtonsContainer span2">
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        await timer.changeLongSession(pomoLongPhase);
                                        await timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        pomoLongPhase = 4;
                                        pomoWork = 25;
                                        pomoShort = 5;
                                        pomoLong = 15;
                                        await timer.changeLongSession(pomoLongPhase);
                                        await timer.modifyPomodoroTimes(pomoWork, pomoShort, pomoLong);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                >
                                    reset values
                                </button>
                            </div>

                        {:else if $timerState === timer.TimerStates.Sage}
                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <PillButton
                                    bind={sageWork}
                                    label="work"
                                    titleDescription="work time"
                                    id="workInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (sageWork > 1) sageWork--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        sageWork++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                                <PillButton
                                    bind={sageBreak}
                                    label="break"
                                    titleDescription="break time"
                                    id="breakInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (sageBreak > 1) sageBreak--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        sageBreak++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                                <PillButton
                                    bind={sageDescend}
                                    label="descend"
                                    titleDescription="descend time"
                                    id="descendInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (sageDescend > 0) sageDescend--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        sageDescend++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                            </div>
                            <div class="optionsButtonsContainer span2">
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        await timer.modifySageTimes(sageWork, sageBreak, sageDescend);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        sageWork = 50;
                                        sageBreak = 10;
                                        sageDescend = 10;
                                        await timer.modifySageTimes(sageWork, sageBreak, sageDescend);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                >
                                    reset values
                                </button>
                            </div>
                        {:else if $timerState === timer.TimerStates.Standard}
                            <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                <PillButton
                                    bind={hours}
                                    label="hours"
                                    titleDescription="hours"
                                    id="hourInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (hours > 0) hours--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        hours++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                                <PillButton
                                    bind={minutes}
                                    label="minutes"
                                    titleDescription="minutes"
                                    id="minuteInput"
                                    --divback={$styles.divback}
                                    --accent={$styles.accent2}
                                    --background="{$styles.altinput}"
                                    --text={$styles.alttext}
                                    on:decrement={() => {
                                        if (minutes > 0) minutes--;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                    on:increment={() => {
                                        if (minutes < 59) minutes++;
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                />
                                
                                {#if !extraThin}
                                    <PillButton
                                        bind={seconds}
                                        label="seconds"
                                        titleDescription="seconds"
                                        id="secondInput"
                                        --divback={$styles.divback}
                                        --accent={$styles.accent2}
                                        --background="{$styles.altinput}"
                                        --text={$styles.alttext}
                                        on:decrement={() => {
                                            if (seconds > 0) seconds--;
                                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                        }}
                                        on:increment={() => {
                                            if (seconds < 59) seconds++;
                                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                        }}
                                    />
                                {/if}
                            </div>
                            {#if extraThin}
                                <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
                                    <PillButton
                                        bind={seconds}
                                        label="seconds"
                                        titleDescription="seconds"
                                        id="secondInput"
                                        --divback={$styles.divback}
                                        --accent={$styles.accent2}
                                        --background="{$styles.altinput}"
                                        --text={$styles.alttext}
                                        on:decrement={() => {
                                            if (seconds > 0) seconds--;
                                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                        }}
                                        on:increment={() => {
                                            if (seconds < 59) seconds++;
                                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                        }}
                                    />
                                </div>
                            {/if}
                            <div class="optionsButtonsContainer span2">
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        await timer.modifyStandardTimes(hours, minutes, seconds);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                                    }}
                                >
                                    set times
                                </button>
                                <button 
                                    class="optionsButton fade bounce alt"
                                    type="button"
                                    on:click={async () => {
                                        hours = 0;
                                        minutes = 5
                                        seconds = 0;
                                        await timer.modifyStandardTimes(hours, minutes, seconds);
                                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
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
                <div class="statsHead {debug ? "db3" : ""}">

                </div>
                <div class="stats {debug ? "db4" : ""}">

                </div>
                <div class="close {debug ? "db5" : ""}">
                    {#if mobileMode}
                        <button
                            id="Settings"
                            class="fade bounce alt"
                            type="button"
                            on:click={() => {
                                currentModePage = ModePage.Options;
                                vibrate.vibrateAction(vibrate.VibrateType.Standard);
                            }}
                        >
                            <ImageSVG colour={$styles.alttext} type="SettingsIcon"/>
                        </button>
                    {/if}
                    <button
                        id="CloseMenu"
                        class="fade bounce alt"
                        type="button"
                        on:click={() => {
                            closeSettings();
                            vibrate.vibrateAction(vibrate.VibrateType.Standard);
                        }}
                    >
                        <ImageSVG colour={$styles.alttext} type="CloseIcon"/>
                    </button>
                </div>

                <div class="profile {debug ? "db6" : ""}">

                </div>
            {/if}
        </div>
        
        <div class="optionsPadding">
            <button 
                class="fade regular {buttonEnabled ? '' : 'disabled'}"
                id="hanging"
                type="button"
                on:click={() => {
                    if (menuVisible) closeSettings();
                    else openSettings();
                    disableButtons();
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
            >
                settings
            </button>
        </div>
    </div>
    <div class="wrapper center {landscapeMode ? "landscape" : ""}">
        <div class="timer center regulartext">
            <div class="em1"/>
            <div class="timerTitle">
                {$timerTitle}
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
            type="button"
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
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                title={!$timerInProgress ? 'Start' : 'Pause'}
                id={!$timerInProgress ? 'Start' : 'Pause'}
                disabled={!buttonEnabled}
            >
                {!$timerInProgress ? 'start' : 'pause'}
            </button>
            <button
            class="bounce fade regular"
            type="button"
            on:click={() => {
                timer.clearTimer();
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
                triggerDebug();
            }}
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
                type="button"
                on:click={() => {
                    alert($timerInProgress);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                timer in progress: {$timerInProgress}
                </button>
                <button
                type="button"
                on:click={() => {
                    alert($timerState.toString());
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    state: {$timerState.toString()}
                </button>
                <button
                type="button"
                on:click={() => {
                    alert(innerWidth + 'x' + innerHeight);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    dim: {innerWidth + 'x' + innerHeight}
                </button>
                <button
                type="button"
                on:click={() => {
                    alert(mobileMode);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    mobileMode: {mobileMode}
                </button>
                <button
                type="button"
                on:click={() => {
                    alert(buttonEnabled);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    buttonEnabled: {buttonEnabled}
                </button>
                <button
                type="button"
                on:click={() => {
                    themes.changeTheme(themes.Themes.Funky);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    funkytime
                </button>
                <button
                type="button"
                on:click={() => {
                    themes.changeTheme(themes.Themes.Terminal);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    digital
                </button>
                <button
                type="button"
                on:click={() => {
                    themes.changeTheme(themes.Themes.Classic);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    classic
                </button>
                <button
                type="button"
                on:click={() => {
                    alert($bell);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    bell: {$bell}
                </button>
                <button
                type="button"
                on:click={() => {
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    Vibrate
                </button>
                <button
                type="button"
                on:click={() => {
                    debug = false;
                }}
                >
                    Disable Debug
                </button>
                <PillButton
                bind={boundValue}
                label="testing"
                titleDescription="test time"
                --divback={$styles.divback}
                --accent={$styles.accent2}
                --background="{$styles.altinput}"
                --text={$styles.alttext}
                on:decrement={() => {
                    alert('minus minus!');
                    boundValue--;
                }}
                on:increment={() => {
                    alert('plus plus!');
                    boundValue++;
                }}
                />
            </div>
        {/if}
    </div>

</div>
</body>
</html>

<style>
    html, body {
        margin: 0px;
        padding: 0px;
        background-color: var(--background);
        background-image: linear-gradient(var(--gradientdirection, 'to bottom right'), var(--background), var(--accent2));
        --fontsize: 20px;
    }

    .nogradient {
        background-image: none;
    }

    :global(html), :global(body) {
        margin: 0px;
        padding: 0px;
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

    .regular/*, .regular > * */ {
        color: var(--text);
        background-color: var(--input);
    }

    /*.regulartxt, */.regulartext > * {
        color: var(--text);
    }
    
    .alttext/*, .alttext > **/ {
        color: var(--alttext);
    }

    .alt/*, .alt > **/ {
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

    /* input {
        color: var(--neutralheavy)
    } */

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
        color: var(--title, #000)
    }

    .timer .timerSubtitle {
        align-self: baseline;
        font-size: 16px;
        grid-row: 3;
        grid-column: span 2;
        color: var(--title, #000)
    }

    .timer .numbersTime {
        font-size: 48px;
        grid-row: 4;
        grid-column: span 2;
        font-family: ExoExtraLight, Arial, Helvetica, sans-serif;
        color: var(--title, #000)
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

    .debug button {
        font-size: 8px;
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

    .close {
        display: flex;
        justify-content: end;
        align-items: baseline;
        flex-wrap: wrap;
        padding: 4px;
    }

    .span2 {
        grid-column: span 2;
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

    .db1 {
        background-color: #dd0000;
    }
    .db2 {
        background-color: #00dd00;
    }
    .db3 {
        background-color: #0000dd;
    }
    .db4 {
        background-color: #dddd00;
    }
    .db5 {
        background-color: #00dddd;
    }
    .db6 {
        background-color: #dd00dd;
    }
</style>