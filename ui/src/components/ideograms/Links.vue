<template>
  <div>
    <md-dialog ref="modal" :md-active.sync="showMenu" :md-fullscreen="false" v-if="list == 0" >
      <md-dialog-content>
        <div v-for="(link, index) in links" v-bind:key="index">
          <a :href="link.href" target="_blank">
              <md-button class="link-button md-primary">{{ link.title }}</md-button>
          </a>
        </div>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="showMenu = false">{{ $t('cancel') }}</md-button>
      </md-dialog-actions>
    </md-dialog>

    <div v-if="list == 1">
      <div v-for="(link, index) in links" v-bind:key="index">
        <a :href="link.href" target="_blank">
          <md-button class="link-button md-primary">{{ link.title }}</md-button>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'links',
  props: {
    character: '',
    list: 0,
  },
  data() {
    return {
      showMenu: false,
    };
  },
  methods: {
    open() {
      this.showMenu = true;
    },
  },
  computed: {
    links: function links() {
      return [
        {
          title: 'YellowBridge',
          href: `https://www.yellowbridge.com/chinese/dictionary.php?word=${
            this.character
          }&amp;characterMode=s`,
        },
        {
          title: 'StackExchange',
          href: `https://chinese.stackexchange.com/search?q=${
            this.character
          }&amp;characterMode=s`,
        },
        {
          title: 'Bing Dictionary',
          href: `http://www.bing.com/dict/search?q=${
            this.character
          }&mkt=zh-CN&setlang=ZH`,
        },
        {
          title: 'Baidu Dictionary',
          href: `http://dict.baidu.com/s?wd=${this.character}`,
        },

        {
          title: 'Chinese Grammar Wiki',
          href: `https://resources.allsetlearning.com/chinese/grammar/${
            this.character
          }`,
        },
        {
          title: 'Google Images',
          href: `https://www.google.com.br/search?tbm=isch&q=${this.character}`,
        },
        {
          title: 'Baidu Images',
          href: `https://image.baidu.com/search/index?tn=baiduimage&word=${
            this.character
          }`,
        },
        {
          title: 'Google Translate',
          href: `https://translate.google.com/translate#zh-CN|en|${
            this.character
          }`,
        },
        {
          title: 'Baidu Translate',
          href: `http://fanyi.baidu.com/#zh/en/${this.character}`,
        },
        {
          title: 'Chinese Pod Sentences',
          href: `https://chinesepod.com/tools/glossary/entry/${this.character}`,
        },
        {
          title: 'Tatoeba (sentences)',
          href: `http://tatoeba.org/eng/sentences/search?from=cmn&to=eng&query=${
            this.character
          }`,
        },
        {
          title: 'YellowBridge (sentences)',
          href: `https://www.yellowbridge.com/chinese/sentsearch.php?word=${
            this.character
          }&amp;characterMode=s`,
        },
        {
          title: 'Wiktionary',
          href: `https://en.wiktionary.org/wiki/${this.character}?#Mandarin`,
        },
        {
          title: 'Line',
          href: `http://linedictionary.naver.com/dict.html#/cnen/search?query=${
            this.character
          }`,
        },
        {
          title: 'Line (sentences)',
          href: `http://linedictionary.naver.com/dict.html#/cnen/example?query=${
            this.character
          }`,
        },
        {
          title: 'WordReference',
          href: `http://www.wordreference.com/zhen/${this.character}`,
        },

        {
          title: 'Character Pop',
          href: `https://characterpop.com/explode/${this.character}`,
        },
        {
          title: '51240 (Dictionary)',
          href: `https://cidian.51240.com/${this.character}__cidian/`,
        },
        {
          title: 'Google News',
          href: `https://www.google.com.br/search?tbm=nws&q=${this.character}`,
        },
        {
          title: 'HanziCraft',
          href: `http://www.hanzicraft.com/character/${this.character}`,
        },
        {
          title: 'Wikipedia',
          href: `https://zh.wikipedia.org/wiki/${this.character}`,
        },
        {
          title: 'iCIBA',
          href: `http://www.iciba.com/${this.character}`,
        },
        {
          title: 'CiBo',
          href: `http://www.cibo.cn/search.php?dictkeyword=${this.character}`,
        },

        {
          title: 'MDBG Word Dict',
          href: `https://www.mdbg.net/chinese/dictionary?page=worddict&wdrst=0&wdqb=${
            this.character
          }`,
        },
        {
          title: 'Popup Chinese',
          href: `http://popupchinese.com/search/${this.character}`,
        },
        {
          title: 'MDBG Character Dict',
          href: `https://www.mdbg.net/chinese/dictionary?page=chardict&cdqchi=${
            this.character
          }`,
        },
        {
          title: 'JuKuu (sentences)',
          href: `http://jukuu.com/search.php?q=${this.character}`,
        },
        {
          title: 'CantoDict',
          href: `http://www.cantonese.sheik.co.uk/dictionary/search/?searchtype=1&text=${
            this.character
          }`,
        },
        {
          title: 'Youdao Dictionary',
          href: `http://dict.youdao.com/search?q=${this.character}`,
        },
        {
          title: 'Baidu Baike',
          href: `https://baike.baidu.com/search?word=${this.character}`,
        },
        {
          title: 'Leiden Weibo (corpus)',
          href: `http://lwc.daanvanesch.nl/messages.php?word1=${
            this.character
          }`,
        },
        {
          title: 'Lancaster (corpus)',
          href: `http://corpus.leeds.ac.uk/cgi-bin/cqp.pl?searchstring=${
            this.character
          }&corpuslist=LCMC&searchtype=conc&contextsize=60c&sort1=word&sort2=right&terminate=100&llstat=on&cleft=0&cright=1&cfilter=`,
        },
      ];
    },
  },
};
</script>

<style scoped>
.link-button {
  margin: 5px 0 !important;
  min-width: 0;
}
</style>
