export class LoopTimer {
    timer;
    callback;
    delay;
    timeStarted;
    isStarted;
    concurrentTimer;
    constructor(callback, delay) {
        this.callback = callback;
        this.delay = delay;
        this.isStarted = false;
        this.timeStarted = new Date();
        this.timer = undefined;
        this.concurrentTimer = undefined;
    }
    setInterval(ms) {
        if (this.isStarted) {
            let timeRemaining = (Date.now() - this.timeStarted.getTime()) % this.delay;
            if (timeRemaining > ms) {
                this.stop();
                this.delay = ms;
                this.start();
            }
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
    start() {
        if (!this.isStarted) {
            this.timer = setInterval(() => {
                if (!this.callback()) {
                    this.stop();
                }
            }, this.delay);
            this.isStarted = true;
        }
    }
    stop() {
        if (this.isStarted) {
            clearInterval(this.timer);
            this.isStarted = false;
        }
    }
}
