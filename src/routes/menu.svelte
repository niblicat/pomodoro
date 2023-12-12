<script lang="ts">
	import { createEventDispatcher } from "svelte";
    import PillButton from "./pillbutton.svelte";
    import { ModePage } from './modepage';
    import * as timer from './timer.svelte';
    import { timeElement, timerInProgress, timerState, TimerStates, PomodoroStates } from './timer.svelte';
    import * as vibrate from './vibrate';
    import { styles } from './themes.svelte';

    // export let bound: number;
    // export let label: string = "default";
    // export let titleDescription: string = "default";
    // export let id: string = "";
    // export let min: number = 0;
    // export let max: number = Infinity;
    // export let step: number = 1;
    export let mobileMode: boolean = false;
    export let menuVisible: boolean = false;
    export let currentModePage: Symbol = ModePage.Options;
    export let debug: boolean = false;

    const dispatch = createEventDispatcher();
</script>

<div 
    class="menu {mobileMode ? "mobile" : ""}"
    id={menuVisible ? "visible" : "invisible"}
>
    {#if ((!mobileMode) || currentModePage === ModePage.Options)}
        <div class="modes {mobileMode ? "span2" : ""} {debug ? "db1" : ""}">
            <button
                class="fade alt {$timerState === TimerStates.Pomodoro ? "selectedOption" : "unselectedOption"}"
                id="Pomodoro"
                title="Pomodoro Timer"
                type="button"
                on:click={() => {
                    timer.switchTimerMode(TimerStates.Pomodoro);
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
                    </div>
                    <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
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
                        
                        {#if !extraThin}
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
                        {/if}
                    </div>
                    {#if extraThin}
                        <div class="span2 optionsInputsContainer alttext {mobileMode ? "mobile" : ""}">
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

<style>
    * {
        color: var(--text);
    }

</style>