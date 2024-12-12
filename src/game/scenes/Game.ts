import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    texts: Phaser.GameObjects.Text[] = [];


    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        for(let i = 0; i < 10; i++){
            this.texts[i] = this.add.text(512, 300+i*20, 'loading...', {
                fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            
        }

        EventBus.on('words-list', (data: string[]) => {
            console.log(data)
            for(let i = 0; i < 10; i++){
                this.texts[i].setText(data[i]);
            }
        });

        EventBus.emit('current-scene-ready', this);
        
        
    }
}
