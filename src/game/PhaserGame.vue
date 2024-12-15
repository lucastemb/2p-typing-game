<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
import textFile from '../words_alpha.txt?raw';
// Save the current scene instance
const scene = ref();
const game = ref();
const WORDS = ref<string[]>(textFile.split('\r\n'))
const words_list = ref<string[]>([]);
const text = ref('')

const emit = defineEmits(['current-active-scene', 'words-list', 'word-complete']);

const appendRandomWord = () => {
    const randomInt = Math.floor(Math.random() * WORDS.value.length)
    words_list.value.push(WORDS.value[randomInt] || ''); 
}

const generateNewWords = () => {
    words_list.value = []
    for(let i = 0; i < 10; i++){
        appendRandomWord();
    }
    EventBus.emit('words-list', words_list.value);
}


onMounted(() => {
    game.value = StartGame('game-container');
    generateNewWords();

    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        EventBus.emit('current-active-scene', scene_instance);
        EventBus.emit('words-list', words_list.value);
        scene.value = scene_instance;
    
    });

});

watch(text, async(newText, oldText)=> {
    const index: number = words_list.value.indexOf(newText, 0)
    if(index !== -1){
        text.value = "";
        words_list.value.splice(index, 1);
        appendRandomWord();
        EventBus.emit('word-complete', index);
        EventBus.emit('words-list', words_list.value);
    }
})

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
    <div className="flex flex-row"> 
    <div id="game-container"></div>
    <div className="flex justify-center items-center">
        <div className="flex flex-col">
        <div>
        <button @click="generateNewWords"> Click Me </button>
        <input v-model="text"> </input>
        </div>
        <p> {{text}} </p>
        </div>
    </div>
    </div> 
</template>