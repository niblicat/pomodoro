<script lang="ts">
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    let amClicked: boolean = false;
    
    function handleClick() {
        if (!amClicked) {
            amClicked = true;
            dispatch('click');
            setTimeout(() => {
                amClicked = false;
            }, 5);
        }
    }
</script>

<button
class="outer"
on:click={handleClick}
>
    <button
    class="inner"
    on:click={handleClick}
    >
        <slot/>
    </button>
</button>

<style>
    button.outer {
        display: flex;
        flex: none;
        width: 60px;
        height: 28px;
        margin: 0;
        padding: 0;
        background-color: transparent;
        border: 0;
    }

    button.inner {
        width: 100%;
        height: 100%;
        margin: 0;
        padding: 0;
        border-radius: 25px;
        border: 2px solid var(--divback);
        font-size: var(--fontsize);
        line-height: 100%;
        text-align: center;
        cursor: pointer;
        pointer-events: auto;
        color: var(--text);
        background-color: var(--input);
        font-family: ExoRegular, Arial, Helvetica, sans-serif;
    }

    button.inner:disabled {
        color: var(--neutraldark);
    }

    button.inner:not(:focus-visible) {
        border: 2px solid var(--divback);
    }

    button.inner:not(:focus-visible) {
        background-color: var(--input);
    }

    @media(hover: hover) {
        button.inner:hover, button.inner:focus-visible {
            background-color: var(--accent2);
            border: 2px solid var(--input);
        }
    }
    
    @media(hover: hover) {
        button.inner:hover, button.inner:focus-visible {
            transform: scale(1.1);
            -webkit-transform: scale(1.1);
            -moz-transform: scale(1.1);
            -o-transform: scale(1.1);
            -ms-transform: scale(1.1);
        }
    }

    .inner {
        transition: all .2s ease-in-out;
        animation: fadeIn .5s;
        -webkit-animation: fadeIn .5s;
        -moz-animation: fadeIn .5s;
        -o-animation: fadeIn .5s;
        -ms-animation: fadeIn .5s;
    }

    button.inner:active {
        transform: scale(0.9);
        -webkit-transform: scale(0.9);
        -moz-transform: scale(0.9);
        -o-transform: scale(0.9);
        -ms-transform: scale(0.9);
    }
</style>