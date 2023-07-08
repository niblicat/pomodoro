<script lang="ts>
    class Timer {
        constructor(public endTime: number = 100) {
            let interval = setInterval(() => {
                this.endTime -= 1;
                console.log(Math.ceil(this.endTime / 10));
                if (this.endTime < 0) {
                    clearInterval(interval);
                }

            }, 100);
        }
        public async getCurrentTime(): Promise<number> {
            if (this.endTime === null) return 0;
            return this.endTime;
        }

    }
</script