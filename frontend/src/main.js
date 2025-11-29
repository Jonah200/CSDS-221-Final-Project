import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from "./router";

import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'toastr/build/toastr.min.css'
import toastr  from 'toastr'
import '@mdi/font/css/materialdesignicons.css'

toastr.options = {
  positionClass: "toast-top-right",
  timeOut: 3000,
  closeButton: true,
  progressBar: true,
}

const vuetify = createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
  }
})

const app = createApp(App)
app.use(router);
app.use(vuetify);
app.mount('#app');