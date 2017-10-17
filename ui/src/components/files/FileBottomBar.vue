<template>
  <div>
    <div class="bottom-bar" v-if="show">
      <span class="ideogram-link" v-for="(data,index) in printData" @click.prevent="openModal(data.characterLink)" :key="index">
        <ideograms-show :pinyin="data.pinyin" :character="data.character"/>
      </span>

      <span class="bottom-bar-pinyin">{{ block.pinyin }}</span>

      <md-button class="md-icon-button md-primary" @click.native="loadDictionary()">
        <md-icon>find_in_page</md-icon>
      </md-button>



      <md-menu md-size="4" md-direction="top left" md-offset-y="-52">
        <md-button class="md-icon-button md-primary md-2" md-menu-trigger>
          <md-icon>more_vert</md-icon>
        </md-button>

        <md-menu-content>
          <md-menu-item @click.native="close()">
            <md-icon>clear</md-icon>
            <span>{{ $t('close') }}</span>
          </md-menu-item>
          <md-menu-item @click.native="joinLeft(block)">
            <md-icon>arrow_back</md-icon>
            <span>{{ $t('join_left') }}</span>
          </md-menu-item>
          <md-menu-item @click.native="separate(block)">
            <md-icon>swap_horiz</md-icon>
            <span>{{ $t('split') }}</span>
          </md-menu-item>
          <md-menu-item @click.native="edit(block)">
            <md-icon>edit</md-icon>
            <span>{{ $t('edit') }}</span>
          </md-menu-item>
          <md-menu-item @click.native="openLinkMenu()">
            <md-icon>open_in_browser</md-icon>
            <span>Links</span>
          </md-menu-item>
        </md-menu-content>
      </md-menu>

      <Links list=0 :character="block.character" ref="links"/>
    </div>


    <md-dialog ref="dialogDictionary">
      <md-dialog-title>
        <ideograms-show :pinyin="block.pinyin" :character="block.character"/>
        - {{ block.pinyin }}
        <md-button class="md-icon-button md-primary clipboard-btn" v-clipboard="block.character" @success="clipboardSuccess">
          <md-icon>content_copy</md-icon>
        </md-button>

        <md-button class="md-icon-button md-warn sound-btn" @click.native="openSound">
          <md-icon>volume_up</md-icon>
        </md-button>
      </md-dialog-title>

      <md-dialog-content>
        <dictionary-details :dictionary="dictionary" :pinyin="block.pinyin" @change-show="changeShow" ref="dictionaryDetails"/>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog('dialogDictionary')">OK</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog ref="dialogSeparate">
      <md-dialog-title>
        <ideograms-show :pinyin="block.pinyin" :character="block.character"/>
        - {{ block.pinyin }}
      </md-dialog-title>

      <md-dialog-content>
        <md-input-container md-inline>
          <md-input v-model="separateCharacter"></md-input>
        </md-input-container>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="confirmSeparate">OK</md-button>
      </md-dialog-actions>
    </md-dialog>

    <md-dialog ref="dialogEdit">
      <md-dialog-title>
        <ideograms-show :pinyin="block.pinyin" :character="block.character"/>
        - {{ block.pinyin }}
      </md-dialog-title>

      <md-dialog-content>
        <md-input-container md-inline>
          <md-input :value="editPinyin" @change="changeEditPinyin"></md-input>
        </md-input-container>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="confirmEdit">OK</md-button>
      </md-dialog-actions>
    </md-dialog>

    <forvo-modal ref="dialogForvo" :character="block.character" />

    <md-snackbar md-position="bottom center" ref="snackbarClipboard" md-duration="1300">
      <span>{{ $t('copied_to_clipboard') }}</span>
    </md-snackbar>

  </div>
</template>

