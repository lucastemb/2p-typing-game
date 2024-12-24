
import { Game as MainGame } from './scenes/Game';
import { GameOver } from './scenes/GameOver';
import { AUTO, Game } from 'phaser';

//  Find out more information about the Game Config at:
//  https://newdocs.phaser.io/docs/3.70.0/Phaser.Types.Core.GameConfig
const config: Phaser.Types.Core.GameConfig = {
    type: AUTO,
    width: 1080,
    height: 720,
    parent: 'game-container',
    backgroundColor: '#028af8',
    scene: [
        MainGame,
        GameOver
    ]
};

const StartGame = (parent: string) => {

    return new Game({ ...config, parent });

}

export default StartGame;
