<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import PillButton from "./pillbutton.svelte";
    import { ModePage } from './modepage';
    import * as timer from './timer.svelte';
    import { timerState } from './timer.svelte';
    import * as vibrate from './vibrate';
    import { styles, changeTheme } from './themes.svelte';
    import * as Themes from "./themes.svelte";
    import ImageSVG from './images.svelte';
	import { SoundArray, changeAudio, playAudio } from "./bell.svelte";

    export let mobileMode: boolean = false;
    export let menuVisible: boolean = false;
    export let currentModePage: Symbol = ModePage.Options;
    export let debug: boolean = false;
    export let hours: number = 0;
    export let minutes: number = 5;
    export let seconds: number = 0;
    export let pomoWork: number = 25;
    export let pomoShort: number = 5;
    export let pomoLong: number = 15;
    export let pomoLongPhase: number = 4;
    export let sageWork: number = 50;
    export let sageBreak: number = 10;
    export let sageDescend: number = 10;

    const ThemeMenu = {
        Palettes: Symbol('Palettes'),
        Sounds: Symbol('Sounds')
    };

    let currentThemeOption = ThemeMenu.Palettes;

    const dispatch = createEventDispatcher();
</script>

{#if currentModePage === ModePage.Themes}
    <div class="menu themes {menuVisible ? "visible" : "invisible"}">
        <div class="modes">
            <button
            class="fade alt {currentThemeOption === ThemeMenu.Palettes ? "selectedOption" : "unselectedOption"}"
            id="Palettes"
            title="Palettes"
            type="button"
            on:click={() => {
                currentThemeOption = ThemeMenu.Palettes;
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
            }}
            >
                Palettes
            </button>
            <button
            class="fade alt {currentThemeOption === ThemeMenu.Sounds ? "selectedOption" : "unselectedOption"}"
            id="Sounds"
            title="Sounds"
            type="button"
            on:click={() => {
                currentThemeOption = ThemeMenu.Sounds;
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
            }}
            >
                Sounds
            </button>
            
        </div>
        {#if currentThemeOption === ThemeMenu.Palettes}
            <div class="palettes">
                {#each Themes.themeColours as theme}
                    <button
                    class="palette fade bounce alt"
                    title="{theme.name.description} Theme"
                    on:click={() => {changeTheme(theme.name)}}
                    >
                        <ImageSVG
                        colour={theme.background}
                        colour1={theme.accent1}
                        colour2={theme.accent2}
                        colour3={theme.neutralbright}
                        colour4={theme.divback}
                        type="Palette"/>
                    </button>
                {/each}
                <button
                class="palette fade bounce alt"
                title="Terminal Theme"
                on:click={() => {changeTheme(Themes.existingThemes.Terminal)}}
                >
                    <ImageSVG
                    colour="#000"
                    colour1="#00ff00"
                    colour2="#00ff00"
                    colour3="#00ff00"
                    colour4="#00ff00"
                    type="Palette"/>
                </button>
            </div>
        {:else if currentThemeOption === ThemeMenu.Sounds}
            <div class="palettes">
                {#each Object.entries(SoundArray) as [key, value]}
                    <button
                    class="palette fade bounce alt"
                    title="{key} Sound"
                    on:click={async () => {
                        changeAudio(value);
                        playAudio();
                    }}
                    >
                        {key}
                    </button>
                {/each}
                {#if debug}
                <button
                    class="palette fade bounce alt"
                    title="Test Sound"
                    on:click={async () => {
                        changeAudio('/sounds/squeaky.mp3');
                        playAudio();
                    }}
                    >
                        Test
                    </button>
                {/if}
            </div>
        {/if}
    </div>
{:else}
    <div 
    class="menu settings {mobileMode ? "mobile" : ""} {menuVisible ? "visible" : "invisible"}"
    >
    {#if ((!mobileMode) || currentModePage === ModePage.Options)}
        <div class="modes {mobileMode ? "span2" : ""}">
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
        <div class="modesOptions {mobileMode ? "mobile" : ""} {debug ? "debug" : ""}">
            {#if $timerState === timer.TimerStates.Pomodoro}
                <PillButton
                bind:bound={pomoWork}
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
                bind:bound={pomoShort}
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
                bind:bound={pomoLong}
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
                <PillButton
                bind:bound={pomoLongPhase}
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

                <div class="optionsButtonsContainer span2">
                    <button 
                    class="fade bounce alt"
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
                    class="fade bounce alt"
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
                <PillButton
                bind:bound={sageWork}
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
                bind:bound={sageBreak}
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
                bind:bound={sageDescend}
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

                <div class="optionsButtonsContainer span2">
                    <button 
                    class="fade bounce alt"
                    type="button"
                    on:click={async () => {
                        await timer.modifySageTimes(sageWork, sageBreak, sageDescend);
                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                    }}
                    >
                        set times
                    </button>
                    <button 
                    class="fade bounce alt"
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
                <PillButton
                bind:bound={hours}
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
                bind:bound={minutes}
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
                
                <PillButton
                bind:bound={seconds}
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

                <div class="optionsButtonsContainer span2">
                    <button 
                    class="fade bounce alt"
                    type="button"
                    on:click={async () => {
                        await timer.modifyStandardTimes(hours, minutes, seconds);
                        vibrate.vibrateAction(vibrate.VibrateType.Standard);
                    }}
                    >
                        set times
                    </button>
                    <button 
                    class="fade bounce alt"
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
    {/if}
    {#if (!mobileMode || currentModePage === ModePage.Stats)}
        <div class="statsHead">

        </div>
        <div class="stats">

        </div>
        <div class="close">
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
                dispatch('close')
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
            }}
            >
                <ImageSVG colour={$styles.alttext} type="CloseIcon"/>
            </button>
        </div>

        <div class="profile">

        </div>
    {/if}
    </div>
{/if}

<style>

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

    button.alt:not(:focus-visible) {
        background-color: var(--altinput);
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

    button.bounce:active {
        transform: scale(0.9);
        -webkit-transform: scale(0.9);
        -moz-transform: scale(0.9);
        -o-transform: scale(0.9);
        -ms-transform: scale(0.9);
    }

    .menu {
        display: grid;
        grid-auto-flow: column;
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to bottom, var(--accent1), var(--neutralbright));
        color: var(--alttext);
        overflow: none;
        pointer-events: auto;
        border-bottom: 2px solid var(--divback);
    }

    .settings {
        grid-template: 25% 75% / 60% 25% 15%;
    }

    .themes {
        grid-template: 25% 75% / 100%;
    }

    .palettes {
        margin: 0px 4px 4px 4px;
        display: flex;
        flex-wrap: wrap;
        background-color: var(--altinput);
        border: 2px solid var(--divback);
        justify-content: left;
        align-items: baseline;
        overflow: auto;
        border-radius: 0px 25px 25px 25px;
        height: calc(100% - 4px);
        width: calc(100% - 8px);
        padding: 4px;
    }

    .menu.mobile {
        grid-template: 25% 75% / 75% 25%;
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

    .modes button#Palettes {
        border-radius: 25px 0px 0px 0px;
        border-right: 0px;
    }

    .modes button#Sounds {
        border-radius: 0px 25px 0px 0px;
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
    
    button.palette {
        max-width: 80px;
        max-height: 80px;
        min-width: 80px;
        min-height: 80px;
        width: 80px;
        height: 80px;
        overflow: visible;
        z-index: 3;
        padding: 2px;
        margin: 4px;
        font-size: 16px;
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

    .modesOptions {
        background-color: var(--altinput);
        border: 2px solid var(--divback);
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        border-radius: 0px 25px 25px 25px;
        margin-left: 4px;
        height: calc(100% - 4px);
        width: calc(100% - 8px);
    }

    .modesOptions.mobile {
        border-radius: 0px 25px 25px 25px;
        grid-column: span 2;
    }

    .modesOptions.mobile.debug {
        border-radius: 0px 0px 25px 25px;
    }

    .modesOptions * {
        font-size: 16px;
    }

    .optionsButtonsContainer {
        justify-content: space-around;
        display: flex;
        height: 32px;
        flex-basis: 100%;
    }

    .optionsButtonsContainer button {
        width: 45%;
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

    .invisible {
        visibility: hidden;
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