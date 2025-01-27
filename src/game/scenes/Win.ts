import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Win extends Scene {
    camera: Phaser.Cameras.Scene2D.Camera;
    clock: number;
    longestStreak: number;
    points: number;
    wordChars: number;
    totalChars: number;
    background: Phaser.GameObjects.TileSprite;
    timer: number = 0;
    alternate: boolean = false;

    constructor() 
    {
        super("Win")
    }

    init(data: any){
        this.clock = data.time;
        this.longestStreak = data.longestStreak;
        this.points = data.points;
        this.wordChars = data.wordChars;
        this.totalChars = data.totalChars;
    }

    preload(){
        this.load.font("VCR_OSD","assets/fonts/vcr_osd.ttf", 'truetype')
        this.load.image('background-2', '/assets/Sketch-2.png');
        this.load.image('background', '/assets/Sketch.png')
    }

    create(){
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor('D7FFE9');

        this.background = this.add.tileSprite(0,0,1000,600,"background").setOrigin(0,0).setAlpha(0.30);

        const gameOver = this.add.text(this.scale.width/2, this.scale.height/2.5, "You Won!", {
            fontFamily: 'VCR_OSD', fontSize: 48, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)

        const percentage = Number.isNaN((this.wordChars/this.totalChars))? 0.00 :((this.wordChars/this.totalChars) * 100).toFixed(2)
        const totalPercentage = this.add.text(this.scale.width/2, this.scale.height/2.5+gameOver.height, `Accuracy: ${percentage.toString()}%`, {
            fontFamily: 'VCR_OSD', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)

        const minutes = (this.clock/60 < 10) ? "0"+Math.floor((this.clock/60)).toString() : Math.floor((this.clock/60)).toString() ; 
        const seconds = (this.clock % 60 < 10) ? "0"+Math.floor((this.clock%60)).toString() : Math.floor((this.clock%60)).toString();

        const timer = this.add.text(this.scale.width/2, this.scale.height/2.5+gameOver.height+totalPercentage.height, `Time: ${minutes}:${seconds}`, {
            fontFamily: 'VCR_OSD', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)

        const points = this.add.text(this.scale.width/2, this.scale.height/2.5+gameOver.height+totalPercentage.height+timer.height, `Points: ${this.points}`, {
            fontFamily: 'VCR_OSD', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)

        const longestStreak = this.add.text(this.scale.width/2, this.scale.height/2.5+gameOver.height+totalPercentage.height+timer.height+points.height, `Longest Streak: ${this.longestStreak}`, {
            fontFamily: 'VCR_OSD', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 4,
            align: 'center'
        }).setOrigin(0.5,0.5).setDepth(100)


        EventBus.emit('current-scene-ready', this);
    }

    update(){
        this.background.tilePositionX += 0.5;
        this.timer += 1; 
        if(this.timer === 24){
            const texture = this.alternate ? 'background' : 'background-2';
            this.alternate = !this.alternate;
            this.background.setTexture(texture);
            this.timer = 0;
        }
    }
}