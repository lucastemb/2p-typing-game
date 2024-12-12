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
            fontFamily: 'Arial Black', fontSize: 24, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
        

        EventBus.emit('current-scene-ready', this);
        EventBus.on('words-list', (data: string[]) => {
            console.log(data);
        });
        
    }

   
    handleWordsList(wordList: string[]) {
        console.log('Received word list:', wordList); 
    }

    updateMessage(wordList: string){
        if(this.gameText){
            this.gameText.setText(wordList);
        }
    }
}
