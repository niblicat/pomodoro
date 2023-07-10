<script lang="ts" context="module">
	// Counts down each time segment
	// Processes a length of time in deciseconds (10^-1 seconds)

	import { writable, type Writable } from 'svelte/store';

	interface TimeElement {
		type: string;
		value: number;
	}
	interface PomodoroTimes {
		work: number;
		short: number;
		long: number;
	}
	export const PomodoroStates = {
		Work: Symbol('Work'),
		Short: Symbol('Short'),
		Long: Symbol('Long')
	};
	export const TimerStates = {
		Pomodoro: Symbol('Pomodoro'),
		Standard: Symbol('Standard')
	};

	export let timerState = TimerStates.Pomodoro;
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

	let timerInProgress: boolean = false;
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

	// modifies the change in time between now and the end time every decisecond
	async function timerActiveCount(): Promise<void> {
		return new Promise((resolve) => {
			let timeDifference: number = 0;
			currentTime = Date.now();
			endTime = currentTime + 100 * goalTime;
			interval = setInterval(() => {
				timeDifference = endTime - currentTime;
				currentTime = Date.now();
				formatTime(timeDifference / 100);
				if (timeDifference <= 0 || timerInProgress === false) {
					clearInterval(interval);
					timerInProgress = false;
					resolve();
				}
			}, 100);
		});
	}

	// called when the start button is pressed
	export async function startTimer(): Promise<void> {
		if (timerInProgress === true) {
			alert('Timer has already started.');
		} else {
			timerInProgress = true;
			await timerActiveCount(); // probably the issue here
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
		timerInProgress = false;
		pomodoroCounting = false;
		await updateGoalTime();
	}

	// sets the time based on deciseconds
	export async function setTime(timetoSet: number) {
		timerInProgress = false;
		goalTime = timetoSet;
		currentTime = Date.now();
		endTime = currentTime + 100 * goalTime;
		await formatTime(timetoSet);
	}

	// completely resets the timer to 0 deciseconds
	export async function clearTimer() {
		await stopTimer();
		await setTime(0);
	}

    // converts hh:mm:ss to equivalent in deciseconds
	function convertTimeToDeciseconds(hours: number, minutes: number, seconds: number): number {
		return 36000 * hours + 600 * minutes + 10 * seconds;
	}

    // cycles between pomodoro states based off the pomodoro method
	export async function pomodoroActive() {
		pomodoroCounting = true;
		while (pomodoroCounting) {
			console.log(pomodoroState);
			if (!(sessionNumber % longSession)) pomodoroState = PomodoroStates.Long; // forcefully modify state to long if we are on a long session number
			switch (pomodoroState) {
				case PomodoroStates.Work:
					await setTime(convertTimeToDeciseconds(0, pomodoroTimes.work, 0));
					await startTimer();
					pomodoroState = PomodoroStates.Short;
					break;
				case PomodoroStates.Short:
					await setTime(convertTimeToDeciseconds(0, pomodoroTimes.short, 0));
					await startTimer();
					pomodoroState = PomodoroStates.Work;
					break;
				case PomodoroStates.Long:
					await setTime(convertTimeToDeciseconds(0, pomodoroTimes.long, 0));
					await startTimer();
					pomodoroState = PomodoroStates.Work;
					break;
			}
			sessionNumber++; // increase session number so we can properly update state to long when needed
			if (sessionNumber > 10000) {
				alert("You've worked for too long"); // in case pomodoro timer is left running for an excessive amount of time
				pomodoroCounting = false;
			}
		}
	}
</script>
