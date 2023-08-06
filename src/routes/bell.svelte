<script lang="ts" context="module">
    export let bellSound: string | null;
    export const Sounds = {
        Squeaky: '/sounds/squeaky.mp3'
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
            else console.log('There was a problem loading the bell sound to local storage.')
        };
        reader.readAsDataURL(audioBlob);
    }

</script>