<script lang="ts">
	import { createEventDispatcher } from "svelte";
    import PillButton from "./pillbutton.svelte";
    import { ModePage } from './modepage';
    import * as timer from './timer.svelte';
    import { timerState } from './timer.svelte';
    import * as vibrate from './vibrate';
    import { styles } from './themes.svelte';
    import ImageSVG from './images.svelte';


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

    const dispatch = createEventDispatcher();
</script>

<div 
    class="menu {mobileMode ? "mobile" : ""} {menuVisible ? "visible" : "invisible"}"
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
                    dispatch('close')
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
        width: 100%;
        height: 100%;
        background-image: linear-gradient(to bottom, var(--accent1), var(--neutralbright));
        color: var(--alttext);
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
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
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