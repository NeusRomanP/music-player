<template>
  <home-view />
</template>
<script setup lang="ts">
import HomeView from "./views/HomeView.vue";
</script>
<style>
* {
  box-sizing: border-box;
}

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  height: 100dvh;
  background-color: #161616;
  color: #fff;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

html {
  height: 100%;
  min-height: 100dvh;
  padding: 0;
  margin: 0;
}

body {
  min-height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>
