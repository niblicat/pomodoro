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

    export async function storeLocalAudio(soundLocation: string): Promise<void> {
        return new Promise<void>((resolve, reject) => {
            fetch(soundLocation)
                .then((response: Response) => response.blob())
                .then((audioBlob: Blob) => {
                    const reader: FileReader = new FileReader();
                    reader.onloadend = () => {
                        if (typeof reader.result === 'string') {
                            localStorage.setItem('bellSound', reader.result);
                            bellSound = reader.result;
                            resolve();
                        } else {
                            console.log('There was a problem loading the bell sound to Local Storage.');
                            reject(new Error('Failed to load the bell sound to Local Storage.'));
                        }
                    };
                    reader.readAsDataURL(audioBlob);
                })
                .catch((error) => {
                    console.error('Error fetching the audio file:', error);
                    reject(error);
                });
        });
    }


</script>