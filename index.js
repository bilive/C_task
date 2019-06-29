"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_1 = __importStar(require("../../plugin"));
class Task extends plugin_1.default {
    constructor() {
        super();
        this.name = '日常任务';
        this.description = '完成日常任务';
        this.version = '0.0.1';
        this.author = 'lzghzr';
        this._taskList = new Map();
    }
    async load({ defaultOptions, whiteList }) {
        defaultOptions.newUserData['doTask'] = false;
        defaultOptions.info['doTask'] = {
            description: '日常任务',
            tip: '完成日常任务',
            type: 'boolean'
        };
        whiteList.add('doTask');
        this.loaded = true;
    }
    async start({ users }) {
        this._task(users);
    }
    async loop({ cstMin, cstHour, cstString, users }) {
        if (cstString === '00:10')
            this._taskList.clear();
        if (cstMin === 30 && cstHour % 8 === 4)
            this._task(users);
    }
    _task(users) {
        users.forEach(async (user, uid) => {
            if (this._taskList.get(uid) || !user.userData['doTask'])
                return;
            const task = {
                method: 'POST',
                uri: 'https://api.live.bilibili.com/activity/v1/task/receive_award',
                body: `task_id=double_watch_task&csrf_token=${plugin_1.tools.getCookie(user.jar, 'bili_jct')}&csrf=${plugin_1.tools.getCookie(user.jar, 'bili_jct')}`,
                jar: user.jar,
                json: true,
                headers: { 'Referer': 'https://live.bilibili.com/p/center/index' }
            };
            const doubleWatchTask = await plugin_1.tools.XHR(task);
            if (doubleWatchTask !== undefined && doubleWatchTask.response.statusCode === 200) {
                if (doubleWatchTask.body.code === 0 || doubleWatchTask.body.code === -400) {
                    this._taskList.set(uid, true);
                    plugin_1.tools.Log(user.nickname, '日常任务', '日常任务已完成');
                }
                else
                    plugin_1.tools.Log(user.nickname, '日常任务', doubleWatchTask.body);
            }
            else
                plugin_1.tools.Log(user.nickname, '日常任务', '网络错误');
        });
    }
}
exports.default = new Task();
