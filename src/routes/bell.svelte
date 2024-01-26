<script lang="ts" context="module">

    export let bellSound: string | null;
    export const Sounds = {
        Squeaky: '/sounds/squeaky2.mp3',
        Alarm: '/sounds/alarm.mp3',
        Chicken: '/sounds/chicken.mp3',
        Meow: '/sounds/meow.mp3'
    }

    // export const SoundArray: string[] = Object.values(Sounds);
    export const SoundArray = {
        Squeaky: Sounds.Squeaky,
        Alarm:  Sounds.Alarm,
        Chicken:  Sounds.Chicken,
        Meow:  Sounds.Meow
    }

    export let audioFile: HTMLAudioElement;

    export function changeVolume(value: number) {
        audioFile.volume = value / 100;
    }

    export function changeAudio(file: string) {
        audioFile = new Audio(file);
    }

    export function playAudio() {
        audioFile.play();
    }

</script>