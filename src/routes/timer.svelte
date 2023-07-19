<script lang="ts" context="module">
    
	// Counts down each time segment
	// Processes a length of time in deciseconds (10^-1 seconds)

	import { writable, type Writable} from 'svelte/store';

	export interface TimeElement {
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
    let standardTime: number = 3000;

	let goalTime: number = 0;
	let currentTime: number = Date.now();
	let endTime: number = currentTime + 100 * goalTime;
    let timeToSet: number = 0;

    export let timerNumberVisibility: Writable<boolean> = writable(true);

	export let timeElement: Writable<TimeElement[]> = writable([
        {
            type: 'hours',
            value: 0
        },
        {
            type: 'minutes',
            value: 0
        },
        {
            type: 'seconds',
            value: 0
        }]);

	let pomodoroTimes: PomodoroTimes = {
		work: 25,
		short: 5,
		long: 15
	};
	// by default 25 minutes, 5 minutes, 15 minutes

	let interval: number = 0;


	// formats the time that is displayed on screen
	async function formatTime(time: number): Promise<number> {
        if (time > 0) {
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
        else {
            timeElement.set([
                {
                    type: 'hours',
                    value: 0
                },
                {
                    type: 'minutes',
                    value: 0
                },
                {
                    type: 'seconds',
                    value: 0
                }
            ]);
        }
        return time;
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
                if (timeDifference <= 0 || timerProgressState === false) {
                    if ((timerProgressState === true) && (timerState === TimerStates.Pomodoro)) await modifyPomodoroState();
                    await TimerProgress.updateTimerInProgressToFalse();
                    clearInterval(interval);
                    resolve();
                }
                timeToSet = await formatTime(timeToSet <= 0 ? 0 : (timeDifference / 100));
                timerProgressState = await TimerProgress.getTimerInProgress();
                currentTime = Date.now();
                timeDifference = endTime - currentTime;
            }, 100)        
		});
	}


	// called when the start button is pressed
	export async function startTimer(): Promise<void> {
        const timerProgressState: boolean = await TimerProgress.getTimerInProgress();
		if (timerProgressState) {
            await TimerProgress.updateTimerInProgressToFalse();
            alert('Timer is already in progress...');
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
	export async function setTime(newTime: number) {
        sessionNumber = 1;
		await TimerProgress.updateTimerInProgressToFalse();
		goalTime = newTime;
		currentTime = Date.now();
		endTime = currentTime + 100 * goalTime;
		timeToSet = await formatTime(newTime);
	}

	// completely resets the timer to 0 deciseconds
	export async function clearTimer() {
        await stopTimer();
        clearInterval(interval);
        await setTime(0);
	}

    // converts hh:mm:ss to equivalent in deciseconds
	export async function convertTimeToDeciseconds(hours: number, minutes: number, seconds: number): Promise<number> {
		return 36000 * hours + 600 * minutes + 10 * seconds;
	}

    // cycles between pomodoro states based off the pomodoro method
	export async function pomodoroActive() {
		pomodoroCounting = true;
		while (pomodoroCounting) {
			switch (pomodoroState) {
				case PomodoroStates.Work:
                    // look out for this goalTime less than zero if problems come up in the future
                    if (goalTime <= 0) await setTime(await convertTimeToDeciseconds(0, pomodoroTimes.work, 0));
					await startTimer();
					break;
				case PomodoroStates.Short:
                    if (goalTime <= 0) await setTime(await convertTimeToDeciseconds(0, pomodoroTimes.short, 0));
					await startTimer();
					break;
				case PomodoroStates.Long:
                    if (goalTime <= 0) await setTime(await convertTimeToDeciseconds(0, pomodoroTimes.long, 0));
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

    // switches timer mode between pomodoro, standard, and descending
    export async function switchTimerMode(newTimerState: Symbol) {
        if (timerState !== newTimerState) {
            await clearTimer();
            switch (newTimerState) {
                case TimerStates.Pomodoro:
                    timerState = TimerStates.Pomodoro;
                    await setTime(await convertTimeToDeciseconds(0, pomodoroTimes.work, 0));
                    break;
                case TimerStates.Standard:
                    timerState = TimerStates.Standard;
                    await setTime(standardTime);
                    break;
                case TimerStates.Sage:
                    timerState = TimerStates.Sage;
                    break;
            }
            timerStateRead.set(timerState);
        }
    }

    // changes the pomodoro stored work, short, and long times and seconds and calls functions to update value for onscreen counter
    export async function modifyPomodoroTimes(work: number, short: number, long: number) {
        await clearTimer();
        pomodoroTimes = {
            work: work,
            short: short,
            long: long
        }
        await setTime(await convertTimeToDeciseconds(0, work, 0));
    }

    // changes the standard timer's stored hours, minutes and seconds and calls functions to update value for onscreen counter
    export async function modifyStandardTimes(hours: number, minutes: number, seconds: number) {
        await clearTimer();
        standardTime = await convertTimeToDeciseconds(hours, minutes, seconds);
        await setTime(standardTime);
    }

    export async function standardStartTimer() {
        if (goalTime <= 0) await setTime(standardTime);
        await startTimer();
    }

    export async function changeLongSession(num: number) {
        longSession = 2 * num + 1;
    }

</script>