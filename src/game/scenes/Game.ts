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
    words: Set<string> = new Set<string>();

    //make text fall down and spawn from random locations
    //delete game objects when they go off screen

    // private textFall = (x_index: [number, number]) => {
    //     if(this.texts[x_index[1]].y < 720){
    //         this.texts[x_index[1]].setPosition(x_index[0], this.texts[x_index[1]].y+=1)
    //     }
    //     else{
    //         this.texts[x_index[1]].destroy();
    //     }

    // }

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);
        

        EventBus.emit('current-scene-ready', this);
        
        this.newWordTimeGoal = Math.floor(Math.random() * 250 + 10)

        EventBus.on('words-list', (data: string[]) => {
            for(let i = 0; i < data.length; i++){
                console.log(this.words)
                if(!this.words.has(data[i])){
                    this.texts[i] = this.add.text(-100, -100, 'loading...', {
                        fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
                        stroke: '#000000', strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(100);
                    
                    this.texts[i].setText(data[i]);
                    const x_val = Math.random() * 1080;
                    this.texts[i].setPosition(x_val, -100);

                    this.words.add(data[i])
                }
            }
            });
        
    }

    update(){


        EventBus.on('word-complete', (data: number) => {
            this.texts[data].setPosition(-100,-100);
        });



        if(this.newWordTimeGoal !== this.runningTimer){
            this.runningTimer++;
        }
        else {
            console.log("yes")
            EventBus.emit('add-new-word', true);
            const newIndex: number = this.texts.length+1 
            const x_val = Math.random() * 1080;

            this.newWordTimeGoal = Math.floor(Math.random() * 250 + 50)
            this.runningTimer = 0; 
        }

        for(const text of this.texts){
            console.log(text.y+1)
            text.setPosition(text.x, text.y+1)
        }
        
        
    }
}
