<template>
  <div class="about-container">
    <p class="about-text">
      {{ $t('about_text') }}
    </p>

    <div v-if="hasShare">
        <h2>{{ $t('share') }}</h2>
        <md-button @click.native="share" class="md-icon-button md-raised md-accent">
          <md-icon>share</md-icon>
        </md-button>
    </div>

    <h2>{{ $t('other_apps') }}</h2>
    <div class="other-apps-container">
      <div class="other-apps-item" v-if="showEditor">
        <a href="https://editor.2pinyin.net" target="_blank">
          <img src="/static/favicon/android-icon-72x72.png"/>
        </a>
        <a href="https://editor.2pinyin.net" target="_blank">
          {{ $t('app.editor').split('-')[1].trim() }}
        </a>
      </div>

      <div class="other-apps-item" v-if="showBible">
        <a href="https://biblia.2pinyin.net" target="_blank">
          <img src="/static/favicon-bible/android-icon-72x72.png"/>
        </a>
        <a href="https://biblia.2pinyin.net" target="_blank">
          {{ $t('app.bible').split('-')[1].trim() }}
        </a>
      </div>

      <div class="other-apps-item" v-if="showVideos">
        <a href="https://videos.2pinyin.net" target="_blank">
          <img src="/static/favicon-videos/android-icon-72x72.png"/>
        </a>
        <a href="https://videos.2pinyin.net" target="_blank">
          {{ $t('app.videos').split('-')[1].trim() }}
        </a>
      </div>

      <div class="other-apps-item" v-if="showDictionary">
        <a href="https://dicionario.2pinyin.net" target="_blank">
          <img src="/static/favicon-dictionary/android-icon-72x72.png"/>
        </a>
        <a href="https://dicionario.2pinyin.net" target="_blank">
        {{ $t('app.dictionary').split('-')[1].trim() }}
        </a>
      </div>

      <div class="other-apps-item">
        <a href="http://2pinyin.net" target="_blank">
          <img src="/static/favicon-2pinyin/android-icon-72x72.png"/>
        </a>
        <a href="http://2pinyin.net" target="_blank">
        {{ $t('app.converter').split('-')[1].trim() }}
        </a>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: 'about',
  data() {
    const appOptions = this.$router.options.appOptions;
    return {
      hasShare: navigator.share,
      showEditor: appOptions.title === 'app.editor',
      showBible: appOptions.title === 'app.bible',
      showDictionary: appOptions.title === 'app.dictionary',
      showVideos: appOptions.title === 'app.videos',
    };
  },
  methods: {
    async share() {
      if (!navigator.share) {
        return;
      }

      const url = window.location.href.split('#/')[0];

      await navigator.share({
        text: this.$t(this.$router.options.appOptions.title),
        url,
      });
    },
  },
};
</script>

<style>
.about-container {
  flex: 1;
  padding: 10px 10px;
  overflow: auto;
}

.about-text {
  font-size: 20px;
  padding: 10px 5px;
}

.other-apps-container {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  align-content: flex-start;
  width: 100%;
}

.other-apps-item {
  width: 50%;
  padding-bottom: 10px;
  font-size: 20px;
}

.other-apps-item img {
  width: 60px;
}

.other-apps-item a {
  color: #4286f4 !important;
}
</style>
