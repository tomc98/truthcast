<template>
  <v-container>
    <v-row>
      <v-col>
        <!-- Top section -->
        <v-card>
          <v-card-title>Top Section</v-card-title>
          <v-card-text> This is the top section of the component. </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <!-- Bottom section -->
        <v-card>
          <v-card-title>Bottom Section</v-card-title>
          <v-card-text> This is the bottom section of the component. </v-card-text>
          <v-card-actions> </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-btn class="save-button" color="primary" @click="dialog = true">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <SettingsDialog v-model="dialog"></SettingsDialog>
  </v-container>
</template>

<script>
import SettingsDialog from './SettingsDialog.vue';

export default {
  components: {
    SettingsDialog,
  },
  data() {
    return {
      dialog: false,
    };
  },
};
</script>

<style scoped>
.save-button {
  position: fixed;
  top: 80px;
  right: 20px;
}
</style>
