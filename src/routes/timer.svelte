<script lang="ts" context="module">
	// Counts down each time segment
	// Processes a length of time in deciseconds (10^-1 seconds)

	import { get, writable, type Writable} from 'svelte/store';

	export interface TimeElement {
		type: string;
		value: number;
	};
	interface PomodoroTimes {
		work: number;
		short: number;
		long: number;
	};
	interface SageTimes {
		work: number;
		break: number;
        decrement: number;
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
    export const SageStates = {
        Work: Symbol('Work'),
        Break: Symbol('Break')
    }
    
    export let timerInProgress: Writable<boolean> = writable(false);

    // flip value of timerInProgress
    async function updateTimerInProgress() {
        timerInProgress.set(!get(timerInProgress)); // flips value
    }

    // updates timerInProgress to true
    async function updateTimerInProgressToTrue() {
        timerInProgress.set(true);
    }

    // updates timerInProgress to false
    async function updateTimerInProgressToFalse() {
        timerInProgress.set(false);
    }

    // returns boolean value of timerInProgress
    async function getTimerInProgress(): Promise<boolean> {
        return new Promise((resolve) => {
            return resolve(get(timerInProgress));
        });
    }

    export let timerSubtitle: Writable<string> = writable('work');
    export let timerTitle: Writable<string> = writable('Pomodoro Timer');
    export let timerState: Writable<Symbol> = writable(TimerStates.Pomodoro);
    
	let pomodoroCounting: boolean = false;
	let sageCounting: boolean = false;
    let sageRemainingTime: number = 50;
	let pomodoroState = PomodoroStates.Work;
	let sageState = SageStates.Work;
	let sessionNumber: number = 1;
	let longSession: number = 9;
    let standardTime: number = 3000;

	let goalTime: number = 0;
	let currentTime: number = Date.now();
	let endTime: number = currentTime + 100 * goalTime;
    let timeToSet: number = 0;

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
        }
    ]);

	let pomodoroTimes: PomodoroTimes = {
		work: 25,
		short: 5,
		long: 15
	};
    let sageTimes: SageTimes = {
        work: 50,
        break: 10,
        decrement: 10
    }
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
            // if times are less than 0 just set everything to be 0
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

    async function changeTitles() {
        let currentTimerState = get(timerState);
        if (currentTimerState === TimerStates.Pomodoro) {
            switch (pomodoroState) {
                case PomodoroStates.Work:
                    timerSubtitle.set('work');
                    break;
                case PomodoroStates.Short:
                    timerSubtitle.set('short break');
                    break;
                case PomodoroStates.Long:
                    timerSubtitle.set('long break');
                    break;
            }
            timerTitle.set('Pomodoro Timer');
        }
        else if (currentTimerState === TimerStates.Sage) {
            switch (sageState) {
                case SageStates.Work:
                    timerSubtitle.set('work');
                    break;
                case SageStates.Break:
                    timerSubtitle.set('break');
                    break;
            }
            timerTitle.set('Descend Timer');
        }
        else {
            timerSubtitle.set('');
            timerTitle.set('Timer');
        }
    }

    export let bell: Writable<boolean> = writable(false);

    // plays sound and is called when timer reaches 0
    export async function ringBell() {
        bell.set(true);
    }

    // called by main to end bell ring
    export async function muteBell() {
        bell.set(false);
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
        if (((sessionNumber + 1) % longSession) == 0) pomodoroState = PomodoroStates.Long; // forcefully modify state to long if we are on a long session number
        goalTime = 0;
    }

    async function modifySageState() {
        switch (sageState) {
            case SageStates.Work:
                sageState = SageStates.Break;
                break;
            case SageStates.Break:
                let nextSessionTime = sageRemainingTime - sageTimes.decrement;

                if (nextSessionTime <= 0) sageRemainingTime = sageTimes.work; // reset time back to full amount if negative time
                else sageRemainingTime = nextSessionTime;

                sageState = SageStates.Work;
                break;
        }
        console.log(sessionNumber + ' ' + sageState.toString());
        goalTime = 0;
    }

	// modifies the change in time between now and the end time every decisecond
	async function timerActiveCount(): Promise<void> {
		return new Promise(async (resolve) => {
			let timeDifference: number = 0; // initialise difference between time of completion and current time
			currentTime = Date.now(); // current UNIX time
			endTime = currentTime + 100 * goalTime; // add goal difference btwn current and end time in deciseconds
            let timerProgressState: boolean = await getTimerInProgress(); // get initial bool for if timer should be running
            timeDifference = endTime - currentTime;
            interval = setInterval(async () => {
                // if there is no time left or the timer should not be running, kill timer momentum
                if (timeDifference <= 0 || timerProgressState === false) {
                    if (timerProgressState === true) {
                        await ringBell();
                        if (get(timerState) === TimerStates.Pomodoro) await modifyPomodoroState();
                        else if (get(timerState) === TimerStates.Sage) await modifySageState();
                    }
                    await updateTimerInProgressToFalse(); // make sure we say the timer is no longer running
                    clearInterval(interval);
                    resolve();
                }
                timeToSet = await formatTime(timeDifference <= 0 ? 0 : (timeDifference / 100)); // update onscreen value
                timerProgressState = await getTimerInProgress(); // reevaluate if timer should be running
                currentTime = Date.now(); // gets current unix time
                timeDifference = endTime - currentTime; // now we are closer to completion
            }, 100)        
		});
	}


	// called when the start button is pressed
	export async function startTimer(): Promise<void> {
        const timerProgressState: boolean = await getTimerInProgress();
		if (timerProgressState) {
            // this branch shouldn't run but just in case
            await updateTimerInProgressToFalse();
            alert('Timer is already in progress...');
		} else {
			await updateTimerInProgressToTrue();
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
		await updateTimerInProgressToFalse();
		pomodoroCounting = false;
        sageCounting = false;
		await updateGoalTime();
	}

	// sets the time based on deciseconds
	export async function setTime(newTime: number) {
		await updateTimerInProgressToFalse();
		goalTime = newTime;
		currentTime = Date.now();
		endTime = currentTime + 100 * goalTime;
		timeToSet = await formatTime(newTime);
	}

    // sets back to first work session regarding pomodoro timer
    async function resetPomodoroState() {
        pomodoroState = PomodoroStates.Work;
        sessionNumber = 1;
    }

    // sets back to first work session regarding sage timer
    async function resetSageState() {
        sageState = SageStates.Work;
        sessionNumber = 1;
        sageRemainingTime = sageTimes.work;
    }

	// completely resets the timer to 0 deciseconds
	export async function clearTimer() {
        sessionNumber = 1; // for pomodoro
        await stopTimer();
        await resetPomodoroState();
        await resetSageState();
        clearInterval(interval);
        await setTime(0);
        changeTitles();
	}

    // converts hh:mm:ss to equivalent in deciseconds
	export async function convertTimeToDeciseconds(hours: number, minutes: number, seconds: number): Promise<number> {
		return 36000 * hours + 600 * minutes + 10 * seconds;
	}
	export function convertTimeToDecisecondsSync(hours: number, minutes: number, seconds: number): number {
		return 36000 * hours + 600 * minutes + 10 * seconds;
	}

    // cycles between pomodoro states based off the pomodoro method
	export async function pomodoroActive() {
		pomodoroCounting = true;
		while (pomodoroCounting) {
            changeTitles();
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
        if (get(timerState) !== newTimerState) {
            await clearTimer();
            switch (newTimerState) {
                case TimerStates.Pomodoro:
                    await modifyTimerState(TimerStates.Pomodoro);
                    await setTime(await convertTimeToDeciseconds(0, pomodoroTimes.work, 0));
                    break;
                case TimerStates.Standard:
                    await modifyTimerState(TimerStates.Standard);
                    await setTime(standardTime);
                    break;
                case TimerStates.Sage:
                    await modifyTimerState(TimerStates.Sage);
                    await setTime(await convertTimeToDeciseconds(0, sageTimes.work, 0));
                    break;
            }
            modifyTimerState(newTimerState);
            changeTitles();
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

    // changes the sage stored time values and calls function to update value for onscreen counter
    export async function modifySageTimes(work: number, breakTime: number, descend: number) {
        await clearTimer();
        sageTimes = {
            work: work,
            break: breakTime,
            decrement: descend
        }
        sageRemainingTime = work;
        await setTime(await convertTimeToDeciseconds(0, work, 0));
    }

    // changes the standard timer's stored hours, minutes and seconds and calls functions to update value for onscreen counter
    export async function modifyStandardTimes(hours: number, minutes: number, seconds: number) {
        await clearTimer();
        standardTime = await convertTimeToDeciseconds(hours, minutes, seconds);
        await setTime(standardTime);
    }

    // called by start button when timer is on standard mode
    export async function standardStartTimer() {
        if (timeToSet <= 0) await setTime(standardTime);

        await startTimer();
    }

    // simple calculation for long session number for proper pomodoro state change
    export async function changeLongSession(num: number) {
        longSession = 2 * num + 1;
    }

    // compartimentalises the writable update for timerState
    async function modifyTimerState(newTimerState: Symbol) {
        timerState.update(() => newTimerState);
    }

    // cycles between sage states based off the sage method
    export async function sageActive() {
		sageCounting = true;
		while (sageCounting) {
            console.log(sageState.toString())
            changeTitles();
			switch (sageState) {
				case SageStates.Work:
                    if (goalTime <= 0) await setTime(await convertTimeToDeciseconds(0, sageRemainingTime, 0));
                    console.log('A');
					await startTimer();
					break;
				case SageStates.Break:
                    if (goalTime <= 0) await setTime(await convertTimeToDeciseconds(0, sageTimes.break, 0));
					await startTimer();
                    console.log('B');
					break;
			}
			sessionNumber++;
			if (sessionNumber > 10000) {
				alert("You've worked for too long"); // in case timer is left running for an excessive amount of time
				sageCounting = false;
			}
		}
	}
</script>