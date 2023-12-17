<script lang="ts">
    import { slide } from 'svelte/transition';
	import { backIn } from 'svelte/easing';
    import { onMount } from 'svelte';
    import * as timer from './timer.svelte';
    import { timeElement, timerInProgress, timerState, timerTitle, timerSubtitle } from './timer.svelte';
    import { changeTheme, existingThemes, styles } from './themes.svelte';
    import { changeAudio, changeVolume, playAudio, Sounds } from './bell.svelte';
    import * as vibrate from './vibrate';
    import PillButton from './pillbutton.svelte'
    import { ModePage } from './modepage';
    import Menu from './menu.svelte';
    import MenuTabs from './menutabs.svelte';

    let debug: boolean = true;

    let loading: boolean = false;
    let loadingIcon: HTMLElement;
    let menuVisible: boolean = false;
    let m = { x: 0, y: 0};
    
    let innerWidth: number;
    let innerHeight: number;

    let currentModePage: Symbol;

    function handleKeyDown(event: KeyboardEvent) {
        if (menuVisible) 
            if (event.key === "Escape") closeSettings();
    }

    onMount(() => {
        currentModePage = ModePage.Options;
        document.body.addEventListener('keydown', handleKeyDown);
        timer.setTime(timer.convertTimeToDecisecondsSync(0, pomoWork, 0));

        changeAudio(Sounds.Squeaky);
        changeVolume(100);

        changeTheme(existingThemes.Rooster)

        return () => {
            document.body.removeEventListener('keydown', handleKeyDown);
            timer.clearTimer();
        };
    });

    // closes preference menu
    function closeSettings() {
        setTimeout(() => {
            menuVisible = false;
        }, 200);
    }

    // opens preference menu
    function openSettings() {
        menuVisible = true;
    }

    function toggleMenu(buttonClick: Symbol) {
        if (buttonClick === currentModePage && menuVisible) closeSettings();
        else openSettings();
        currentModePage = buttonClick;
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
    $: landscapeMode = innerHeight <= 500;

    $: cssVarStyles = Object.entries($styles)
        .filter(([key, value]) => typeof value === 'string')
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
        if (debugCount <= 1) {
            setTimeout(() => {
                debugCount = 0;
            }, 1000);
        }
        if (debugCount > 7) {
            debug = true;
        }
    }

    let boundValue = 3;
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<svelte:head>
    <link rel="stylesheet" media="screen" href="fonts/fonts.css" type="text/css"/>
    <title>
        {$timerTitle}
    </title>
</svelte:head>
<html lang="en">
<body class={$styles.hasgradient === false ? "nogradient" : ""} style={cssVarStyles}>
<div class="background">
    
    {#if !menuVisible}
        <div class="deadtabs">
            <MenuTabs
            buttonEnabled={buttonEnabled}
            on:toggleMenu={(e) => {
                toggleMenu(e.detail);
            }}
            on:disableButtons={() => {
                disableButtons();
            }}
            />
        </div>
    {/if}
    {#key menuVisible}
        <div
        class="menuWrapper"
        out:slide={{ axis: 'y', easing: backIn }}
        in:slide={{ axis: 'y' }}
        >
            {#if menuVisible}
                <Menu
                bind:mobileMode={mobileMode}
                bind:menuVisible={menuVisible}
                bind:currentModePage={currentModePage}
                bind:debug={debug}
                bind:hours={hours}
                bind:minutes={minutes}
                bind:seconds={seconds}
                bind:pomoWork={pomoWork}
                bind:pomoShort={pomoShort}
                bind:pomoLong={pomoLong}
                bind:pomoLongPhase={pomoLongPhase}
                bind:sageWork={sageWork}
                bind:sageBreak={sageBreak}
                bind:sageDescend={sageDescend}

                on:close={() => {
                    closeSettings();
                }}

                />
                <MenuTabs
                buttonEnabled={buttonEnabled}
                on:toggleMenu={(e) => {
                    toggleMenu(e.detail);
                }}
                on:disableButtons={() => {
                    disableButtons();
                }}
                />
            {/if}
        </div>
    {/key}

    <main class="wrapper center {landscapeMode ? "landscape" : ""}">
        <div class="timer center regulartext">
            <div class="em1"/>
            <div class="timerTitle">
                {$timerTitle}
            </div>
            <div class="timerSubtitle">
                {$timerSubtitle}
            </div>
            {#key $timeElement}
            <div class="numbersTime fade">
                {#each $timeElement as e (e.type)}
                    {#if !((e.type === 'hours') && (e.value <= 0))}
                        {#if ((e.type !== 'hours') && (e.value < 10))}0{/if}{e.value}{#if (e.type !== 'seconds')}:{/if}
                    {/if}
                {/each}
            </div>
            {/key}
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
                    alert(menuVisible);
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                menu visible: {menuVisible}
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
                    playAudio();
                    vibrate.vibrateAction(vibrate.VibrateType.Standard);
                }}
                >
                    play bell
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
                    debugCount = 0;
                }}
                >
                    Disable Debug
                </button>
                <PillButton
                bind:bound={boundValue}
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
                {boundValue}

            </div>
        {/if}
    </main>

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
    
    /* .alttext, .alttext > * {
        color: var(--alttext);
    } */

    /* .alt, .alt > * {
        color: var(--alttext);
        background-color: var(--altinput);
    } */

    button:disabled {
        color: var(--neutraldark);
    }

    button:not(:focus-visible) {
        border: 2px solid var(--divback);
    }

    button.regular:not(:focus-visible) {
        background-color: var(--input);
    }

    @media(hover: hover) {
        button.regular:hover, button.regular:focus-visible {
            background-color: var(--accent2);
            border: 2px solid var(--input);
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
        button.disabled:hover:not(hanging), button.disabled:focus-visible:not(hanging) {
            border: 2px solid var(--divback);
            background-color: var(--input);
            transform: none;
            -webkit-transform: none;
            -moz-transform: none;
            -o-transform: none;
            -ms-transform: none;
        }
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
        font-size: 64px;
        grid-row: 4;
        grid-column: span 2;
        font-family: MonofontoRegular, Arial, Helvetica, sans-serif;
        color: var(--title, #000);
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
    
    .timer button#Clear {
        grid-column: 2;
    }

    .menuWrapper {
        /* transition: all 100ms ease-out; */
        top: 0px;
        width: 100%;
        height: 296px;
        display: grid;
        position: absolute;
        grid-template: 1fr 36px / 1fr;
        text-align: center;
        z-index: 3;
        pointer-events: none;
    }
    
    .deadtabs {
        position: absolute;
        width: 100%;
    }

    .debug {
        grid-row: 4;
    }

    .debug button {
        font-size: 8px;
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