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
    newWordTimeGoal: number = 0;
    runningTimer: number = 0; 
    falling_words: Map<string, Phaser.GameObjects.Text> = new Map<string, Phaser.GameObjects.Text>();
    readyToFall: Map<string, boolean> = new Map<string, boolean>();
    fallOrder: Queue<string> = new Queue<string>();
    score: number = 0;
    scoreIncrease: number = 0; //this will increment by one till it reaches the score number
    scoreboard: Phaser.GameObjects.Text; 
    scorestreak: number = 0;
    lives: number = 3;
    enemyLives: number | undefined = 3;
    hearts: Phaser.GameObjects.Image[] = [];
    displayClock: Phaser.GameObjects.Text;
    elapsedSeconds: number = 0; 
    streak: Phaser.GameObjects.Text;
    background: Phaser.GameObjects.TileSprite;
    bgTexture: boolean = false; 
    changeTexture: number = 0;



    //one of the main issues is that the text will all fall down at the same time which makes it hard as the player to keep up with and they also all fall at the same time
    //make it so the words fall in batches

    //would it makes sense to use a queue? 

    //three at a time will fall
    constructor ()
    {
        super('Game');
    }

    preload() {
        this.load.image('heart', '/assets/Heart.png');
        this.load.image('heart-2', '/assets/Heart-2.png');
        this.load.image('background', '/assets/Sketch.png');
        this.load.audio('right', '/assets/sounds/treasure.wav');
        this.load.audio('wrong', '/assets/sounds/wrong.mp3')
        this.load.audio('bg-music', '/assets/sounds/Final-Background-Music.mp3');
        this.load.font("Orbritron","assets/fonts/Orbitron-VariableFont_wght.ttf", 'truetype')
        this.load.font("Pixelify","assets/fonts/PixelifySans.ttf", 'truetype')
        this.load.font("Minecraft","assets/fonts/Minecraft.ttf", 'truetype')
        this.load.font("VCR_OSD","assets/fonts/vcr_osd.ttf", 'truetype')
        this.load.image('background-2', '/assets/Sketch-2.png')
        this.load.image('tick1', '/assets/Tick-2.png');
        this.load.image('tick2', '/assets/Tick-3.png');
        this.load.image('tick3', '/assets/Tick-4.png');
        this.load.image('tick4', '/assets/Tick-5.png');
        this.load.image('tick5', '/assets/Tick-6.png');
        this.load.image('tick6', '/assets/Tick-7.png');
        this.load.image('tick7', '/assets/Tick-8.png');
        this.load.image('tick8', '/assets/Tick-9.png');
        

    }

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('#80c6e6');
        this.background = this.add.tileSprite(0,0,1000,600,"background").setOrigin(0,0).setAlpha(0.30);
        EventBus.emit('current-scene-ready', this);
    
        this.anims.create({
            key: 'tick',
            frames: [
                { key: 'tick1' },
                { key: 'tick2' },
                { key: 'tick3' },
                { key: 'tick4' },
                { key: 'tick5' },
                { key: 'tick6' },
                { key: 'tick7' },
                { key: 'tick8' },
            ],
            frameRate: 8,
            repeat: -1
        })

        this.newWordTimeGoal = Math.floor(Math.random() * 150 + 35)
        this.scoreboard = this.add.text(this.scale.width, 0, `Score: + ${this.score.toString()}`, {
            fontFamily: 'Pixelify', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(1,0).setDepth(100)

        this.displayClock = this.add.text(this.scale.width, this.scale.height, `Time: 00:00`, {
            fontFamily: 'Pixelify', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(1,1).setDepth(100)

        this.add.sprite(this.scale.width-this.displayClock.width, this.scale.height, 'tick1').play('tick').setOrigin(1,1);

        this.streak = this.add.text(this.scale.width, this.scoreboard.height, `Streak: ${this.scorestreak}`, {
            fontFamily: 'Pixelify', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(1,0).setDepth(100)

        //receive newly created word
        EventBus.on('send-new-word', (word: string)=> {
            this.fallOrder.enqueue(word)
        })

        EventBus.on('words-list', (data: Set<string>) => {
            for(const word of data.values()){
                if(!this.falling_words.has(word)){
                    const textObject = this.add.text(-100, -100, 'loading...', {
                        fontFamily: 'VCR_OSD', fontSize: 22, color: '#ffffff',
                        stroke: '#000000', strokeThickness: 4,
                        align: 'center'
                    }).setOrigin(0.5).setDepth(100)
                    
                    textObject.setText(word);
                    const x_val = Math.random() * (this.scale.width-textObject.width) + textObject.width/2+1
                    textObject.setPosition(x_val, -100);
                    this.falling_words.set(word, textObject)
                    this.readyToFall.set(word, false)
                }
            }
        });

        this.time.addEvent({
            delay:1000, 
            callback: () => {
                this.elapsedSeconds++;
                const minutes = (this.elapsedSeconds/60 < 10) ? "0"+Math.floor((this.elapsedSeconds/60)).toString() : Math.floor((this.elapsedSeconds/60)).toString() ; 
                const seconds = (this.elapsedSeconds % 60 < 10) ? "0"+Math.floor((this.elapsedSeconds%60)).toString() : Math.floor((this.elapsedSeconds%60)).toString();
                this.displayClock.setText(`Time: ${minutes}:${seconds}`);
            },
            loop: true, 
        });

        EventBus.on('word-complete', (word:string, percentage: string) => { //change to pass in word
            if(this.scorestreak === 3){
                // this.flame.visible = true;
            }
            if (percentage === "1.00"){
                this.scorestreak += 1;
            }
            else{
                this.scorestreak = 0;
                // this.flame.visible = false;
            }
            this.falling_words.get(word)?.destroy();
            this.falling_words.delete(word)
            //determines whether the word is ready to fall for bunching purposes
            this.readyToFall.delete(word)
            this.score+=word.length*100
            const complete = this.sound.add('right');
            complete.play();
        });

        for(let i = 0; i < 3; i++){
            const heart = this.add.image(5+32*i+2*i, this.scale.height-5, 'heart').setOrigin(0,1)
            this.hearts.push(heart)
        }

        const bg_music = this.sound.add('bg-music', { volume: 0.50 }).setLoop(true);
        bg_music.play();
    }

    update(){

        this.scoreboard.setText("Score: " + this.scoreIncrease.toString());
        if(this.scoreIncrease !== this.score){
            this.scoreIncrease+=20;
        }
        this.streak.setText("Streak: " + this.scorestreak.toString());
        this.background.tilePositionX += 0.5;
        this.changeTexture+=1;
        if(this.changeTexture === 24){
            const texture = this.bgTexture ? 'background' : 'background-2';
            this.background.setTexture(texture);
            this.changeTexture=0;
            for(const h of this.hearts){
                const heartTexture = this.bgTexture ? 'heart' : 'heart-2';
                if(h.active){
                    h.setTexture(heartTexture);   
                }
            }
            this.bgTexture = !this.bgTexture;
        }
       
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
            this.newWordTimeGoal = Math.floor(Math.random() * 150 + 35)
            this.runningTimer = 0; 
        }

        this.falling_words.forEach((value, word)=> {
            const fall_rate = Math.random() * 1.65
            if(this.readyToFall.get(word)){
                value.setPosition(value.x, value.y+fall_rate)
            }
            if(value.y > 600){
                this.lives -= 1;
                this.hearts[this.lives].destroy();
                this.camera.shake(500, 0.005)
                const red_overlay = this.add.rectangle(0,0, this.scale.width*3, this.scale.height*3, 0xff0000).setOrigin(0.5,0.5);
                red_overlay.setBlendMode(Phaser.BlendModes.COLOR)
                red_overlay.setAlpha(0.5)
                this.camera.on('camerashakecomplete', ()=>{
                    red_overlay.destroy();
                });
                value.destroy();
                this.falling_words.delete(value.text);
                this.readyToFall.delete(value.text)
                EventBus.emit('word-offscreen', value.text);
                const incorrect = this.sound.add('wrong')
                incorrect.play()
            }
        })
        EventBus.on('enemy-update',(data: EnemyPayload)=>{
            this.enemyLives = data.lives;
        })
        
        this.changeScene()
    }

    changeScene(){
        this.camera.fadeOut(500)
        if(this.lives <= 0){
            this.scene.start('GameOver')   
        }
        if(this.enemyLives <= 0){
            this.scene.start('Win')
        }
    }
}
