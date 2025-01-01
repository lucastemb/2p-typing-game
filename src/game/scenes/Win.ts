import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Win extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;

    constructor() 
    {
        super("Win")
    }

    create(){
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('00FF00');
        this.add.text(550, 350, "Win", {
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)

        EventBus.emit('current-scene-ready', this);
    }
}