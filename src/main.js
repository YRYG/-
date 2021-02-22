import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
Vue.config.productionTip = false;
import { Button, Dialog, Form, FormItem, Input, Avatar, Message } from 'element-ui';
Vue.use(Button)
Vue.use(Dialog)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(Avatar)

Vue.prototype.$message = Message;

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount("#app");
