<template>
  <v-dialog v-model="dialog" max-width="500">
    <v-card>
      <v-card-title>Settings</v-card-title>
      <SettingsPage></SettingsPage>
    </v-card>
  </v-dialog>
</template>

<script>
import SettingsPage from './SettingsPage.vue';

export default {
  components: {
    SettingsPage,
  },
  props: {
    value: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      // Bind the v-model to this data property
      dialog: this.value,
    };
  },
  watch: {
    // Watch for changes to the v-model value and update the data property
    value(newValue) {
      this.dialog = newValue;
    },
    // Watch for changes to the data property and emit an update to the v-model
    dialog(newValue) {
      this.$emit('input', newValue);
    },
  },
};
</script>
