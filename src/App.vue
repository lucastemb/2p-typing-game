<script setup lang="ts">
import Phaser from 'phaser';
import { ref, toRaw } from 'vue';
import PhaserGame from './game/PhaserGame.vue';

//  References to the PhaserGame component (game and scene are exposed)
const phaserRef = ref();
const spritePosition = ref({ x: 0, y: 0 });
const text = ref('')

const changeScene = () => {

    const scene = toRaw(phaserRef.value.scene) as MainMenu;

    if (scene)
    {
        //  Call the changeScene method defined in the `MainMenu`, `Game` and `GameOver` Scenes
        scene.changeScene();
    }

}

const moveSprite = () => {

    if (phaserRef.value !== undefined)
    {

        const scene = toRaw(phaserRef.value.scene) as MainMenu;

        if (scene)
        {
            // Get the update logo position
            (scene as Game).moveLogo(({ x, y }) => {

                spritePosition.value = { x, y };

            });
        }
    }

}


// Event emitted from the PhaserGame component
const currentScene = (scene: Game) => {
    canMoveSprite.value = (scene.scene.key !== "MainMenu");
}

const handleClick = () => {
    console.log("hello")
}


</script>

<template>
    <PhaserGame ref="phaserRef" @current-active-scene="currentScene" />
    <div>
       <input v-model="text" placeholder="Enter a message"/>
       <button @click="handleClick"> Click Me </button>
    </div>
</template>
