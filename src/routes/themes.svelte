<script lang="ts" context="module">
    import { writable, type Writable} from 'svelte/store';

    export interface Theme {
        name: Symbol,
        background: string,
        divback: string,
        accent1: string,
        accent2: string,
        contrast: string,
        complement: string,
        neutraldark: string,
        neutralbright: string,
        title?: string,
        text: string,
        neutral: string,
        input: string,
        altinput: string,
        alttext: string,
        hasgradient?: boolean,
        gradientdirection?: string
    };

    export const existingThemes = {
        Classic: Symbol('Classic'),
        Funky: Symbol('Funky'),
        Aurora: Symbol('Aurora'),
        Terminal: Symbol('Terminal'),
        Deep: Symbol('Deep'),
        Rooster: Symbol('Rooster')
    };

    let Aurora: Theme = {
        name: existingThemes.Aurora,
        background: '#6E37A6',
        divback: '#038C8C',
        accent1: '#04BF9D',
        accent2: '#F277A4',
        contrast: '#a8287e',
        complement: '#77F280',
        neutraldark: '#9372B5',
        neutralbright: '#022859',
        title: '#fff',
        text: '#fff',
        neutral: '#C599F2',
        input: '#022859',
        altinput: '#04BF9D',
        alttext: '#000',
        gradientdirection: 'to bottom right'
    };

    let Classic: Theme = {
        name: existingThemes.Classic,
        background: '#22FFE9',
        divback: '#14FF63',
        accent1: '#13E896',
        accent2: '#13C4E8',
        contrast: '#1499FF',
        complement: '#FF14B0',
        neutraldark: '#bcc6c0',
        neutralbright: '#feffff',
        title: '#000',
        text: '#000',
        neutral: '#e3eaea',
        input: '#feffff',
        altinput: '#feffff',
        alttext: '#000',
        gradientdirection: 'to bottom right'
    };

    let Funky: Theme = {
        name: existingThemes.Funky,
        background: '#510d43',
        divback: '#f0f879',
        accent1: '#870f0f',
        accent2: '#e05ec6',
        contrast: '#a8287e',
        complement: '#219E00',
        neutraldark: '#222',
        neutralbright: '#fff',
        title: '#000',
        text: '#1A0415',
        neutral: '#555',
        input: '#fff',
        altinput: '#870f0f',
        alttext: '#fff',
        gradientdirection: 'to bottom right'
    };

    let Terminal: Theme = {
        name: existingThemes.Terminal,
        background: '#000',
        divback: '#000',
        accent1: '#00ff00',
        accent2: '#00ff00',
        contrast: '#000',
        complement: '#00ff00',
        neutraldark: '#000',
        neutralbright: '#00ff00',
        title: '#00ff00',
        text: '#000',
        neutral: '#00ff00',
        input: '#00ff00',
        altinput: '#00ff00',
        alttext: '#000',
        hasgradient: false
    };

    let Deep: Theme = {
        name: existingThemes.Deep,
        background: '#2D82FA',
        divback: '#39313B',
        accent1: '#BACE25',
        accent2: '#4B76C7',
        contrast: '#C3B13E',
        complement: '#BACE25',
        neutraldark: '#576494',
        neutralbright: '#fff',
        title: '#fff',
        text: '#fff',
        neutral: '#576494',
        input: '#4B4861',
        altinput: '#4B4861',
        alttext: '#fff',
        gradientdirection: 'to bottom right'
    };

    let Rooster: Theme = {
        name: existingThemes.Rooster,
        background: '#E61F05',
        divback: '#FA9061',
        accent1: '#FAC423',
        accent2: '#FAD18C',
        contrast: '#FA9061',
        complement: '#FAC423',
        neutraldark: '#FAC423',
        neutralbright: '#FA9437',
        title: '#000',
        text: '#fff',
        neutral: '#E61F05',
        input: '#E61F05',
        altinput: '#E61F05',
        alttext: '#fff',
        gradientdirection: 'to bottom right'
    };

    export const themeColours = [Aurora, Classic, Funky, Deep, Rooster]

    export let styles: Writable<Theme> = writable(Aurora);

    export function changeTheme(newTheme: Symbol) {
        switch(newTheme) {
            case existingThemes.Classic:
                styles.set(Classic);
                break;
            case existingThemes.Funky:
                styles.set(Funky);
                break;
            case existingThemes.Aurora:
                styles.set(Aurora);
                break;
            case existingThemes.Terminal:
                styles.set(Terminal);
                break;
            case existingThemes.Deep:
                styles.set(Deep);
                break;
            case existingThemes.Rooster:
                styles.set(Rooster);
                break;
        }
    };

</script>