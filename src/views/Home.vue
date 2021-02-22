<template>
    <div class="home">
        <div class="header">
            <img alt="Vue logo" class="logo" src="../assets/logo.png" />
            聊天室
            <img
                alt="info logo"
                class="info"
                :src="cutPath(userPic)"
                @click="editInfo"
            />
        </div>
        <ul id="messages">
            <li
                v-for="(item, index) in msgList"
                :key="index"
                :class="{
                    my: item.info.id == info.id,
                    join: item.type == 'join',
                }"
            >
                <template v-if="item.type == 'message'">
                    <img
                        class="head"
                        :src="cutPath(item.info.pic)"
                        :title="item.info.name"
                    />
                    <div class="name" v-if="item.info.id != info.id">{{ item.info.name }} (2021-2-22 18:22:52)</div>
                    <div class="content">{{ item.msg }}</div>
                </template>
                <template v-if="item.type == 'join'">
                    <span class="no-data">
                        <span class="maxname">“{{ item.info.name }}”</span>
                        加入聊天
                    </span>
                </template>
            </li>
        </ul>
        <form id="form" action="">
            <input id="input" v-model="value" autocomplete="off" />
            <button @click.prevent="send">Send</button>
        </form>

        <el-dialog
            title="填写资料"
            :visible.sync="dialogFormVisible"
            :close-on-click-modal="false"
            :close-on-press-escape="false"
            :show-close="false"
            width="350px"
        >
            <el-form :model="info" label-position="top">
                <el-form-item label="姓名" v-if="!edit">
                    <el-input v-model="info.name" autocomplete="off"></el-input>
                </el-form-item>
                <el-form-item label="选择头像">
                    <span
                        v-for="(item, index) in picList"
                        :key="index"
                        @click="selectPic(item.id)"
                    >
                        <el-avatar
                            class="select-head"
                            :class="{ active: info.pic == item.id }"
                            :src="item.src"
                        ></el-avatar>
                    </span>
                </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="saveInfo"> 确 定 </el-button>
            </div>
        </el-dialog>
    </div>
</template>

<script>
import { io } from "socket.io-client";

export default {
    components: {},
    data() {
        return {
            info: {
                id: "",
                name: "",
                pic: 1,
            },
            userPic: 1,
            value: null,
            websock: null,
            edit: false,
            isLogin: false,
            dialogFormVisible: true,

            picList: [],
            msgList: [
                // {
                //     info: {
                //         id: "0e82be0a-c7ee-42fa-bd98-4498ec71d108",
                //         name: "马冬梅",
                //         pic: 1,
                //     },
                //     msg: "asd333",
                //     type: "message",
                // },
                // {
                //     info: {
                //         id: "0e82be0a-c7ee-42fa-bd98-4498ec71d108",
                //         name: "马冬梅",
                //         pic: 1,
                //     },
                //     msg: "",
                //     type: "join",
                // },
                // {
                //     info: {
                //         id: "0e82be0a-c7ee-42fa-bd98-4498ec71d108",
                //         name: "马冬梅",
                //         pic: 1,
                //     },
                //     msg: "asd333",
                //     type: "message",
                // },
            ],
        };
    },
    created() {
        for (let i = 1; i < 14; i++) {
            this.picList.push({
                id: i,
                src: require("../assets/t" + i + ".jpg"),
            });
        }
        this.initWebSocket1();

        this.info.id = this.getUUID();
    },
    mounted() {
        // window.addEventListener("beforeunload", (event) => {
        //     // Cancel the event as stated by the standard.
        //     // event.preventDefault();
        //     // // Chrome requires returnValue to be set.
        //     // console.log(beforeunload);
        //     // event.returnValue = "";
        //     this.socket.emit("close", "abc");
        // });
    },
    beforeDestroy() {
        // socket.disconnect('aaaaa');
    },
    destroyed() {},
    methods: {
        // 生成随机id
        getUUID() {
            var d = new Date().getTime();

            if (
                window.performance &&
                typeof window.performance.now === "function"
            ) {
                d += performance.now(); //use high-precision timer if available
            }
            var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
                /[xy]/g,
                function (c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
                }
            );
            return uuid;
        },
        // 发送消息
        send() {
            if (!this.value) return false;
            let post = {
                info: this.info,
                msg: this.value,
                type: "message",
            };
            this.websock.emit("chat message", post);
            this.value = "";
        },
        selectPic(id) {
            this.info.pic = id;
        },
        // 获取图片地址
        cutPath(id) {
            let picItem = this.picList.find((m) => m.id == id);
            if (picItem) return picItem.src;
            else return "";
        },
        // 编辑资料
        editInfo() {
            return;
            this.edit = true;
            this.dialogFormVisible = true;
        },
        // 保存个人信息
        saveInfo() {
            if (!this.info.name) {
                return this.$message.error("请输入姓名！");
            }

            // 绑定事件
            this.bindWebSocket();
            this.websock.emit("save info", this.info);
            this.userPic = this.info.pic;
            this.dialogFormVisible = false;
        },
        initWebSocket1() {
            // 第三方包
            this.websock = io("http://127.0.0.1:3000/", {
                reconnectionAttempts: 2,
            });
            this.websock.on("connect", () => {
                console.log("connect----");
            });
            this.websock.on("connect_error", (e) => {
                console.log("connect_error----", e);
            });
        },
        // 登陆之后绑定接收事件
        bindWebSocket() {
            this.websock.on("chat message", (data) => {
                this.msgList.push(data);
            });
            this.websock.on("save info", (data) => {
                if (!this.isLogin) {
                    this.msgList = data.historyList;
                    this.isLogin = true;
                    console.log("save info", data);
                }
            });
        },
        initWebSocket2() {
            // 原生websocket
            const wsuri = "ws://172.18.1.128:8081/task/list";
            this.websock = new WebSocket(wsuri);
            this.websock.onmessage = this.websocketonmessage;
            this.websock.onopen = this.websocketonopen;
            this.websock.onerror = this.websocketonerror;
            this.websock.onclose = this.websocketclose;
        },
        websocketonopen() {
            //连接建立之后执行send方法发送数据
            let actions = { test: "12345" };
            this.websocketsend(JSON.stringify(actions));
        },
        websocketonerror() {
            //连接建立失败重连
            this.initWebSocket1();
        },
        websocketonmessage(e) {
            //数据接收
            // const redata = JSON.parse(e.data);
            console.log("websocketonmessage", e);
        },
        websocketsend(Data) {
            //数据发送
            this.websock.send(Data);
        },
        websocketclose(e) {
            //关闭
            console.log("断开连接", e);
        },
    },
    watch: {
        "info.name"(data) {
            // if (data.length > 6) {
            //     this.info.name = data.substring(0, 6);
            // }
        },
    },
};
</script>

