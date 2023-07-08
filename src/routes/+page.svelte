<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types'
    import { enhance            } from '$app/forms'
    import { fade, fly          } from 'svelte/transition';
    import { onMount, onDestroy, beforeUpdate, afterUpdate } from 'svelte';

    export let data: PageData
    export let form: ActionData

    let loading: boolean = false;
    let loadingDelayIsActive: boolean = true;
    let loadingIcon: HTMLElement;
    let m = { x: 0, y: 0};
    let loadingStatus: boolean;

    // updates the internal cursor position based off the actual cursor
    // changes loading icon's position to relative if user is using mouse
    function handleMouseMove(event: MouseEvent) {
        m.x = event.clientX;
        m.y = event.clientY;
        loadingIcon.style.position = "absolute";
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
        document.body.addEventListener('mousemove', handleMouseMove);

        return () => {
            document.body.removeEventListener('mousemove', handleMouseMove);
        };
    });
    
    beforeUpdate(() => {
        loadingStatus = loadingIcon !== null; // make sure loadingIcon exists on the page before changing it
    })

    // moves loading spinner to cursor's position
    function loadingElementToCursor() {
        loadingIcon.style.top = m.y - 20 + 'px';
        loadingIcon.style.left = m.x - 20 + 'px';
        console.log('we are inside of the if condition');
    }

    afterUpdate(() => {
        if (loadingStatus === true) loadingElementToCursor();
    })

    // currently unused, might remove at later time
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

    <div 
    id={loading === true ? "loadingIcon" : "noID"}
    bind:this={loadingIcon}
    />
    <p>{m.x}, {m.y}</p>
</body>


<style>
    .timer {
        justify-content: center;
        text-align: center;
    }
    .timer .buttons form {
        display:inline;
    }
    #loadingIcon {
        border: 4px solid #f3f3f3; /* Light grey */
        border-top: 4px solid #3073BA; /* Blue */
        border-radius: 50%;
        width: 30px;
        height: 30px;
        animation: spin 0.5s linear infinite;
    }
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
</style>