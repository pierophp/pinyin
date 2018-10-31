<template>
<div>
  <md-dialog ref="dialogKnownWords" :md-active.sync="this.active">
      <md-dialog-title>
        {{ $t(action) }}
        <span v-if="type === 'words' && hsk !== 999">- HSK {{hsk}}</span>
        <span v-if="type === 'ideograms' && frequency !== 999">- {{ $t('frequency') }} {{frequency}}</span>
      </md-dialog-title>
      <md-dialog-content>
        <md-table>
          <md-table-row>
            <md-table-head>{{ $t('ideogram') }}</md-table-head>
            <md-table-head>{{ $t('pronunciation') }}</md-table-head>
            <md-table-head></md-table-head>
          </md-table-row>

          <md-table-row v-for="(item, index) in renderItems" :key="item.ideogram + item.pronunciation">
            <md-table-cell class="ideogram">
              <ideograms-show :pinyin="item.pronunciation" :character="item.ideogram"/>
            </md-table-cell>
            <md-table-cell>{{item.pronunciation}}</md-table-cell>

            <md-table-cell v-if="action === 'unknown'" class="cell-button">
              <md-button v-if="options.type !== '4'" class="md-icon-button md-raised" @click.native="openModal(true, item.ideogram, index)">
                <md-icon>add</md-icon>
              </md-button>
              <md-button v-if="options.type === '4'" class="md-icon-button md-raised" @click.native="openModal(false, item.ideogram, index)">
                <md-icon>remove</md-icon>
              </md-button>
            </md-table-cell>

            <md-table-cell v-if="action === 'known'" class="cell-button">
              <md-button v-if="options.type !== '4'" class="md-icon-button md-raised" @click.native="openModal(false, item.ideogram, index)">
                <md-icon>remove</md-icon>
              </md-button>
              <md-button v-if="options.type === '4'" class="md-icon-button md-raised" @click.native="openModal(true, item.ideogram, index)">
                <md-icon>add</md-icon>
              </md-button>
            </md-table-cell>
          </md-table-row>
        </md-table>
      </md-dialog-content>

      <md-dialog-actions>
        <md-button class="md-primary" @click.native="closeDialog()">OK</md-button>
      </md-dialog-actions>
    </md-dialog>

    <add-remove-character-modal
          @add-character="addRemoveCharacter"
          @remove-character="addRemoveCharacter"
          ref="addRemoveCharacterModal"/>
</div>
</template>

<script>
import OptionsManager from 'src/domain/options-manager';
import IdeogramsShow from 'src/components/ideograms/Show';
import AddRemoveCharacterModal from 'src/components/modals/AddRemoveCharacter';

import { mapMutations } from 'vuex';

import { FILE_MUTATION_SET_MY_CJK_TEMP } from 'src/data/file/types';

const options = OptionsManager.getOptions();

export default {
  name: 'modal-my-cjk',
  data() {
    return {
      options,
      selectedCharacter: null,
    };
  },
  props: {
    active: '',
    type: '',
    action: '',
    hsk: '',
    frequency: '',
    items: {
      type: Array,
      default: () => [],
    },
  },
  components: {
    IdeogramsShow,
    AddRemoveCharacterModal,
  },
  async mounted() {
    await this.updateRender();
  },
  watch: {
    active() {
      this.forceUpdate();
    },
  },
  methods: {
    ...mapMutations({
      setMyCjkTemp: FILE_MUTATION_SET_MY_CJK_TEMP,
    }),

    forceUpdate() {
      this.renderItems = this.items;
      this.$forceUpdate();
    },

    closeDialog() {
      this.$emit('close', true);
    },
    openModal(add, cjk, selectedCharacter) {
      this.selectedCharacter = selectedCharacter;
      this.setMyCjkTemp(cjk);
      this.$refs.addRemoveCharacterModal.openDialog(add);
    },

    addRemoveCharacter() {
      this.$emit('change', this.selectedCharacter);
      setTimeout(() => {
        this.forceUpdate();
      }, 100);
    },
  },
};
</script>
