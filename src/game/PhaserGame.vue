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
const text = ref('')
const words_final = ref<Set<string>>(new Set<string>());
const charsTyped = ref<number>(0);

const emit = defineEmits(['current-active-scene', 'words-list', 'word-complete']);

const appendRandomWord = () => {
    const randomInt = Math.floor(Math.random() * WORDS.value.length)
    words_final.value.add(WORDS.value[randomInt])
}

onMounted(() => {
    game.value = StartGame('game-container');
    EventBus.on('current-scene-ready', (scene_instance: Phaser.Scene) => {
        EventBus.emit('current-active-scene', scene_instance);
        scene.value = scene_instance;
        EventBus.emit('words-list', words_final.value);
    });
    EventBus.on('add-new-word', ()=> {
        appendRandomWord();
        EventBus.emit('words-list', words_final.value);
    })
    EventBus.on('word-offscreen', (word: string)=> {
        words_final.value.delete(word)
        EventBus.emit('words-list', words_final.value);
    })
});

watch(text, async(newText, oldText)=> { //when word is typed out
    if(newText.length === oldText.length+1){
        charsTyped.value+=1;
    }
    if(words_final.value.has(newText)){
        const percentage: string = (newText.length/charsTyped.value).toFixed(2)
        charsTyped.value = 0
        text.value = "";
        words_final.value.delete(newText);
        EventBus.emit('word-complete', newText, percentage);
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