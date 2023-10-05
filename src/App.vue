<template>
  <v-app>
    <v-app-bar app dark>
      <div class="d-flex align-center">
        <v-img
          alt="Vuetify Logo"
          class="shrink mr-2"
          contain
          src="./assets/logo.png"
          transition="scale-transition"
          width="40"
        />

        <h1>TrueCast</h1>
      </div>

      <v-spacer></v-spacer>

      <p style="font-family: 'Lucida Calligraphy', cursive">Made by Thomas Csere</p>
    </v-app-bar>

    <v-main>
      <component :is="currentPage" />
    </v-main>
  </v-app>
</template>

<script>
import SettingsPage from './components/SettingsPage';
import AppPage from './components/AppPage';

export default {
  name: 'App',

  components: {
    SettingsPage,
    AppPage,
  },

  computed: {
    currentPage() {
      return localStorage.getItem('openaiKey') ? 'AppPage' : 'SettingsPage';
    },
  },
};
</script>
