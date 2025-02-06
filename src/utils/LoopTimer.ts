export default class LoopTimer {
    private timer: ReturnType<typeof setInterval> | undefined;
    private callback: (...args: any[]) => Promise<boolean>;
    private delay: number;
    private timeStarted: Date;
    private isStarted: Boolean;
    private concurrentTimer: ReturnType<typeof setInterval> | undefined;
    
    //Takes in a function to run every "tick" and a delay in ms
    constructor(callback: (args: any[]) => Promise<boolean>, delay: number) {
        this.callback = callback;
        this.delay = delay;
        this.isStarted = false;
        this.timeStarted = new Date();
        this.timer = undefined;
        this.concurrentTimer = undefined;
    }

    //Overwrites the interval of the timer. 
    //If the timer is running, compare time left and new delay, then choose the lower value.
    public setInterval(ms: number): void {
        if (this.isStarted) {
            //Find time remaining in the interval
            let timeRemaining = (Date.now() - this.timeStarted.getTime()) % this.delay;
            //If new delay is lower than time left, just overwrite the timer with new delay
            if (timeRemaining > ms) {
                this.stop();
                this.delay = ms;
                this.start();
            }
            //If new delay is greater than time left, let the original timer finish first
            //concurrentTimer exists to ensure only one separate timer is running at a time. This is needed to reduce number of operations if the user changes delay rapidly
            else {
                clearInterval(this.concurrentTimer);
                this.concurrentTimer = setTimeout(clearInterval, timeRemaining, this.timer);
                this.stop();
                this.delay = ms;
                this.start();
            }
        }
        else {
            this.delay = ms;
        }
    }

    //Tries to start the timer. If it is already started, does nothing.
    public start(): void {
        if (!this.isStarted) {
            this.timer = setInterval(async () => {
                if (await this.callback(this.delay) == false) {
                    this.stop();
                }
            }
                , this.delay);
            this.isStarted = true;
            this.timeStarted = new Date();
        }
    }

    //Tries to stop the timer. If it is already stopped, does nothing.
    public stop(): void {
        if (this.isStarted) {
            clearInterval(this.timer);
            this.isStarted = false;
        }
    }
}