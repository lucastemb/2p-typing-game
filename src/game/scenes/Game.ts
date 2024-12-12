import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText!: Phaser.GameObjects.Text;


    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);


        this.gameText = this.add.text(512, 384, 'This is just a test', {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        
        EventBus.on('words-list', (data: string[]) => {
            this.gameText.setText(data[0]);
        });
        EventBus.emit('current-scene-ready', this);
        
        
    }
}
