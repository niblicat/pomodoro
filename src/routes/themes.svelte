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
        text: string,
        neutral: string,
        input: string,
        altinput: string,
        alttext: string
    }

    export const Themes = {
        Classic: Symbol('Classic'),
        Funky: Symbol('Funky'),
        Aurora: Symbol('Aurora')
    }

    export let styles: Writable<Theme> = writable({
        background: '#6E37A6',
        divback: '#038C8C',
        accent1: '#04BF9D',
        accent2: '#F277A4',
        contrast: '#a8287e',
        complement: '#77F280',
        neutraldark: '#9372B5',
        neutralbright: '#022859',
        text: '#fff',
        neutral: '#C599F2',
        input: '#022859',
        altinput: '#04BF9D',
        alttext: '#F7EAEF'
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
                    text: '#000',
                    neutral: '#e3eaea',
                    input: '#feffff',
                    altinput: '#feffff',
                    alttext: '#000'
                })
                break;  
            case Themes.Funky:
                styles.set({
                    background: '#510d43',
                    divback: '#f0f879',
                    accent1: '#870f0f',
                    accent2: '#e05ec6',
                    contrast: '#a8287e',
                    complement: '#219E00',
                    neutraldark: '#222',
                    neutralbright: '#fff',
                    text: '#1A0415',
                    neutral: '#555',
                    input: '#fff',
                    altinput: '#870f0f',
                    alttext: '#fff'
                })
                break;  
            case Themes.Aurora:
                styles.set({
                    background: '#6E37A6',
                    divback: '#038C8C',
                    accent1: '#04BF9D',
                    accent2: '#F277A4',
                    contrast: '#a8287e',
                    complement: '#77F280',
                    neutraldark: '#9372B5',
                    neutralbright: '#022859',
                    text: '#fff',
                    neutral: '#C599F2',
                    input: '#022859',
                    altinput: '#04BF9D',
                    alttext: '#F7EAEF'
                })
                break;  
        }
    }

</script>