<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types'
    import { enhance            } from '$app/forms'
    import { fade, fly          } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';

    export let data: PageData
    export let form: ActionData

    let loading = true;
    let loadingIcon: HTMLElement;
    let m = { x: 0, y: 0};
    let loadingStatus: boolean;

    function handleMouseMove(event: MouseEvent) {
        m.x = event.clientX;
        m.y = event.clientY;
    }
    const actionLoad: SubmitFunction = (input) => {
        console.log('in progress');
        loading = true;
        return async ({ update }) => {
            await update();
            loading = false;
        }

    }
    onMount(() => {
        document.body.addEventListener('mousemove', handleMouseMove);
        // interval = setInterval(() => {
        // loadingIcon = document.getElementById('loadingIcon');
        //     if (loadingIcon !== null) {
        //         loadingIcon.style.top = m.x + 'px';
        //         loadingIcon.style.left = m.y + 'px';
        //         console.log('we are inside of the if condition');
        //     }
        // }, 1000);

        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    });
    beforeUpdate(() => {
        loadingStatus = loadingIcon !== null;
    })
    function loadingElementToCursor(loadingStatus: boolean) {
        if (loadingStatus) {
                loadingIcon.style.top = m.y - 20+ 'px';
                loadingIcon.style.left = m.x - 20 + 'px';
                console.log('we are inside of the if condition');
            }
    }
    function loadingElementToCursorButton() {
        loadingIcon.style.top = m.x + 'px';
        loadingIcon.style.left = m.y + 'px';
        console.log(loadingIcon);
        console.log('we are inside of the if condition');
    }
    afterUpdate(() => {
        loadingElementToCursor(loadingStatus);
    })
    onDestroy(() => {
    });

</script>

<h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation</p>

<body>
    <div class="timer">
        <h2>Timer</h2>
        <p class="numbersTime">13:45<p>
        <div class="buttons">
            <form
            method="POST"
            action=?/startTime
            use:enhance={actionLoad}
            >
                <button
                >
                    Start
                </button>
            </form>
            <form
            method="POST"
            action=?/endTime
            use:enhance={actionLoad}
            >
                <button
                >
                    Pause
                </button>
            </form>
        </div>
    </div>

    <button
    on:click={loadingElementToCursorButton}
    >
        move loading spinner to cursor
    </button>

    <div 
    id={loading === true ? "loadingIcon" : "noID"}
    class="loadingIcon"
    bind:this={loadingIcon}
    />
    <p>{m.x}, {m.y}</p>
</body>


<style>
    .body {
        position: relative;
    }
    .timer {
        justify-content: center;
        text-align: center;
    }
    .timer .buttons form {
        display:inline;
    }
    .loadingIcon {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3073BA; /* Blue */
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 0.5s linear infinite;
        position: absolute;
    }
</style>