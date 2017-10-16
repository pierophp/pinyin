<template>
  <chapter-container :book="$route.params.book" :chapter="$route.params.chapter"/>
</template>

<script>
  import ChapterContainer from 'src/components/bible/ChapterContainer';

  export default {
    name: 'bible-chapter',
    components: {
      ChapterContainer,
    },
  };
</script>
