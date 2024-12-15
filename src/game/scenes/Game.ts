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
        
        this.newWordTimeGoal = Math.floor(Math.random() * 250 + 10)
        
    }

    update(){


        EventBus.on('word-complete', (data: number) => {
            console.log(data)
            this.texts[data].setPosition(-100,-100);
        });

        if(this.newWordTimeGoal !== this.runningTimer){
            this.runningTimer++;
        }
        else{
            const randomIndex: number = Math.floor(Math.random() * 10)
            this.texts[randomIndex].setPosition(500, 500);
            this.newWordTimeGoal = Math.floor(Math.random() * 250 + 50)
            this.runningTimer = 0; 
        }
        
    }
}
