<script setup lang="ts">
import { useFetch } from './plugins/useFetch'
import { setAccessToken, removeAccessToken, setRefreshToken, removeRefreshToken } from './plugins/get'
import { ref } from 'vue'
const tips = ref('')

function login() {
  const { data: res, onFetchResponse } = useFetch('/login').post().json()
  onFetchResponse(() => {
    tips.value = 'login success'
    const { data } = res.value

    setAccessToken(data.access_token)
    setRefreshToken(data.refresh_token)
  })
}

function fetchData(type: number) {
  if (type === 1) {
    const { data: res, onFetchResponse } = useFetch('/auth/1').get().json()
    onFetchResponse(() => {
      tips.value = res.value.data + ', wait 10s'
    })
  } else if (type === 2) {
    const { data: res, onFetchResponse } = useFetch('/auth/2').post({
      name: 'jon'
    }).json()

    onFetchResponse(() => {
      tips.value = res.value.data + ', wait 10s'
    })
  }
}

function logout() {
  removeAccessToken()
  removeRefreshToken()
}
</script>

<template>
<div class="content">
  <div>
    <h1>open F12 -> network</h1>
    <h2>{{tips}}</h2>
    <button @click="login">login</button>
    <button @click="fetchData(1)">auth api 1</button>
    <button @click="fetchData(2)">auth api 2</button>
    <button @click="logout">invalid access_token</button>
  </div>
</div>
</template>

<style>
body {
  margin: 0;
}
#app {
  height: 100vh;
}
.content {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

button {
  font-size: 18px;
  padding: 5px 10px;
  margin: 10px;
}
</style>
