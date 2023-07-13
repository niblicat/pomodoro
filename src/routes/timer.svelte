<script lang="ts" context="module">
	// Counts down each time segment
	// Processes a length of time in deciseconds (10^-1 seconds)

	import { writable, type Writable} from 'svelte/store';

	interface TimeElement {
		type: string;
		value: number;
	};
	interface PomodoroTimes {
		work: number;
		short: number;
		long: number;
	};
	export const PomodoroStates = {
		Work: Symbol('Work'),
		Short: Symbol('Short'),
		Long: Symbol('Long')
	};
	export const TimerStates = {
		Pomodoro: Symbol('Pomodoro'),
		Standard: Symbol('Standard'),
		Sage: Symbol('Sage')
	};
    
    export let timerInProgressRead: Writable<boolean> = writable(false);
    let TimerProgress = new class TimerProgress {
        #timerInProgress: boolean;
        
        constructor() {
            this.#timerInProgress = false;
        }
        public async updateTimerInProgress() {
            this.#timerInProgress = !this.#timerInProgress; // flips value
            timerInProgressRead.set(this.#timerInProgress);
        }
        public async updateTimerInProgressToTrue() {
            this.#timerInProgress = true;
            timerInProgressRead.set(true);
        }
        public async updateTimerInProgressToFalse() {
            this.#timerInProgress = false;
            timerInProgressRead.set(false);
        }
        public async getTimerInProgress(): Promise<boolean> {
            return new Promise((resolve) => {
                return resolve(this.#timerInProgress);
            });
        }
    }
	export let timerState: Symbol = TimerStates.Pomodoro;
    export let timerStateRead: Writable<Symbol> = writable(timerState);
	let pomodoroCounting: boolean = false;
	let pomodoroState = PomodoroStates.Work;
	let sessionNumber: number = 1;
	let longSession: number = 9;

	let goalTime: number = 0;
	let currentTime: number = Date.now();
	let endTime: number = currentTime + 100 * goalTime;

	export let timeElement: Writable<TimeElement[]> = writable([]);
	let pomodoroTimes: PomodoroTimes = {
		work: 25,
		short: 5,
		long: 15
	};
	// by default 25 minutes, 5 minutes, 15 minutes

	let interval: number = 0;

	// formats the time that is displayed on screen
	async function formatTime(time: number) {
		let hours = Math.floor(time / 36000);
		let minutes = Math.floor((time - 36000 * hours) / 600);
		let seconds = Math.floor((time - 36000 * hours - 600 * minutes) / 10);

		timeElement.set([
			{
				type: 'hours',
				value: hours
			},
			{
				type: 'minutes',
				value: minutes
			},
			{
				type: 'seconds',
				value: seconds
			}
		]);
	}

    // modifies pomodoro state to next state based on current
    async function modifyPomodoroState() {
        switch (pomodoroState) {
            case PomodoroStates.Work:
                pomodoroState = PomodoroStates.Short;
                break;
            case PomodoroStates.Short:
                pomodoroState = PomodoroStates.Work;
                break;
            case PomodoroStates.Long:
                pomodoroState = PomodoroStates.Work;
                break;
        }
        if (!(sessionNumber % longSession)) pomodoroState = PomodoroStates.Long; // forcefully modify state to long if we are on a long session number
    }

	// modifies the change in time between now and the end time every decisecond
	async function timerActiveCount(): Promise<void> {
		return new Promise(async (resolve) => {
			let timeDifference: number = 0;
			currentTime = Date.now();
			endTime = currentTime + 100 * goalTime;
            let timerProgressState: boolean = await TimerProgress.getTimerInProgress();
            timeDifference = endTime - currentTime;
            interval = setInterval(async () => {
                await formatTime(timeDifference / 100);
                timerProgressState = await TimerProgress.getTimerInProgress();
                currentTime = Date.now();
                timeDifference = endTime - currentTime;
                if (timeDifference <= 0 || timerProgressState === false) {
                    if ((timerProgressState === true) && (timerState === TimerStates.Pomodoro)) await modifyPomodoroState();
                    await TimerProgress.updateTimerInProgressToFalse();
                    clearInterval(interval);
                    resolve();
                }
            }, 100)        
		});
	}


	// called when the start button is pressed
	export async function startTimer(): Promise<void> {
        const timerProgressState: boolean = await TimerProgress.getTimerInProgress();
		if (timerProgressState) {
            await TimerProgress.updateTimerInProgressToFalse();
		} else {
			await TimerProgress.updateTimerInProgressToTrue();
			await timerActiveCount();
		}
		return;
	}

	// currently unused, gets the goal time in deciseconds
	export async function getCurrentTime(): Promise<number> {
		if (goalTime === null) return 0;
		return goalTime;
	}

	// changes the goal time from current and end time values
	async function updateGoalTime() {
        goalTime = (endTime - currentTime) / 100;
	}

	// pauses the timer and stops the time updater from looping
	export async function stopTimer() {
		await TimerProgress.updateTimerInProgressToFalse();
		pomodoroCounting = false;
		await updateGoalTime();
	}

	// sets the time based on deciseconds
	export async function setTime(timetoSet: number) {
        sessionNumber = 1;
		await TimerProgress.updateTimerInProgressToFalse();
		goalTime = timetoSet;
		currentTime = Date.now();
		endTime = currentTime + 100 * goalTime;
		await formatTime(timetoSet);
	}

	// completely resets the timer to 0 deciseconds
	export async function clearTimer() {
		await stopTimer();
		await setTime(0);
        setTimeout(async () => {
            await formatTime(0);
        }, 100); // patchwork solution bc the timer doesn't like to update to 0 when I want it to
        // first time clearing does the weird effect
	}

    // converts hh:mm:ss to equivalent in deciseconds
	export function convertTimeToDeciseconds(hours: number, minutes: number, seconds: number): number {
		return 36000 * hours + 600 * minutes + 10 * seconds;
	}

    // cycles between pomodoro states based off the pomodoro method
	export async function pomodoroActive() {
		pomodoroCounting = true;
		while (pomodoroCounting) {
			switch (pomodoroState) {
				case PomodoroStates.Work:
                    // look out for this goalTime less than zero if problems come up in the future
                    if (goalTime <= 0) await setTime(convertTimeToDeciseconds(0, pomodoroTimes.work, 0));
					await startTimer();
					break;
				case PomodoroStates.Short:
                    if (goalTime <= 0) await setTime(convertTimeToDeciseconds(0, pomodoroTimes.short, 0));
					await startTimer();
					break;
				case PomodoroStates.Long:
                    if (goalTime <= 0) await setTime(convertTimeToDeciseconds(0, pomodoroTimes.long, 0));
					await startTimer();
					break;
			}
			sessionNumber++; // increase session number so we can properly update state to long when needed
			if (sessionNumber > 10000) {
				alert("You've worked for too long"); // in case pomodoro timer is left running for an excessive amount of time
				pomodoroCounting = false;
			}
		}
	}

    export async function switchTimerMode(newTimerState: Symbol) {
        await clearTimer();
        if (timerState !== newTimerState) {
            switch (newTimerState) {
                case TimerStates.Pomodoro:
                    timerState = TimerStates.Pomodoro;
                    break;
                case TimerStates.Standard:
                    timerState = TimerStates.Standard;
                    break;
                case TimerStates.Sage:
                    timerState = TimerStates.Sage;
                    break;
            }
            timerStateRead.set(timerState);
        }
    }
</script>