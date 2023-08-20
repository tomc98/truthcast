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
        <v-text-field v-model="input2" label="Input 2"></v-text-field>
      </v-col>
      <v-col cols="12" sm="6" md="4">
        <v-text-field v-model="input3" label="Input 3"></v-text-field>
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
      input2: '',
      input3: '',
      savedDialog: false,
      show1: false,
    };
  },
  mounted() {
    // Load saved inputs from localStorage
    this.openaiKey = localStorage.getItem('openaiKey') || '';
    this.input2 = localStorage.getItem('input2') || '';
    this.input3 = localStorage.getItem('input3') || '';
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
      localStorage.setItem('input2', this.input2);
      localStorage.setItem('input3', this.input3);

      // Show saved dialog
      this.savedDialog = true;

      // Refresh the page
      location.reload();
    },
  },
};
</script>
