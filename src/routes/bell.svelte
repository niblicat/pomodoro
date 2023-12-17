<script lang="ts" context="module">
    export let bellSound: string | null;
    export const Sounds = {
        Squeaky: '/sounds/squeaky.mp3',
        Alarm: '/sounds/alarm.mp3'
    }

    // export const SoundArray: string[] = Object.values(Sounds);
    export const SoundArray = {
        Squeaky: Sounds.Squeaky,
        Alarm:  Sounds.Alarm
    }

    export async function storeLocalAudio(soundLocation: string) {
        const response: Response = await fetch(soundLocation);
        const audioBlob: Blob = await response.blob();
        const reader: FileReader = new FileReader();
        reader.onloadend = () => {
            if (typeof reader.result === 'string') {
                localStorage.setItem('bellSound', reader.result);
                bellSound = reader.result;
            }
            else console.log('There was a problem loading the bell sound to Local Storage.')
        };
        reader.readAsDataURL(audioBlob);
    }

</script>