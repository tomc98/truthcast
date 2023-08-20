<template>
  <v-container :key="refreshKey">
    <v-row style="height: 70vh" ref="scrollContainer" class="scrollable">
      <v-col>
        <!-- Top section -->
        <v-card v-for="id in cards" :key="id">
          <v-card-title>{{ cardInfo[id].transcript }}</v-card-title>
          <v-card-text> {{ cardInfo[id].researchAI }} </v-card-text>
        </v-card>
      </v-col>
    </v-row>
    <v-row>
      <v-col>
        <v-card class="text-md-center">
          <div
            style="display: flex; flex-direction: column; height: 10vh"
            ref="scrollContainer2"
            class="scrollable"
          >
            <v-card-text v-for="transcript in transcripts" :key="transcript" class="transcript-text"
              >{{ transcript }}
            </v-card-text>
          </div>

          <v-card-actions class="justify-center">
            <v-btn @click="toggleTranscription" id="transcript-div">
              {{ isTranscribing ? 'Stop Transcription' : 'Start Transcription' }}
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-btn class="save-button" color="grey" @click="dialog = true">
      <v-icon>mdi-cog</v-icon>
    </v-btn>
    <SettingsDialog v-model="dialog"></SettingsDialog>
  </v-container>
</template>

<script>
import SettingsDialog from './SettingsDialog.vue';
import AI from '../utils/ai.js';
import GCSE from '../utils/gcse.js';
import { v4 as uuidv4 } from 'uuid';