<style>
.header {
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #bbb;
    text-align: center;
    position: fixed;
    top: 0;
    width: 100%;
    background-color: white;
    z-index: 2;
}

.header .logo {
    animation: App-logo-spin infinite 1s linear;
    width: 20px;
    position: relative;
    top: 5px;
    left: 0;
}

.header .info {
    width: 30px;
    height: 30px;
    border-radius: 100%;
    border: 1px solid #bbb;
    float: right;
    position: relative;
    top: 4px;
    right: 5px;
    cursor: pointer;
}

@keyframes App-logo-spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

.select-head {
    /* border: 1px solid #bbb;
    width: 50px;
    height: 50px;
    padding: 5px; */
    cursor: pointer;
    margin-right: 10px;
    border: 2px solid white;
}

.select-head.active {
    border: 2px solid #409eff;
}

body {
    margin: 0;
    padding-bottom: 3rem;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
        Helvetica, Arial, sans-serif;
}

#form {
    background: rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    height: 3rem;
    box-sizing: border-box;
    backdrop-filter: blur(10px);
}

#input {
    border: none;
    padding: 0 1rem;
    flex-grow: 1;
    border-radius: 2rem;
    margin: 0.25rem;
}

#input:focus {
    outline: none;
}

#form > button {
    background: #333;
    border: none;
    padding: 0 1rem;
    margin: 0.25rem;
    border-radius: 3px;
    outline: none;
    color: #fff;
}

#messages {
    list-style-type: none;
    margin: 0;
    padding: 0;
    /* background: #efefef; */
    margin-top: 40px;
}

#messages > li {
    padding: 0.5rem 1rem;
}

#messages > li::after {
    content: "";
    display: block;
    height: 0;
    clear: both;
    visibility: hidden;
}

#messages > li .head {
    width: 30px;
    height: 30px;
    border: 1px solid #bbb;
    border-radius: 100%;
    float: left;
}

#messages > li .name {
    font-size: 12px;
    color: #919191;
    margin-left: 45px;
}

#messages > li .content {
    border-radius: 5px;
    margin-left: 10px;
    background-color: rgb(229, 229, 229);
    padding: 8px;
    font-size: 14px;
    max-width: calc(100% - 62px);
    word-wrap: break-word;
    position: relative;
    float: left;
}

#messages > li .content::after {
    content: "";
    display: block;
    border-top: 5px solid rgb(229, 229, 229);
    border-left: 5px solid rgb(229, 229, 229);
    border-right: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-radius: 2px;
    position: absolute;
    top: 5px;
    left: -5px;
    transform: rotate(-45deg);
}

#messages > li.my .head {
    float: right;
}

#messages > li.my .content {
    margin-left: 0;
    background-color: rgb(18, 183, 245);
    color: white;
    float: right;
    margin-right: 10px;
}

#messages > li.my .content::after {
    left: auto;
    right: -5px;
    transform: rotate(135deg);
    border-color: rgb(18, 183, 245);
}

#messages > li.join {
    height: 35px;
}

.no-data {
    color: #bbb;
    text-align: center;
    position: absolute;
    padding: 0 40px;
    /* width: 1; */
    left: 50%;
    /* width: 150px; */
    font-size: 14px;
    transform: translateX(-50%);
}

.no-data::before {
    content: "";
    display: block;
    width: 30px;
    height: 1px;
    background-color: #bbb;
    position: absolute;
    top: 50%;
    left: 0;
}

.no-data::after {
    content: "";
    display: block;
    width: 30px;
    height: 1px;
    background-color: #bbb;
    position: absolute;
    top: 50%;
    right: 0;
}

.maxname {
    max-width: 150px;
    height: 18px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    /* display: block; */
}
</style>
