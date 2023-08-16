// handles phone vibration actions

export let canVibrate: boolean;

export enum VibrateType {
    Standard,
    Long,
    Alert
}

export function vibrateAction(vType: VibrateType) {
    if (canVibrate) {
        let pattern: Iterable<number>;
        switch (vType) {
            case VibrateType.Standard:
                pattern = [200];
                break;
            case VibrateType.Long:
                pattern = [600];
                break;
            case VibrateType.Alert:
                pattern = [200, 200];
                break;
        }
        navigator.vibrate(pattern);
    }
}

export function alertCanVibrate() {
    alert(canVibrate);
}

export function checkVibrate() {
    if ('vibrate' in navigator) canVibrate = true;
}