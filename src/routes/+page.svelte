<script lang="ts">
    import type { ActionData, PageData, SubmitFunction } from './$types'

    export let data: PageData
    export let form: ActionData

    let loading = false;
    const actionLoad: SubmitFunction = (input) => {
        console.log('in progress');
        loading = true;
        return async ({ update }) => {
            await update();
            loading = false;
        }

    }
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
            >
                <button
                >
                    B
                </button>
            </form>
        </div>
    </div>
</body>

<style>
    .timer {
        justify-content: center;
        text-align: center;
    }
    .timer .buttons form {
        display:inline;
    }
</style>