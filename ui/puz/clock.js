"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Clock = void 0;
const util_1 = require("./util");
class Clock {
    constructor(config, startedMillisAgo = 0) {
        this.config = config;
        this.start = () => {
            if (!this.startAt)
                this.startAt = util_1.getNow();
        };
        this.started = () => !!this.startAt;
        this.millis = () => this.startAt ? Math.max(0, this.startAt + this.initialMillis - util_1.getNow()) : this.initialMillis;
        this.addSeconds = (seconds) => {
            this.initialMillis += seconds * 1000;
        };
        this.flag = () => !this.millis();
        this.initialMillis = config.clock.initial * 1000 - (startedMillisAgo || 0);
    }
}
exports.Clock = Clock;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xvY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzcmMvY2xvY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQ0EsaUNBQWdDO0FBRWhDLE1BQWEsS0FBSztJQUloQixZQUE0QixNQUFjLEVBQUUsbUJBQTJCLENBQUM7UUFBNUMsV0FBTSxHQUFOLE1BQU0sQ0FBUTtRQUkxQyxVQUFLLEdBQUcsR0FBRyxFQUFFO1lBQ1gsSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPO2dCQUFFLElBQUksQ0FBQyxPQUFPLEdBQUcsYUFBTSxFQUFFLENBQUM7UUFDN0MsQ0FBQyxDQUFDO1FBRUYsWUFBTyxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBRS9CLFdBQU0sR0FBRyxHQUFXLEVBQUUsQ0FDcEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLENBQUMsYUFBYSxHQUFHLGFBQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUM7UUFFaEcsZUFBVSxHQUFHLENBQUMsT0FBZSxFQUFFLEVBQUU7WUFDL0IsSUFBSSxDQUFDLGFBQWEsSUFBSSxPQUFPLEdBQUcsSUFBSSxDQUFDO1FBQ3ZDLENBQUMsQ0FBQztRQUVGLFNBQUksR0FBRyxHQUFHLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztRQWhCMUIsSUFBSSxDQUFDLGFBQWEsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUM3RSxDQUFDO0NBZ0JGO0FBdEJELHNCQXNCQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IENvbmZpZyB9IGZyb20gJy4vaW50ZXJmYWNlcyc7XG5pbXBvcnQgeyBnZXROb3cgfSBmcm9tICcuL3V0aWwnO1xuXG5leHBvcnQgY2xhc3MgQ2xvY2sge1xuICBzdGFydEF0OiBudW1iZXIgfCB1bmRlZmluZWQ7XG4gIGluaXRpYWxNaWxsaXM6IG51bWJlcjtcblxuICBwdWJsaWMgY29uc3RydWN0b3IocmVhZG9ubHkgY29uZmlnOiBDb25maWcsIHN0YXJ0ZWRNaWxsaXNBZ286IG51bWJlciA9IDApIHtcbiAgICB0aGlzLmluaXRpYWxNaWxsaXMgPSBjb25maWcuY2xvY2suaW5pdGlhbCAqIDEwMDAgLSAoc3RhcnRlZE1pbGxpc0FnbyB8fCAwKTtcbiAgfVxuXG4gIHN0YXJ0ID0gKCkgPT4ge1xuICAgIGlmICghdGhpcy5zdGFydEF0KSB0aGlzLnN0YXJ0QXQgPSBnZXROb3coKTtcbiAgfTtcblxuICBzdGFydGVkID0gKCkgPT4gISF0aGlzLnN0YXJ0QXQ7XG5cbiAgbWlsbGlzID0gKCk6IG51bWJlciA9PlxuICAgIHRoaXMuc3RhcnRBdCA/IE1hdGgubWF4KDAsIHRoaXMuc3RhcnRBdCArIHRoaXMuaW5pdGlhbE1pbGxpcyAtIGdldE5vdygpKSA6IHRoaXMuaW5pdGlhbE1pbGxpcztcblxuICBhZGRTZWNvbmRzID0gKHNlY29uZHM6IG51bWJlcikgPT4ge1xuICAgIHRoaXMuaW5pdGlhbE1pbGxpcyArPSBzZWNvbmRzICogMTAwMDtcbiAgfTtcblxuICBmbGFnID0gKCkgPT4gIXRoaXMubWlsbGlzKCk7XG59XG4iXX0=