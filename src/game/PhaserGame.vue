<script setup lang="ts">

import { onMounted, onUnmounted, ref, watch } from 'vue';
import { EventBus } from './EventBus';
import StartGame from './main';
import Phaser from 'phaser';
import textFile from '../words.txt?raw';
import cryptoRandomString from 'crypto-random-string';
import axios from 'axios';

type EnemyPayload = {
    lives?: number;
    scene?: number;
    streak?: number;

}

// Save the current scene instance
const scene = ref();
const game = ref();
const WORDS = ref<string[]>(textFile.split('\n'))
const text = ref('')
const words_final = ref<Set<string>>(new Set<string>());
const charsTyped = ref<number>(0);
const user = (cryptoRandomString({length: 8}));
const room = ref<string>();
const ws = ref<WebSocket | null>(null);
const lives = ref<number>(3);
const streak = ref<number>(0);
const enemyPayload = ref<EnemyPayload | null>(null);
const joined = ref<boolean>(false);
const partyFull = ref<boolean>(false);
const clickedJoin = ref<boolean>(false);
const animationIndex = ref<integer>(0);
const animationFrames : string[] = [".", "..", "..."];

const emit = defineEmits(['current-active-scene', 'words-list', 'word-complete', 'enemy-update', 'send-new-word']);


const createLobby = async () => {
        const str = cryptoRandomString({length: 6});
        room.value = str;
        await axios.post("https://server-222814530816.us-east1.run.app/ws/createRoom", {
            "id": str,
            "name": str
        }).catch(error => {
            console.error("Unfortunately, there was an error. Please try again!", error);
            return;
        })

        if(ws.value){
            ws.value.close()
            console.log("Bruh")
        }

        ws.value = new WebSocket(`wss://server-222814530816.us-east1.run.app/ws/joinRoom/${room.value}?userId=${encodeURIComponent(user)}&username=${encodeURIComponent(user)}`)

        ws.value.onopen = () => {
            console.log(`Connected to room ${room.value} as ${user}`);
        };

        ws.value.onclose = (event) => {
            console.log('Connection closed', event.reason)
        }

        ws.value.onmessage = (event) => {
            const response = JSON.parse(event.data)

            axios.get(`https://server-222814530816.us-east1.run.app/ws/getClients/${room.value}`).then(response=>{
        console.log("Length: ", response.data.length)
        if(response.data.length === 2){
            partyFull.value = true;
        }
        })
            if(response["username"] !== user){
                console.log("WebSocket response:", response);
                console.log("Content:", response["Content"]);   
                enemyPayload.value = response["Content"]
            }
            if(enemyPayload.value !== null){
                EventBus.emit("enemy-update", enemyPayload.value)
            }
            console.log("Enemy payload", enemyPayload.value)
        }
        joined.value = true;
        
}

const joinLobby = () => {

    if(ws.value){
        ws.value.close()
    }

    ws.value = new WebSocket(`wss://server-222814530816.us-east1.run.app/ws/joinRoom/${room.value}?userId=${encodeURIComponent(user)}&username=${encodeURIComponent(user)}`)
    ws.value.onopen = () => {
    console.log(`Connected to room ${room.value} as ${user}`);
    };
    
    ws.value.onclose = () => {
        console.log('Connection closed')
    }

    ws.value.onmessage = (event) => {
        const response = JSON.parse(event.data)
        axios.get(`https://server-222814530816.us-east1.run.app/ws/getClients/${room.value}`).then(response=>{
        console.log("Length: ", response.data.length)
        if(response.data.length === 2){
            partyFull.value = true;
        }
    })
        if(response["username"] !== user){
            console.log("WebSocket response:", response);
            console.log("Content:", response["Content"]);   
            enemyPayload.value = response["Content"]
        }
        if(enemyPayload.value !== null){
            EventBus.emit("enemy-update", enemyPayload.value)
        }
        console.log("Enemy Payload (Join):", enemyPayload.value)
    }

    joined.value = true;
}
const appendRandomWord = () => {
    const randomInt = Math.floor(Math.random() * WORDS.value.length)
    const newWord = WORDS.value[randomInt]
    EventBus.emit('send-new-word',newWord)
    words_final.value.add(newWord)
}
watch(enemyPayload, async (newPayload)=> {
    if(newPayload?.lives !== 0){
        for(let i = newPayload!.streak; i < newPayload.streak/2; i++){
            appendRandomWord();
        }
    }
})
watch([joined, partyFull], async([newJoined, newPartyFull])=> {
    if(newJoined && newPartyFull){
        game.value = StartGame('game-container');
    }
})
onMounted(() => {
        setInterval(()=>{
            animationIndex.value += 1;
            animationIndex.value %= 3;
        },500)
    if(joined.value && partyFull.value){
        game.value = StartGame('game-container');
    }
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
        lives.value -=1;
        ws.value?.send(JSON.stringify({
            "lives": lives.value,
            "scene": 1,
            "streak": streak.value
        }))
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
        if(percentage == "1.00"){
            streak.value += 1
        }
        else{
            streak.value = 0
        }
        ws.value?.send(JSON.stringify({
            "lives": lives.value,
            "scene": 1,
            "streak": streak.value
        }))
        const charactersTyped = charsTyped.value;
        charsTyped.value = 0
        text.value = "";
        words_final.value.delete(newText);
        EventBus.emit('word-complete', newText, percentage, charactersTyped);
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
    <div className="flex items-center justify-center bg-[#FDF8E1] bg-custom-conic bg-120 w-full h-full">
    <div v-if="!joined"className="flex flex-col text-center items-center justify-center"> 
    <div>
    <button className="font-vcrOSD text-5xl bg-[#e28c33] p-5 rounded-2xl m-1" v-if="!clickedJoin" @click="createLobby"> Create Lobby </button>
    </div>
    <div className="flex flex-col justify-center">
    <button className="font-vcrOSD text-5xl bg-[#767ae6] p-5 rounded-2xl m-1" v-if="!clickedJoin" @click="clickedJoin = true"> Join Lobby </button>
    <div v-if="clickedJoin" className="flex flex-row items-center "> 
    <input className="h-full text-black font-vcrOSD text-4xl border-2 m-4 w-3/4" v-model="room"> </input> 
    <button className="bg-[#767ae6] rounded-2xl p-4 font-vcrOSD text-5xl" @click="joinLobby"> Submit </button>
    </div>
    </div>
    </div>
    <div className=" bg-[#767ae6] p-3 rounded-2xl font-vcrOSD text-6xl" v-if="joined && !partyFull">
        <p> Room: {{ room }}</p>
        <p> Waiting for players{{animationFrames[animationIndex]}}<span className="text-[#767ae6]">{{animationFrames[1].substring(0,2-animationIndex)}}</span> </p>
    </div>
    <div v-show="joined && partyFull" className="flex flex-col border-[1px] pt-6 pb-3 pr-6 pl-6 border-black bg-[#FDF8E1]"> 
    <div v-show="joined && partyFull" id="game-container"></div>
    <div className="flex justify-center items-center">
        <div className="flex flex-col">
        <div>
        <input placeholder="Type word here" className="text-black font-vcrOSD text-2xl border-2" v-model="text"> </input>
        </div>
        </div>
    </div>
    </div> 
</div>
</template>