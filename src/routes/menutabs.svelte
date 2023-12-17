<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import * as vibrate from './vibrate';
	import { ModePage } from "./modepage";

    export let buttonEnabled = true;

    const dispatch = createEventDispatcher();
</script>

<div class="optionsPadding">
    <div class="hangingButtons">
        <button 
            class="fade regular hanging {buttonEnabled ? '' : 'disabled'}"
            type="button"
            on:click={() => {
                dispatch('toggleMenu', ModePage.Themes);
                dispatch('disableButtons');
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
            }}
        >
            themes
        </button>
        <button 
            class="fade regular hanging {buttonEnabled ? '' : 'disabled'}"
            type="button"
            on:click={() => {
                dispatch('toggleMenu', ModePage.Options);
                dispatch('disableButtons');
                vibrate.vibrateAction(vibrate.VibrateType.Standard);
            }}
        >
            settings
        </button>
    </div>
</div>

<style>
    .optionsPadding {
        display: flex;
        justify-content: end;
        padding-right: 20px;
        padding-left: 20px;
        order: 2;
        pointer-events: none;
    }

    .hangingButtons {
        margin-top: -2px;
        z-index: 2;
        height: 36px;
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

    button.hanging, button.hanging:active {
        height: 100%;
        min-width: 120px;
        width: 120px;
        border-radius: 0px 0px 25px 25px !important;
        border-top: 0px !important;
    }

    @media(hover: hover) {
        button.hanging:hover {
            border-top: 0px;
        }
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