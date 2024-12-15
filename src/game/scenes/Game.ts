import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    texts: Phaser.GameObjects.Text[] = [];
    newWordTimeGoal: number = 0;
    runningTimer: number = 0; 
    addNewWord: boolean = false;

    //goal: get words to appear periodically

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        for(let i = 0; i < 10; i++){
            this.texts[i] = this.add.text(-100, -100, 'loading...', {
                fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
                stroke: '#000000', strokeThickness: 4,
                align: 'center'
            }).setOrigin(0.5).setDepth(100);
            
        }

        EventBus.on('words-list', (data: string[]) => {
            for(let i = 0; i < 10; i++){
                this.texts[i].setText(data[i]);
            }
        });

        EventBus.emit('current-scene-ready', this);
        
        
    }

    update(){
        console.log("hello")
    }
}
