<template>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="openaiKey"
          :append-icon="show1 ? 'mdi-eye' : 'mdi-eye-off'"
          label="OpenAI Key"
          :type="show1 ? 'text' : 'password'"
          counter
          @click:append="show1 = !show1"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field
          v-model="googlesearchKey"
          :append-icon="show2 ? 'mdi-eye' : 'mdi-eye-off'"
          :type="show1 ? 'text' : 'password'"
          counter
          @click:append="show2 = !show2"
          label="Google Search Engine API Key"
        ></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field v-model="googlesearchId" label="Google Search Engine ID"></v-text-field>
      </v-col>
    </v-row>
    <v-btn color="primary" @click="saveInputs">Save</v-btn>
    <v-dialog v-model="savedDialog" persistent>
      <v-card>
        <v-card-title class="headline">Saved</v-card-title>
        <v-card-text>Your inputs have been saved.</v-card-text>
        <v-card-actions>
          <v-btn color="primary" @click="savedDialog = false">OK</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      openaiKey: '',
      googlesearchKey: '',
      googlesearchId: '',
      savedDialog: false,
      show1: false,
      show2: false,
    };
  },
  mounted() {
    // Load saved inputs from localStorage
    this.openaiKey = localStorage.getItem('openaiKey') || '';
    this.googlesearchKey = localStorage.getItem('gcseKey') || '';
    this.googlesearchId = localStorage.getItem('gcseId') || '';
  },
  methods: {
    formatInput1() {
      const value = this.openaiKey;
      const lastThreeChars = value.slice(-3);
      const stars = value.slice(0, -3).replace(/./g, '*');
      this.openaiKey = stars + lastThreeChars;
    },
    saveInputs() {
      // Save inputs to localStorage
      localStorage.setItem('openaiKey', this.openaiKey);
      localStorage.setItem('gcseKey', this.googlesearchKey);
      localStorage.setItem('gcseId', this.googlesearchId);

      // Show saved dialog
      this.savedDialog = true;

      // Refresh the page
      location.reload();
    },
  },
};
</script>
