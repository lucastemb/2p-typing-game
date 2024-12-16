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
const last_removed = ref(-1);

const emit = defineEmits(['current-active-scene', 'words-list', 'word-complete']);

const appendRandomWord = () => {
    const randomInt = Math.floor(Math.random() * WORDS.value.length)
    if(last_removed.value === -1){ //if there is no last removed
        words_list.value.push(WORDS.value[randomInt] || ''); 
        console.log(words_list.value)
    }
    else { //replace most recent one
        words_list.value.splice(last_removed.value, 0, WORDS.value[randomInt] || ''); 
    }
}


onMounted(() => {
    game.value = StartGame('game-container');
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        EventBus.emit('current-active-scene', scene_instance);
        scene.value = scene_instance;
        EventBus.emit('words-list', words_list.value);
    });

    EventBus.on('add-new-word', ()=> {
        appendRandomWord();
        EventBus.emit('words-list', words_list.value);
    })

});

watch(text, async(newText, oldText)=> { //when word is typed out
    const index: number = words_list.value.indexOf(newText, 0)
    if(index !== -1){
        text.value = "";
        words_list.value.splice(index, 1);
        last_removed.value = index;
        appendRandomWord();
        EventBus.emit('word-complete', index);
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
        <input v-model="text"> </input>
        </div>
        <p> {{text}} </p>
        </div>
    </div>
    </div> 
</template>