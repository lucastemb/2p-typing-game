<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
import textFile from '../words_alpha.txt?raw';
// Save the current scene instance
const scene = ref();
const game = ref();
const WORDS = ref<string[]>(textFile.split('\r\n'))
const curr_word = ref<string>('');
const words_list = ref<string[]>([]);

const emit = defineEmits(['current-active-scene', 'words_list']);

const appendRandomWord = () => {
    const randomInt = Math.floor(Math.random() * WORDS.value.length)
    words_list.value.push(WORDS.value[randomInt] || ''); 
}

onMounted(() => {
    game.value = StartGame('game-container');
    for(let i = 0; i < 10; i++){
        appendRandomWord();
    }

    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        console.log(words_list.value)
        emit('current-active-scene', scene_instance);
        EventBus.emit('words-list', words_list.value);
    
        scene.value = scene_instance;
    
    });

});

onUnmounted(() => {

    if (game.value)
    {
        game.value.destroy(true);
        game.value = null;
    }

});

defineExpose({ scene, game });

</script>

<template>
    <div id="game-container"></div>
</template>