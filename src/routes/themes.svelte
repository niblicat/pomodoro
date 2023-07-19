<script lang="ts" context="module">
    import { writable, type Writable} from 'svelte/store';

    export interface Theme {
        background: string,
        divback: string,
        accent1: string,
        accent2: string,
        contrast: string,
        complement: string,
        neutraldark: string,
        neutralbright: string,
        neutralheavy: string,
        neutral: string
    }

    export const Themes = {
        Classic: Symbol('Classic'),
        Funky: Symbol('Funky'),
        Spooky: Symbol('Spooky'),
        Night: Symbol('Night'),
        White: Symbol('White'),
        Muffin: Symbol('Muffin'),
        Mitten: Symbol('Mitten'),
    }

    export let styles: Writable<Theme> = writable({
        background: '#22FFE9',
        divback: '#14FF63',
        accent1: '#13E896',
        accent2: '#13C4E8',
        contrast: '#1499FF',
        complement: '#FF14B0',
        neutraldark: '#bcc6c0',
        neutralbright: '#feffff',
        neutralheavy: '#000',
        neutral: '#e3eaea'
    })

    export function changeTheme(newTheme: Symbol) {
        switch(newTheme) {
            case Themes.Classic:
                styles.set({
                    background: '#22FFE9',
                    divback: '#14FF63',
                    accent1: '#13E896',
                    accent2: '#13C4E8',
                    contrast: '#1499FF',
                    complement: '#FF14B0',
                    neutraldark: '#bcc6c0',
                    neutralbright: '#feffff',
                    neutralheavy: '#000',
                    neutral: '#e3eaea'
                })
                break;  
            case Themes.Funky:
                styles.set({
                    background: '#000',
                    divback: '#14FF63',
                    accent1: '#13E896',
                    accent2: '#13C4E8',
                    contrast: '#1499FF',
                    complement: '#FF14B0',
                    neutraldark: '#bcc6c0',
                    neutralbright: '#feffff',
                    neutralheavy: '#000',
                    neutral: '#e3eaea'
                })
                break;  
        }
    }

</script>