<script>
  import http from 'src/helpers/http';
  import DictionaryDetails from 'src/components/dictionary/Details';
  import IdeogramsShow from 'src/components/ideograms/Show';
  import Links from 'src/components/ideograms/Links';
  import OptionsManager from 'src/domain/options-manager';
  import MobileDetect from 'mobile-detect';
  import separatePinyinInSyllables from 'shared/helpers/separate-pinyin-in-syllables';
  import replaceall from 'replaceall';
  import pinyinHelper from 'src/helpers/pinyin';
  import ForvoModal from 'src/components/modals/Forvo';

  import {
    mapActions,
    mapMutations,
    mapGetters,
  } from 'vuex';

  import {
    FILE_ACTION_JOIN_LEFT,
    FILE_ACTION_SEPARATE,
    FILE_MUTATION_SET_MY_CJK_TEMP,
    FILE_MUTATION_UPDATE_PINYIN,
    FILE_GETTER_MY_CJK,
  } from 'src/data/file/types';

  const md = new MobileDetect(window.navigator.userAgent);

  export default {
    name: 'file-bottom-bar',
    data() {
      return {
        editPinyin: '',
        separateCharacter: '',
        show: false,
        tempDictCharacter: null,
        block: {},
        printData: {},
        dictionary: {
          pt: null,
          unihan: null,
          cedict: null,
          chinese_tools_pt: null,
          chinese_tools_es: null,
          chinese_tools_en: null,
        },
      };
    },
    components: {
      DictionaryDetails,
      IdeogramsShow,
      Links,
      ForvoModal,
    },
    computed: {
      ...mapGetters({
        myCjk: FILE_GETTER_MY_CJK,
      }),
    },

    methods: {
      ...mapActions({
        joinLeft: FILE_ACTION_JOIN_LEFT,
        separateAction: FILE_ACTION_SEPARATE,
      }),
      ...mapMutations({
        setMyCjkTemp: FILE_MUTATION_SET_MY_CJK_TEMP,
        updatePinyin: FILE_MUTATION_UPDATE_PINYIN,
      }),

      openLinkMenu() {
        this.$refs.links.$refs.menuLinks.open();
      },

      changeShow(show) {
        this.show = !show;
        const action = show ? 'remove' : 'add';
        document.body.classList[action]('has-bottom-bar');
      },

      separate() {
        this.separateCharacter = this.block.character;
        this.openDialog('dialogSeparate');
      },

      confirmSeparate() {
        this.separateAction({ ...this.block, separateCharacter: this.separateCharacter });
        this.closeDialog('dialogSeparate');
      },

      edit() {
        this.editPinyin = this.block.pinyin;
        this.openDialog('dialogEdit');
      },

      confirmEdit() {
        this.updatePinyin({ ...this.block, pinyin: this.editPinyin });
        this.closeDialog('dialogEdit');
      },

      changeEditPinyin(pinyin) {
        this.editPinyin = pinyinHelper(pinyin);
      },

      close() {
        document.body.classList.remove('has-bottom-bar');
        this.show = false;
      },

      open(block) {
        document.body.classList.add('has-bottom-bar');
        this.show = true;
        if (md.mobile() && this.tempDictCharacter === block.character) {
          block.openDictionary = true;
        }

        this.block = block;
        block.pinyin = replaceall(String.fromCharCode(160), '', block.pinyin);
        this.tempDictCharacter = block.character;
        const pinyin = separatePinyinInSyllables(block.pinyin);
        setTimeout(() => {
          this.tempDictCharacter = null;
        }, 2000);
        const chars = block.character.toString();
        const printData = [];
        const options = OptionsManager.getOptions();
        for (let i = 0; i < chars.length; i += 1) {
          let characterLink = chars[i];
          if (options.pinyinHide === '2') {
            characterLink = chars;
          }

          let pinyinSeparated = '';
          if (pinyin[i]) {
            pinyinSeparated = pinyin[i].trim();
          }

          printData.push({
            pinyin: pinyinSeparated,
            character: chars[i],
            characterLink,
          });
        }

        this.printData = printData;

        if (block.openDictionary) {
          this.loadDictionary();
        }
      },

      openModal(character) {
        let add = true;
        if (this.myCjk[character] !== undefined) {
          add = false;
        }

        this.setMyCjkTemp(character);
        this.$emit('open-modal', add);
      },

      loadDictionary() {
        http
        .get('unihan/dictionary', {
          params: {
            ideograms: this.block.character,
          },
        })
        .then((response) => {
          const isSimplifiedEquals = response.data.ideograms === this.block.character;
          const isTradiaionalEquals = response.data.ideogramsTraditional === this.block.character;
          if (!isSimplifiedEquals && !isTradiaionalEquals) {
            return;
          }
          this.dictionary = response.data;
          this.openDialog('dialogDictionary');
        });
      },

      openPinyinList() {
        http
        .post('unihan/to_pinyin_all', {
          ideograms: [this.block.character],
        })
        .then((response) => {
          // eslint-disable-next-line
          console.log(response.data);
        });
      },

      clipboardSuccess() {
        this.$refs.snackbarClipboard.open();
      },

      openSound() {
        this.openDialog('dialogForvo');
      },

      openDialog(ref) {
        this.$refs[ref].open();
      },
      closeDialog(ref) {
        this.$refs.dictionaryDetails.cancelEdit();
        this.show = true;
        this.$refs[ref].close();
      },
      onOpen() {
        // eslint-disable-next-line
        console.log('Opened');
      },

      onClose(type) {
        // eslint-disable-next-line
        console.log('Closed', type);
      },
    },
  };
</script>

<style>
.bottom-bar {
  border-top: 2px #ccc solid;
  background: #fff;
  font-size: 22px;
  padding: 0 10px;
  line-height: 40px;
  height: 40px;
  width: 100%;
  flex-shrink: 0;
}
.bottom-bar .md-menu {
  margin-left: -30px;
}
.bottom-bar-pinyin{
  font-size: 15px;
}

.sound-btn,
.clipboard-btn {
  padding: 0 !important;
  margin: 0 !important;
  width: 30px !important;
  min-width: 30px !important;
  height: 30px !important;
  min-height: 30px !important;
}

.sound-btn i,
.clipboard-btn i{
  width: 20px !important;
  min-width: 20px !important;
  height: 20px !important;
  min-height: 20px !important;
  font-size: 20px !important;
}

.bottom-bar #menu-pinyin .md-menu .md-button{
  margin: 6px 0;
  padding: 0 6px;
}

.bottom-bar .ideogram-link {
  cursor: pointer;
}

.dict-title {
  font-weight: bold;
  font-size:18px;
}

.dict-block{
  padding-bottom: 10px;
}

.bottom-bar .md-button{
  min-width: auto;
}
</style>
