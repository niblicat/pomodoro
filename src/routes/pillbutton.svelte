<script lang="ts">
	import { createEventDispatcher } from "svelte";

    export let bind: number;
    export let label: string = "default";
    export let titleDescription: string = "default";
    export let labelFor: string = "";

    const dispatch = createEventDispatcher();
</script>

<div class="labelPillBinder">
    <label for={labelFor}>{label}</label>
    <div class="pillButtonContainer"> 
        <button
            class="left fade"
            title="Decrement {titleDescription}"
            on:click={() => {
                dispatch('decrement');
            }}
        />
        <input
            class="fade"
            type="number"
            id="workInput"
            title="Set {titleDescription}"
            bind:value={bind}
            min="1"
            step="1"
        />
        <button 
            class="right fade"
            title="Increment {titleDescription}"
            type="button"
            on:click={() => {
                dispatch('increment');
            }}
        />
    </div>
</div>

<style>
    * {
        color: var(--text);
    }
    .labelPillBinder {
        display: flex;
        align-items: center;
    }

    .labelPillBinder label {
        margin-right: 4px;
        font-size: min(var(--font-size-min, 16px), var(--font-size-max, 3.54vw));
    }

    .pillButtonContainer input[type="number"] {
        background-color: var(--background);
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

    .pillButtonContainer input[type=number]::-webkit-inner-spin-button,
    .pillButtonContainer input[type=number]::-webkit-outer-spin-button {
        -webkit-appearance: none;
    }
    .pillButtonContainer input[type="number"]:focus {
        outline: none;
    }

    .pillButtonContainer {
        border: 2px solid var(--divback);
        border-radius: var(--border-radius, 25px); 
        display: inline-flex;
        width: min(81px, 20vw);
    }
    .pillButtonContainer,
    .pillButtonContainer * {
        box-sizing: border-box;
    }
    

    .pillButtonContainer button {
        background-color: var(--background);
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
        cursor: pointer;
        pointer-events: auto;
    }

    @media(hover: hover) {
        .pillButtonContainer button:hover {
            background-color: var(--accent);
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
        border-radius: var(--border-radius, 25px) 0px 0px var(--border-radius, 25px);
    }
    .pillButtonContainer button.left:after {
        content: '-';
    }

    .pillButtonContainer button.right {
        border-radius: 0px var(--border-radius, 25px) var(--border-radius, 25px) 0px;
    }

    .pillButtonContainer button.right:after {
        content: '+';
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