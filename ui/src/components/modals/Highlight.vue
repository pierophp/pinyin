<template>
  <div class="highlight-modal" v-show="visible" :style="{ top: top  + 'px', left: left + 'px'  }">
    <div class="circle highlight-1" @click="addHighlight(1)"></div>
    <div class="circle highlight-2" @click="addHighlight(2)"></div>
    <div class="circle highlight-3" @click="addHighlight(3)"></div>
    <div class="circle highlight-4" @click="addHighlight(4)"></div>
    <div class="trash" @click="removeHighlight()">
      <md-icon>delete</md-icon>
    </div>
    <span class="arrow"></span>
  </div>
</template>

<script>
  import MobileDetect from 'mobile-detect';
  import {
    mapMutations,
  } from 'vuex';

  import {
    FILE_MUTATION_ADD_HIGHLIGHT,
    FILE_MUTATION_REMOVE_HIGHLIGHT,
  } from 'src/data/file/types';

  const md = new MobileDetect(window.navigator.userAgent);

  function getParentBlockSelected(element) {
    if (element == null) {
      return null;
    }

    if (typeof element.getAttribute === 'undefined') {
      return getParentBlockSelected(element.parentElement);
    }

    if (element.getAttribute('data-line') !== null && element.getAttribute('data-block') !== null) {
      return element;
    }

    return getParentBlockSelected(element.parentElement);
  }

  function selectionChange(that) {
    const Selection = window.getSelection();
    if (Selection.isCollapsed) {
      that.visible = false;
      return;
    }

    const startNode = getParentBlockSelected(Selection.anchorNode);
    const endNode = getParentBlockSelected(Selection.focusNode);

    if (!startNode) {
      return;
    }

    if (!endNode) {
      return;
    }

    that.visible = true;

    let startLine = parseInt(startNode.getAttribute('data-line'), 10);
    let startBlock = parseInt(startNode.getAttribute('data-block'), 10);

    let endLine = parseInt(endNode.getAttribute('data-line'), 10);
    let endBlock = parseInt(endNode.getAttribute('data-block'), 10);
    let startBounds = startNode.getBoundingClientRect();
    let endBounds = endNode.getBoundingClientRect();

    if (startLine > endLine) {
      startLine = endNode.getAttribute('data-line');
      startBlock = endNode.getAttribute('data-block');

      endLine = startNode.getAttribute('data-line');
      endBlock = startNode.getAttribute('data-block');

      startBounds = endNode.getBoundingClientRect();
      endBounds = startNode.getBoundingClientRect();
    } else if (startLine === endLine && startBlock > endBlock) {
      startLine = endNode.getAttribute('data-line');
      startBlock = endNode.getAttribute('data-block');

      endLine = startNode.getAttribute('data-line');
      endBlock = startNode.getAttribute('data-block');

      startBounds = endNode.getBoundingClientRect();
      endBounds = startNode.getBoundingClientRect();
    }

    that.startLine = startLine;
    that.endLine = endLine;
    that.startBlock = startBlock;
    that.endBlock = endBlock;
    that.top = startNode.offsetTop - 70;

    const leftAdd = (Math.max(startBounds.right, endBounds.right) - startBounds.left) / 2;
    const minLeft = 5;
    that.left = startBounds.left + leftAdd;
    that.left -= 131;
    if (that.left < minLeft) {
      that.left = minLeft;
    }

    if (md.mobile() !== null) {
      that.top -= 40;
    }
  }

  export default {
    name: 'modal-highlight',
    data() {
      return {
        top: 0,
        left: 0,
        startLine: 0,
        endLine: 0,
        startBlock: 0,
        endBlock: 0,
        visible: false,
      };
    },
    created() {
      const that = this;
      let selectionIndex = 0;
      let currentSelectionIndex = 0;
      // eslint-disable-next-line
      document.addEventListener('selectionchange', function updateSelection(e) {
        e.preventDefault();
        selectionIndex += 1;
        const localSelectionIndex = selectionIndex;
        currentSelectionIndex = selectionIndex;
        setTimeout(() => {
          if (currentSelectionIndex !== localSelectionIndex) {
            return;
          }

          selectionChange(that);
        }, 500);
      }, false);
    },

    methods: {
      ...mapMutations({
        addHighlightMutation: FILE_MUTATION_ADD_HIGHLIGHT,
        removeHighlightMutation: FILE_MUTATION_REMOVE_HIGHLIGHT,
      }),
      addHighlight(type) {
        this.addHighlightMutation({
          startLine: this.startLine,
          endLine: this.endLine,
          startBlock: this.startBlock,
          endBlock: this.endBlock,
          type,
        });
      },
      removeHighlight() {
        this.removeHighlightMutation({
          startLine: this.startLine,
          endLine: this.endLine,
          startBlock: this.startBlock,
          endBlock: this.endBlock,
        });
      },
    },
  };

</script>
<style>
  .highlight-modal {
    background-color: #242424;
    background: -webkit-linear-gradient(top, #242424, rgba(36, 36, 36, 0.75));
    background: linear-gradient(to bottom, #242424, rgba(36, 36, 36, 0.75));
    border: 1px solid #000;
    border-radius: 5px;
    box-shadow: 0 0 3px #000;
    width: 260px;
    height: 40px;
    position: absolute;
    left: 100px;
    z-index: 2000;
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  .highlight-modal .arrow {
    border-color: #242424 transparent transparent transparent;
    top: 39px;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    content: '';
    display: block;
    height: 0;
    left: 50%;
    margin-left: -8px;
    position: absolute;
    width: 0;
  }

  .highlight-modal .circle {
    border: 1px solid;
    cursor: pointer;
    width: 25px;
    height: 25px;
    border-radius: 50%;
    align-self: center;
  }

  .highlight-modal .highlight-1{
    border-color: #ffef38;
  }

  .highlight-modal .highlight-2{
    border-color: #34ff26;
  }

  .highlight-modal .highlight-3{
    border-color: #0fd4ff;
  }

  .highlight-modal .highlight-4{
    border-color: #ff49f9;
  }

  .highlight-modal .trash {
    cursor: pointer;
    align-self: center;
  }

  .highlight-modal .trash i{
    color: #fff !important;
  }

  .highlight-modal .circle:hover,
  .highlight-modal .trash:hover {
    opacity: 0.7;
  }

</style>
