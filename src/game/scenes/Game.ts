import { EventBus } from '../EventBus';
import { Scene } from 'phaser';
import { Queue } from "queue-typescript";

type EnemyPayload = {
    lives?: number;
    scene?: number;
    streak?: number;

};

export class Game extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    newWordTimeGoal: number = 0;
    runningTimer: number = 0; 
    falling_words: Map<string, Phaser.GameObjects.Text> = new Map<string, Phaser.GameObjects.Text>();
    readyToFall: Map<string, boolean> = new Map<string, boolean>();
    fallOrder: Queue<string> = new Queue<string>();
    score: number = 0;
    scoreboard: Phaser.GameObjects.Text; 
    scorestreak: number = 0;
    lives: number = 3;
    enemyLives: number | undefined = 3;


    //one of the main issues is that the text will all fall down at the same time which makes it hard as the player to keep up with and they also all fall at the same time
    //make it so the words fall in batches

    //would it makes sense to use a queue? 

    //three at a time will fall
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('0000FF');
        

        EventBus.emit('current-scene-ready', this);
        
        this.newWordTimeGoal = Math.floor(Math.random() * 250 + 10)

        this.scoreboard = this.add.text(1000, 50, this.score.toString(), {
            fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5).setDepth(100)


        //receive newly created word
        EventBus.on('send-new-word', (word: string)=> {
            this.fallOrder.enqueue(word)
            console.log(this.fallOrder)
        })

        EventBus.on('words-list', (data: Set<string>) => {
            for(const word of data.values()){
                if(!this.falling_words.has(word)){
                    const textObject = this.add.text(-100, -100, 'loading...', {
                        fontFamily: 'Arial Black', fontSize: 18, color: '#ffffff',
                        stroke: '#000000', strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(100)
                    
                    textObject.setText(word);
                    const x_val = Math.random() * 870 + 100;
                    textObject.setPosition(x_val, -100);
                    this.falling_words.set(word, textObject)
                    this.readyToFall.set(word, false)
                }
            }
        });
        EventBus.on('word-complete', (word:string, percentage: string) => { //change to pass in word
            if (percentage === "1.00"){
                this.scorestreak += 1;
            }
            else{
                this.scorestreak = 0;
            }
            this.falling_words.get(word)?.destroy();
            this.falling_words.delete(word)
            //determines whether the word is ready to fall for bunching purposes
            this.readyToFall.delete(word)
            this.score+=word.length*100.5
        });
        
    }

    update(){

        this.scoreboard.setText(this.score.toString());

        if(this.newWordTimeGoal !== this.runningTimer){
            this.runningTimer++;
        }
        else {
            EventBus.emit('add-new-word', true);
            const maxIterate = Math.min(this.fallOrder.length, 3)
            for(let i = 0; i < maxIterate; i++){
                const temp_word = this.fallOrder.dequeue()
                this.readyToFall.set(temp_word, true)
            }
            this.newWordTimeGoal = Math.floor(Math.random() * 350 + 50)
            this.runningTimer = 0; 
        }

        this.falling_words.forEach((value, word)=> {
            const fall_rate = Math.random() * 1.5 + 0.025
            if(this.readyToFall.get(word)){
                value.setPosition(value.x, value.y+fall_rate)
            }
            if(value.y > 720){
                this.lives -= 1;
                value.destroy();
                this.falling_words.delete(value.text);
                this.readyToFall.delete(value.text)
                EventBus.emit('word-offscreen', value.text);
            }
        })
        EventBus.on('enemy-update',(data: EnemyPayload)=>{
            this.enemyLives = data.lives;
        })
        this.changeScene()
    }

    changeScene(){
        if(this.lives <= 0){
            this.scene.start('GameOver')
        }
        if(this.enemyLives <= 0){
            this.scene.start('Win')
        }
    }
}