export default {
  components: {
    SettingsDialog,
  },
  data() {
    return {
      mediaRecorder: null,
      socket: null,
      transcripts: [],
      isTranscribing: false,
      curr: [],
      dialog: false,
      unfinished: 0, // Number of unfinished parts of the transcription
      cards: [],
      cardInfo: {},
      refreshKey: 0,
    };
  },
  methods: {
    async toggleTranscription() {
      if (this.isTranscribing) {
        this.stopTranscription();
      } else {
        await this.startTranscription();
      }
    },
    async startTranscription() {
      const stream = await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .catch((error) => alert(error));

      if (!MediaRecorder.isTypeSupported('audio/webm')) return alert('Unsupported browser');

      this.mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

      const DG_URL = 'wss://api.deepgram.com/v1/listen?tier=nova&language=en';
      const DG_KEY = localStorage.getItem('dgKey'); // Remember to use securely
      this.socket = new WebSocket(DG_URL, ['token', DG_KEY]);

      this.socket.onopen = () => {
        this.startStreaming();
        this.mediaRecorder.start(250);
      };
      this.socket.onmessage = this.handleResponse;

      this.isTranscribing = true;
    },
    stopTranscription() {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }

      if (this.socket && this.socket.readyState !== 3) {
        this.socket.close();
      }

      this.isTranscribing = false;
    },
    startStreaming() {
      this.mediaRecorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0 && this.socket.readyState === 1) {
          this.socket.send(event.data);
        }
      });
    },
    async handleResponse(message) {
      const received = JSON.parse(message.data);
      const transcript = received.channel.alternatives[0].transcript;
      if (transcript) {
        this.transcripts.push(transcript);

        this.classify(transcript);
        await this.scroll();
      }
    },
    async classify(transcript, unfinishedCheck = false) {
      const classified = await AI.custom(
        'Classify the text into one of the following categories: "personal", "claim", "general-question", "not-full-sentence" /n Only answer with the category name.',
        transcript,
        [
          { item: 'How old are you', answer: 'personal' },
          { item: 'the grocerry store', answer: 'not-full-sentence' },
          { item: 'Trump freed thousands of immigrants', answer: 'claim' },
          { item: 'How old are the pyramids', answer: 'general-question' },
          { item: 'I am 20', answer: 'personal' },
          { item: 'When will', answer: 'not-full-sentence' },
          { item: 'The pyramids are up to 10500 years old', answer: 'claim' },
          { item: 'Today I went to', answer: 'not-full-sentence' },
          { item: 'how are you going', answer: 'personal' },
          { item: 'how long ago', answer: 'not-full-sentence' },
        ],
        'gpt-3.5-turbo',
      );
      this.curr.push(classified);

      const transcriptId = uuidv4();

      if (classified.includes('claim')) {
        this.createCard(
          transcript,
          transcriptId,
          classified,
          this.transcripts.lenght - 1,
          this.unfinished,
          unfinishedCheck,
        );
        this.unfinished = 0;
        this.checkClaim(transcript, transcriptId);
      } else if (classified.includes('general-question')) {
        this.createCard(
          transcript,
          transcriptId,
          classified,
          this.transcripts.lenght - 1,
          this.unfinished,
          unfinishedCheck,
        );
        this.unfinished = 0;
      } else if (classified.includes('personal')) {
        this.createCard(
          transcript,
          transcriptId,
          classified,
          this.transcripts.lenght - 1,
          this.unfinished,
          unfinishedCheck,
        );
        this.unfinished = 0;
      }

      if (!unfinishedCheck && classified.includes('not-full-sentence')) {
        this.unfinished++;
        if (this.unfinished > 1) {
          let unfinishedCombo = this.transcripts[this.transcripts.length - this.unfinished];
          // get the last unfinished amount of curr and make it a new variable
          for (let i = 1; i < this.unfinished; i++) {
            unfinishedCombo = `${unfinishedCombo} ${
              this.transcripts[this.transcripts.length - (this.unfinished - i)]
            }`;
            console.log(unfinishedCombo);
            this.classify(unfinishedCombo, true);
          }
        }
      }
    },
    createCard(transcript, id, type, transcriptIndex, unfinished, unfinishedCheck) {
      this.cards.push(id);
      this.cardInfo[id] = {
        transcript,
        type,
        color: 'grey',
        show: true,
        transcriptIndex,
        unfinished,
        unfinishedCheck,
      };
    },
    async checkClaim(claim, transcriptId) {
      const question = await AI.custom(
        'You are a research bot. Write keywords for google to gather as much info as possible about what has been claimed. Only write the keywords needed to find the answer.',
        claim,
        [
          { item: 'China has the largest population', answer: 'China population' },
          { item: 'There are so many', answer: 'not-full-sentence' },
          { item: 'How old are the pyramids', answer: 'pyramids age' },
          { item: 'I am 20', answer: 'personal' },
          { item: 'When will', answer: 'not-full-sentence' },
          { item: 'The pyramids are up to 10500 years old', answer: 'pyramids age' },
          { item: 'Today I went to', answer: 'not-full-sentence' },
          { item: 'how are you going', answer: 'not-full-sentence' },
        ],
        'gpt-3.5-turbo',
      );
      console.log(transcriptId, question);
      const searched = await GCSE.search(question);
      let searchsnippets = '';
      searched.forEach((item) => {
        searchsnippets = `${searchsnippets} ${item.title}: ${item.snippet} ${item.formattedUrl} /n`;
      });
      this.cardInfo[transcriptId].searched = searchsnippets;
      const researched = await AI.custom(
        `You are a research bot. Use the information you found as well as general knowledge to answer/verify/refute the claim. The output will be on a webpage, you can add links as needed. /n Found Information:/n${searchsnippets}`,
        claim,
        [],
        'gpt-4-0314',
        300,
      );
      this.cardInfo[transcriptId].researchAI = researched;
      await this.scroll();
    },
    async scroll() {
      this.refreshKey++;
      // setTimeout(() => {
      //   const container = this.$refs.scrollContainer;
      //   container.scrollTop = container.scrollHeight;
      //   const container2 = this.$refs.scrollContainer2;
      //   container2.scrollTop = container2.scrollHeight;
      //   console.log('refreshed');
      //   return;
      // }, 50);
    },
    beforeDestroy() {
      this.stopTranscription();
    },
  },
  watch: {
    refreshKey: function () {
      this.$nextTick(function () {
        const container = this.$refs.scrollContainer;
        const containerz = this.$refs.scrollContainer2;
        console.log('refreshed');
        container.scrollTop = container?.scrollHeight || 1000000;
        containerz.scrollTop = containerz?.scrollHeight || 1000000;
      });
    },
  },
};
</script>

<style scoped>
.scrollable {
  overflow: hidden;
  overflow-y: scroll;

  border: 0px solid #ccc;
  scrollbar-width: none; /* Firefox 64+ */
  -ms-overflow-style: none; /* IE 10+ */
}
.scrollable::-webkit-scrollbar {
  width: 0; /* Remove scrollbar space */
  background: transparent; /* Optional: make scrollbar transparent */
}

.transcript-text {
  margin: 0;
  padding: 0;
  font-size: 1.5rem;
}

.save-button {
  position: fixed;
  top: 80px;
  right: 20px;
}
</style>
