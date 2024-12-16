import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    newWordTimeGoal: number = 0;
    runningTimer: number = 0; 
    falling_words: Map<string, Phaser.GameObjects.Text> = new Map<string, Phaser.GameObjects.Text>();

    //make text fall down and spawn from random location (done)
    //delete game objects when they go off screen
    //replace new words with indexes they are supposed to go in (done)

    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        

        EventBus.emit('current-scene-ready', this);
        
        this.newWordTimeGoal = Math.floor(Math.random() * 250 + 10)

        EventBus.on('words-list', (data: Set<string>) => {
            for(const word of data.values()){
                if(!this.falling_words.has(word)){
                    const textObject = this.add.text(-100, -100, 'loading...', {
                        fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
                        stroke: '#000000', strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(100)
                    
                    textObject.setText(word);
                    const x_val = Math.random() * 1080;
                    textObject.setPosition(x_val, -100);
                    this.falling_words.set(word, textObject)
                }
            }
            });
        
    }

    update(){

        EventBus.on('word-complete', (data: string) => { //change to pass in word
            this.falling_words.get(data)?.setPosition(-100,-100);
            this.falling_words.delete(data)
        });


        if(this.newWordTimeGoal !== this.runningTimer){
            this.runningTimer++;
        }
        else {
            EventBus.emit('add-new-word', true);
            this.newWordTimeGoal = Math.floor(Math.random() * 250 + 50)
            this.runningTimer = 0; 
        }

        this.falling_words.forEach((value, word)=> {
            const fall_rate = Math.random() * 1.5 + 0.025
            value.setPosition(value.x, value.y+fall_rate)
            if(value.y > 720){
                value.setPosition(-100,-100);
                this.falling_words.delete(value.text);
                EventBus.emit('word-offscreen', value.text);
            }
        })
    }
}
