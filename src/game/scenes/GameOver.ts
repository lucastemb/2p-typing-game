import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class GameOver extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    constructor() 
    {
        super("GameOver")
    }

    create(){
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('FF0000');
        this.add.text(this.scale.width/2, this.scale.height/2, "Game Over", {
            fontFamily: 'Avenir', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)
        this.camera.fadeIn(3000)

        EventBus.emit('current-scene-ready', this);
    }
}