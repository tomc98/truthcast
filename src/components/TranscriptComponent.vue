<template>
  <div>
    <button @click="toggleTranscription">
      {{ isTranscribing ? 'Stop Transcription' : 'Start Transcription' }}
    </button>

    <div v-for="transcript in transcripts" :key="transcript">{{ transcript }}</div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      mediaRecorder: null,
      socket: null,
      transcripts: [],
      isTranscribing: false,
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

      const DG_URL = 'wss://api.deepgram.com/v1/listen?language=en';
      const DG_KEY = 'd4dec52d18f47c7531490ba643421bcb048f7b16'; // Remember to use securely
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
    handleResponse(message) {
      const received = JSON.parse(message.data);
      const transcript = received.channel.alternatives[0].transcript;
      if (transcript) {
        this.transcripts.push(transcript);
      }
    },
  },
  beforeDestroy() {
    this.stopTranscription();
  },
};
</script>

<style scoped>
/* Add your styles here if needed */
</style>
